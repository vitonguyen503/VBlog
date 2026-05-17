-- Migration 0002: Row Level Security Policies

-- PROFILES
alter table profiles enable row level security;

create policy "Public read profiles"
  on profiles for select using (true);

create policy "User manages own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- CATEGORIES (read-only for all; writes via service role / dashboard)
alter table categories enable row level security;

create policy "Public read categories"
  on categories for select using (true);

-- POSTS
alter table posts enable row level security;

create policy "Public read published posts"
  on posts for select
  using (status = 'published');

create policy "Author reads own drafts"
  on posts for select
  using (auth.uid() = author_id);

create policy "Author inserts posts"
  on posts for insert
  with check (auth.uid() = author_id);

create policy "Author updates own posts"
  on posts for update
  using (auth.uid() = author_id);

create policy "Author deletes own posts"
  on posts for delete
  using (auth.uid() = author_id);

-- TAGS
alter table tags enable row level security;

create policy "Public read tags"
  on tags for select using (true);

create policy "Authenticated create tags"
  on tags for insert
  to authenticated
  with check (true);

-- POST_TAGS
alter table post_tags enable row level security;

create policy "Public read post_tags"
  on post_tags for select using (true);

create policy "Author manages post tags"
  on post_tags for all
  using (
    exists (
      select 1 from posts
      where id = post_id and author_id = auth.uid()
    )
  );

-- COMMENTS
alter table comments enable row level security;

create policy "Public read comments"
  on comments for select using (true);

create policy "Auth users insert comments"
  on comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Author updates own comment"
  on comments for update
  using (auth.uid() = author_id);

create policy "User or post-author deletes comment"
  on comments for delete
  using (
    auth.uid() = author_id
    or exists (
      select 1 from posts
      where id = post_id and author_id = auth.uid()
    )
  );
