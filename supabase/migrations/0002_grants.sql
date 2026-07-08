-- Table-level grants (CLAUDE.md Section 5.3). RLS policies alone are not
-- sufficient: Postgres also requires an explicit GRANT before a role can
-- touch a table at all, and newer Supabase projects no longer auto-expose
-- new tables to anon/authenticated (see the auto_expose_new_tables note in
-- supabase/config.toml). Without this, every content query 42501s even
-- though the read policies in 0001_init.sql say `using (true)`.

grant usage on schema public to anon, authenticated;

-- Public content: read-only to everyone.
grant select on
  translations,
  scripture_refs,
  verse_texts,
  packs,
  pack_items,
  badges
to anon, authenticated;

-- User-owned tables: full CRUD for signed-in users; RLS policies above
-- still restrict every row to its owner (or, for groups, its members/leader).
grant select, insert, update, delete on
  profiles,
  user_verses,
  verse_progress,
  review_events,
  daily_activity,
  user_badges,
  groups,
  group_members,
  group_assignments
to authenticated;
