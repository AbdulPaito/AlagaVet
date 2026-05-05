-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Users see their own roles" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

-- Auto-promote the first signed-up user to admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12,2) not null default 0,
  category text not null default 'general',
  image text not null default '',
  stock integer not null default 0,
  labels text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view products" on public.products
  for select using (true);
create policy "Admins manage products" on public.products
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Orders
create type public.order_status as enum ('Pending', 'Confirmed', 'Delivered', 'Cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null default ('ORD-' || lpad((floor(random()*9000)+1000)::text, 4, '0')),
  customer_name text not null,
  phone text not null,
  address text not null,
  product_name text not null,
  quantity integer not null default 1,
  message text not null default '',
  status order_status not null default 'Pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Customers (public/anonymous) can submit orders
create policy "Anyone can submit an order" on public.orders
  for insert with check (true);
-- Only admins can read/update/delete
create policy "Admins view orders" on public.orders
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete orders" on public.orders
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null default '',
  rating integer not null default 5 check (rating between 1 and 5),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "Anyone can view testimonials" on public.testimonials
  for select using (true);
create policy "Admins manage testimonials" on public.testimonials
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();