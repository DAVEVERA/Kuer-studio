create index qr_projects_brand_kit_id_idx on public.qr_projects (brand_kit_id);
create index qr_redirects_owner_id_idx on public.qr_redirects (owner_id);

create policy request_rate_limits_deny_client_access
on public.request_rate_limits
for all
to anon, authenticated
using (false)
with check (false);

create policy stripe_webhook_events_deny_client_access
on public.stripe_webhook_events
for all
to anon, authenticated
using (false)
with check (false);
