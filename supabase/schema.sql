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

-- 誰が読んだのかを、粗いカテゴリで見せる（任意）。
-- 会社名も細かい職種も持たない。年代・地域と3つ揃うと個人が絞れるため。
alter table responders add column if not exists job_band text;   -- model.ts の JobBand
alter table responders add column if not exists tone text;       -- model.ts の Tone（回答の書き方）

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
  -- 既定は下で 'draft' に変える（有料化。支払い前に配らない）
  status text not null default 'recruiting', -- draft/payment_pending/review/recruiting/collecting/completed/refunded/cancelled
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
-- 列名は、コードが実際に使っているものに合わせてある（amount / payment_status）。
-- 以前ここが amount_yen / status になっていて、
--   create index ... (payment_status) で schema.sql がその行で止まり、
--   /api/checkout の insert も列が無くて必ず失敗した。
-- つまり「決済が1件も通らない」状態だった。
-- scripts/check-schema.mjs が、同じずれを二度と通さない。
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references consultations(id) on delete set null,
  provider text default 'stripe',
  provider_ref text,
  amount int not null,                       -- 税込の円。プランの値段をサーバが入れる
  payment_status text default 'pending',     -- pending / paid / refunded / partially_refunded / failed
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 旧い名前で作られた DB を直す。新しく作った DB では何も起きない。
alter table payments add column if not exists amount int;
alter table payments add column if not exists payment_status text default 'pending';
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_name = 'payments' and column_name = 'amount_yen') then
    update payments set amount = coalesce(amount, amount_yen);
    alter table payments alter column amount_yen drop not null;
  end if;
  if exists (select 1 from information_schema.columns
             where table_name = 'payments' and column_name = 'status') then
    update payments set payment_status = coalesce(payment_status, status);
  end if;
end $$;
alter table payments alter column amount set not null;

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
  r.job_band,
  r.tone,
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


-- ═══════════════════════════════════════════════════════════════
-- 有料化（Stripe）
--
-- 無料ベータをやめ、都度課金にする。
-- 検証したいのは「ChatGPT が無料で使える時代に、
-- 実在の人の反応に 5,980円 以上払うか」の1点なので、
-- 無料の利用者数は指標にしない。
--
-- ── 決済が終わるまで配らない ────────────────────
-- consultations.status は payment_pending から動かさない。
-- recruiting へ進めるのは Webhook が支払いを確認したときだけ。
-- success_url では進めない（URLは手で叩ける）。
-- ═══════════════════════════════════════════════════════════════

alter table consultations add column if not exists product_type text;   -- human_check / target_check / human_test
alter table consultations add column if not exists price int;           -- 請求した金額（円）。サーバーが入れる
-- オプション（「もう一度」「話す」を基本相談に付け足す売り方）は廃止した。
-- 商品は plans.ts の5つだけで、金額も人数も product_type から server 側で引き直す。
-- 画面から来た金額は保存しない。
-- 既に options 列がある環境はそのまま残してよい（読み書きしない）。
alter table consultations add column if not exists asker_id uuid;       -- 会員を入れたときのため。いまは null
alter table consultations add column if not exists paid_at timestamptz; -- 支払いが確認できた時刻
-- 人が見てから配るか。画像つきの相談は、払われても自動では配らない。
-- 支払いの確認が draft → recruiting を動かすので、
-- この判断は相談を受け取った時点で持っておく必要がある。
alter table consultations add column if not exists needs_review boolean not null default false;
-- 検証の核心。「ChatGPT が無料で使えるのに、それでも払ったか」。
-- 任意の設問なので、答えなかった人は null。null を false と混ぜない。
alter table consultations add column if not exists asked_ai boolean;
-- 結果を見たあとに聞く「なぜ人にも聞いたか」。選択式。答えなければ空。
alter table consultations add column if not exists ask_reasons jsonb default '[]'::jsonb;

-- ── 届くまでを見せる ────────────────────────────
-- 「1人目が見ています」を本当の数から出すために、開いた時刻を持つ。
-- 誰が開いたかは相談者に渡さない。数えるためだけに使う。
alter table response_invites add column if not exists opened_at timestamptz;
create index if not exists response_invites_consultation_idx
  on response_invites (consultation_id);

