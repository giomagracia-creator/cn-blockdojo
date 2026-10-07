-- Phase 1 foundation. Run once in the Supabase SQL editor.
-- Creates the roster, belts, staff roles, and PIN sign-in. No Ninja activity data yet.

create extension if not exists pgcrypto;

create table if not exists public.dojos (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  seat_limit integer not null default 15 check (seat_limit between 1 and 30),
  allowed_public_ips text[] not null default '{}',
  default_scene text not null default 'block-dojo',
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid not null references public.dojos(id) on delete cascade,
  name text not null,
  status text not null default 'planned' check (status in ('planned', 'active', 'ended')),
  current_scene text not null default 'block-dojo',
  created_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid not null references public.dojos(id) on delete cascade,
  name text not null,
  token_hash text,
  last_seen timestamptz,
  agent_version text,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null,
  role text not null check (role in ('sensei', 'director', 'owner')),
  dojo_id uuid references public.dojos(id),
  created_at timestamptz not null default now()
);

create table if not exists public.belts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  track text not null,
  sort_order integer not null,
  xp_multiplier numeric not null
);

create table if not exists public.pass_tiers (
  id uuid primary key default gen_random_uuid(),
  belt_id uuid not null references public.belts(id) on delete cascade,
  level integer not null check (level between 1 and 20),
  base_xp integer not null,
  digital_reward text,
  physical_reward text,
  unique (belt_id, level)
);

create table if not exists public.ninjas (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_initial text not null,
  dojo_id uuid not null references public.dojos(id),
  default_session_id uuid references public.sessions(id),
  belt_id uuid not null references public.belts(id),
  pin_encrypted text not null,
  avatar text not null default 'block',
  pet text not null default 'none',
  photo_consent boolean not null default false,
  active boolean not null default true,
  pin_failures integer not null default 0,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin_hash text not null,
  waiver_status text not null default 'unsigned',
  created_at timestamptz not null default now()
);

create table if not exists public.parent_ninja (
  parent_id uuid not null references public.parents(id) on delete cascade,
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  primary key (parent_id, ninja_id)
);

