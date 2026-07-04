-- Seed data for local development and CI (CLAUDE.md Section 7, Phase 1.1).
-- Ships the public-domain WEB translation plus one curated starter pack (5 verses)
-- and a few milestone badges. All verse text is World English Bible (public domain).

-- WEB translation (the enabled default). Licensed translations stay disabled until
-- their license is in place (CLAUDE.md Section 11 / 12).
insert into translations (id, code, name, license_type, is_enabled, attribution) values
  (
    '00000000-0000-0000-0000-000000000001',
    'WEB',
    'World English Bible',
    'public_domain',
    true,
    'World English Bible (WEB), public domain.'
  );

-- Scripture references (translation-independent addresses).
insert into scripture_refs
  (id, book, chapter, verse_start, verse_end, canonical_ref, osis, sort_key) values
  ('10000000-0000-0000-0000-000000000001', 'Genesis', 1, 1, 1, 'Genesis 1:1', 'Gen.1.1', 1001001),
  ('10000000-0000-0000-0000-000000000002', 'Psalm', 23, 1, 1, 'Psalm 23:1', 'Ps.23.1', 19023001),
  ('10000000-0000-0000-0000-000000000003', 'Philippians', 4, 13, 13, 'Philippians 4:13', 'Phil.4.13', 50004013),
  ('10000000-0000-0000-0000-000000000004', 'John', 3, 16, 16, 'John 3:16', 'John.3.16', 43003016),
  ('10000000-0000-0000-0000-000000000005', 'John', 11, 35, 35, 'John 11:35', 'John.11.35', 43011035);

-- WEB verse text for each reference.
insert into verse_texts (scripture_ref_id, translation_id, text, word_count) values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'In the beginning, God created the heavens and the earth.',
    10
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Yahweh is my shepherd; I shall lack nothing.',
    8
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'I can do all things through Christ, who strengthens me.',
    10
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
    26
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Jesus wept.',
    2
  );

-- Curated starter pack, ordered gentlest-first for a good first session.
insert into packs (id, slug, title, description, category, age_band_hint, sort_order) values
  (
    '20000000-0000-0000-0000-000000000001',
    'getting-started',
    'Getting Started',
    'A gentle first set of well-known verses to learn the first-letter method.',
    'beginner',
    'all',
    0
  );

insert into pack_items (pack_id, scripture_ref_id, position) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 1),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 2),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 3),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 4),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 5);

-- Milestone badges (criteria evaluated in Phase 1.7).
insert into badges (slug, title, description, criteria_type, criteria_value) values
  ('first-verse', 'First Verse', 'Master your very first verse.', 'verses_mastered', 1),
  ('ten-verses', 'Ten Strong', 'Master ten verses.', 'verses_mastered', 10),
  ('week-streak', '7-Day Streak', 'Practice seven days in a row.', 'streak_days', 7),
  ('pack-finisher', 'Pack Finisher', 'Complete a full verse pack.', 'pack_complete', 1);
