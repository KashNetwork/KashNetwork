-- Seed social-proof notification lines.
-- PLACEHOLDER content — replace with the client-approved list before launch
-- (docs/CLIENT-QUESTIONS.md #20). relative_time_text is illustrative; the
-- frontend may randomise it per session.

insert into notifications (location, member_label, message, relative_time_text, weight) values
  ('both',    'Verified Member from New York',    'Just earned 3 commissions today!',    '4 minutes ago', 2),
  ('both',    'Verified Member from Texas',       'Just earned their first commission!', '3 hrs ago',     2),
  ('both',    'New Member from Georgia',          'Just joined Kash Network!',           '1 minute ago',  3),
  ('both',    'Verified Member from California',  'Just earned 5 commissions today!',    '10 minutes ago',1),
  ('both',    'Verified Member from Alabama',     'Just earned another commission!',     '7 hrs ago',     2),
  ('both',    'Verified Member from Arizona',     'Just earned a residual commission!',  '5 minutes ago', 2),
  ('both',    'Verified Member from Florida',     'Just earned a residual commission!',  '12 minutes ago',2),
  ('both',    'New Member from Ohio',             'Just joined Kash Network!',           '2 minutes ago', 3),
  ('landing', 'Verified Member from Nevada',      'Just upgraded to Premium!',           '8 minutes ago', 1),
  ('sales',   'Verified Member from Washington',  'Just earned their first commission!', '6 minutes ago', 2);
