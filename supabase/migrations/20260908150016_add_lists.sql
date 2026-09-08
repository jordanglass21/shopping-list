-- 1. The lists table
create table lists (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_template boolean not null default false,
  created_at timestamptz not null default now()
);

alter table lists enable row level security;

create policy "Users manage their own lists"
  on lists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Add list_id to items (nullable for now, so existing rows don't break)
alter table items add column list_id bigint references lists (id) on delete cascade;

-- 3. Backfill: create a default working list per user, assign their items to it
do $$
declare
  u record;
  new_list_id bigint;
begin
  for u in (select distinct user_id from items) loop
    insert into lists (user_id, name, is_template)
      values (u.user_id, 'My List', false)
      returning id into new_list_id;
    update items set list_id = new_list_id where user_id = u.user_id;
  end loop;
end $$;