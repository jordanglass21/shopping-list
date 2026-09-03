create table items (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    name text not null,
    quantity text,
    checked boolean not null default false,
    category_id bigint references categories (id) on delete set null,
    created_at timestamptz not null default now()
);