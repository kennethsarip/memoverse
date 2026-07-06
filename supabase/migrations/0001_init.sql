-- Fount initial schema (CLAUDE.md Section 5).
-- Principles: translation-independent references, per-user progress, groups modeled
-- now (UI in v2), and Row-Level Security on every table (default deny).

-- =====================================================================
-- Content tables (public, read-only to clients)
-- =====================================================================

create table translations (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  name         text not null,
  license_type text not null check (license_type in ('public_domain', 'licensed')),
  is_enabled   boolean not null default false,
  attribution  text not null
);

create table scripture_refs (
  id            uuid primary key default gen_random_uuid(),
  book          text not null,
  chapter       integer not null,
  verse_start   integer not null,
  verse_end     integer not null,
  canonical_ref text not null,
  osis          text unique,
  sort_key      integer not null
);
create index scripture_refs_sort_key_idx on scripture_refs (sort_key);

create table verse_texts (
  id               uuid primary key default gen_random_uuid(),
  scripture_ref_id uuid not null references scripture_refs (id),
  translation_id   uuid not null references translations (id),
  text             text not null,
  word_count       integer not null,
  unique (scripture_ref_id, translation_id)
);

create table packs (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  category      text,
  age_band_hint text,
  cover_key     text,
  sort_order    integer not null default 0,
  is_curated    boolean not null default true
);

create table pack_items (
  pack_id          uuid not null references packs (id),
  scripture_ref_id uuid not null references scripture_refs (id),
  position         integer not null,
  primary key (pack_id, scripture_ref_id)
);

create table badges (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text not null,
  icon_key       text,
  criteria_type  text not null,
  criteria_value integer
);

-- =====================================================================
-- User-owned tables
-- =====================================================================

create table profiles (
  id             uuid primary key references auth.users (id),
  username       text unique not null,
  display_name   text,
  avatar_key     text,
  age_band       text not null check (age_band in ('under_13', '13_17', '18_plus')),
  kids_mode      boolean not null default false,
  timezone       text not null default 'UTC',
  xp             integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_on date,
  notif_opt_in   boolean not null default false,
  created_at     timestamptz not null default now()
);

create table user_verses (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles (id),
  scripture_ref_id uuid references scripture_refs (id),
  translation_id   uuid references translations (id),
  source           text not null check (source in ('pack', 'custom')),
  custom_ref       text,
  custom_text      text,
  added_at         timestamptz not null default now(),
  archived         boolean not null default false
);
create index user_verses_user_id_idx on user_verses (user_id);

create table verse_progress (
  id               uuid primary key default gen_random_uuid(),
  user_verse_id    uuid not null unique references user_verses (id),
  difficulty_tier  smallint not null default 1 check (difficulty_tier between 1 and 3),
  ease_factor      numeric not null default 2.5,
  interval_days    integer not null default 0,
  repetitions      integer not null default 0,
  due_on           date not null default current_date,
  last_reviewed_at timestamptz,
  last_grade       smallint,
  is_mastered      boolean not null default false
);
create index verse_progress_due_on_idx on verse_progress (due_on);

create table review_events (
  id              uuid primary key default gen_random_uuid(),
  user_verse_id   uuid not null references user_verses (id),
  reviewed_at     timestamptz not null default now(),
  mode            text not null,
  difficulty_tier smallint not null,
  grade           smallint not null,
  accuracy        numeric not null,
  duration_ms     integer
);
create index review_events_user_verse_id_idx on review_events (user_verse_id);

create table daily_activity (
  user_id           uuid not null references profiles (id),
  activity_on       date not null,
  xp_earned         integer not null default 0,
  verses_reviewed   integer not null default 0,
  session_completed boolean not null default false,
  primary key (user_id, activity_on)
);

