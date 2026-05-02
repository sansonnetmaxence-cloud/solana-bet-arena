-- 1. Fix search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Lock down has_role: only the database (policies) and service_role should call it.
revoke execute on function public.has_role(uuid, public.app_role) from public;
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated;

-- 3. Tighten the public insert policy: prevent submitters from pre-marking as unsubscribed
--    and require explicit marketing_consent = true.
drop policy if exists "Anyone can submit a marketing contact" on public.marketing_contacts;

create policy "Anyone can submit a marketing contact"
  on public.marketing_contacts for insert
  to anon, authenticated
  with check (
    unsubscribed_at is null
    and marketing_consent = true
    and source in ('auth_dialog', 'wallet_connect', 'newsletter', 'footer')
  );