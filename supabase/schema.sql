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

-- Recovery Check submissions (Layer 2 product). Editor reads `email`
-- and the structured `responses` to write a personal report. Long-term,
-- `responses` feeds the anonymized Recovery Data layer.
create table if not exists checks (
  id uuid primary key default gen_random_uuid(),
  email text,                    -- short-lived contact (purge after reply)
  name text,
  email_hash text,               -- permanent anonymized identifier
  responses jsonb not null,
  status text default 'submitted', -- submitted / reviewing / replied / archived
  notes text,                    -- editor notes
  utm_source text,
  referrer_host text,
  landing_path text,
  created_at timestamptz default now()
);

-- Recovery Guide requests (Layer 3 product). 90-minute editorial
-- session intake. Editor confirms scheduling + payment by email.
create table if not exists guide_requests (
  id uuid primary key default gen_random_uuid(),
  email text,
  name text,
  email_hash text,
  format text default 'online',         -- online / in_person
  preferences jsonb default '[]'::jsonb,-- ['weekday_day','weekday_eve','weekend']
  check_taken text default 'no',        -- yes / no / maybe
  topic text not null,
  budget text default 'undecided',      -- beta / regular / undecided
  extra text,
  status text default 'submitted',      -- submitted / scheduling / scheduled / completed / cancelled
  notes text,                           -- editor notes
  utm_source text,
  referrer_host text,
  landing_path text,
  created_at timestamptz default now()
);

-- Recovery Certified applications (Layer 4 — the network moat).
-- Clinics / salons / gyms / specialists apply for the editorial
-- certification. Approved rows surface on /network publicly.
create table if not exists certified_applications (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  org_type text not null,               -- clinic / salon / gym / specialist
  rep_name text,
  email text,
  phone text,
  website_url text,
  location text,                        -- 東京 / 京都 / 大阪 / その他
  services_description text,            -- どんな施術 / サービスか
  philosophy text,                      -- 顧客理解についての立場
  principles_checked jsonb default '{}'::jsonb,
  -- {understanding,no_hard_sell,improvement_data,education,long_term:bool}
  has_nps_data text default 'no',       -- yes / no / maybe
  has_education text default 'no',      -- yes / no
  has_longterm_plan text default 'no',  -- yes / no
  notes text,                           -- editor + committee notes
  status text default 'submitted',
  -- submitted / reviewing / audit / committee / certified / declined / revoked
  certified_at date,
  certified_year int,
  public_blurb text,                    -- shown on /network when certified
  utm_source text,
  referrer_host text,
  landing_path text,
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
create index if not exists checks_status_idx on checks(status);
create index if not exists checks_created_at_idx on checks(created_at desc);
create index if not exists guide_requests_status_idx on guide_requests(status);
create index if not exists guide_requests_created_at_idx on guide_requests(created_at desc);
create index if not exists certified_applications_status_idx
  on certified_applications(status);
create index if not exists certified_applications_created_at_idx
  on certified_applications(created_at desc);

-- ─────────────────────────────────────────────
-- Row Level Security
-- Anon key may INSERT (forms post anonymously).
-- Service role key (server only) may SELECT for the admin dashboard.
-- ─────────────────────────────────────────────

alter table assessments enable row level security;
alter table stories enable row level security;
alter table letters enable row level security;
alter table events enable row level security;
alter table checks enable row level security;
alter table guide_requests enable row level security;
alter table certified_applications enable row level security;

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

drop policy if exists "anon insert checks" on checks;
create policy "anon insert checks" on checks
  for insert to anon with check (true);

drop policy if exists "anon insert guide_requests" on guide_requests;
create policy "anon insert guide_requests" on guide_requests
  for insert to anon with check (true);

drop policy if exists "anon insert certified_applications" on certified_applications;
create policy "anon insert certified_applications" on certified_applications
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
