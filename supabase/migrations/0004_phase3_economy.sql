-- Phase 3 economy and parents. Run once after Phase 2.

create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price integer not null check (price > 0),
  stock integer not null default 10,
  kind text not null check (kind in ('digital', 'physical')),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  item_id uuid not null references public.shop_items(id),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  item_id uuid not null references public.shop_items(id),
  status text not null default 'placed' check (status in ('placed', 'handed_out', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  ninja_id uuid not null references public.ninjas(id) on delete cascade,
  body text not null,
  parent_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.waivers (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents(id) on delete cascade,
  signed_name text not null,
  created_at timestamptz not null default now()
);

alter table public.shop_items enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.notes enable row level security;
alter table public.waivers enable row level security;

drop policy if exists inventory_read on public.inventory;
create policy inventory_read on public.inventory for select using (true);
create policy shop_read on public.shop_items for select using (true);
drop policy if exists staff_orders on public.orders;
create policy staff_orders on public.orders for select using (public.is_staff());
drop policy if exists staff_notes on public.notes;
create policy staff_notes on public.notes for select using (public.is_staff());

insert into public.shop_items (name, description, price, stock, kind)
select 'Blue block skin', 'A digital skin for the dojo TV.', 20, 50, 'digital'
where not exists (select 1 from public.shop_items where name = 'Blue block skin');
insert into public.shop_items (name, description, price, stock, kind)
select 'Dojo snack', 'Handed out by a Sensei.', 15, 20, 'physical'
where not exists (select 1 from public.shop_items where name = 'Dojo snack');

insert into public.parents (name, pin_hash)
select 'Demo Parent', crypt('135790', gen_salt('bf'))
where not exists (select 1 from public.parents where name = 'Demo Parent');
insert into public.parent_ninja (parent_id, ninja_id)
select p.id, n.id from public.parents p, public.ninjas n
where p.name = 'Demo Parent' and n.first_name = 'Pixel'
on conflict do nothing;

create or replace function public.coin_balance(target uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount), 0) from public.coin_ledger where ninja_id = target
$$;

create or replace function public.buy_item(target uuid, item uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.shop_items;
  balance numeric;
begin
  select * into row from public.shop_items where id = item and stock > 0;
  if row.id is null then
    return jsonb_build_object('ok', false, 'detail', 'That item is gone.');
  end if;
  balance := public.coin_balance(target);
  if balance < row.price then
    return jsonb_build_object('ok', false, 'detail', 'Not enough coins.');
  end if;
  insert into public.coin_ledger (ninja_id, amount, entry_type, reason, actor)
  values (target, -row.price, 'spend', row.name, 'ninja');
  update public.shop_items set stock = stock - 1 where id = item;
  if row.kind = 'digital' then
    insert into public.inventory (ninja_id, item_id) values (target, item);
    return jsonb_build_object('ok', true, 'detail', 'Skin added to the locker.');
  end if;
  insert into public.orders (ninja_id, item_id) values (target, item);
  return jsonb_build_object('ok', true, 'detail', 'Order placed. A Sensei will hand it out.');
end;
$$;

create or replace function public.adjust_coins(target uuid, amount numeric, reason text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_director() then return 'Only a Director can change coins.'; end if;
  insert into public.coin_ledger (ninja_id, amount, entry_type, reason, actor)
  values (target, amount, 'adjust', reason, auth.uid()::text);
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid()::text, 'adjust_coins', target::text, jsonb_build_object('amount', amount));
  return 'Coins updated.';
end;
$$;

create or replace function public.add_shop_item(item_name text, item_price integer, item_kind text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_director() then return 'Only a Director can add items.'; end if;
  insert into public.shop_items (name, price, kind) values (item_name, item_price, item_kind);
  return 'Item added.';
end;
$$;

create or replace function public.parent_sign_in(pin text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  found public.parents;
begin
  select * into found from public.parents where pin_hash = crypt(pin, pin_hash) limit 1;
  if found.id is null then
    return jsonb_build_object('ok', false, 'detail', 'Ask the dojo to reset the parent PIN.');
  end if;
  return jsonb_build_object('ok', true, 'parent_id', found.id, 'name', found.name, 'signed', exists(select 1 from public.waivers w where w.parent_id = found.id));
end;
$$;

create or replace function public.sign_waiver(parent uuid, signed_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.waivers (parent_id, signed_name) values (parent, signed_name);
  return 'Agreement signed.';
end;
$$;

create or replace function public.parent_view(parent uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'first_name', n.first_name,
    'belt', b.name,
    'level', p.level,
    'coins', public.coin_balance(n.id),
    'note', (select body from public.notes where ninja_id = n.id and parent_visible order by created_at desc limit 1)
  )), '[]'::jsonb)
  from public.parent_ninja link
  join public.ninjas n on n.id = link.ninja_id
  join public.belts b on b.id = n.belt_id
  join public.ninja_progress p on p.ninja_id = n.id
  where link.parent_id = parent
$$;

grant execute on function public.buy_item(uuid, uuid) to anon, authenticated;
grant execute on function public.adjust_coins(uuid, numeric, text) to authenticated;
grant execute on function public.add_shop_item(text, integer, text) to authenticated;
grant execute on function public.parent_sign_in(text) to anon, authenticated;
grant execute on function public.sign_waiver(uuid, text) to anon, authenticated;
grant execute on function public.parent_view(uuid) to anon, authenticated;
grant execute on function public.coin_balance(uuid) to anon, authenticated;
