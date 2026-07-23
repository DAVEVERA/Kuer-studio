-- Browser uploads must pass through the validated /api/assets/qr route. The
-- service role used there bypasses storage RLS; authenticated users cannot
-- write directly to the public bucket.
drop policy if exists qr_assets_insert_own_folder on storage.objects;
drop policy if exists qr_assets_update_own_folder on storage.objects;
drop policy if exists qr_assets_delete_own_folder on storage.objects;

create or replace function public.apply_stripe_subscription_event(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_plan_code text,
  p_status text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_stripe_event_created bigint,
  p_active boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_applied_user_id uuid;
begin
  if p_plan_code not in ('pro', 'studio') then
    raise exception 'Invalid paid plan code';
  end if;

  insert into public.subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    plan_code,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    stripe_event_created
  ) values (
    p_user_id,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_plan_code,
    p_status,
    p_current_period_start,
    p_current_period_end,
    p_cancel_at_period_end,
    p_stripe_event_created
  )
  on conflict (user_id) do update set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    stripe_price_id = excluded.stripe_price_id,
    plan_code = excluded.plan_code,
    status = excluded.status,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    stripe_event_created = excluded.stripe_event_created,
    updated_at = now()
  where public.subscriptions.stripe_event_created <= excluded.stripe_event_created
  returning user_id into v_applied_user_id;

  if v_applied_user_id is null then
    return false;
  end if;

  update public.profiles
  set
    stripe_customer_id = p_stripe_customer_id,
    plan_code = case when p_active then p_plan_code else 'free' end,
    updated_at = now()
  where id = p_user_id;

  return true;
end;
$$;

revoke all on function public.apply_stripe_subscription_event(
  uuid, text, text, text, text, text, timestamptz, timestamptz, boolean, bigint, boolean
) from public, anon, authenticated;
grant execute on function public.apply_stripe_subscription_event(
  uuid, text, text, text, text, text, timestamptz, timestamptz, boolean, bigint, boolean
) to service_role;