-- ── 直して、もう一度聞く ────────────────────────
-- 2回目は別の相談として作り、1回目にぶら下げる。
-- 同じ行を上書きすると、前と後を並べられなくなる。
alter table consultations add column if not exists round int not null default 1;
alter table consultations add column if not exists parent_id uuid
  references consultations(id) on delete set null;
create index if not exists consultations_parent_idx on consultations (parent_id);

-- ── 今、答えられる人 ────────────────────────────
-- 回答者が自分で ON / OFF する。切れる時刻も持つ。
-- 切れる時刻が無いと、ONのまま放置された人に配り続けることになる。
alter table responders add column if not exists available boolean not null default false;
alter table responders add column if not exists available_until timestamptz;
create index if not exists responders_available_idx
  on responders (available, display_age_band);

-- 既定値を draft に変える。
-- recruiting のままだと、列を書き忘れた経路から
-- 払っていない相談が募集に入る。
alter table consultations alter column status set default 'draft';

-- 状態:
--   draft → payment_pending → paid(内部) → recruiting → collecting → completed
--   review は画像つきの相談が支払い後に入る（人が見てから recruiting へ）
--   cancelled / refunded
-- 決済前は recruiting に入らない。

-- 回答者がどこから来たか。供給側の集客を、需要側と同じ物差しで見るのに要る。
-- これが無いまま /api/join が utm_source を送っていたので、登録が全部失敗していた。
alter table responders add column if not exists utm_source text;
alter table responders add column if not exists referrer_host text;
alter table responders add column if not exists landing_path text;

alter table payments add column if not exists stripe_checkout_session_id text;
alter table payments add column if not exists stripe_payment_intent_id text;
alter table payments add column if not exists currency text default 'jpy';
alter table payments add column if not exists refunded_at timestamptz;

-- 同じ Checkout を二度記録しない。Webhook は再送される前提。
create unique index if not exists payments_session_uniq
  on payments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create unique index if not exists payments_intent_uniq
  on payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists payments_consultation_idx on payments (consultation_id, payment_status);

-- 回答者への謝礼。
-- MVP では Stripe Connect を使わず、手で精算する。
-- ただし後から Connect へ移せるよう、送金先と状態の列だけ用意しておく。
alter table rewards add column if not exists consultation_id uuid references consultations(id) on delete set null;
alter table rewards add column if not exists status text default 'pending';  -- pending / paid / void
alter table rewards add column if not exists payout_ref text;                -- 手で振り込んだときの控え。将来は Connect の transfer id

-- 売上と、回答がどこで止まっているか。
create or replace view sales_board as
select
  date_trunc('day', p.paid_at) as day,
  c.product_type,
  count(*) filter (where p.payment_status = 'paid') as paid_count,
  sum(p.amount) filter (where p.payment_status = 'paid') as paid_yen,
  count(*) filter (where p.payment_status = 'refunded') as refunded_count,
  count(*) filter (where c.status = 'completed') as completed_count
from payments p
join consultations c on c.id = p.consultation_id
where p.paid_at is not null
group by 1, 2
order by 1 desc;


-- 「話す」の順番待ち。
-- まだ売れない商品の需要だけ先に測る。お金は受け取らない。
-- 何に迷っているかは聞かない（買えないものの入口で悩みを預からせない）。
create table if not exists talk_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  utm_source text,
  referrer_host text,
  notified_at timestamptz,
  created_at timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════════
-- 回答者の残高
--
-- 報酬が確定するのは即時。銀行への出金はまとめて。
-- 1件200円を毎回振り込むと、送金の手数料と手間だけが積み上がる。
--
--   答えた → 品質の確認を通った瞬間 → 残高に入る（即時）
--   残高   → まとまったら出金申請   → まとめて振り込む
--
-- 回答者から見れば「答えたらすぐ稼げた」。
-- 裏ではまとめて精算できる。
-- ═══════════════════════════════════════════════════════════════

-- 何波目で声をかけたか。1波目で足りなければ2波目を作る。
alter table response_invites add column if not exists wave int not null default 1;

-- 回答者の段。良い回答をすると、単価の高い仕事が回ってくる。
-- 順位を公開して競わせることはしない。
alter table responders add column if not exists tier text not null default 'bronze';
  -- bronze / trusted / top
alter table responders add column if not exists helpful_rate numeric(4,3);
alter table responders add column if not exists reports_count int not null default 0;

