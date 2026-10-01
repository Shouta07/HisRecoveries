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

-- 言いにくい相談（距離感・触れ方・付き合う前・性の価値観）を受けるか。
--
-- 既定は false。自分で入れた人にだけ回る。
-- 既定を true にして「嫌なら外してください」にはしない。
-- 外し方を知らないまま届くことになる。
--
-- not null default false にしているのは、null を「たぶん受ける」と
-- 読み違える実装が混ざらないようにするため。
alter table responders add column if not exists takes_sensitive boolean not null default false;

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

-- どう変われば自然か。答える人が短く書く。
--
-- ここを AI に書かせない。
-- 「どう直すか」は、そう感じた本人が書いたものにいちばん価値がある。
-- AI が書くと、誰でも書ける一般論になる（それなら人に頼む理由が無い）。
alter table responses add column if not exists fix text;

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
  r.takes_sensitive,
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
-- 声で話す（15分。1回分 = 15分1本。時間の残高としては持たせない）
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


-- ═══════════════════════════════════════════════════════════════
-- 確かめる（5回パス）
--
-- ── 1件ずつ売らない ─────────────────────────────
-- 迷いは小さい。迷うたびに決済の画面が出ると、そこで止まる。
-- 売るのは「迷った時に5回まで使える状態」。
--
-- ── 残りはサーバーが持つ ────────────────────────
-- 画面の数字は表示。減らすのはここだけ。
-- 使った記録（pass_uses）を1件ずつ残し、
-- 残りは「買った回数 − 使った件数」で出す。
-- 数字を直接書き換える列は作らない（書き換えの事故を残さない）。
--
-- ── 自動更新しない ──────────────────────────────
-- 期限も作らない。買った回数は、使うまで残る。
-- 期限で消す仕組みを作ると、急がせる商売になる。
-- ═══════════════════════════════════════════════════════════════

create table if not exists ask_passes (
  id uuid primary key default gen_random_uuid(),
  -- 持ち主がこのパスを開く鍵（c + 32文字）
  token text unique not null,
  plan_id text not null,
  -- 買った回数。5回パスなら 5
  uses_total int not null check (uses_total > 0),
  price int,
  stripe_payment_id text,
  paid_at timestamptz,
  -- 運営が足したとき（返金の代わりなど）。理由も一緒に残す
  granted_extra int not null default 0,
  granted_reason text,
  created_at timestamptz default now()
);

create index if not exists ask_passes_paid_idx on ask_passes (paid_at desc);

-- 1回使うごとに1行。残りはここを数えて出す。
create table if not exists pass_uses (
  id uuid primary key default gen_random_uuid(),
  pass_id uuid not null references ask_passes(id),
  consultation_id uuid references consultations(id),
  created_at timestamptz default now()
);

create index if not exists pass_uses_pass_idx on pass_uses (pass_id, created_at desc);

-- 残り回数。画面はここを読む。
-- 引き算を1か所にしておかないと、数え方が画面ごとにずれる。
create or replace view pass_balance as
select
  p.id,
  p.token,
  p.plan_id,
  p.uses_total,
  p.granted_extra,
  p.paid_at,
  count(u.id) as used,
  (p.uses_total + p.granted_extra - count(u.id)) as remaining
from ask_passes p
left join pass_uses u on u.pass_id = p.id
where p.paid_at is not null
group by p.id;


-- ═══════════════════════════════════════════════════════════════
-- チケットを1回使う（数える側でやる）
--
-- ── なぜ関数にするか ────────────────────────────
-- 「残りを読む → 足りていれば使う」をアプリ側で2回に分けると、
-- その間にもう1つ来たときに、両方が「足りている」と判断する。
-- 5回パスで6回使える瞬間ができる。
--
-- 行をロックしたまま数えて書く。同時に来たもう一方は待つ。
--
-- ── 同じ相談で二度使わない ──────────────────────
-- 画面の二度押し、Webhookの再送、リロード。どれでも来る。
-- 同じ相談が既に使っていたら、使わずに「使用済み」として返す。
-- ═══════════════════════════════════════════════════════════════

create or replace function spend_pass(
  p_token text,
  p_consultation uuid,
  p_cost int
)
returns table (ok boolean, remaining int, why text)
language plpgsql
security definer
as $$
declare
  v_pass   ask_passes%rowtype;
  v_used   int;
  v_left   int;
  v_dup    int;
  i        int;
begin
  if p_cost is null or p_cost < 1 then
    return query select false, 0, '使う回数が不正です'::text;
    return;
  end if;

  -- ここで行を押さえる。同時に来たもう一方は、この先へ進めない。
  select * into v_pass
    from ask_passes
   where token = p_token
     and paid_at is not null
   for update;

  if not found then
    return query select false, 0, 'このパスは見つかりません'::text;
    return;
  end if;

  -- 同じ相談が既に使っているなら、二度目は使わない。
  if p_consultation is not null then
    select count(*) into v_dup
      from pass_uses
     where pass_id = v_pass.id
       and consultation_id = p_consultation;
    if v_dup > 0 then
      select count(*) into v_used from pass_uses where pass_id = v_pass.id;
      v_left := v_pass.uses_total + coalesce(v_pass.granted_extra, 0) - v_used;
      return query select true, greatest(v_left, 0), 'すでに使っています'::text;
      return;
    end if;
  end if;

  -- 出入りの合計。使った分は負、返した分は正で入っている。
  select coalesce(sum(amount), 0)::int into v_used
    from pass_uses where pass_id = v_pass.id;
  v_left := v_pass.uses_total + coalesce(v_pass.granted_extra, 0) + v_used;

  if v_left < p_cost then
    return query select false, greatest(v_left, 0), '残りが足りません'::text;
    return;
  end if;

  -- 2回分なら2行入れる。1行に「2」と書かない。
  -- 数で持つと、数え方を間違えたときに気づけない。
  for i in 1..p_cost loop
    insert into pass_uses (pass_id, consultation_id, kind, amount)
    values (v_pass.id, p_consultation, 'consume', -1);
  end loop;

  return query select true, v_left - p_cost, null::text;
