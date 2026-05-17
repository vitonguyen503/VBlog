-- Seed data: initial categories
-- Run after migrations are applied

insert into categories (name, slug, description) values
  ('Technology', 'technology',  'Tech, code, programming tools'),
  ('Life',       'life',        'Personal thoughts and daily life'),
  ('Travel',     'travel',      'Places, journeys, and experiences'),
  ('Learning',   'learning',    'Books, courses, and personal growth')
on conflict (slug) do nothing;
