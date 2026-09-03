create table categories (
    id bigint generated always as identity primary key,
    name text not null,
    sort_order int not null default 0
);