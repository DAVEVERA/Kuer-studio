create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  company_name text not null default '',
  avatar_url text,
  notification_preferences jsonb not null default '{"scanAlerts":true,"weeklyReport":true,"productUpdates":false,"exportComplete":true}'::jsonb,
  plan_code text not null default 'free' check (plan_code in ('free', 'pro', 'studio')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  plan_code text not null check (plan_code in ('pro', 'studio')),
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_event_created bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default array['generate', 'read']::text[],
  rate_limit integer not null default 100 check (rate_limit between 1 and 10000),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.generation_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  period_start date not null,
  generations integer not null default 0 check (generations >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start)
);

create table public.request_rate_limits (
  identity_key text not null,
  bucket text not null,
  window_start timestamptz not null,
  requests integer not null default 0 check (requests >= 0),
  updated_at timestamptz not null default now(),
  primary key (identity_key, bucket, window_start)
);

create table public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  stripe_created_at bigint not null,
  status text not null default 'processing' check (status in ('processing', 'processed', 'failed')),
  attempts integer not null default 1 check (attempts >= 1),
  last_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  logo_url text,
  primary_color text not null default '#000000',
  secondary_color text not null default '#FFFFFF',
  accent_color text not null default '#008081',
  font_preference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.qr_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brand_kit_id uuid references public.brand_kits (id) on delete set null,
  name text not null check (char_length(name) between 1 and 160),
  target_url text not null check (target_url ~* '^https?://'),
  short_id text not null unique check (short_id ~ '^[A-Za-z0-9_-]{6,32}$'),
  type text not null check (type in ('static', 'dynamic')),
  category text not null check (category in (
    'website', 'social-media', 'video', 'ar-experience', 'podcast',
    'menu', 'payment', 'event', 'product-packaging', 'campaign'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.uploaded_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.qr_projects (id) on delete cascade,
  original_url text not null,
  analysis_json jsonb not null default '{}'::jsonb,
  width integer not null default 0 check (width >= 0),
  height integer not null default 0 check (height >= 0),
  file_size integer not null default 0 check (file_size >= 0),
  mime_type text not null default 'image/png',
  created_at timestamptz not null default now()
);

create table public.qr_variants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.qr_projects (id) on delete cascade,
  prompt text not null default '',
  style_preset text not null default 'corporate-clean',
  model_id text,
  image_url text not null default '',
  base_qr_url text not null default '',
  scanability_score integer not null default 0 check (scanability_score between 0 and 100),
  validation_status text not null default 'pending',
  validation_report jsonb not null default '{}'::jsonb,
  export_urls jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.scan_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.qr_projects (id) on delete cascade,
  variant_id uuid references public.qr_variants (id) on delete set null,
  timestamp timestamptz not null default now(),
  user_agent text not null default '',
  device_type text not null default '',
  browser text not null default '',
  os text not null default '',
  country text not null default '',
  city text not null default '',
  ip_hash text not null default ''
);

create table public.export_history (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.qr_variants (id) on delete cascade,
  format text not null,
  size text not null default '',
  file_url text not null default '',
  created_at timestamptz not null default now()
);

