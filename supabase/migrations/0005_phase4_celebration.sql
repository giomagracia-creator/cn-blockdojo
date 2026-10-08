-- Phase 4: belt-up queue, quests, teams, matches, achievements.

create table if not exists public.belt_celebrations (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  from_belt text not null,
  to_belt text not null,
  status text not null default 'queued' check (status in ('queued', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text not null default '',
  reward_xp integer not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.quest_claims (
  quest_id uuid not null references public.quests(id) on delete cascade,
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (quest_id, ninja_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  primary key (team_id, ninja_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  detail text not null default '',
  reward_xp integer not null default 5,
  created_at timestamptz not null default now()
);

create table if not exists public.achievement_awards (
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (achievement_id, ninja_id)
);

alter table public.belt_celebrations enable row level security;
alter table public.quests enable row level security;
alter table public.quest_claims enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.matches enable row level security;
alter table public.achievements enable row level security;
alter table public.achievement_awards enable row level security;

drop policy if exists read_celebrations on public.belt_celebrations;
create policy read_celebrations on public.belt_celebrations for select using (true);
drop policy if exists read_quests on public.quests;
create policy read_quests on public.quests for select using (true);
drop policy if exists read_teams on public.teams;
create policy read_teams on public.teams for select using (true);
drop policy if exists read_matches on public.matches;
create policy read_matches on public.matches for select using (true);
drop policy if exists read_achievements on public.achievements;
create policy read_achievements on public.achievements for select using (true);

create or replace function public.queue_belt_up(target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order integer;
  current_name text;
  next_id uuid;
  next_name text;
  who text;
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  select b.sort_order, b.name, n.first_name into current_order, current_name, who
  from public.ninjas n join public.belts b on b.id = n.belt_id where n.id = target;
  if current_name is null then return 'Ninja not found.'; end if;
  select id, name into next_id, next_name from public.belts where sort_order = current_order + 1;
  if next_id is null then return who || ' is already at the top belt.'; end if;
  update public.ninjas set belt_id = next_id where id = target;
  update public.ninja_progress
  set belt_id = next_id, level = 1, xp_in_level = 0, updated_at = now()
  where ninja_id = target;
  insert into public.belt_celebrations (ninja_id, from_belt, to_belt) values (target, current_name, next_name);
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid()::text, 'belt_up', target::text, jsonb_build_object('from', current_name, 'to', next_name));
  return who || ' queued: ' || current_name || ' to ' || next_name || '.';
end;
$$;

create or replace function public.celebration_feed()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'first_name', n.first_name,
    'from_belt', c.from_belt,
    'to_belt', c.to_belt,
    'status', c.status,
    'created_at', c.created_at
  ) order by c.created_at desc), '[]'::jsonb)
  from public.belt_celebrations c
  join public.ninjas n on n.id = c.ninja_id;
$$;

create or replace function public.set_celebration(target uuid, next_status text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  if next_status not in ('queued', 'done') then return 'Use queued or done.'; end if;
  update public.belt_celebrations set status = next_status where id = target;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid()::text, 'celebration', target::text, jsonb_build_object('status', next_status));
  return 'Celebration updated.';
end;
$$;

create or replace function public.session_board()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'first_name', n.first_name,
    'belt', b.name,
    'level', p.level,
    'xp', p.xp_in_level
  ) order by b.sort_order desc, p.level desc, p.xp_in_level desc), '[]'::jsonb)
  from public.ninjas n
  join public.ninja_progress p on p.ninja_id = n.id
  join public.belts b on b.id = n.belt_id
  where n.active = true;
$$;

create or replace function public.create_quest(title text, detail text, reward_xp integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  insert into public.quests (title, detail, reward_xp) values (title, detail, reward_xp);
  insert into public.audit_log (actor, action, details)
  values (auth.uid()::text, 'create_quest', jsonb_build_object('title', title));
  return 'Quest saved.';
end;
$$;

create or replace function public.list_quests()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'title', title, 'detail', detail, 'reward_xp', reward_xp
  ) order by created_at desc), '[]'::jsonb)
  from public.quests where active = true;
$$;

