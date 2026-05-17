-- Migration 0001: Initial Schema
-- Run this in Supabase SQL editor or via `supabase db push`

-- PROFILES (linked 1:1 to auth.users)
create table if not exists profiles (
  id           uuid primary key references auth.users on delete cascade,
  username     text unique not null,
  display_name text,
  avatar_url   text,
  bio          text,
  created_at   timestamptz default now()
);

-- CATEGORIES (seeded, admin-managed via Supabase dashboard)
create table if not exists categories (
  id          serial primary key,
  name        text not null,
  slug        text unique not null,
  description text,
  created_at  timestamptz default now()
);

-- POSTS
create table if not exists posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text unique not null,
  content_json    jsonb,
  excerpt         text,
  cover_image_url text,
  author_id       uuid not null references profiles(id) on delete cascade,
  category_id     int  references categories(id) on delete set null,
  language        text not null default 'vi' check (language in ('vi', 'en', 'ja')),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists posts_author_id_idx       on posts(author_id);
create index if not exists posts_category_id_idx     on posts(category_id);
create index if not exists posts_status_published_idx on posts(status, published_at desc);
create index if not exists posts_slug_idx            on posts(slug);

-- TAGS
create table if not exists tags (
  id   serial primary key,
  name text not null,
  slug text unique not null
);

-- POST_TAGS (junction)
create table if not exists post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id  int  references tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

-- COMMENTS (1-level nesting enforced at app layer via parent_id)
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id)    on delete cascade,
  author_id  uuid not null references profiles(id) on delete cascade,
  content    text not null check (char_length(content) <= 2000),
  parent_id  uuid references comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists comments_post_id_idx on comments(post_id, created_at);