create table user_badges (
  user_id   uuid not null references profiles (id),
  badge_id  uuid not null references badges (id),
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- =====================================================================
-- Groups (schema now, UI in v2 — CLAUDE.md Section 5.2)
-- =====================================================================

create table groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  join_code  text unique not null,
  leader_id  uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create table group_members (
  group_id  uuid not null references groups (id),
  user_id   uuid not null references profiles (id),
  role      text not null check (role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table group_assignments (
  id               uuid primary key default gen_random_uuid(),
  group_id         uuid not null references groups (id),
  scripture_ref_id uuid not null references scripture_refs (id),
  translation_id   uuid references translations (id),
  assigned_by      uuid not null references profiles (id),
  week_of          date,
  due_on           date
);

-- =====================================================================
-- Row-Level Security (default deny; enable on every table)
-- =====================================================================

alter table translations       enable row level security;
alter table scripture_refs      enable row level security;
alter table verse_texts         enable row level security;
alter table packs               enable row level security;
alter table pack_items          enable row level security;
alter table badges              enable row level security;
alter table profiles            enable row level security;
alter table user_verses         enable row level security;
alter table verse_progress      enable row level security;
alter table review_events       enable row level security;
alter table daily_activity      enable row level security;
alter table user_badges         enable row level security;
alter table groups              enable row level security;
alter table group_members       enable row level security;
alter table group_assignments   enable row level security;

-- Public content: read-only to everyone (anon + authenticated). No write policies.
create policy content_read_translations on translations
  for select to anon, authenticated using (true);
create policy content_read_scripture_refs on scripture_refs
  for select to anon, authenticated using (true);
create policy content_read_verse_texts on verse_texts
  for select to anon, authenticated using (true);
create policy content_read_packs on packs
  for select to anon, authenticated using (true);
create policy content_read_pack_items on pack_items
  for select to anon, authenticated using (true);
create policy content_read_badges on badges
  for select to anon, authenticated using (true);

-- profiles: a user reads and writes only their own row.
create policy profiles_select_own on profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_insert_own on profiles
  for insert to authenticated with check (id = auth.uid());
create policy profiles_update_own on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- user_verses: owned by user_id.
create policy user_verses_all_own on user_verses
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- verse_progress: ownership derived from the parent user_verse.
create policy verse_progress_all_own on verse_progress
  for all to authenticated
  using (
    exists (
      select 1 from user_verses uv
      where uv.id = verse_progress.user_verse_id and uv.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from user_verses uv
      where uv.id = verse_progress.user_verse_id and uv.user_id = auth.uid()
    )
  );

-- review_events: append-only, ownership via parent user_verse.
create policy review_events_select_own on review_events
  for select to authenticated
  using (
    exists (
      select 1 from user_verses uv
      where uv.id = review_events.user_verse_id and uv.user_id = auth.uid()
    )
  );
create policy review_events_insert_own on review_events
  for insert to authenticated
  with check (
    exists (
      select 1 from user_verses uv
      where uv.id = review_events.user_verse_id and uv.user_id = auth.uid()
    )
  );

-- daily_activity: owned by user_id.
create policy daily_activity_all_own on daily_activity
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- user_badges: owned by user_id.
create policy user_badges_all_own on user_badges
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Groups (v2): members may read their group's rows; only a leader may write.
create policy groups_select_members on groups
  for select to authenticated
  using (
    leader_id = auth.uid()
    or exists (
      select 1 from group_members gm
      where gm.group_id = groups.id and gm.user_id = auth.uid()
    )
  );
create policy groups_write_leader on groups
  for all to authenticated
  using (leader_id = auth.uid()) with check (leader_id = auth.uid());

create policy group_members_select_members on group_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from groups g
      where g.id = group_members.group_id and g.leader_id = auth.uid()
    )
  );
create policy group_members_write_leader on group_members
  for all to authenticated
  using (
    exists (
      select 1 from groups g
      where g.id = group_members.group_id and g.leader_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from groups g
      where g.id = group_members.group_id and g.leader_id = auth.uid()
    )
  );

create policy group_assignments_select_members on group_assignments
  for select to authenticated
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_assignments.group_id and gm.user_id = auth.uid()
    )
  );
create policy group_assignments_write_leader on group_assignments
  for all to authenticated
  using (
    exists (
      select 1 from groups g
      where g.id = group_assignments.group_id and g.leader_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from groups g
      where g.id = group_assignments.group_id and g.leader_id = auth.uid()
    )
  );
