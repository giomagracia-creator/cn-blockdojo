-- Phase 2 core loop. Run once in the Supabase SQL editor after Phase 1.

alter table public.ninjas add column if not exists screen_locked boolean not null default false;
alter table public.sessions add column if not exists current_scene text not null default 'block-dojo';

create table if not exists public.activity_minutes (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  device_name text,
  minute timestamptz not null default now(),
  active_buckets integer not null,
  xp numeric not null,
  coins numeric not null,
  power_up boolean not null default false
);

create table if not exists public.daily_totals (
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  day date not null default current_date,
  active_minutes integer not null default 0,
  xp numeric not null default 0,
  coins numeric not null default 0,
  primary key (ninja_id, day)
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  amount numeric not null,
  reason text not null,
  actor text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coin_ledger (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  amount numeric not null,
  entry_type text not null check (entry_type in ('earn', 'spend', 'adjust', 'refund')),
  reason text not null,
  actor text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.powerups (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  multiplier numeric not null default 2,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  creator text not null
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid references public.ninjas(id) on delete cascade,
  device_name text,
  category text not null,
  app_or_domain text,
  status text not null default 'open',
  action_taken text,
  created_at timestamptz not null default now()
);

alter table public.activity_minutes enable row level security;
alter table public.daily_totals enable row level security;
alter table public.xp_events enable row level security;
alter table public.coin_ledger enable row level security;
alter table public.powerups enable row level security;
alter table public.alerts enable row level security;

drop policy if exists staff_activity on public.activity_minutes;
create policy staff_activity on public.activity_minutes for select using (public.is_staff());
drop policy if exists staff_totals on public.daily_totals;
create policy staff_totals on public.daily_totals for select using (public.is_staff());
drop policy if exists staff_xp on public.xp_events;
create policy staff_xp on public.xp_events for select using (public.is_staff());
drop policy if exists staff_coins on public.coin_ledger;
create policy staff_coins on public.coin_ledger for select using (public.is_staff());
drop policy if exists staff_power on public.powerups;
create policy staff_power on public.powerups for select using (public.is_staff());
drop policy if exists staff_alerts on public.alerts;
create policy staff_alerts on public.alerts for select using (public.is_staff());

create or replace function public.apply_xp(target uuid, amount numeric, reason text, actor text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  progress public.ninja_progress;
  belt_mult numeric;
  need integer;
begin
  select * into progress from public.ninja_progress where ninja_id = target;
  select xp_multiplier into belt_mult from public.belts where id = progress.belt_id;
  progress.xp_in_level := progress.xp_in_level + amount;
  progress.total_xp := progress.total_xp + amount;
  need := round((30 + 2 * (progress.level - 1)) * belt_mult);
  while progress.xp_in_level >= need and progress.level < 20 loop
    progress.xp_in_level := progress.xp_in_level - need;
    progress.level := progress.level + 1;
    need := round((30 + 2 * (progress.level - 1)) * belt_mult);
  end loop;
  if progress.level = 20 and progress.xp_in_level >= need then
    progress.stars := progress.stars + 1;
    progress.xp_in_level := 0;
  end if;
  update public.ninja_progress
  set xp_in_level = progress.xp_in_level, total_xp = progress.total_xp, level = progress.level, stars = progress.stars, updated_at = now()
  where ninja_id = target;
  insert into public.xp_events (ninja_id, amount, reason, actor) values (target, amount, reason, actor);
end;
$$;

create or replace function public.record_minute(target uuid, device_name text, active_buckets integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  before_count integer;
  powered boolean;
  rate numeric;
  xp numeric;
  coins numeric;
  counted boolean := false;
begin
  select count(*) into before_count from public.activity_minutes
    where ninja_id = target and minute::date = current_date and xp > 0;
  select exists(select 1 from public.powerups where ninja_id = target and ends_at > now()) into powered;
  if active_buckets >= 3 and before_count < 120 then
    counted := true;
    rate := case when before_count >= 5 then 2 when before_count >= 2 then 1.5 else 1 end;
    if powered then rate := rate * 2; end if;
    xp := rate;
    coins := round((0.1 + ((case when before_count >= 5 then 2 when before_count >= 2 then 1.5 else 1 end) - 1) * 0.1) * (case when powered then 2 else 1 end) * 100) / 100;
    perform public.apply_xp(target, xp, 'active minute', coalesce(device_name, 'agent'));
    insert into public.coin_ledger (ninja_id, amount, entry_type, reason, actor)
    values (target, coins, 'earn', 'active minute', coalesce(device_name, 'agent'));
    insert into public.daily_totals (ninja_id, day, active_minutes, xp, coins)
    values (target, current_date, 1, xp, coins)
    on conflict (ninja_id, day) do update
      set active_minutes = public.daily_totals.active_minutes + 1,
          xp = public.daily_totals.xp + excluded.xp,
          coins = public.daily_totals.coins + excluded.coins;
  else
    xp := 0;
    coins := 0;
  end if;
  insert into public.activity_minutes (ninja_id, device_name, active_buckets, xp, coins, power_up)
  values (target, device_name, active_buckets, xp, coins, powered);
  return jsonb_build_object('ok', true, 'counted', counted, 'xp', xp, 'coins', coins);
end;
$$;

create or replace function public.award_xp(target uuid, amount numeric, reason text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  perform public.apply_xp(target, amount, reason, auth.uid()::text);
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid()::text, 'award_xp', target::text, jsonb_build_object('amount', amount, 'reason', reason));
  return 'XP saved.';
end;
$$;

create or replace function public.start_powerup(target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  insert into public.powerups (ninja_id, ends_at, creator) values (target, now() + interval '5 minutes', auth.uid()::text);
  insert into public.audit_log (actor, action, target) values (auth.uid()::text, 'powerup', target::text);
  return 'Power-up started for 5 minutes.';
end;
$$;

create or replace function public.lock_screen(target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  update public.ninjas set screen_locked = true where id = target;
  insert into public.alerts (ninja_id, category, status, action_taken) values (target, 'lock', 'handled', 'lock screen');
  insert into public.audit_log (actor, action, target) values (auth.uid()::text, 'lock_screen', target::text);
  return 'Screen lock sent.';
end;
$$;

create or replace function public.set_scene(scene text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  update public.sessions set current_scene = scene where status = 'active';
  insert into public.audit_log (actor, action, target) values (auth.uid()::text, 'set_scene', scene);
  return 'Scene set.';
end;
$$;

create or replace function public.live_board()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', n.id,
    'first_name', n.first_name,
    'level', p.level,
    'xp_in_level', p.xp_in_level,
    'total_xp', p.total_xp,
    'coins', coalesce((select sum(amount) from public.coin_ledger c where c.ninja_id = n.id), 0),
    'screen_locked', n.screen_locked,
    'belt', b.name
  ) order by n.first_name), '[]'::jsonb)
  from public.ninjas n
  join public.ninja_progress p on p.ninja_id = n.id
  join public.belts b on b.id = n.belt_id
  where n.active = true
$$;

grant execute on function public.record_minute(uuid, text, integer) to anon, authenticated;
grant execute on function public.live_board() to anon, authenticated;
grant execute on function public.award_xp(uuid, numeric, text) to authenticated;
grant execute on function public.start_powerup(uuid) to authenticated;
grant execute on function public.lock_screen(uuid) to authenticated;
grant execute on function public.set_scene(text) to authenticated;
