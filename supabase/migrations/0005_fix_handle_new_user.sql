-- Migration 0005: Fix handle_new_user trigger
-- Adds SET search_path = public (required for SECURITY DEFINER in newer Postgres)
-- Sanitizes email-derived username (removes dots, plus signs etc.) and appends
-- 8 hex chars from UUID for guaranteed uniqueness.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  _username text;
begin
  -- Sanitize email prefix: lowercase + replace non-alphanumeric/underscore with '_'
  -- Append 8 hex chars from UUID for guaranteed uniqueness
  _username := lower(
    regexp_replace(
      coalesce(
        nullif(new.raw_user_meta_data->>'preferred_username', ''),
        split_part(new.email, '@', 1)
      ),
      '[^a-z0-9_]', '_', 'g'
    )
  ) || '_' || substr(replace(new.id::text, '-', ''), 1, 8);

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    _username,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