-- 残高。1行1回答者。
create table if not exists responder_balances (
  responder_id uuid primary key references responders(id) on delete cascade,
  -- 確定していて、まだ出金していない額
  available_yen int not null default 0,
  -- 出金申請中で、振り込み待ちの額
  pending_yen int not null default 0,
  -- これまでに稼いだ合計（表示用。減らさない）
  lifetime_yen int not null default 0,
  updated_at timestamptz default now()
);

-- 残高が動いた記録。増減は必ずここを通す。
-- 残高テーブルだけを直接書き換えると、合わない日が来たときに追えない。
create table if not exists responder_ledger (
  id uuid primary key default gen_random_uuid(),
  responder_id uuid not null references responders(id) on delete cascade,
  -- earn: 回答の報酬 / bonus: 上乗せ / payout: 出金 / adjust: 訂正
  kind text not null,
  yen int not null,                   -- 増えるときは正、減るときは負
  response_id uuid references responses(id) on delete set null,
  consultation_id uuid references consultations(id) on delete set null,
  note text,
  created_at timestamptz default now()
);

create index if not exists responder_ledger_who_idx
  on responder_ledger (responder_id, created_at desc);

-- 同じ回答に二度払わない。
create unique index if not exists responder_ledger_earn_uniq
  on responder_ledger (response_id)
  where kind = 'earn' and response_id is not null;

-- 出金申請。まとめて振り込むための単位。
create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  responder_id uuid not null references responders(id) on delete cascade,
  yen int not null,
  -- requested / sent / failed
  status text not null default 'requested',
  -- 振り込んだときの控え。将来 Connect に移すときは transfer id
  ref text,
  requested_at timestamptz default now(),
  sent_at timestamptz
);

create index if not exists payouts_status_idx on payouts (status, requested_at);

-- 回答ごとに、いくら払うことになっているか。
-- 案件を作った時点で決まる（動的に決めるので、回答ごとに違う）。
alter table response_invites add column if not exists reward_yen int;

-- 今日いくら稼いだか。回答者の画面に出す。
create or replace view responder_today as
select
  responder_id,
  sum(yen) filter (where kind in ('earn','bonus')) as earned_yen,
  count(*) filter (where kind = 'earn') as answered
from responder_ledger
where created_at >= date_trunc('day', now())
group by responder_id;

-- 条件を広げて続行した時刻。二度広げない／広げた事実を残すため。
alter table consultations add column if not exists widened_at timestamptz;
-- 一部だけ返金した状態。payments.payment_status に partially_refunded が入る。


-- ═══════════════════════════════════════════════════════════════
-- 回答者が友達を呼ぶ
--
-- 相談する側には紹介を置かない。使う瞬間が恥ずかしい瞬間なので、
-- 人に言わない。回答する側は言える（空いた2分で180円）。
-- そして供給が増えることが、このサービスが速くなる唯一の道。
--
-- 登録しただけでは払わない。実際に5件答えてから、二人に払う。
-- ═══════════════════════════════════════════════════════════════

-- 回答者ひとりに1つ渡す鍵。自分の画面を開くために使う。
alter table responders add column if not exists token text unique;
-- 友達に渡すコード。短い。これ単体では何もできない。
alter table responders add column if not exists referral_code text unique;
-- 誰から来たか
alter table responders add column if not exists referred_by uuid
  references responders(id) on delete set null;
-- 紹介が成立したか（5件答えた時点で立てる）
alter table responders add column if not exists referral_paid_at timestamptz;

create index if not exists responders_referred_by_idx on responders (referred_by);

-- 紹介の実績。呼んだ人の画面に出す。
create or replace view responder_referrals as
select
  r.referred_by as inviter_id,
  count(*) as invited,
  count(*) filter (where r.referral_paid_at is not null) as completed
from responders r
where r.referred_by is not null
group by r.referred_by;

-- ═══════════════════════════════════════════════════════════════
-- A/B の結果だけ、共有できるようにする
--
-- 相談の鍵（c...）は、その相談の持ち主の鍵。これを共有させない。
-- 共有したら、相談の全文も次の操作もすべて渡すことになる。
--
-- 共有用に別の鍵を作る。開けるのは A と B の割れ方と、
-- ひとことのコメントだけ。本文も、誰が聞いたかも出ない。
-- ═══════════════════════════════════════════════════════════════

create table if not exists shares (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  token text unique not null,         -- 共有用（s + 32文字）
  revoked_at timestamptz,             -- 取り消したら開かなくなる
  views int not null default 0,
  created_at timestamptz default now()
);