create table if not exists public.ninja_progress (
  ninja_id uuid primary key references public.ninjas(id) on delete cascade,
  belt_id uuid not null references public.belts(id),
  level integer not null default 1,
  xp_in_level integer not null default 0,
  total_xp integer not null default 0,
  stars integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  target text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.roster_imports (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  row_count integer not null,
  error_count integer not null,
  imported_by text not null,
  created_at timestamptz not null default now()
);

alter table public.dojos enable row level security;
alter table public.sessions enable row level security;
alter table public.devices enable row level security;
alter table public.staff_users enable row level security;
alter table public.belts enable row level security;
alter table public.pass_tiers enable row level security;
alter table public.ninjas enable row level security;
alter table public.parents enable row level security;
alter table public.parent_ninja enable row level security;
alter table public.ninja_progress enable row level security;
alter table public.settings enable row level security;
alter table public.feature_flags enable row level security;
alter table public.audit_log enable row level security;
alter table public.roster_imports enable row level security;

create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.staff_users where auth_user_id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_staff_role() in ('sensei', 'director', 'owner')
$$;

create or replace function public.is_director()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_staff_role() in ('director', 'owner')
$$;

drop policy if exists belts_read on public.belts;
create policy belts_read on public.belts for select using (true);
drop policy if exists tiers_read on public.pass_tiers;
create policy tiers_read on public.pass_tiers for select using (true);
drop policy if exists dojos_read on public.dojos;
create policy dojos_read on public.dojos for select using (true);
drop policy if exists sessions_read on public.sessions;
create policy sessions_read on public.sessions for select using (true);
drop policy if exists ninja_roster on public.ninjas;
create policy ninja_roster on public.ninjas for select using (active = true or public.is_staff());
drop policy if exists staff_self on public.staff_users;
create policy staff_self on public.staff_users for select using (auth_user_id = auth.uid() or public.is_director());
drop policy if exists director_dojos on public.dojos;
create policy director_dojos on public.dojos for update using (public.is_director());
drop policy if exists director_sessions on public.sessions;
create policy director_sessions on public.sessions for all using (public.is_director());
drop policy if exists director_devices on public.devices;
create policy director_devices on public.devices for all using (public.is_director());
drop policy if exists staff_devices_read on public.devices;
create policy staff_devices_read on public.devices for select using (public.is_staff());
drop policy if exists director_settings on public.settings;
create policy director_settings on public.settings for all using (public.is_director());
drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings for select using (public.is_staff());
drop policy if exists flags_read on public.feature_flags;
create policy flags_read on public.feature_flags for select using (true);
drop policy if exists director_flags on public.feature_flags;
create policy director_flags on public.feature_flags for update using (public.is_director());
drop policy if exists staff_audit on public.audit_log;
create policy staff_audit on public.audit_log for select using (public.is_staff());
drop policy if exists director_imports on public.roster_imports;
create policy director_imports on public.roster_imports for select using (public.is_director());
drop policy if exists staff_parents on public.parents;
create policy staff_parents on public.parents for select using (public.is_director());
drop policy if exists staff_progress on public.ninja_progress;
create policy staff_progress on public.ninja_progress for select using (public.is_staff());

insert into public.dojos (name, seat_limit)
values ('Code Ninjas Central Edmonton', 15)
on conflict (name) do nothing;

insert into public.sessions (dojo_id, name, status)
select id, 'CREATE Afternoon', 'active' from public.dojos where name = 'Code Ninjas Central Edmonton'
and not exists (select 1 from public.sessions where name = 'CREATE Afternoon');

insert into public.belts (name, track, sort_order, xp_multiplier)
values
  ('White', 'blocks', 1, 1),
  ('Yellow', 'blocks', 2, 1),
  ('Orange', 'blocks', 3, 1),
  ('Green', 'blocks', 4, 1),
  ('Blue', 'javascript', 5, 1.25),
  ('Purple', 'javascript', 6, 1.25),
  ('Brown', 'javascript', 7, 1.25),
  ('Red', 'javascript', 8, 1.25),
  ('Black', 'javascript', 9, 1.25),
  ('Bronze', 'bonus', 10, 1.5),
  ('Silver', 'bonus', 11, 1.5),
  ('Platinum', 'bonus', 12, 1.5),
  ('Gold', 'bonus', 13, 1.5)
on conflict (name) do nothing;

insert into public.pass_tiers (belt_id, level, base_xp, digital_reward, physical_reward)
select b.id, n, round((30 + 2 * (n - 1)) * b.xp_multiplier)::int,
  case when n in (5, 10, 15, 20) then null else b.name || ' block ' || n end,
  case n when 5 then 'sticker' when 10 then 'snack' when 15 then 'pencil' when 20 then 'keychain' else null end
from public.belts b
cross join generate_series(1, 20) as n
on conflict (belt_id, level) do nothing;

insert into public.settings (key, value)
values
  ('xpPerActiveMinuteByTier', '[1, 1.5, 2]'),
  ('minutesToReachTier2', '2'),
  ('minutesToReachTier3', '5'),
  ('dailyActiveMinuteCap', '120'),
  ('seatLimitMax', '30'),
  ('powerUpMinutes', '5'),
  ('powerUpMultiplier', '2'),
  ('coinsPerTenDollars', '100')
on conflict (key) do nothing;

insert into public.feature_flags (key, enabled)
values ('myStudio', false), ('attendanceImport', false)
on conflict (key) do nothing;

insert into public.ninjas (first_name, last_initial, dojo_id, default_session_id, belt_id, pin_encrypted)
select 'Pixel', 'D', d.id, s.id, b.id, '2468'
from public.dojos d
join public.sessions s on s.dojo_id = d.id and s.name = 'CREATE Afternoon'
join public.belts b on b.name = 'White'
where d.name = 'Code Ninjas Central Edmonton'
and not exists (select 1 from public.ninjas where first_name = 'Pixel' and last_initial = 'D');

insert into public.ninja_progress (ninja_id, belt_id)
select n.id, n.belt_id from public.ninjas n
where not exists (select 1 from public.ninja_progress p where p.ninja_id = n.id);

create or replace function public.claim_director()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  dojo uuid;
begin
  if auth.uid() is null then
    return 'Sign in first.';
  end if;
  if exists (select 1 from public.staff_users) then
    return 'A staff roster already exists.';
  end if;
  select id into dojo from public.dojos where name = 'Code Ninjas Central Edmonton';
  insert into public.staff_users (auth_user_id, email, role, dojo_id)
  values (auth.uid(), coalesce(auth.jwt() ->> 'email', 'director'), 'director', dojo);
  insert into public.audit_log (actor, action, target) values (auth.uid()::text, 'claim_director', 'staff_users');
  return 'Director claimed.';
end;
$$;

create or replace function public.assign_role(staff_email text, staff_role text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  found uuid;
  dojo uuid;
begin
  if not public.is_director() then
    return 'Only a Director can assign roles.';
  end if;
  if staff_role not in ('sensei', 'director', 'owner') then
    return 'Unknown role.';
  end if;
  select id into found from auth.users where lower(email) = lower(staff_email);
  if found is null then
    return 'That email has no login yet. Create it in Supabase Auth first.';
  end if;
  select id into dojo from public.dojos where name = 'Code Ninjas Central Edmonton';
  insert into public.staff_users (auth_user_id, email, role, dojo_id)
  values (found, staff_email, staff_role, dojo)
  on conflict (auth_user_id) do update set role = excluded.role, email = excluded.email;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid()::text, 'assign_role', staff_email, jsonb_build_object('role', staff_role));
  return 'Role saved.';
end;
$$;

create or replace function public.sign_in_ninja(target uuid, pin text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.ninjas;
  seats integer;
  signed_in integer;
begin
  select * into row from public.ninjas where id = target and active = true;
  if row.id is null then
    return jsonb_build_object('ok', false, 'detail', 'That Ninja is not on the roster.');
  end if;
  if row.locked or row.pin_failures >= 3 then
    return jsonb_build_object('ok', false, 'detail', 'Locked. A Sensei has to unlock this Ninja.');
  end if;
  if row.pin_encrypted <> pin then
    update public.ninjas set pin_failures = pin_failures + 1, locked = pin_failures + 1 >= 3 where id = target;
    return jsonb_build_object('ok', false, 'detail', 'Wrong PIN.');
  end if;
  select seat_limit into seats from public.dojos where id = row.dojo_id;
  select count(*) into signed_in from public.ninja_progress where updated_at > now() - interval '8 hours' and ninja_id <> target;
  if signed_in >= seats then
    return jsonb_build_object('ok', false, 'detail', 'This dojo is full.');
  end if;
  update public.ninjas set pin_failures = 0, locked = false where id = target;
  update public.ninja_progress set updated_at = now() where ninja_id = target;
  return jsonb_build_object('ok', true, 'detail', 'Welcome, ' || row.first_name || '.');
end;
$$;

create or replace function public.unlock_ninja(target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    return 'Staff only.';
  end if;
  update public.ninjas set locked = false, pin_failures = 0 where id = target;
  insert into public.audit_log (actor, action, target) values (auth.uid()::text, 'unlock_ninja', target::text);
  return 'Unlocked.';
end;
$$;

create or replace function public.lookup_pin(target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  pin text;
begin
  if not public.is_staff() then
    return 'Staff only.';
  end if;
  select pin_encrypted into pin from public.ninjas where id = target;
  insert into public.audit_log (actor, action, target) values (auth.uid()::text, 'lookup_pin', target::text);
  return pin;
end;
$$;

create or replace function public.random_pin(len integer)
returns text
language plpgsql
as $$
declare
  pin text;
begin
  pin := lpad((floor(random() * (10 ^ len)))::int::text, len, '0');
  return pin;
end;
$$;

create or replace function public.import_roster(rows jsonb, file_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  dojo uuid;
  belt uuid;
  session_id uuid;
  ninja uuid;
  parent uuid;
  ninja_pin text;
  parent_pin text;
  added integer := 0;
  errors integer := 0;
  sheet jsonb := '[]'::jsonb;
begin
  if not public.is_director() then
    return jsonb_build_object('ok', false, 'detail', 'Only a Director can import.');
  end if;
  select id into dojo from public.dojos where name = 'Code Ninjas Central Edmonton';
  for item in select * from jsonb_array_elements(rows)
  loop
    select id into belt from public.belts where lower(name) = lower(item ->> 'belt');
    if belt is null or coalesce(item ->> 'first_name', '') = '' then
      errors := errors + 1;
      continue;
    end if;
    select id into session_id from public.sessions where dojo_id = dojo and name = coalesce(item ->> 'session', 'CREATE Afternoon') limit 1;
    select id into ninja from public.ninjas
      where dojo_id = dojo and lower(first_name) = lower(item ->> 'first_name') and last_initial = left(coalesce(item ->> 'last_name', 'X'), 1);
    if ninja is null then
      ninja_pin := public.random_pin(4);
      insert into public.ninjas (first_name, last_initial, dojo_id, default_session_id, belt_id, pin_encrypted, photo_consent)
      values (item ->> 'first_name', left(coalesce(item ->> 'last_name', 'X'), 1), dojo, session_id, belt, ninja_pin, coalesce((item ->> 'photo_consent')::boolean, false))
      returning id into ninja;
      insert into public.ninja_progress (ninja_id, belt_id) values (ninja, belt);
      added := added + 1;
    else
      select pin_encrypted into ninja_pin from public.ninjas where id = ninja;
      update public.ninjas set belt_id = belt, active = true, photo_consent = coalesce((item ->> 'photo_consent')::boolean, photo_consent) where id = ninja;
    end if;
    if coalesce(item ->> 'parent_name', '') <> '' then
      parent_pin := public.random_pin(6);
      insert into public.parents (name, pin_hash) values (item ->> 'parent_name', crypt(parent_pin, gen_salt('bf')));
      parent := (select id from public.parents where name = item ->> 'parent_name' order by created_at desc limit 1);
      insert into public.parent_ninja (parent_id, ninja_id) values (parent, ninja) on conflict do nothing;
    else
      parent_pin := '';
    end if;
    sheet := sheet || jsonb_build_array(jsonb_build_object(
      'first_name', item ->> 'first_name',
      'last_initial', left(coalesce(item ->> 'last_name', 'X'), 1),
      'ninja_pin', ninja_pin,
      'parent_name', item ->> 'parent_name',
      'parent_pin', parent_pin
    ));
  end loop;
  insert into public.roster_imports (file_name, row_count, error_count, imported_by)
  values (file_name, added, errors, auth.uid()::text);
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid()::text, 'import_roster', file_name, jsonb_build_object('added', added, 'errors', errors));
  return jsonb_build_object('ok', true, 'added', added, 'errors', errors, 'sheet', sheet);
end;
$$;

grant execute on function public.claim_director() to authenticated;
grant execute on function public.assign_role(text, text) to authenticated;
grant execute on function public.sign_in_ninja(uuid, text) to anon, authenticated;
grant execute on function public.unlock_ninja(uuid) to authenticated;
grant execute on function public.lookup_pin(uuid) to authenticated;
grant execute on function public.import_roster(jsonb, text) to authenticated;
