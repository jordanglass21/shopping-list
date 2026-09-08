alter table lists
  add column source_template_id bigint references lists (id) on delete set null;