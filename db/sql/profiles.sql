-- Database pieces Drizzle can't express. Safe to re-run: npm run db:sql

-- Every new account gets a profile holding the username from the sign-up form.
-- Google sign-ins don't send a username, so they get no profile row yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'username' is not null then
    insert into public.profiles (id, username)
    values (new.id, lower(new.raw_user_meta_data ->> 'username'));
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form check a username before creating the account,
-- without letting signed-out visitors read the profiles table itself
create or replace function public.username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where username = lower(name)
  );
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- The trigger function is internal; nobody should call it through the API
revoke all on function public.handle_new_user() from public, anon, authenticated;
