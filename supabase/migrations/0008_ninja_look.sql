-- Save the Ninja's body, hair, and color on their account.

alter table public.ninjas add column if not exists look_sprite text not null default 'boy';
alter table public.ninjas add column if not exists look_hair text not null default 'buzzcut';
alter table public.ninjas add column if not exists look_color text not null default '#1c1c1e';

create or replace function public.save_look(target uuid, sprite text, hair text, color text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if sprite not in ('boy', 'girl') then return 'Pick a body.'; end if;
  if hair not in ('buzzcut', 'bedhead', 'cowlick', 'bob', 'long', 'curly_short') then return 'Pick a hair style.'; end if;
  if color not in ('#1c1c1e', '#6b3a1f', '#a84820', '#e2b657', '#f0d48a', '#c0392b', '#338fbf', '#1d4e89', '#7b4ea3', '#e38aaa') then
    return 'Pick a hair color.';
  end if;
  update public.ninjas
  set look_sprite = sprite, look_hair = hair, look_color = color
  where id = target and active = true;
  if not found then return 'Ninja not found.'; end if;
  return 'Look saved.';
end;
$$;

create or replace function public.get_look(target uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object('sprite', look_sprite, 'hair', look_hair, 'color', look_color)
  from public.ninjas
  where id = target and active = true;
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
  return jsonb_build_object(
    'ok', true,
    'detail', 'Welcome, ' || row.first_name || '.',
    'sprite', row.look_sprite,
    'hair', row.look_hair,
    'color', row.look_color
  );
end;
$$;

grant execute on function public.save_look(uuid, text, text, text) to anon, authenticated;
grant execute on function public.get_look(uuid) to anon, authenticated;
grant execute on function public.sign_in_ninja(uuid, text) to anon, authenticated;