end;
$$;


-- ═══════════════════════════════════════════════════════════════
-- 相手ごとのケース
--
-- ── なぜ要るか ──────────────────────────────────
-- 画面では「前回の続きから相談できます」と言っている。
-- 言っているのに、相談は1件ずつ独立していて、
-- 実際には毎回ゼロから書かせていた。
--
-- 人は伴走しない。文脈が伴走する。
-- その文脈を置く場所がここ。
--
-- ── 相手の情報は持たない ────────────────────────
-- 実名・連絡先・SNS・年齢そのものは持たない。
-- 持つのは「この相談者から見た、その関係の現在地」だけ。
-- 呼び名（partner_label）も相談者が自分で付けたもので、
-- 相手の本名を入れないよう画面側で断る。
--
-- ── 要約はAIが書いてよい ────────────────────────
-- current_summary は「これまでの経緯」の圧縮で、事実の整理。
-- 女性が感じたことをAIが書き換えるのとは別物。
-- ただし、入力されていない事実を足さないこと。
-- ═══════════════════════════════════════════════════════════════

create table if not exists relationship_cases (
  id uuid primary key default gen_random_uuid(),
  -- 持ち主がこのケースを開く鍵（c + 32文字）。会員登録は無い
  token text unique not null,
  -- 5回パスの鍵。同じ持ち主のケースをまとめるのに使う
  pass_token text,
  -- 相談者が付けた呼び名。相手の本名は入れない（画面で断る）
  partner_label text,
  user_age_band text,
  partner_age_band text,
  -- 出会ったところ。Pairs / with / タップル など
  dating_app text,
  -- いまどこにいるか。journey.ts の StepId と同じ語彙
  current_stage text,
  goal text,
  -- これまでの経緯の圧縮。新しい相談のときに、ここだけを渡す
  current_summary text,
  -- 前回、本人が決めたこと
  last_decision text,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists relationship_cases_pass_idx
  on relationship_cases (pass_token, updated_at desc);

-- 相談を、ケースにぶら下げる。
-- 既にある相談は case_id が null のまま（過去のものを壊さない）。
alter table consultations add column if not exists case_id uuid references relationship_cases(id);

create index if not exists consultations_case_idx on consultations (case_id, created_at);

-- ケースの流れ。マイページの「今ここ」に使う。
-- 本文は出さない（長くなるし、一覧で読むものではない）。
create or replace view case_timeline as
select
  rc.id as case_id,
  rc.token as case_token,
  rc.partner_label,
  rc.dating_app,
  rc.current_stage,
  rc.current_summary,
  rc.last_decision,
  c.id as consultation_id,
  c.token as consultation_token,
  c.category,
  c.status,
  c.journey_step,
  c.created_at,
  c.paid_at
from relationship_cases rc
left join consultations c on c.case_id = rc.id
order by rc.updated_at desc, c.created_at asc;


-- ═══════════════════════════════════════════════════════════════
-- チケットの出入りを、種別つきで持つ
--
-- ── なぜ「使った記録」だけでは足りないか ────────
-- 画面では「集まらなかった分はお返しします」と言っている。
-- 返すときに pass_uses の行を消すと、
-- 「使った→返した」という出来事そのものが消える。
-- あとから何が起きたのか追えなくなる。
--
-- 消さずに、打ち消す行を足す。
--   consume  -1
--   refund   +1
--   bonus    +1（運営が足す）
--   admin    ±（手で直す。理由を必ず書く）
--
-- 残り = 買った回数 + 足した回数 + 出入りの合計
--
-- ── 既にある行を壊さない ────────────────────────
-- 既存の行は kind も amount も入っていない。
-- default を consume / -1 にしてあるので、
-- 流し直しても、これまでの「使った」がそのまま -1 として数えられる。
-- ═══════════════════════════════════════════════════════════════

alter table pass_uses add column if not exists kind text not null default 'consume';
alter table pass_uses add column if not exists amount int not null default -1;
alter table pass_uses add column if not exists reason text;

-- 残りの出し方を、種別つきに直す。
create or replace view pass_balance as
select
  p.id,
  p.token,
  p.plan_id,
  p.uses_total,
  p.granted_extra,
  p.paid_at,
  -- 「使った回数」は、減らした行だけを数える（返した分は含めない）
  coalesce(sum(case when u.amount < 0 then -u.amount else 0 end), 0)::int as used,
  (p.uses_total + p.granted_extra + coalesce(sum(u.amount), 0))::int as remaining
from ask_passes p
left join pass_uses u on u.pass_id = p.id
where p.paid_at is not null
group by p.id;


-- ═══════════════════════════════════════════════════════════════
-- 使った1回分を返す
--
-- 人数が集まらなかったとき、こちらの都合で配れなかったとき。
-- 消すのではなく、打ち消す行を足す。
--
-- 二度返さない。同じ相談に既に返した行があれば、何もしない。
-- （返金の処理は、通信が切れて押し直されることがある）
-- ═══════════════════════════════════════════════════════════════

create or replace function refund_pass(
  p_consultation uuid,
  p_reason text
)
returns table (ok boolean, refunded int, remaining int, why text)
language plpgsql
security definer
as $$
declare
  v_pass_id uuid;
  v_spent   int;
  v_back    int;
  v_left    int;
  i         int;
begin
  if p_consultation is null then
    return query select false, 0, 0, '相談が指定されていません'::text;
    return;
  end if;

  -- どのパスから、何回分使ったか。
  select pass_id,
         coalesce(sum(case when amount < 0 then -amount else 0 end), 0)::int,
         coalesce(sum(case when amount > 0 then amount else 0 end), 0)::int
    into v_pass_id, v_spent, v_back
    from pass_uses
   where consultation_id = p_consultation
   group by pass_id
   limit 1;

  if v_pass_id is null then
    return query select false, 0, 0, 'この相談はチケットを使っていません'::text;
    return;
  end if;

  -- 行を押さえる。同時に来たもう一方は、ここで待つ。
  perform 1 from ask_passes where id = v_pass_id for update;

  -- 既に返してあるなら、二度返さない。
  if v_back >= v_spent then
    select remaining into v_left from pass_balance where id = v_pass_id;
    return query select true, 0, coalesce(v_left, 0), 'すでに返しています'::text;
    return;
  end if;

  for i in 1..(v_spent - v_back) loop
    insert into pass_uses (pass_id, consultation_id, kind, amount, reason)
    values (v_pass_id, p_consultation, 'refund', 1, p_reason);
  end loop;

  select remaining into v_left from pass_balance where id = v_pass_id;
  return query select true, (v_spent - v_back), coalesce(v_left, 0), null::text;
end;
$$;


-- ═══════════════════════════════════════════════════════════════
-- 答える人が、自分で案件を取る
--
-- ── なぜ要るか ──────────────────────────────────
-- 依頼（response_invites）は作られるのに、
-- 誰に届けるかが決まっていなかった。
-- 運営が1件ずつURLを送るしかなく、そこで詰まる。
--
-- 答える人が自分の画面で見て、答えたいものを取る形にする。
-- ノルマも指名もない、という約束（policy.ts）とも合う。
--
-- ── 同じ案件を2人が取らないこと ────────────────
-- 行を押さえてから確かめる。同時に来たもう一方は待たされ、
-- 起きたときには「もう取られている」と返る。
--
-- ── 言いにくい相談は、受けると決めた人だけ ──────
-- takes_sensitive が false の人には、そもそも一覧に出さず、
-- 取ろうとしても関数の側で止める（画面だけで隠さない）。
-- ═══════════════════════════════════════════════════════════════

-- まだ誰も取っていない依頼。本文は出さない。
-- 一覧で読むものではないし、取る前に全部読ませる必要も無い。
create or replace view open_invites as
select
  i.id,
  i.consultation_id,
  i.created_at,
  c.category,
  c.journey_step,
  c.panel_age,
  c.asker_age_band,
  c.other_age_band,
  c.is_ab,
  c.product_type
from response_invites i
join consultations c on c.id = i.consultation_id
where i.responder_id is null
  and i.answered_at is null
  and c.status in ('recruiting', 'collecting')
order by i.created_at asc;

create or replace function claim_invite(
  p_responder_token text,
  p_invite uuid
)
returns table (ok boolean, reply_token text, why text)
language plpgsql
security definer
as $$
declare
  v_r        responders%rowtype;
  v_invite   response_invites%rowtype;
  v_category text;
  v_status   text;
begin
  select * into v_r from responders where token = p_responder_token;
  if not found then
    return query select false, null::text, 'この鍵では取れません'::text;
    return;
  end if;
  -- 確認が済んでいない人には配らない。
  if coalesce(v_r.active, false) = false then
    return query select false, null::text, 'まだ確認が済んでいません'::text;
    return;
  end if;

  -- 行を押さえる。同時に来たもう一方は、ここで待つ。
  select * into v_invite from response_invites where id = p_invite for update;
  if not found then
    return query select false, null::text, 'この依頼は見つかりません'::text;
    return;
  end if;
  if v_invite.responder_id is not null then
    return query select false, null::text, 'この依頼は、もう取られています'::text;
    return;
  end if;
  if v_invite.answered_at is not null then
    return query select false, null::text, 'この依頼は、もう終わっています'::text;
    return;
  end if;

  select category, status into v_category, v_status
    from consultations where id = v_invite.consultation_id;
  if v_status not in ('recruiting', 'collecting') then
    return query select false, null::text, 'この相談は、いま募集していません'::text;
    return;
  end if;

  -- 言いにくい相談は、受けると決めた人だけ。
  -- 画面で隠すだけにしない（URLを直に叩かれる）。
  if v_category = 'distance' and coalesce(v_r.takes_sensitive, false) = false then
    return query select false, null::text, 'この種類の相談は受け取らない設定です'::text;
    return;
  end if;

  update response_invites
     set responder_id = v_r.id,
         opened_at = coalesce(opened_at, now())
   where id = p_invite;

  return query select true, v_invite.token, null::text;
end;
$$;


-- ═══════════════════════════════════════════════════════════════
-- 案件1件ごとの採算
--
-- ── なぜ要るか ──────────────────────────────────
-- いままでは商品ごとの「見込み」しか無かった。
-- 実際に1件でいくら残ったかが分からないと、直せない。
--
-- ── まとめ売りの売価の割り当て ──────────────────
-- 5回パスは1回いくらで売ったのかが決まっていない。
-- 買った金額 ÷ 買った回数 を、その1回の売価とする。
--
-- 使われなかった回数を利益にしない。
-- 「5枚のうち3枚しか使われないから、実質は1枚2,660円」
-- という数え方をすると、全部使われた月に赤字になる。
-- ═══════════════════════════════════════════════════════════════

-- 1件ごとの採算。数えるのはここだけにして、画面では計算しない。
create or replace view consultation_economics as
select
  c.id,
  c.token,
  c.product_type,
  c.status,
  c.created_at,
  c.paid_at,
  c.completed_at,
  -- 売価の割り当て。まとめ売りは「買った金額 ÷ 買った回数 × 使った回数」
  case
    when p.id is not null and p.uses_total > 0
      then round(p.price::numeric / p.uses_total
                 * coalesce((select sum(-u2.amount) from pass_uses u2
                              where u2.consultation_id = c.id and u2.amount < 0), 1))
    else coalesce(c.price, 0)
  end as allocated_revenue,
  -- 答える人へ払った額
  coalesce((select sum(rw.amount_yen) from rewards rw
             join responses rs on rs.id = rw.response_id
            where rs.consultation_id = c.id), 0) as reviewer_cost,
  -- 決済の手数料（3.6%の見込み。まとめ売りは割り当てた売価に対して）
  round(
    case
      when p.id is not null and p.uses_total > 0
        then p.price::numeric / p.uses_total
      else coalesce(c.price, 0)
    end * 0.036
  ) as payment_fee_estimate,
  -- 返した回数（チケット）
  coalesce((select sum(u3.amount) from pass_uses u3
             where u3.consultation_id = c.id and u3.amount > 0), 0) as refunded_tickets
from consultations c
left join pass_uses u on u.consultation_id = c.id and u.amount < 0
left join ask_passes p on p.id = u.pass_id
group by c.id, p.id, p.price, p.uses_total;

-- ══════════════════════════════════════════════════
-- 実行した結果
-- ══════════════════════════════════════════════════
-- 相談して、女性の反応を読んで、送るか送らないかを決めた。
-- そのあと、実際に何が起きたか。
--
-- ここが、このサービスと恋愛相談の違いになる。
-- 相談は「どう思いますか」で終わる。
-- ここは「で、どうなったか」まで持つ。
--
-- ── なぜ持つのか ──────────────────────────────
--   1 本人にとって  次に相談するとき、前回どうなったかから始められる
--   2 答えた人にとって 自分の反応が当たっていたかが分かる
--   3 運営にとって   どの場面で役に立っているかが、推測でなく分かる
--
-- ── 持たないもの ──────────────────────────────
-- 相手が誰か。相手の連絡先。相手が実際に送ってきた文面。
-- 相手はこのサービスに同意していない第三者なので、持たない。
-- 持つのは「返信が来た」「デートが決まった」という、
-- 相談した本人から見た出来事だけ。
--
-- ── 任意である ────────────────────────────────
-- 答えないまま放っておける。催促もしない。
-- 必須にすると、次に相談するときに邪魔になる。
create table if not exists case_events (
  id uuid primary key default gen_random_uuid(),
  -- どの相談の結果か
  consultation_id uuid not null references consultations(id) on delete cascade,
  -- 相手ごとのケース。ケースを作っていない相談もあるので null を許す
  case_id uuid references relationship_cases(id) on delete set null,
  -- 何が起きたか。lib/ask/outcome.ts の OutcomeId と同じ語彙
  outcome text not null,
  -- ひとこと。任意。相手を特定できることは書かないよう画面で断る
  note text,
  created_at timestamptz default now()
);

-- 1つの相談につき1件。二度押し・リロードで増やさない
create unique index if not exists case_events_one_per_consultation
  on case_events (consultation_id);

create index if not exists case_events_case_idx
  on case_events (case_id, created_at desc);

-- 結果を書く。
--
-- ── 二度書かない ──────────────────────────────
-- 画面の二度押し、通信が切れての押し直し、リロード。どれでも来る。
-- 既にあるなら、書かずにそれを返す。
--
-- ── 鍵で引く ──────────────────────────────────
-- 会員登録が無いので、相談の鍵を知っていること自体が持ち主の証。
-- 相談IDを画面から送らせない（他人の相談に書けてしまう）。
create or replace function record_outcome(
  p_token text,
  p_outcome text,
  p_note text
)
returns table (ok boolean, outcome text, why text)
language plpgsql
security definer
as $$
declare
  v_id      uuid;
  v_case    uuid;
  v_status  text;
  v_have    text;
begin
  select c.id, c.case_id, c.status
    into v_id, v_case, v_status
    from consultations c
   where c.token = p_token
   limit 1;

  if v_id is null then
    return query select false, null::text, 'この相談は見つかりません'::text;
    return;
  end if;

  -- 行を押さえる。同時に来たもう一方は、ここで待つ。
  perform 1 from consultations where id = v_id for update;

  -- 既に書いてあるなら、上書きしない。
  -- 「返信が来た」を「来なかった」に書き換えられると、
  -- 何が起きたかの記録ではなく、あとからの感想になる。
  select ce.outcome into v_have from case_events ce where ce.consultation_id = v_id limit 1;
  if v_have is not null then
    return query select true, v_have, 'すでに教えてもらっています'::text;
    return;
  end if;

  -- 回答が揃う前に結果は起きない。
  if v_status is distinct from 'completed' then
    return query select false, null::text, 'まだ回答が揃っていません'::text;
    return;
  end if;

  insert into case_events (consultation_id, case_id, outcome, note)
  values (v_id, v_case, p_outcome, nullif(btrim(coalesce(p_note, '')), ''));

  return query select true, p_outcome, null::text;
end;
$$;

-- どの場面で、どうなったか。
-- 推測ではなく、実際に教えてもらったぶんだけを数える。
create or replace view outcome_stats as
select c.category,
       e.outcome,
       count(*)::int as n
from case_events e
join consultations c on c.id = e.consultation_id
group by c.category, e.outcome;

-- ═══════════════════════════════════════════════════════════════
-- 今日、受け付けている人
--
-- ══════════════════════════════════════════════════
-- 「出勤」と呼ばない
-- ══════════════════════════════════════════════════
-- 画面に出す言葉は「受付」。内部の列名もそれに合わせる。
-- 「出勤」「在籍」「指名」は、この製品が売っているものと違う。
-- 売っているのは人ではなく、その人の反応。
--
-- ══════════════════════════════════════════════════
-- 無い数字は作らない
-- ══════════════════════════════════════════════════
-- 「受付中3人」は、本当に3人いるときだけ出す。
-- 「あと2枠」「平均18分」も、実績があるときだけ。
-- 賑わって見せるために数を盛ると、来た人が最初に気づく。
-- ═══════════════════════════════════════════════════════════════

-- いま受けるかどうか。本人が押して切り替える
alter table responders add column if not exists accepting boolean default false;
-- 同時に持てる件数。超えたら、新しい依頼を回さない
alter table responders add column if not exists max_concurrent int default 2;
-- 画面に出す呼び名。本名は入れない（登録の画面で断る）
alter table responders add column if not exists display_name text;

-- 受付の予定。
--
-- 日付と時刻で持つ。「毎週火曜18時」のような繰り返しは持たない。
-- 繰り返しを持つと、休んだ日を打ち消す仕組みが要る。
-- 予定は1日ずつ入れてもらう。
create table if not exists reviewer_shifts (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references responders(id) on delete cascade,
  -- 受付の開始と終了。保存は UTC、画面は JST（lib/reviewers/today.ts）
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz default now(),
  check (ends_at > starts_at)
);

create index if not exists reviewer_shifts_window_idx
  on reviewer_shifts (starts_at, ends_at);

-- いまの状態。
--
-- available 受付中で、まだ余裕がある
-- busy      受付中だが、手一杯
-- paused    予定の時間内だが、本人が止めている
-- offline   予定の時間外
--
-- 状態は列で持たない。予定と件数から、そのつど数えて出す。
-- 列で持つと、切り替え忘れがそのまま「受付中」として残る。
create or replace view reviewer_status as
select
  r.id,
  r.display_name,
  r.display_age_band,
  r.specialties,
  r.verified_age,
  r.verified_profile,
  r.takes_sensitive,
  r.answered_count,
  r.avg_reply_minutes,
  r.max_concurrent,
  -- いま抱えている件数
  coalesce(w.open_count, 0)::int as open_count,
  -- いま予定の中にいるか
  (s.id is not null) as in_shift,
  s.starts_at as shift_starts_at,
  s.ends_at   as shift_ends_at,
  -- 次に受け付ける予定
  (select min(n.starts_at) from reviewer_shifts n
    where n.reviewer_id = r.id and n.starts_at > now()) as next_starts_at,
  case
    when s.id is null then 'offline'
    when coalesce(r.accepting, false) = false then 'paused'
    when coalesce(w.open_count, 0) >= coalesce(r.max_concurrent, 2) then 'busy'
    else 'available'
  end as status
from responders r
left join lateral (
  select sh.id, sh.starts_at, sh.ends_at
    from reviewer_shifts sh
   where sh.reviewer_id = r.id
     and sh.starts_at <= now() and sh.ends_at > now()
   order by sh.ends_at desc
   limit 1
) s on true
left join lateral (
  select count(*) as open_count
    from response_invites i
   where i.responder_id = r.id and i.answered_at is null
) w on true
where coalesce(r.active, false) = true;

-- 依頼を1人に出す。
--
-- ══════════════════════════════════════════════════
-- くじ引きにしない
-- ══════════════════════════════════════════════════
-- 「おまかせ」は、相談する人から見ると誰が来るか分からない。
-- 裏では選んでいる。random() で選ぶと、
-- 手が空いている人と埋まっている人が同じ確率になる。
--
-- 並べ方は
--   1 いま抱えている件数が少ない人から（仕事を散らす）
--   2 その相談の種類を得意だと言っている人を先に
--   3 同じなら、待っている時間が長い人から
--
-- ══════════════════════════════════════════════════
-- 二重に渡さない
-- ══════════════════════════════════════════════════
-- 同じ相談を2人が受けると、2人ぶん払って1件しか返らない。
-- 行を押さえてから確かめる。
create table if not exists assignment_offers (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  reviewer_id uuid not null references responders(id) on delete cascade,
  offered_at timestamptz default now(),
  -- ここまでに受けなければ、次の人へ回す
  expires_at timestamptz not null,
  accepted_at timestamptz,
  -- offered / accepted / expired / passed
  status text not null default 'offered'
);

create index if not exists assignment_offers_live_idx
  on assignment_offers (status, expires_at);
create index if not exists assignment_offers_reviewer_idx
  on assignment_offers (reviewer_id, status);

-- 受けるまでの持ち時間。短いと取りこぼし、長いと相談者が待つ
create or replace function offer_window_minutes() returns int
language sql immutable as $$ select 20 $$;

-- 次の人に出す。
--
-- 相談1件につき、生きている offer は1つだけ。
-- 既に生きているものがあれば、何もせずにそれを返す
-- （Webhookの再送・二度押し・リロードは、どれでも来る）。
create or replace function offer_next(p_consultation uuid)
returns table (ok boolean, reviewer uuid, expires_at timestamptz, why text)
language plpgsql
security definer
as $$
declare
  v_cat   text;
  v_state text;
  v_live  assignment_offers%rowtype;
  v_pick  uuid;
  v_exp   timestamptz;
begin
  select c.category, c.status into v_cat, v_state
    from consultations c where c.id = p_consultation;
  if v_cat is null then
    return query select false, null::uuid, null::timestamptz, 'この相談は見つかりません'::text;
    return;
  end if;
  if v_state not in ('recruiting', 'collecting') then
    return query select false, null::uuid, null::timestamptz, 'この相談は、いま募集していません'::text;
    return;
  end if;

  -- 行を押さえる。同時に来たもう一方は、ここで待つ。
  perform 1 from consultations where id = p_consultation for update;

  -- 既に生きている offer があれば、増やさない。
  update assignment_offers
     set status = 'expired'
   where consultation_id = p_consultation
     and status = 'offered'
     and expires_at <= now();

  select * into v_live from assignment_offers
   where consultation_id = p_consultation and status = 'offered'
   limit 1;
  if found then
    return query select true, v_live.reviewer_id, v_live.expires_at, 'すでに出しています'::text;
    return;
  end if;

  -- 候補。
  --   受付中で、手が空いている
  --   言いにくい相談なら、受けると決めた人だけ
  --   この相談を、まだ断っていない／期限切れにしていない
  select s.id into v_pick
    from reviewer_status s
   where s.status = 'available'
     and (v_cat <> 'distance' or coalesce(s.takes_sensitive, false) = true)
     and not exists (
       select 1 from assignment_offers o
        where o.consultation_id = p_consultation and o.reviewer_id = s.id
     )
   order by s.open_count asc,
            -- その種類を得意だと言っている人を先に
            (case when s.specialties ? v_cat then 0 else 1 end) asc,
            s.answered_count asc
   limit 1;

  if v_pick is null then
    return query select false, null::uuid, null::timestamptz,
      'いま受け付けている人がいません'::text;
    return;
  end if;

  v_exp := now() + (offer_window_minutes() || ' minutes')::interval;
  insert into assignment_offers (consultation_id, reviewer_id, expires_at)
  values (p_consultation, v_pick, v_exp);

  return query select true, v_pick, v_exp, null::text;
end;
$$;

-- 受ける。
--
-- 2人が同時に押しても、1人しか通らない。
-- 通った人にだけ response_invites の行を渡す。
create or replace function accept_offer(p_responder_token text, p_offer uuid)
returns table (ok boolean, reply_token text, why text)
language plpgsql
security definer
as $$
declare
  v_r     responders%rowtype;
  v_o     assignment_offers%rowtype;
  v_inv   response_invites%rowtype;
begin
  select * into v_r from responders where token = p_responder_token;
  if not found or coalesce(v_r.active, false) = false then
    return query select false, null::text, 'この鍵では受けられません'::text;
    return;
  end if;

  -- 行を押さえる。もう一方はここで待つ。
  select * into v_o from assignment_offers where id = p_offer for update;
  if not found then
    return query select false, null::text, 'この依頼は見つかりません'::text;
    return;
  end if;
  if v_o.reviewer_id <> v_r.id then
    return query select false, null::text, 'この依頼は、あなた宛てではありません'::text;
    return;
  end if;
  if v_o.status <> 'offered' then
    return query select false, null::text, 'この依頼は、もう終わっています'::text;
    return;
  end if;
  if v_o.expires_at <= now() then
    update assignment_offers set status = 'expired' where id = p_offer;
    return query select false, null::text, '受付の時間が過ぎました'::text;
    return;
  end if;

  -- まだ誰も取っていない invite を、この人のものにする。
  select * into v_inv from response_invites
   where consultation_id = v_o.consultation_id
     and responder_id is null and answered_at is null
   limit 1
   for update;
  if not found then
    update assignment_offers set status = 'expired' where id = p_offer;
    return query select false, null::text, 'この相談は、もう埋まっています'::text;
    return;
  end if;

  update response_invites
     set responder_id = v_r.id, opened_at = coalesce(opened_at, now())
   where id = v_inv.id;

  update assignment_offers
     set status = 'accepted', accepted_at = now()
   where id = p_offer;

  return query select true, v_inv.token, null::text;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 通報と、利用を止めること
--
-- ══════════════════════════════════════════════════
-- 規約に書いて、黙認しない
-- ══════════════════════════════════════════════════
-- 「禁止しています」と書いてあるのに、通報の口が無いサービスは、
-- 実際には黙認している。書いたことと、できることを合わせる。
--
-- ══════════════════════════════════════════════════
-- 録音しないぶん、ここで受ける
-- ══════════════════════════════════════════════════
-- 通話は録音していない（room.ts で設定ごと止めてある）。
-- 録音は、規約違反を把握しないための逃げ道にしない。
-- 代わりに、答えた人がその場で出せる口を作る。
--
-- ══════════════════════════════════════════════════
-- 押した人が損をしない
-- ══════════════════════════════════════════════════
-- 通報しても、その回の報酬は引かない。
-- 引くと、我慢したほうが得になる。
-- ═══════════════════════════════════════════════════════════════

create table if not exists safety_reports (
  id uuid primary key default gen_random_uuid(),
  -- 出した人（答える側）
  reviewer_id uuid references responders(id) on delete set null,
  -- どの相談・どの通話で起きたか。どちらか片方でよい
  consultation_id uuid references consultations(id) on delete set null,
  call_session_id uuid references call_sessions(id) on delete set null,
  -- lib/safety/report.ts の ReasonId と同じ語彙
  reason text not null,
  note text,
  -- new / seen / acted / closed
  status text not null default 'new',
  -- 運営が見た時刻と、何をしたか
  seen_at timestamptz,
  acted_at timestamptz,
  action_note text,
  created_at timestamptz default now()
);

create index if not exists safety_reports_new_idx
  on safety_reports (status, created_at desc);

-- 相談した人の状態。
--
-- 会員登録が無いので、人を1つの行で持てない。
-- 持てるのは「その鍵を使った人」まで。
-- 5回パスの鍵を止めると、その鍵で買ったぶんが使えなくなる。
--
-- active     ふつう
-- warned     一度注意した
-- restricted 言いにくい相談だけ止める
-- suspended  新しい相談を受け付けない
create table if not exists asker_standing (
  pass_token text primary key,
  status text not null default 'active',
  reason text,
  -- 何件の通報が、この鍵に紐づいているか
  report_count int not null default 0,
  updated_at timestamptz default now()
);

-- 通報を受ける。
--
-- ── 二度出しても増やさない ────────────────────
-- 同じ人が同じ通話について二度押しても、1件にする。
-- 手が震えているときに二度押すのは、ふつうのこと。
create or replace function file_safety_report(
  p_responder_token text,
  p_consultation uuid,
  p_call uuid,
  p_reason text,
  p_note text
)
returns table (ok boolean, why text)
language plpgsql
security definer
as $$
declare
  v_r    responders%rowtype;
  v_have uuid;
begin
  select * into v_r from responders where token = p_responder_token;
  if not found then
    return query select false, 'この鍵では出せません'::text;
    return;
  end if;

  select id into v_have from safety_reports
   where reviewer_id = v_r.id
     and ((p_call is not null and call_session_id = p_call)
       or (p_call is null and p_consultation is not null and consultation_id = p_consultation))
   limit 1;
  if v_have is not null then
    return query select true, 'すでに受け取っています'::text;
    return;
  end if;

  insert into safety_reports (reviewer_id, consultation_id, call_session_id, reason, note)
  values (v_r.id, p_consultation, p_call, p_reason,
          nullif(btrim(coalesce(p_note, '')), ''));

  return query select true, null::text;
end;
$$;

-- まだ見ていない通報。運営の画面はこれを見る
create or replace view open_safety_reports as
select r.id, r.reason, r.note, r.status, r.created_at,
       r.consultation_id, r.call_session_id,
       c.category
from safety_reports r
left join consultations c on c.id = r.consultation_id
where r.status in ('new', 'seen')
order by r.created_at asc;

-- ═══════════════════════════════════════════════════════════════
-- 相談に添えた画像
--
-- ══════════════════════════════════════════════════
-- 画像そのものはここに入れない
-- ══════════════════════════════════════════════════
-- 中身は Storage の非公開バケットに置く。
-- ここに持つのは、どこに置いたかと、誰の相談のものか。
--
-- ══════════════════════════════════════════════════
-- 公開URLを持たない
-- ══════════════════════════════════════════════════
-- 列に url を作らない。作ると、そこに恒久的なURLが入る。
-- 見るときは、そのつど短い期限の署名URLを作る。
--
-- ══════════════════════════════════════════════════
-- 消す日を持つ
-- ══════════════════════════════════════════════════
-- 第三者の顔と名前が写っている。持ち続ける理由が無い。
-- 消す日を行に持って、過ぎたものから消す。
-- 「消す仕組みを作る」ではなく「消す日を最初から書く」。
-- ═══════════════════════════════════════════════════════════════
create table if not exists consultation_images (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references consultations(id) on delete cascade,
  -- バケットの中の道。lib/ask/images.ts の pathFor が作る
  path text not null,
  -- 並び順。送った順に読んでもらう（LINEのやりとりは順番が意味を持つ）
  ord int not null default 0,
  content_type text,
  bytes int,
  created_at timestamptz default now(),
  -- ここを過ぎたら消す
  expires_at timestamptz not null default (now() + interval '90 days')
);

create unique index if not exists consultation_images_path_idx
  on consultation_images (path);
create index if not exists consultation_images_of_idx
  on consultation_images (consultation_id, ord);
create index if not exists consultation_images_expiry_idx
  on consultation_images (expires_at);

-- 期限の切れたもの。消す処理はこれを見る
create or replace view expired_images as
select id, consultation_id, path, expires_at
from consultation_images
where expires_at <= now()
order by expires_at asc;


-- ═══════════════════════════════════════════════════════════════
-- 回数（パス）に、有効期限をつける
--
-- ── なぜ、いま作るか ────────────────────────────
-- ここは元々「期限を作らない」だった。急がせる商売にしないため。
-- その理由は、いまも正しい。
--
-- 変えたのは、残高に期限の無い回数券が
-- 資金決済法の「前払式支払手段（自家型）」そのものだから。
-- 未使用残高が基準日（3/31・9/30）に1,000万円を超えると、
-- 財務局への届出と、残高の半額の供託が要る。
--
-- 発行日から6か月以内しか使えないものは、そもそも適用の外
-- （資金決済法4条2号／施行令4条2項）。
-- 180日にしておけば、この話が丸ごと発生しない。
--
-- ── 180日は、急かす長さではない ─────────────────
-- 5回を180日なら、36日に1回のペース。
-- 「今週中に使わないと消えます」にはならない。
--
-- ── 黙って消さない ──────────────────────────────
-- 期限は、買うとき（決済の直前）と、残りを見るときの
-- 両方に必ず出す。画面に出ていない期限で消すのがいちばん悪い。
--
-- ── 既に売ったぶんを、あとから短くしない ────────
-- default は付けない。expires_at が null のパスは、
-- 期限なしとして今までどおり使える（この行を入れる前に
-- 買った人の回数を、あとから消さない）。
-- 期限を入れるのは、これから買われるぶんだけ（fulfil が入れる）。
-- ═══════════════════════════════════════════════════════════════

alter table ask_passes add column if not exists expires_at timestamptz;

create index if not exists ask_passes_expires_idx on ask_passes (expires_at);

-- 残りの出し方に、期限を足す。
-- 切れているかは、画面ではなくここで判定する。
-- 画面ごとに日付を比べると、時計のずれで答えが割れる。
create or replace view pass_balance as
select
  p.id,
  p.token,
  p.plan_id,
  p.uses_total,
  p.granted_extra,
  p.paid_at,
  p.expires_at,
  (p.expires_at is not null and p.expires_at <= now()) as expired,
  coalesce(sum(case when u.amount < 0 then -u.amount else 0 end), 0)::int as used,
  (p.uses_total + p.granted_extra + coalesce(sum(u.amount), 0))::int as remaining
from ask_passes p
left join pass_uses u on u.pass_id = p.id
where p.paid_at is not null
group by p.id;

-- 切れたパスでは使えない。
--
-- 残りの数え方（remaining）は変えない。
-- 0にしてしまうと、何回ぶんが未使用のまま切れたのかが
-- 追えなくなる。使えるかどうかだけを、ここで止める。
create or replace function spend_pass(
  p_token text,
  p_consultation uuid,
  p_cost int
)
returns table (ok boolean, remaining int, why text)
language plpgsql
security definer
as $$
declare
  v_pass   ask_passes%rowtype;
  v_used   int;
  v_left   int;
  v_dup    int;
  i        int;
begin
  if p_cost is null or p_cost < 1 then
    return query select false, 0, '使う回数が不正です'::text;
    return;
  end if;

  select * into v_pass
    from ask_passes
   where token = p_token
     and paid_at is not null
   for update;

  if not found then
    return query select false, 0, 'このパスは見つかりません'::text;
    return;
  end if;

  -- 同じ相談が既に使っているなら、二度目は使わない。
  -- 期限より先に見る。切れたあとに来た再送で、
  -- 「使えません」に化けさせない（もう使い終わっている）。
  if p_consultation is not null then
    select count(*) into v_dup
      from pass_uses
     where pass_id = v_pass.id
       and consultation_id = p_consultation;
    if v_dup > 0 then
      select coalesce(sum(amount), 0)::int into v_used
        from pass_uses where pass_id = v_pass.id;
      v_left := v_pass.uses_total + coalesce(v_pass.granted_extra, 0) + v_used;
      return query select true, greatest(v_left, 0), 'すでに使っています'::text;
      return;
    end if;
  end if;

  select coalesce(sum(amount), 0)::int into v_used
    from pass_uses where pass_id = v_pass.id;
  v_left := v_pass.uses_total + coalesce(v_pass.granted_extra, 0) + v_used;

  -- 期限切れ。残りは残したまま、使うのだけ止める。
  if v_pass.expires_at is not null and v_pass.expires_at <= now() then
    return query select false, greatest(v_left, 0), '有効期限が切れています'::text;
    return;
  end if;

  if v_left < p_cost then
    return query select false, greatest(v_left, 0), '残りが足りません'::text;
    return;
  end if;

  for i in 1..p_cost loop
    insert into pass_uses (pass_id, consultation_id, kind, amount)
    values (v_pass.id, p_consultation, 'consume', -1);
  end loop;

  return query select true, v_left - p_cost, null::text;
end;
$$;


-- ═══════════════════════════════════════════════════════════════
-- 女性の反応を、言葉だけで終わらせない
--
-- ── なぜ足すか ──────────────────────────────────
-- いままで返ってくるのは、判定（このままでOK / 少し気になる /
-- 変えた方がいい）と、自由に書いた文だけだった。
--
-- 文は読む人には効くが、溜めても比べられない。
-- 10件たまっても「だいたい好評」以上のことが言えない。
--
-- 同じ尺度で答えてもらえば、溜めたものが効いてくる。
--   誘うのが早いと言われるのは、どの段階か
--   返信したくなると言われる文は、何が違うか
--
-- ── 第一印象は足さない ──────────────────────────
-- 既にある verdict が、ほぼ同じことを聞いている。
-- 両方置くと、同じ人に同じことを2回聞くことになる。
-- 尺度は lib/ask/reaction.ts。理由もそちらに書いてある。
--
-- ── どちらも任意 ────────────────────────────────
-- 自己紹介文の相談に「距離感」を必須で聞くと、関係ない設問に
-- 何かを選ばせることになる。埋まっているだけで中身の無い行が増える。
-- 答えが無いことは、無いまま持つ（null を許す）。
-- ═══════════════════════════════════════════════════════════════

alter table responses add column if not exists distance text;    -- ok / early / too_early
alter table responses add column if not exists reply_urge int;   -- 1〜5

alter table responses drop constraint if exists responses_distance_check;
alter table responses add constraint responses_distance_check
  check (distance is null or distance in ('ok', 'early', 'too_early'));

alter table responses drop constraint if exists responses_reply_urge_check;
alter table responses add constraint responses_reply_urge_check
  check (reply_urge is null or (reply_urge between 1 and 5));

-- 溜まったものを見るところ。
-- 相談の種類ごとに、距離感と返信したくなる度がどう出ているか。
--
-- 件数が少ないうちは、平均を見ても意味が無い。
-- 何件から見るかは、見る側が判断する（ここでは絞らない）。
create or replace view reaction_stats as
select
  c.category,
  count(r.id)                                              as answers,
  count(r.distance)                                        as with_distance,
  count(*) filter (where r.distance = 'ok')                as distance_ok,
  count(*) filter (where r.distance = 'early')             as distance_early,
  count(*) filter (where r.distance = 'too_early')         as distance_too_early,
  count(r.reply_urge)                                      as with_reply_urge,
  round(avg(r.reply_urge)::numeric, 2)                     as reply_urge_avg
from responses r
join consultations c on c.id = r.consultation_id
group by c.category;
