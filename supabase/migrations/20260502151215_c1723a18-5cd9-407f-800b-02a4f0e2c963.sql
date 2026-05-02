-- Roles enum
create type public.app_role as enum ('admin', 'user');

-- user_roles table (separate from any profile table)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- SECURITY DEFINER function to check roles without RLS recursion
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Users can read their own roles
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- Only admins can manage roles
create policy "Admins can insert roles"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update roles"
  on public.user_roles for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
  on public.user_roles for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Marketing contacts table
create table public.marketing_contacts (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  wallet_address text,
  source text not null default 'auth_dialog',
  marketing_consent boolean not null default true,
  unsubscribed_at timestamptz,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_contacts_email_or_phone check (
    email is not null or phone is not null or wallet_address is not null
  )
);

-- Unique partial indexes (allow nulls but enforce uniqueness when present)
create unique index marketing_contacts_email_uniq
  on public.marketing_contacts (lower(email)) where email is not null;
create unique index marketing_contacts_phone_uniq
  on public.marketing_contacts (phone) where phone is not null;

alter table public.marketing_contacts enable row level security;

-- Anyone can submit a contact (collected via the auth dialog)
create policy "Anyone can submit a marketing contact"
  on public.marketing_contacts for insert
  to anon, authenticated
  with check (true);

-- Only admins can read/update/delete
create policy "Admins can view marketing contacts"
  on public.marketing_contacts for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update marketing contacts"
  on public.marketing_contacts for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete marketing contacts"
  on public.marketing_contacts for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger marketing_contacts_set_updated_at
  before update on public.marketing_contacts
  for each row execute function public.set_updated_at();