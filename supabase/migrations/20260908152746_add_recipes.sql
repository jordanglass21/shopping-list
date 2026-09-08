-- 1. The recipes table
create table recipes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;

create policy "Users manage their own recipes"
  on recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Tag items with the recipe they came from (nullable — manual items have none)
alter table items
  add column recipe_id bigint references recipes (id) on delete set null;