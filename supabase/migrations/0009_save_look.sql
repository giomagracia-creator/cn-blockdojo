-- Mark a look as chosen so the default body does not replace it.

alter table public.ninjas add column if not exists look_saved boolean not null default false;

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
  set look_sprite = sprite, look_hair = hair, look_color = color, look_saved = true
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
  select jsonb_build_object('sprite', look_sprite, 'hair', look_hair, 'color', look_color, 'saved', look_saved)
  from public.ninjas
  where id = target and active = true;
$$;

grant execute on function public.save_look(uuid, text, text, text) to anon, authenticated;
grant execute on function public.get_look(uuid) to anon, authenticated;
