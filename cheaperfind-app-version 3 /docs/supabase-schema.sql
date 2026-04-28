create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  price text,
  source text,
  link text not null,
  image text,
  created_at timestamptz default now()
);
alter table public.saved_items enable row level security;
create policy "Users can read own saved items" on public.saved_items for select using (auth.uid() = user_id);
create policy "Users can insert own saved items" on public.saved_items for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved items" on public.saved_items for delete using (auth.uid() = user_id);
