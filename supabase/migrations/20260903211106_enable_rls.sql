-- ITEMS: private, per-user
alter table items enable row level security;

create policy "Users can view their own items"
    on items for select
    using (auth.uid() = user_id);

reate policy "Users can insert their own items"
    on items for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own items"
    on items for update
    using (auth.uid() = user_id);

create policy "Users can delete their own items"
    on items for delete
    using (auth.uid() = user_id);

-- CATEGORIES: shared, read-only for signed-in users
alter table categories enable row level security;

create policy "Signed-in users can view categories"
    on categories for select
    to authenticated
    using (true);