create index if not exists shares_consultation_idx on shares (consultation_id);

-- 共有面に出してよいものだけを集めたビュー。
-- 本文・選択肢の中身・相談の鍵は、ここに含めない。
create or replace view share_public as
select
  s.token,
  s.revoked_at,
  c.id as consultation_id,
  c.is_ab,
  c.panel_size,
  c.category
from shares s
join consultations c on c.id = s.consultation_id
where c.is_ab = true;


-- 恋愛のどの段階の相談か。
-- before / matched / before_meet / date / deeper
--
-- 単発の相談の集合ではなく、プロセスとして見るために持つ。
-- どの段階でいちばん人に聞かれるのかが、ここでしか分からない。
--
-- 相手の情報は持たない（名前もアプリ名も保存しない）。
-- 同じ相手をまとめるラベルは、利用者の端末の中だけに置く。
alter table consultations add column if not exists journey_step text;
create index if not exists consultations_step_idx on consultations (journey_step, created_at desc);


-- ═══════════════════════════════════════════════════════════════
-- 販売を回すための集計
--
-- 出稿を増やすか止めるかを、毎朝これだけで決められるようにする。
-- 見るのは4つ。
--   いくら売れたか / どこで落ちているか / どの流入が売上になったか /
--   売ったあとに返金になっていないか
--
-- 率は画面側で出す。ここでは数だけ持つ（分母の取り違えを1か所に閉じる）。
-- ═══════════════════════════════════════════════════════════════

-- 日ごとの売上。返金は引かず、別の列で持つ（引くと、返金が見えなくなる）。
create or replace view sales_daily as
select
  date_trunc('day', p.paid_at)::date          as day,
  count(*) filter (where p.payment_status in ('paid', 'partially_refunded'))      as paid_count,
  coalesce(sum(p.amount) filter (where p.payment_status in ('paid', 'partially_refunded')), 0) as paid_yen,
  count(*) filter (where p.payment_status in ('refunded', 'partially_refunded'))  as refunded_count
from payments p
where p.paid_at is not null
group by 1
order by 1 desc;


-- 流入元ごとの売上。
-- 相談に付いている utm を使う（買った相談がどこから来たか）。
-- イベント側の utm と混ぜない。混ぜると、同じ人が二重に数えられる。
create or replace view sales_by_source as
select
  coalesce(c.utm_source, c.referrer_host, 'direct') as source,
  c.landing_path,
  c.product_type,
  count(*) filter (where p.payment_status in ('paid', 'partially_refunded'))      as paid_count,
  coalesce(sum(p.amount) filter (where p.payment_status in ('paid', 'partially_refunded')), 0) as paid_yen,
  count(*) filter (where p.payment_status in ('refunded', 'partially_refunded'))  as refunded_count,
  min(p.paid_at) as first_paid_at,
  max(p.paid_at) as last_paid_at
from payments p
join consultations c on c.id = p.consultation_id
where p.paid_at is not null
group by 1, 2, 3
order by 5 desc;


-- 購入までの各段を、流入元ごとに数える。
-- 着地（site_landed）を分母に置く。これが無いと、
-- 広告の管理画面のクリック数を信じるしかなくなる。
create or replace view funnel_by_source as
select
  coalesce(utm_source, referrer_host, 'direct') as source,
  utm_campaign,
  count(*) filter (where event_name = 'site_landed')      as landed,
  count(*) filter (where event_name = 'plan_viewed')      as plan_viewed,
  count(*) filter (where event_name = 'ask_submitted')    as submitted,
  count(*) filter (where event_name = 'checkout_started') as checkout_started,
  count(*) filter (where event_name = 'purchase_paid')    as paid,
  count(*) filter (where event_name = 'checkout_blocked') as blocked
from events
where created_at > now() - interval '30 days'
group by 1, 2
order by 3 desc;


-- 日ごとの各段。落ちはじめた日が分かる。
create or replace view funnel_daily as
select
  date_trunc('day', created_at)::date as day,
  count(*) filter (where event_name = 'site_landed')      as landed,
  count(*) filter (where event_name = 'plan_viewed')      as plan_viewed,
  count(*) filter (where event_name = 'ask_submitted')    as submitted,
  count(*) filter (where event_name = 'checkout_started') as checkout_started,
  count(*) filter (where event_name = 'purchase_paid')    as paid
