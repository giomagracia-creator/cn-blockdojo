-- Let the signed-in owner claim Director when no Director exists yet.

create or replace function public.claim_director()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  dojo uuid;
  existing text;
begin
  if auth.uid() is null then
    return 'Sign in with your email first, then tap Claim Director.';
  end if;
  select role into existing from public.staff_users where auth_user_id = auth.uid();
  if existing in ('director', 'owner') then
    return 'Director claimed.';
  end if;
  if existing is not null then
    return 'This login is a ' || existing || '.';
  end if;
  if exists (select 1 from public.staff_users where role in ('director', 'owner')) then
    return 'A Director already exists. Sign in with that email.';
  end if;
  select id into dojo from public.dojos
  where name = 'Code Ninjas Central Edmonton' or slug = 'central'
  order by (name = 'Code Ninjas Central Edmonton') desc
  limit 1;
  insert into public.staff_users (auth_user_id, email, role, dojo_id)
  values (auth.uid(), coalesce(auth.jwt() ->> 'email', 'director'), 'director', dojo);
  insert into public.audit_log (actor, action, target) values (auth.uid()::text, 'claim_director', 'staff_users');
  return 'Director claimed.';
end;
$$;

grant execute on function public.claim_director() to anon, authenticated;
