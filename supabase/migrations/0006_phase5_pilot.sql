-- Phase 5: second dojo display, pilot notes, keep-alive, and purge.

create table if not exists public.health_pings (
  id bigint generated always as identity primary key,
  source text not null,
  created_at timestamptz not null default now()
);

alter table public.health_pings enable row level security;

alter table public.dojos add column if not exists slug text;
create unique index if not exists dojos_slug on public.dojos (slug);

update public.dojos set slug = 'central'
where name = 'Code Ninjas Central Edmonton' and slug is null;

insert into public.dojos (name, slug, seat_limit)
values ('Dojo 2', 'dojo-2', 15)
on conflict (name) do nothing;

update public.dojos set slug = 'dojo-2' where name = 'Dojo 2' and slug is null;

insert into public.sessions (dojo_id, name, status)
select id, 'Dojo 2 Afternoon', 'active' from public.dojos where slug = 'dojo-2'
and not exists (select 1 from public.sessions where name = 'Dojo 2 Afternoon');

create table if not exists public.pilot_notes (
  id uuid primary key default gen_random_uuid(),
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.pilot_notes enable row level security;
drop policy if exists staff_pilot_notes on public.pilot_notes;
create policy staff_pilot_notes on public.pilot_notes for select using (public.is_staff());

create or replace function public.live_board_for(room text)
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
  join public.dojos d on d.id = n.dojo_id
  where n.active = true and d.slug = room;
$$;

create or replace function public.pilot_report()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'minutes_14d', coalesce((select sum(active_minutes) from public.daily_totals where day >= current_date - 14), 0),
    'open_alerts', (select count(*) from public.alerts where status = 'open'),
    'coins_spent', coalesce((select sum(-amount) from public.coin_ledger where entry_type = 'spend' and created_at > now() - interval '14 days'), 0),
    'ninjas', (select count(*) from public.ninjas where active),
    'last_ping', (select max(created_at) from public.health_pings)
  );
$$;

create or replace function public.add_pilot_note(note text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  insert into public.pilot_notes (note) values (note);
  return 'Note saved.';
end;
$$;

create or replace function public.list_pilot_notes()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', id, 'note', note, 'created_at', created_at) order by created_at desc)
    from public.pilot_notes
  ), '[]'::jsonb);
end;
$$;

create or replace function public.keep_alive()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.health_pings where created_at > now() - interval '12 hours') then
    return 'Already fresh.';
  end if;
  insert into public.health_pings (source) values ('daily');
  return 'Keep-alive saved.';
end;
$$;

create or replace function public.purge_old()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  minutes_deleted integer;
  alerts_deleted integer;
begin
  if not public.is_staff() then return 'Staff only.'; end if;
  delete from public.activity_minutes where minute < now() - interval '14 days';
  get diagnostics minutes_deleted = row_count;
  delete from public.alerts where created_at < now() - interval '30 days';
  get diagnostics alerts_deleted = row_count;
  insert into public.audit_log (actor, action, details)
  values (coalesce(auth.uid()::text, 'cron'), 'purge_old', jsonb_build_object('minutes', minutes_deleted, 'alerts', alerts_deleted));
  return 'Purged ' || minutes_deleted || ' old minutes and ' || alerts_deleted || ' old alerts.';
end;
$$;

create or replace function public.backup_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then return jsonb_build_object('error', 'Staff only.'); end if;
  return jsonb_build_object(
    'saved_at', now(),
    'dojos', (select coalesce(jsonb_agg(jsonb_build_object('name', name, 'slug', slug, 'seat_limit', seat_limit)), '[]'::jsonb) from public.dojos),
    'ninjas', (select coalesce(jsonb_agg(jsonb_build_object('first_name', n.first_name, 'belt', b.name, 'level', p.level, 'xp', p.total_xp)), '[]'::jsonb)
      from public.ninjas n
      join public.belts b on b.id = n.belt_id
      join public.ninja_progress p on p.ninja_id = n.id
      where n.active),
    'daily_totals', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'minutes', active_minutes, 'xp', xp)), '[]'::jsonb) from public.daily_totals where day >= current_date - 30)
  );
end;
$$;

grant execute on function public.live_board_for(text) to anon, authenticated;
grant execute on function public.pilot_report() to anon, authenticated;
grant execute on function public.add_pilot_note(text) to anon, authenticated;
grant execute on function public.list_pilot_notes() to anon, authenticated;
grant execute on function public.keep_alive() to anon, authenticated;
grant execute on function public.purge_old() to anon, authenticated;
grant execute on function public.backup_snapshot() to anon, authenticated;
