create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  full_name text,
  role text not null default 'volunteer'
    check (role in ('admin', 'volunteer')),
  email text
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

-- El usuario solo puede cambiar su nombre desde la aplicación.
-- El correo y el rol se gestionan por los flujos de Auth y backend.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

create or replace function public.sync_auth_user_to_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created_or_updated
after insert or update on auth.users
for each row
execute function public.sync_auth_user_to_profile();