create table public.qr_redirects (
  short_id text primary key,
  project_id uuid not null unique references public.qr_projects (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  target_url text not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index brand_kits_user_id_idx on public.brand_kits (user_id);
create index qr_projects_user_updated_idx on public.qr_projects (user_id, updated_at desc);
create index qr_variants_project_created_idx on public.qr_variants (project_id, created_at desc);
create index uploaded_images_project_idx on public.uploaded_images (project_id);
create index scan_events_project_timestamp_idx on public.scan_events (project_id, timestamp desc);
create index scan_events_variant_idx on public.scan_events (variant_id);
create index export_history_variant_created_idx on public.export_history (variant_id, created_at desc);
create index subscriptions_user_status_idx on public.subscriptions (user_id, status);
create index api_keys_user_id_idx on public.api_keys (user_id);
create index request_rate_limits_updated_idx on public.request_rate_limits (updated_at);
create index stripe_webhook_events_status_idx on public.stripe_webhook_events (status, updated_at);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();
create trigger brand_kits_set_updated_at before update on public.brand_kits
for each row execute function public.set_updated_at();
create trigger qr_projects_set_updated_at before update on public.qr_projects
for each row execute function public.set_updated_at();
create trigger stripe_webhook_events_set_updated_at before update on public.stripe_webhook_events
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email, full_name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
on conflict (id) do nothing;

create function public.sync_qr_redirect()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.qr_redirects (short_id, project_id, owner_id, target_url, is_active, updated_at)
  values (new.short_id, new.id, new.user_id, new.target_url, true, now())
  on conflict (project_id) do update set
    short_id = excluded.short_id,
    owner_id = excluded.owner_id,
    target_url = excluded.target_url,
    updated_at = now();
  return new;
end;
$$;

create trigger qr_projects_sync_redirect
after insert or update of short_id, target_url on public.qr_projects
for each row execute function public.sync_qr_redirect();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.sync_qr_redirect() from public, anon, authenticated;
grant execute on function public.set_updated_at() to authenticated;

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.api_keys enable row level security;
alter table public.generation_usage enable row level security;
alter table public.request_rate_limits enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.brand_kits enable row level security;
alter table public.qr_projects enable row level security;
alter table public.uploaded_images enable row level security;
alter table public.qr_variants enable row level security;
alter table public.scan_events enable row level security;
alter table public.export_history enable row level security;
alter table public.qr_redirects enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy subscriptions_select_own on public.subscriptions for select to authenticated
using ((select auth.uid()) = user_id);

create policy api_keys_select_own on public.api_keys for select to authenticated
using ((select auth.uid()) = user_id);
create policy api_keys_delete_own on public.api_keys for delete to authenticated
using ((select auth.uid()) = user_id);

create policy generation_usage_select_own on public.generation_usage for select to authenticated
using ((select auth.uid()) = user_id);

create function public.consume_generation_quota(p_user_id uuid, p_requested integer)
returns table (used integer, quota integer, plan_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text;
  v_quota integer;
  v_used integer;
  v_period date := date_trunc('month', now())::date;
begin
  if p_requested < 1 or p_requested > 8 then
    raise exception 'invalid_generation_count' using errcode = '22023';
  end if;

  select p.plan_code into v_plan from public.profiles p where p.id = p_user_id;
  v_plan := coalesce(v_plan, 'free');
  v_quota := case v_plan when 'studio' then 2500 when 'pro' then 500 else 20 end;

  insert into public.generation_usage (user_id, period_start, generations, updated_at)
  values (p_user_id, v_period, p_requested, now())
  on conflict (user_id, period_start) do update
  set generations = public.generation_usage.generations + excluded.generations,
      updated_at = now()
  where public.generation_usage.generations + excluded.generations <= v_quota
  returning generations into v_used;

  if v_used is null then
    raise exception 'generation_quota_exceeded' using errcode = 'P0001';
  end if;

  return query select v_used, v_quota, v_plan;
end;
$$;

create function public.enforce_project_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text, 0));
  select p.plan_code into v_plan from public.profiles p where p.id = new.user_id;
  if coalesce(v_plan, 'free') = 'free' and (select count(*) from public.qr_projects q where q.user_id = new.user_id) >= 3 then
    raise exception 'project_quota_exceeded' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create function public.consume_request_rate_limit(
  p_identity_key text,
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_requests integer;
  v_retry_after integer;
begin
  if p_identity_key is null or char_length(p_identity_key) < 3 or char_length(p_identity_key) > 160 then
    raise exception 'invalid_rate_limit_identity' using errcode = '22023';
  end if;
  if p_bucket is null or char_length(p_bucket) < 1 or char_length(p_bucket) > 80 then
    raise exception 'invalid_rate_limit_bucket' using errcode = '22023';
  end if;
  if p_limit < 1 or p_limit > 10000 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid_rate_limit_configuration' using errcode = '22023';
  end if;

  v_window_start := pg_catalog.to_timestamp(
    floor(extract(epoch from pg_catalog.now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.request_rate_limits (identity_key, bucket, window_start, requests, updated_at)
  values (p_identity_key, p_bucket, v_window_start, 1, pg_catalog.now())
  on conflict (identity_key, bucket, window_start) do update
  set requests = public.request_rate_limits.requests + 1,
      updated_at = pg_catalog.now()
  returning requests into v_requests;

  v_retry_after := greatest(
    1,
    ceil(extract(epoch from (v_window_start + pg_catalog.make_interval(secs => p_window_seconds) - pg_catalog.now())))::integer
  );

  return query select
    v_requests <= p_limit,
    greatest(0, p_limit - v_requests),
    v_retry_after;
end;
$$;

create trigger qr_projects_enforce_plan_limit
before insert on public.qr_projects
for each row execute function public.enforce_project_plan_limit();

create function public.enforce_brand_kit_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text;
  v_limit integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text, 1));
  select p.plan_code into v_plan from public.profiles p where p.id = new.user_id;
  v_limit := case coalesce(v_plan, 'free') when 'studio' then null when 'pro' then 10 else 1 end;
  if v_limit is not null and (select count(*) from public.brand_kits b where b.user_id = new.user_id) >= v_limit then
    raise exception 'brand_kit_quota_exceeded' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger brand_kits_enforce_plan_limit
before insert on public.brand_kits
for each row execute function public.enforce_brand_kit_plan_limit();

revoke all on function public.consume_generation_quota(uuid, integer) from public, anon, authenticated;
revoke all on function public.consume_request_rate_limit(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.enforce_project_plan_limit() from public, anon, authenticated;
revoke all on function public.enforce_brand_kit_plan_limit() from public, anon, authenticated;
grant execute on function public.consume_generation_quota(uuid, integer) to service_role;
grant execute on function public.consume_request_rate_limit(text, text, integer, integer) to service_role;

create policy brand_kits_select_own on public.brand_kits for select to authenticated
using ((select auth.uid()) = user_id);
create policy brand_kits_insert_own on public.brand_kits for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy brand_kits_update_own on public.brand_kits for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy brand_kits_delete_own on public.brand_kits for delete to authenticated
using ((select auth.uid()) = user_id);

create policy qr_projects_select_own on public.qr_projects for select to authenticated
using ((select auth.uid()) = user_id);
create policy qr_projects_insert_own on public.qr_projects for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (brand_kit_id is null or exists (
    select 1 from public.brand_kits b where b.id = brand_kit_id and b.user_id = (select auth.uid())
  ))
);
create policy qr_projects_update_own on public.qr_projects for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (brand_kit_id is null or exists (
    select 1 from public.brand_kits b where b.id = brand_kit_id and b.user_id = (select auth.uid())
  ))
);
create policy qr_projects_delete_own on public.qr_projects for delete to authenticated
using ((select auth.uid()) = user_id);

create policy uploaded_images_owner_all on public.uploaded_images for all to authenticated
using (exists (
  select 1 from public.qr_projects p where p.id = project_id and p.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.qr_projects p where p.id = project_id and p.user_id = (select auth.uid())
));

create policy qr_variants_owner_all on public.qr_variants for all to authenticated
using (exists (
  select 1 from public.qr_projects p where p.id = project_id and p.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.qr_projects p where p.id = project_id and p.user_id = (select auth.uid())
));

create policy scan_events_select_own on public.scan_events for select to authenticated
using (exists (
  select 1 from public.qr_projects p where p.id = project_id and p.user_id = (select auth.uid())
));

create policy export_history_owner_all on public.export_history for all to authenticated
using (exists (
  select 1
  from public.qr_variants v
  join public.qr_projects p on p.id = v.project_id
  where v.id = variant_id and p.user_id = (select auth.uid())
))
with check (exists (
  select 1
  from public.qr_variants v
  join public.qr_projects p on p.id = v.project_id
  where v.id = variant_id and p.user_id = (select auth.uid())
));

create policy qr_redirects_select_own on public.qr_redirects for select to authenticated
using ((select auth.uid()) = owner_id);

grant usage on schema public to anon, authenticated, service_role;
grant select, update on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;
grant select, delete on public.api_keys to authenticated;
grant select on public.generation_usage to authenticated;
grant select, insert, update, delete on public.brand_kits to authenticated;
grant select, insert, update, delete on public.qr_projects to authenticated;
grant select, insert, update, delete on public.uploaded_images to authenticated;
grant select, insert, update, delete on public.qr_variants to authenticated;
grant select on public.scan_events to authenticated;
grant select, insert, update, delete on public.export_history to authenticated;
grant select on public.qr_redirects to authenticated;
grant all on all tables in schema public to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('qr-assets', 'qr-assets', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable' and p.pronargs = 0
  ) then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;