create or replace function public.complete_quest(quest uuid, target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  reward integer;
  title text;
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  select q.reward_xp, q.title into reward, title from public.quests q where q.id = quest and q.active;
  if title is null then return 'Quest not found.'; end if;
  insert into public.quest_claims (quest_id, ninja_id) values (quest, target)
  on conflict do nothing;
  if not found then return 'Already completed.'; end if;
  perform public.apply_xp(target, reward, 'quest ' || title, auth.uid()::text);
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid()::text, 'complete_quest', target::text, jsonb_build_object('quest', title, 'xp', reward));
  return 'Quest complete. +' || reward || ' XP.';
end;
$$;

create or replace function public.create_team(team_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  insert into public.teams (name) values (team_name);
  return 'Team saved.';
exception when unique_violation then
  return 'That team already exists.';
end;
$$;

create or replace function public.join_team(team uuid, target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  insert into public.team_members (team_id, ninja_id) values (team, target)
  on conflict do nothing;
  return 'Ninja added to the team.';
end;
$$;

create or replace function public.list_teams()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id,
    'name', t.name,
    'xp', coalesce((
      select sum(p.total_xp) from public.team_members m
      join public.ninja_progress p on p.ninja_id = m.ninja_id
      where m.team_id = t.id
    ), 0)
  ) order by t.name), '[]'::jsonb)
  from public.teams t;
$$;

create or replace function public.start_match(title text, minutes integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  insert into public.matches (title, ends_at) values (title, now() + make_interval(mins => greatest(minutes, 1)));
  insert into public.audit_log (actor, action, details)
  values (auth.uid()::text, 'start_match', jsonb_build_object('title', title, 'minutes', minutes));
  return 'Match started.';
end;
$$;

create or replace function public.list_matches()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'title', title, 'ends_at', ends_at
  ) order by ends_at desc), '[]'::jsonb)
  from public.matches where ends_at > now();
$$;

create or replace function public.create_achievement(achievement_name text, detail text, reward_xp integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  insert into public.achievements (name, detail, reward_xp) values (achievement_name, detail, reward_xp);
  return 'Achievement saved.';
end;
$$;

create or replace function public.award_achievement(achievement uuid, target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  reward integer;
  achievement_name text;
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  select a.reward_xp, a.name into reward, achievement_name from public.achievements a where a.id = achievement;
  if achievement_name is null then return 'Achievement not found.'; end if;
  insert into public.achievement_awards (achievement_id, ninja_id) values (achievement, target)
  on conflict do nothing;
  if not found then return 'Already awarded.'; end if;
  perform public.apply_xp(target, reward, 'achievement ' || achievement_name, auth.uid()::text);
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid()::text, 'award_achievement', target::text, jsonb_build_object('name', achievement_name, 'xp', reward));
  return achievement_name || ' awarded. +' || reward || ' XP.';
end;
$$;

create or replace function public.list_achievements()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'name', name, 'detail', detail, 'reward_xp', reward_xp
  ) order by created_at desc), '[]'::jsonb)
  from public.achievements;
$$;

insert into public.quests (title, detail, reward_xp)
select 'Code for 40 minutes', 'Active minutes on a dojo computer.', 15
where not exists (select 1 from public.quests where title = 'Code for 40 minutes');

insert into public.quests (title, detail, reward_xp)
select 'Bring a friend', 'A Sensei confirms this at check-in.', 25
where not exists (select 1 from public.quests where title = 'Bring a friend');

insert into public.achievements (name, detail, reward_xp)
select 'Helping hands', 'Helped another Ninja finish a project.', 10
where not exists (select 1 from public.achievements where name = 'Helping hands');

grant execute on function public.queue_belt_up(uuid) to anon, authenticated;
grant execute on function public.celebration_feed() to anon, authenticated;
grant execute on function public.set_celebration(uuid, text) to anon, authenticated;
grant execute on function public.session_board() to anon, authenticated;
grant execute on function public.create_quest(text, text, integer) to anon, authenticated;
grant execute on function public.list_quests() to anon, authenticated;
grant execute on function public.complete_quest(uuid, uuid) to anon, authenticated;
grant execute on function public.create_team(text) to anon, authenticated;
grant execute on function public.join_team(uuid, uuid) to anon, authenticated;
grant execute on function public.list_teams() to anon, authenticated;
grant execute on function public.start_match(text, integer) to anon, authenticated;
grant execute on function public.list_matches() to anon, authenticated;
grant execute on function public.create_achievement(text, text, integer) to anon, authenticated;
grant execute on function public.award_achievement(uuid, uuid) to anon, authenticated;
grant execute on function public.list_achievements() to anon, authenticated;
