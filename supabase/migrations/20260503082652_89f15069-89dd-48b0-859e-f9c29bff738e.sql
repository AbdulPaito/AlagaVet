-- Fix touch_updated_at search_path
create or replace function public.touch_updated_at()
returns trigger language plpgsql
security definer set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

-- Restrict execute on security definer functions
revoke execute on function public.has_role(uuid, app_role) from public, anon, authenticated;
grant execute on function public.has_role(uuid, app_role) to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Replace permissive order insert with one validating non-empty required fields
drop policy if exists "Anyone can submit an order" on public.orders;
create policy "Anyone can submit an order" on public.orders
  for insert
  with check (
    length(trim(customer_name)) > 0
    and length(trim(phone)) between 5 and 30
    and length(trim(address)) > 0
    and length(trim(product_name)) > 0
    and quantity between 1 and 9999
  );