from events
where created_at > now() - interval '60 days'
group by 1
order by 1 desc;


-- 決済を始められなかった理由。
-- 法令の表記や鍵の不足が、ここに数で出る。
-- 「出稿したのに売れない」の原因がここにあることがある。
create or replace view checkout_blocks as
select
  coalesce(props ->> 'why', 'unknown') as why,
  coalesce(props ->> 'plan', 'unknown') as plan,
  count(*) as n,
  max(created_at) as last_at
from events
where event_name = 'checkout_blocked'
  and created_at > now() - interval '30 days'
group by 1, 2
order by 3 desc;


-- ═══════════════════════════════════════════════════════════════
-- 声で話す（15分 / 30分）
--
-- ── 時間はここが持つ ────────────────────────────
-- 画面のカウントダウンは飾り。ブラウザの時計は変えられる。
-- 実際に切るのは started_at / ends_at だけ。
--
-- ── 先に入った人からは数えない ──────────────────
-- 女性が5分早く入っても、そこからは数えない。
-- 両方がつながった時刻を started_at にする。
--
-- ── 切れても延びない ────────────────────────────
-- 入り直しても ends_at は動かさない。
-- 延ばせるのは運営だけ。そのとき extended_minutes と extended_by に残す。
--
-- ── 録らない ────────────────────────────────────
-- 録音・録画・文字起こしの列は作らない。
-- 列が無ければ、設定を1つ変えるだけでは録れない。
-- ═══════════════════════════════════════════════════════════════

create table if not exists call_sessions (
  id uuid primary key default gen_random_uuid(),
  -- 相談した人がこの通話を開く鍵（c + 32文字。相談と同じ形）
  token text unique not null,
  -- もとの相談。文字の相談から通話へ続いたときに紐づく
  consultation_id uuid references consultations(id),
  -- 答える人。決まるまで null
  responder_id uuid references responders(id),
  -- どの商品か（plans.ts の PlanId）。金額も分数もここから引く
  plan_id text not null,
  -- 何分の通話か。plans.ts の callMinutes を写す。
  -- 写すのは、あとから商品の分数を変えても、
  -- 売った通話の長さが変わらないようにするため。
  duration_minutes int not null check (duration_minutes in (15, 30)),
  -- 請求した金額（円）。サーバーが入れる
  price int,

  -- 予約した時刻。運営が確定する
  scheduled_at timestamptz,
  -- 両方がつながった時刻。ここから数える
  started_at timestamptz,
  -- 終わる時刻。started_at + duration_minutes。ここだけが切る根拠
  ends_at timestamptz,
  -- 実際に切れた時刻
  ended_at timestamptz,

  -- どちらが入っているか。両方 true になった瞬間に started_at を決める
  asker_joined_at timestamptz,
  responder_joined_at timestamptz,

  status text not null default 'pending_payment',

  -- 通話の部屋（外のサービス側の名前とURL）
  room_name text,
  room_url text,

  -- 決済
  stripe_payment_id text,
  paid_at timestamptz,

  -- 運営が延ばしたとき。理由と誰がやったかを残す
  extended_minutes int not null default 0,
  extended_by text,
  extended_reason text,

  -- 終わったあと
  asker_rating int check (asker_rating between 1 and 5),
  asker_again boolean,
  asker_note text,
  responder_note text,
  -- 答える人へ払う額（円）。economics.ts の上限を超えない
  reward_yen int,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists call_sessions_status_idx on call_sessions (status, scheduled_at);
create index if not exists call_sessions_responder_idx on call_sessions (responder_id, scheduled_at);

-- 運営の画面。今日の通話と、手を入れるところ。
-- 本文（相談の中身）はここに出さない。相談した人のものなので、
-- 必要なときに consultations を見る。
create or replace view call_board as
select
  cs.id,
  cs.token,
  cs.plan_id,
  cs.duration_minutes,
  cs.status,
  cs.scheduled_at,
  cs.started_at,
  cs.ends_at,
  cs.ended_at,
  cs.responder_id,
  r.display_age_band as responder_age_band,
  r.verified_age,
  cs.asker_joined_at,
  cs.responder_joined_at,
  cs.price,
  cs.reward_yen,
  cs.extended_minutes,
  cs.asker_rating,
  cs.created_at
from call_sessions cs
left join responders r on r.id = cs.responder_id
order by coalesce(cs.scheduled_at, cs.created_at) desc;
