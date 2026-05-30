-- His Recoveries — Insight Database Schema
-- Run this once in Supabase SQL Editor to set up the tables.
-- Re-running is safe (uses IF NOT EXISTS).

-- ─────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────

create extension if not exists pgcrypto;

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  concern text,
  impact int,
  tried text,
  goal text,
  has_email boolean default false,
  email_hash text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer_host text,
  landing_path text,
  created_at timestamptz default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  category text,
  before_text text,
  did_text text,
  changed_text text,
  consent text,
  has_email boolean default false,
  email_hash text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer_host text,
  landing_path text,
  created_at timestamptz default now()
);

create table if not exists letters (
  id uuid primary key default gen_random_uuid(),
  category text,
  body text,
  has_email boolean default false,
  email_hash text,
  utm_source text,
  referrer_host text,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  props jsonb default '{}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer_host text,
  landing_path text,
  path text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────

create index if not exists events_created_at_idx on events(created_at desc);
create index if not exists events_event_name_idx on events(event_name);
create index if not exists assessments_concern_idx on assessments(concern);
create index if not exists assessments_created_at_idx on assessments(created_at desc);
create index if not exists stories_category_idx on stories(category);
create index if not exists stories_created_at_idx on stories(created_at desc);

-- ─────────────────────────────────────────────
-- Row Level Security
-- Anon key may INSERT (forms post anonymously).
-- Service role key (server only) may SELECT for the admin dashboard.
-- ─────────────────────────────────────────────

alter table assessments enable row level security;
alter table stories enable row level security;
alter table letters enable row level security;
alter table events enable row level security;

drop policy if exists "anon insert assessments" on assessments;
create policy "anon insert assessments" on assessments
  for insert to anon with check (true);

drop policy if exists "anon insert stories" on stories;
create policy "anon insert stories" on stories
  for insert to anon with check (true);

drop policy if exists "anon insert letters" on letters;
create policy "anon insert letters" on letters
  for insert to anon with check (true);

drop policy if exists "anon insert events" on events;
create policy "anon insert events" on events
  for insert to anon with check (true);

-- ─────────────────────────────────────────────
-- Aggregation views (used by /admin/insights)
-- ─────────────────────────────────────────────

create or replace view daily_signals as
select
  date_trunc('day', created_at) as day,
  count(*) filter (where event_name = 'assessment_start') as assessment_starts,
  count(*) filter (where event_name = 'assessment_complete') as assessments_done,
  count(*) filter (where event_name = 'story_start') as story_starts,
  count(*) filter (where event_name = 'story_submitted') as stories_done,
  count(*) filter (where event_name = 'gathering_apply') as gathering_applies,
  count(*) filter (where event_name = 'affiliate_click') as affiliate_clicks,
  count(*) filter (where event_name = 'subscribe_click') as subscribe_clicks,
  count(*) filter (where event_name = 'hero_cta_click') as hero_cta_clicks,
  count(*) filter (where event_name = 'article_cta_click') as article_cta_clicks
from events
group by 1
order by 1 desc;

create or replace view concern_frequency as
select
  concern,
  count(*) as count,
  round(avg(impact)::numeric, 1) as avg_impact,
  count(*) filter (where impact >= 8) as high_impact_count,
  count(*) filter (where tried = 'none') as untreated_count,
  count(*) filter (where tried in ('clinic', 'ongoing')) as treated_count,
  count(*) filter (where has_email) as email_capture_count
from assessments
where concern is not null
group by 1
order by 2 desc;

create or replace view story_categories as
select
  category,
  count(*) as count,
  count(*) filter (where consent = 'yes') as publishable_count,
  count(*) filter (where has_email) as email_capture_count,
  round(avg(length(before_text) + length(did_text) + length(changed_text))::numeric, 0) as avg_total_length
from stories
where category is not null
group by 1
order by 2 desc;

create or replace view affiliate_by_provider as
select
  props->>'provider' as provider,
  props->>'product' as product,
  count(*) as clicks,
  max(created_at) as last_click_at
from events
where event_name = 'affiliate_click'
group by 1, 2
order by 3 desc;

create or replace view utm_source_breakdown as
select
  coalesce(utm_source, referrer_host, 'direct') as source,
  count(*) as events,
  count(*) filter (where event_name = 'assessment_complete') as assessments,
  count(*) filter (where event_name = 'story_submitted') as stories,
  count(*) filter (where event_name = 'gathering_apply') as gathering_applies,
  count(*) filter (where event_name = 'affiliate_click') as affiliate_clicks
from events
group by 1
order by 2 desc;
