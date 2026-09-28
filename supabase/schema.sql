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
  -- Follow-up loop: who has been asked "その後どうですか?" and who became a
  -- Recovery Story. These are the foundations of the 10-cases moat asset.
  follow_up_at timestamptz,      -- when the editor sent the follow-up
  story_slug text,               -- if lifted into /stories/[slug], the slug
  created_at timestamptz default now()
);

-- Idempotent column additions (for tables created by older deploys).
alter table checks add column if not exists follow_up_at timestamptz;
alter table checks add column if not exists story_slug text;

-- Recovery Q&A submissions (/ask). A lightweight single-question
-- intake — the natural evolution of Recovery Check. Editor reads,
-- replies privately, and may publish an anonymized version under
-- /qa/[slug] if the asker consents (consent_publish).
create table if not exists asks (
  id uuid primary key default gen_random_uuid(),
  email text,                    -- short-lived contact (purge after reply / publication)
  email_hash text,               -- permanent anonymized identifier
  question text not null,
  context text,                  -- optional life-pain context line
  age_range text,                -- optional (e.g. "20代後半")
  territory text,                -- optional self-selected territory slug
  feeling text,                  -- optional referring feeling slug
  consent_reply boolean default true,    -- consent to receive an editor reply
  consent_publish boolean default false, -- consent to anonymized publication on /qa
  status text default 'submitted', -- submitted / reviewing / replied / published / archived
  notes text,                    -- editor notes
  qa_slug text,                  -- once published, the /qa/[slug] this was lifted into
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
create index if not exists asks_status_idx on asks(status);
create index if not exists asks_created_at_idx on asks(created_at desc);
create index if not exists asks_territory_idx on asks(territory);
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

drop policy if exists "anon insert asks" on asks;
create policy "anon insert asks" on asks
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


-- ═══════════════════════════════════════════════════════════════
-- 「女性に聞く」（Ask a woman）
--
-- 男性が匿名で相談を投稿し、招待した女性回答者が匿名で答える。
-- 価値は「生身の人間が実際にどう感じるか」にあるので、
-- ここに保存するのは人が書いた言葉であって、機械の判定ではない。
--
-- ── 会員登録を前提にしない ──────────────────────
-- MVP では相談者も回答者もアカウントを作らない。
-- URL に入っている鍵（token）を知っていることが、そのまま権限になる。
-- だから鍵は 32 文字で、漏れたら作り直す前提にする。
--
-- ── 相手（第三者）を保存しない ──────────────────
-- 相談に写り込む「相手」は、このサービスの利用者ではない。
-- その人の名前・連絡先・SNS を列として持たない。置き場所を作らない。
-- 本文に混ざったものは保存前に伏せ字にする（src/lib/ask/redact.ts）。
-- ═══════════════════════════════════════════════════════════════

-- 回答してくれる女性。運営が招待して1行ずつ入れる。
-- 本人の連絡先は通知に要るので持つが、相談者には一切出さない。
create table if not exists responders (
  id uuid primary key default gen_random_uuid(),
  display_age_band text not null,     -- 相談者に見せる年代 (20-24 / 25-29 / 30s ...)
  -- 属性のラベル。「誰に聞くか」を選べることが、この製品の価値そのもの。
  -- 配列で持つのは、後から種類を足すときにテーブルを変えないため。
  -- 例: ["app_user","single"]
  attrs jsonb default '[]'::jsonb,
  -- 回答実績。良い回答者に優先して配るために使う（MVP では記録のみ）。
  answered_count int default 0,
  rating_avg numeric(3,2),
  -- 公開プロフィールに出すもの。個人は特定できない粒度だけ。
  area text,                          -- 東京 / 大阪 など。市区町村までは持たない
  specialties jsonb default '[]'::jsonb, -- 得意なカテゴリ ["message","date"]
  -- 確認済みかどうか。C2C で相手が見えない以上、ここは表示に使う。
  -- 年齢は自己申告なので「確認済み」と書けるのは運営が確かめた人だけ。
  verified_age boolean default false,
  verified_profile boolean default false,
  avg_reply_minutes int,              -- 依頼から回答までの中央値。実績が出るまで null
  line_user_id text,                  -- LINE 通知先。未連携なら null
  email text,                         -- LINE を使わない人向け
  note text,                          -- 運営メモ（どこから来た人か等）
  active boolean default true,
  invited_at timestamptz default now(),
  last_replied_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists responders_active_idx on responders (active, display_age_band);

-- 相談1件。
create table if not exists consultations (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,         -- 相談者が結果を見るための鍵（c + 32文字）
  category text not null,             -- message / signal / date / photo / style / romance / distance / other
  -- 本文は伏せ字をかけた後のもの。原文は保存しない。
  -- 「原文も確認できる」ようにすると、伏せた意味が無くなる。
  body text not null,
  -- A/B のときだけ使う。どちらも本文と同じく伏せ字済み。
  option_a text,
  option_b text,
  is_ab boolean default false,
  -- 回答者が判断するのに要る最小限の状況
  asker_age_band text,
  other_age_band text,
  relation text,
  -- 誰に何人聞くか
  panel_age text not null default 'any',
  -- 年齢以外に指定された属性。空なら指定なし。
  panel_attrs jsonb default '[]'::jsonb,
  panel_size int not null default 3,
  status text not null default 'recruiting', -- draft/review/recruiting/collecting/completed/cancelled
  -- 伏せ字で何を消したか。相談者に「これは消しました」と見せるため。
  -- 消した中身そのものは持たない。
  redacted_kinds jsonb default '[]'::jsonb,
  -- 回答文をまとめた一文。まとめる仕組みが動いたときだけ入る。
  -- null の間は、画面にその欄ごと出さない。
  summary text,
  completed_at timestamptz,
  utm_source text,
  referrer_host text,
  landing_path text,
  created_at timestamptz default now()
);

create index if not exists consultations_status_idx on consultations (status, created_at desc);

-- 相談に添えた画像。
-- 画像の中の顔と文字は機械で消せないので、
-- 画像がある相談は status='review' から始まり、人が見てから募集に入る。
create table if not exists consultation_assets (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  storage_path text not null,         -- Supabase Storage のパス
  slot text default 'main',           -- main / a / b
  approved boolean default false,     -- 人が見て、配ってよいと判断した
  created_at timestamptz default now()
);

create index if not exists consultation_assets_c_idx on consultation_assets (consultation_id);

-- 誰にこの相談を配ったか。1行が1つの回答依頼になる。
-- 鍵はここに持つ。相談ごと・回答者ごとに違う鍵になるので、
-- 1つ漏れても他の相談は開けない。
create table if not exists response_invites (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  responder_id uuid references responders(id) on delete set null,
  token text unique not null,         -- 回答用の鍵（r + 32文字）
  notified_at timestamptz,
  opened_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists response_invites_c_idx on response_invites (consultation_id);

-- 回答。
-- 回答者どうしは、自分が出すまで他の回答を見られない。
-- （見えると、先に出た意見に引っ張られる）
create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  invite_id uuid unique references response_invites(id) on delete set null,
  -- 相談者に見せるのは年代だけ。誰が書いたかは出さない。
  display_age_band text not null,
  verdict text,                       -- good / ok / meh / stop
  pick text,                          -- a / b / neither （A/B のときだけ）
  -- カテゴリごとの2つ目の問い（例: 返信したいと思うか）。yes / no
  second text,
  comment text not null,
  -- 相談した人が「役に立った」と押したか。押されるまでは null。
  -- helpful率を名乗れるのは、これが貯まってから。
  helpful boolean,
  created_at timestamptz default now()
);

create index if not exists responses_c_idx on responses (consultation_id, created_at);

-- 回答者への謝礼。MVP では記録だけ持ち、支払いは運営が手で行う。
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  responder_id uuid references responders(id) on delete set null,
  response_id uuid references responses(id) on delete set null,
  amount_yen int not null default 0,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 相談の代金。
-- 特定商取引法に基づく表記（事業者の氏名・所在地・電話番号・価格）が
-- 揃うまで請求しないので、MVP ではこの表に行が入らない。
-- 先に作っておくのは、後から列を足す作業を相談の本体に持ち込まないため。
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references consultations(id) on delete set null,
  provider text default 'stripe',
  provider_ref text,
  amount_yen int not null,
  status text default 'pending',      -- pending / paid / refunded / failed
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 運営が見る一覧。いま何件が、どの段階で止まっているか。
create or replace view consultation_board as
select
  c.id,
  c.created_at,
  c.status,
  c.category,
  c.panel_age,
  c.panel_size,
  count(distinct i.id) as invited,
  count(distinct r.id) as answered,
  c.panel_size - count(distinct r.id) as remaining
from consultations c
left join response_invites i on i.consultation_id = c.id
left join responses r on r.consultation_id = c.id
group by c.id
order by c.created_at desc;


-- 回答者の公開プロフィール。
-- email と line_user_id をここに含めない。含めた瞬間に事故になる。
-- active（運営が確認済み）の人だけを出す。
create or replace view responder_profiles as
select
  r.id,
  r.display_age_band,
  r.area,
  r.attrs,
  r.specialties,
  r.verified_age,
  r.verified_profile,
  r.avg_reply_minutes,
  count(res.id) as answered,
  count(res.id) filter (where res.helpful is true) as helpful_yes,
  count(res.id) filter (where res.helpful is not null) as helpful_rated,
  max(res.created_at) as last_answered_at
from responders r
-- 回答は invite 経由で回答者に紐づく。直接の外部キーは持っていない
left join response_invites inv on inv.responder_id = r.id
left join responses res on res.invite_id = inv.id
where r.active = true
group by r.id;

-- いま流れている相談。本文は出さない（相談者のものなので）。
-- 出すのは「どんな問いが、誰に向けて、何件集まっているか」だけ。
create or replace view live_questions as
select
  c.id,
  c.created_at,
  c.category,
  c.panel_age,
  c.panel_attrs,
  c.panel_size,
  c.status,
  count(r.id) as answered
from consultations c
left join responses r on r.consultation_id = c.id
where c.status in ('recruiting', 'collecting', 'completed')
group by c.id
order by c.created_at desc;
