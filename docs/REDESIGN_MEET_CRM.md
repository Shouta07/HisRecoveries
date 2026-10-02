# タシカメ 再設計：出会ったあとを支える

作成 2026-10-02 ／ まだ実装していない。決めることを先に出した設計書

---

## 0. 先に決めないと作れないこと

ここを飛ばして作ると、作ったあとに作り直すことになる。
**上から3つは、設計の前提そのものが変わる。**

### 0-1. 公開済みのプライバシー方針に「録音はしません」と書いてある

いま `/privacy` に、こう出ている。

> 音声通話による相談を行う場合も、電話番号の交換は行いません。
> 通話は当社が用意したブラウザ上の仕組みで行い、**録音はしません。**

新しい中核は「Meetの内容を文字起こし → AIで構造化」。
文字起こしには音声を取る必要があり、この一文と正面からぶつかる。

必要なこと。

- プライバシー方針の改訂（何を録り、どこに置き、いつ消すか）
- **相談者と回答者の両方から、通話ごとに同意を取る**
- 同意が無いときは、録らずに通話だけ行える道を残す
- 文字起こしの保持期間（画像は90日。音声は、より短くてよい）
- 音声そのものを残すのか、文字にしたら消すのか（**残さないほうがよい**）

> 録音は「あとで揉めたときの証拠」ではなく「次回の続きを作るための材料」。
> 材料として使い終わったら消す、という設計にできる。

### 0-2. Google Meet は、参加者のアカウント名が相手に見える

この製品は「回答者は匿名」を前提に作ってある。
規約にも「連絡先の交換の媒介を行わない」と書いた。

Google Meet で繋ぐと、画面に **Google アカウントの表示名**が出る。
設定次第ではメールアドレスも見える。回答者の本名が相談者に渡る。

さらに Meet は映像が既定。顔が映る。
いまの回答者は顔を出さない前提で集めている。

取れる道は3つ。

| | 回答者の匿名性 | 作る手間 |
|---|---|---|
| A. Meet をやめ、いまの Daily を使う | 保てる | **ほぼ不要**（既にある） |
| B. Meet を使い、回答者用の匿名アカウントを配る | Workspace のアカウントを人数分。運用が重い | 重い |
| C. Meet を使い、回答者の本名が出ることを双方に明示 | 捨てる | 軽いが、集めた前提と違う |

**勧めるのは A。** いまの `lib/call`（Daily）は部屋も入室券も REST で作れて、
名前を自由に付けられる。匿名のまま通話でき、録音APIもある。

「Meet を使う」が目的ではなく「通話を自前で作らない」が目的なら、
Daily のままで目的は満たされている。
`lib/call/room.ts` には最初から「いまは Daily」と書いてあり、差し替えられる。

### 0-3. Google Meet の自動発行と文字起こしは、有料契約が要る

- Meet のリンクを自動で作るには Google Workspace ＋ OAuth ＋ Calendar API
- **Meet の文字起こしは Workspace Business Standard 以上**
- 文字起こしは Drive に落ちるので、取りに行くには Drive API
- 開始すると参加者に通知が出る（黙って録ることはできない。これは正しい挙動）

有料契約は、こちらの判断では結ばない。
0-2 で A を選ぶなら、この項目は消える。

### 0-4. AI の口がまだ無い

`AI_COST_YEN = 20` は**予算の行で、実装は無い**。
文字起こしも構造化も、外部APIを呼ぶ仕組みがまだ無い。

要るもの。

- APIキー（文字起こし用と、構造化用）
- 通話が終わったことを受けて走る仕組み
- 失敗したときの扱い（通話は済んでいるのに構造化だけ失敗した、が起きる）

費用は後述（§9）。10分の通話で **¥30前後**。予算の ¥20 に収まらない。

### 0-5. 相手は、同意していない第三者

CRM に残るのは、**本人が一度も同意していない人**の情報になる。

いまの設計は、そこを避けてある。

- 呼び名だけ（`partner_label`。本名は入れないと画面で断っている）
- 年代の帯だけ
- 「氏名・勤務先・SNSアカウントを書かないでください」と規約に書いてある

新しい案の `nickname` `perceived_partner_interest` `concerns` も、
この線を越えないなら問題は小さい。越えた瞬間に、人物データベースになる。

**守る線（提案）**

- 本名・連絡先・SNS・勤務先・学校・写真は保存しない
- 相手の写真は、相談のあいだだけ見えて、残らない
- `perceived_partner_interest` は**相談者の見立て**であって相手の実際ではない、と列名とUIの両方で分ける
- 相手1人ぶんを、相談者がいつでも丸ごと消せる

### 0-6. 男女両方を対象にすると、回答者が2倍要る

いま確保できている回答者は **1人**。
男性利用者には女性回答者、女性利用者には男性回答者が要る。

売り出しの判定は `online >= ceil(必要人数 × 1.5)`。
男女それぞれで満たす必要がある。

**MVPは片側（男性利用者 → 女性回答者）だけで出すことを勧める。**
両方同時に始めると、どちらも人が足りず、どちらも開かない。

### 0-7. いま作ったばかりのものを、どうするか

直近で入れた「3人に見せる」「AとB」「相談の例」は、この案だと脇に回る。

捨てなくてよい。**文字の相談として残す。**

- Meet 相談（新しい中核）＝ 話して、整理される
- 文字の相談（いまあるもの）＝ 送る前に、見てもらう

使う場面が違うので、並べて置ける。
ただし **LPの主役は Meet 側に移す**。

---

## 1. サービス像

> 出会いは、with・Pairs・タップル。
> 出会った後は、タシカメ。

マッチングはしない。出会った**後**だけを扱う。

利用者がすることは、相談だけ。
その副産物として、相手ごとの状況が勝手に残る。

```
相談する → 話す → 文字になる → 整理される → 次回は続きから
```

**利用者に管理表を書かせない。** ここが商品。

---

## 2. ファーストビュー

```
出会いは、with・Pairs・タップル。
出会った後は、タシカメ。

マッチングアプリで出会った相手のことを、実在する異性に相談できます。
話した内容は自動で整理されるので、次回は続きから相談できます。

[ 無料ではじめる ]     [ 異性に相談する ]

無料でできること：相手の管理 / 進み具合 / 相談の履歴
```

直下に、画面そのものを置く。説明より先に見せる。

```
┌─────────────────────────────┐
│ いまの状況                       │
│                                  │
│ 進行中 4人   次回予定 2人          │
│ 返信待ち 1人  止まっている 1人      │
├─────────────────────────────┤
│ Aさん          with              │
│ 2回目デート済み                   │
│ 次回 10/10                       │
│ 次に確認：今後の予定               │
├─────────────────────────────┤
│ Bさん          Pairs             │
│ 初回デート予定 10/6               │
│ 相談履歴 1件                     │
└─────────────────────────────┘
```

### 言葉づかい

LPに出さない語：**AI / JSON / CRM / 文字起こし / 構造化 / パイプライン / 案件**

言い換え。

| 内部 | 画面 |
|---|---|
| CRM | いまの状況 |
| 文字起こし・構造化 | 話した内容が整理されます |
| ステージ | どこまで進んだか |
| AI推論 | （出さない。推測であることだけ書く） |

---

## 3. LP 全文（案）

### 1画面目
上記。

### 2. 伝えることは3つだけ

```
1  異性に、直接相談できる
   実在する人です。AIではありません。

2  相談した内容が、勝手に整理される
   自分で書く欄はありません。話すだけです。

3  次は、最初から説明しなくていい
   前回の続きから始まります。
```

### 3. 使ってみると、こうなる

```
① 相談したい相手を選ぶ
   はじめてなら、呼び名とアプリだけ。

② 時間を選ぶ
   相談相手（異性）が決まり、通話の部屋ができます。

③ 10分、話す
   「この人どう思う？」「次誘っていい？」

④ 終わると、整理されている
   今日の話から、変わったところだけ出ます。
   「更新する」を押すだけ。

⑤ 次回
   前回の続きから話せます。
```

### 4. 何を相談しているか

```
この人どう思う？      次誘っていい？
このLINEどう？        本気度が気になる
2回目行くべき？        告白していい？
このまま続ける？
```

### 5. AIと、人の役割

```
AIがやるのは、裏側だけ。
  話した内容を文字にする
  変わったところを見つける
  要約する

人がやるのは、こちら。
  実際にどう感じるか
  異性から見た違和感
  自分では気づかない見方

答えるのは、いつも人です。
```

### 6. 相手のことは、残しすぎない

```
保存するもの   呼び名 / どこで出会ったか / どこまで進んだか /
               相談で話したこと

保存しないもの 相手の本名 / 連絡先 / SNS / 勤務先 / 写真

いつでも、相手ごと丸ごと消せます。
```

### 7. 料金

```
相手の管理・進み具合・相談の履歴   無料
異性との相談 10分                ¥1,980
異性との相談 20分                ¥3,480

月額はありません。使うときだけ。
```

### 8. よくある質問
### 9. 最後のCTA

```
話すだけで、残ります。

[ 無料ではじめる ]
```

---

## 4. ユーザージャーニー

```
LPを見る
  ↓
無料で登録（鍵だけ。会員登録の重さは出さない）
  ↓
相手を1人足す（呼び名 / アプリ / いまどこまで）
  ↓ ─────────────── ここまで無料
相談を予約（相手 / テーマ / 時間）
  ↓
決済（都度）
  ↓
通話の部屋ができる。URLが出る
  ↓
10分話す
  ↓
終わる
  ↓
整理が走る（文字 → 構造化）
  ↓
「今回の相談から、以下を更新します」
  ↓ 利用者は「更新する」を押すだけ
相手カードが変わる
  ↓
次の相談は、前回の続きから
```

**無料と有料の線は「人と話すかどうか」。** ここが唯一の線。

---

## 5. 画面一覧

| 画面 | 何をする | MVP |
|---|---|---|
| `/` | LP | ● |
| `/start` | はじめる（鍵の発行） | ● |
| `/home` | いまの状況。相手カード一覧 | ● |
| `/p/[id]` | 相手1人の詳細。履歴と、次に確認すること | ● |
| `/p/new` | 相手を足す（呼び名 / アプリ / 段階） | ● |
| `/talk/new` | 相談を予約（相手 / テーマ / 長さ） | ● |
| `/talk/[id]` | 通話の部屋へ入る | ● |
| `/talk/[id]/after` | 更新の確認画面 | ● |
| `/talk/[id]/done` | 終わったあと。次にやること | ● |
| `/me` | 自分の設定。目的、消す | ● |
| `/r/[token]` | **回答者側**：依頼の中身と、入室 | ● |
| `/r/[token]/after` | **回答者側**：所感を書く | ● |
| `/stats` | 簡単なBI | ○ |
| `/legal` `/terms` `/privacy` | 法定表示 | ● |

---

## 6. DB 設計

### すでにあるもの（使い回す）

`relationship_cases` が、ほぼそのまま相手カードになる。

```sql
relationship_cases (
  id, token, pass_token,
  partner_label,        -- 呼び名
  user_age_band, partner_age_band,
  dating_app,           -- with / Pairs / tapple ← 既に想定済み
  current_stage,
  goal,
  current_summary,      -- 次の相談に渡す「これまで」
  last_decision,
  status, created_at, updated_at
)
```

### 足すもの

```sql
-- 相手カードを、新しい段階と予定に対応させる
alter table relationship_cases add column if not exists stage text;
alter table relationship_cases add column if not exists date_count int default 0;
alter table relationship_cases add column if not exists next_date date;
alter table relationship_cases add column if not exists next_date_status text;
alter table relationship_cases add column if not exists last_contact_date date;
alter table relationship_cases add column if not exists reply_status text;
alter table relationship_cases add column if not exists user_interest_level int;
alter table relationship_cases add column if not exists next_action text;

-- 事実・見立て・人の意見・AIの推測を、混ぜないで持つ。
-- 1つの表に列で足すと、どれがどれか分からなくなる。
create table if not exists case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references relationship_cases(id) on delete cascade,
  talk_id uuid,
  -- fact        起きたこと（会った、返信が来た）
  -- feeling     相談者自身の気持ち
  -- opinion     回答者（人）が言ったこと
  -- inference   AIの推測
  -- action      次にやること
  kind text not null check (kind in ('fact','feeling','opinion','inference','action')),
  body text not null,
  -- AIが出したものだけ、どのくらい確からしいかを持つ
  confidence real,
  -- 利用者が確認したか。推測は確認されるまで「仮」
  confirmed boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists case_notes_case_idx on case_notes (case_id, created_at desc);

-- 通話1回
create table if not exists talks (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  case_id uuid references relationship_cases(id) on delete set null,
  consultation_id uuid references consultations(id),
  topic text,
  minutes int not null,
  -- 録音と文字起こしの同意。両方が true でなければ録らない
  consent_user boolean not null default false,
  consent_reviewer boolean not null default false,
  room_url text,
  started_at timestamptz,
  ended_at timestamptz,
  -- 文字起こしは、構造化が済んだら消す
  transcript text,
  transcript_deleted_at timestamptz,
  status text not null default 'scheduled',
  created_at timestamptz default now()
);

-- AIが出した更新案。利用者が押すまで本体に入れない
create table if not exists talk_updates (
  id uuid primary key default gen_random_uuid(),
  talk_id uuid not null references talks(id) on delete cascade,
  payload jsonb not null,      -- §7 の JSON そのまま
  applied_at timestamptz,
  created_at timestamptz default now()
);
```

### 設計で守ること

1. **AIの出したものは、`talk_updates` に置いて `relationship_cases` を直接書き換えない。** 利用者が押してから入る。
2. **`case_notes.kind` で、事実と推測を分ける。** 同じ表に混ぜない。
3. **`transcript` は消す列を持つ。** 構造化が終わったら本文を消し、`transcript_deleted_at` を入れる。
4. **相手を消したら、ぶら下がるものも消える**（`on delete cascade`）。

---

## 7. JSON Schema（Meet のあと、AIが返すもの）

```jsonc
{
  "type": "object",
  "required": ["facts", "feelings", "opinions", "inferences", "next_action", "summary"],
  "additionalProperties": false,
  "properties": {
    // 起きたこと。話の中で確かに言われたことだけ
    "facts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["body", "quote"],
        "properties": {
          "body":  { "type": "string", "maxLength": 120 },
          // 元の発言。これが無いものは事実として扱わない
          "quote": { "type": "string", "maxLength": 200 }
        }
      }
    },
    // 相談者自身の気持ち。主語は相談者
    "feelings": {
      "type": "array",
      "items": { "type": "string", "maxLength": 120 }
    },
    // 回答者（人）が言ったこと。言い換えない
    "opinions": {
      "type": "array",
      "items": { "type": "string", "maxLength": 200 }
    },
    // AIの推測。必ず確からしさを持つ
    "inferences": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["body", "confidence"],
        "properties": {
          "body":       { "type": "string", "maxLength": 120 },
          "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
        }
      }
    },
    "stage_update": {
      "type": ["object", "null"],
      "required": ["from", "to", "confidence"],
      "properties": {
        "from": { "type": "string" },
        "to":   { "type": "string" },
        "confidence": { "type": "number" }
      }
    },
    "next_date_update": {
      "type": ["object", "null"],
      "properties": {
        "date":   { "type": ["string", "null"], "format": "date" },
        "status": { "enum": ["confirmed", "proposed", "none"] }
      }
    },
    "concerns_add":   { "type": "array", "items": { "type": "string" } },
    "signals_add":    { "type": "array", "items": { "type": "string" } },
    "topics_to_confirm": { "type": "array", "items": { "type": "string" } },
    "next_action": { "type": "string", "maxLength": 120 },
    "summary":     { "type": "string", "maxLength": 300 }
  }
}
```

### AI に守らせること（プロンプトと、受け取り側の検証の両方で）

- **`facts` は `quote` が無ければ捨てる。** 言われていないことを事実にしない
- **相手の気持ちを断定しない。** 「脈あり」「本命」などが出たら落とす（`MIND_READING` と同じ線）
- **`opinions` は回答者の発言の引用に近い形で。** 要約しすぎると、誰も言っていない意見ができる
- **`inferences` は `confidence < 0.6` なら画面に出さない**
- **スキーマに合わないものは捨てて、`talk_updates` に「構造化できなかった」として残す**

---

## 8. Meet 予約 〜 CRM 更新のフロー

> 0-2 の結論どおり、**通話は Daily（いまあるもの）**で書く。
> Meet にする場合も、形は同じ。差し替わるのは「部屋を作る」ところだけ。

```
① 相談を予約
   相手 / テーマ / 長さ（10分 or 20分）
      ↓
② 回答者がいるか見る（supply）
   足りなければ、ここで止める。決済へ進ませない
      ↓
③ 決済（Stripe Checkout。いまあるものをそのまま）
      ↓
④ 支払い確定（webhook → fulfil）
   talks を作る
   回答者へ依頼を飛ばす
      ↓
⑤ 回答者が受ける
   このとき、前回までの要約（current_summary）だけ渡す
   相談の全文は渡さない
      ↓
⑥ 部屋ができる（lib/call/room.ts）
   両方に入室券。名前は匿名のまま
      ↓
⑦ 入室時に、両方へ同意を取る
   「この通話を文字にして、次回の相談に使います。音声は残しません」
   どちらかが断れば、録らずに通話する（CRM更新は手入力の案内に落とす）
      ↓
⑧ 通話（10〜20分）
      ↓
⑨ 終了
      ↓
⑩ 文字起こし
      ↓
⑪ 構造化（§7 の JSON）
      ↓
⑫ 文字起こし本文を消す（transcript_deleted_at）
      ↓
⑬ talk_updates に置く。本体はまだ変えない
      ↓
⑭ 利用者に「更新します」画面
      ↓ 「更新する」
⑮ relationship_cases と case_notes へ反映
      ↓
⑯ 次回の相談は、current_summary から始まる
```

### 失敗したときの扱い

| 失敗 | どうする |
|---|---|
| 通話が繋がらなかった | 全額返金。`talks.status = failed` |
| 通話は済んだが文字起こしが失敗 | **返金しない**（人には会えている）。更新画面を「手で足す」に落とす |
| 構造化が失敗 | 同上。文字起こしは残して、再実行できるようにする |
| 同意が得られなかった | 通話だけ行う。これは失敗ではない |

---

## 9. 回答者側 UX

```
依頼が来る
  ↓
/r/[token] を開く
  ┌──────────────────────────┐
  │ 10分の相談です             │
  │                           │
  │ 相手のこと                 │
  │  20代後半・男性            │
  │  with で出会った相手について │
  │  2回目のデートが終わったところ│
  │                           │
  │ 前回までの経緯             │
  │  （current_summary の3行）  │
  │                           │
  │ 今日、聞かれること          │
  │  次に誘うタイミング          │
  │                           │
  │ [ 受ける ]  [ 今回は見送る ] │
  └──────────────────────────┘
  ↓ 受ける
時間になったら入室
  ↓
通話（匿名。本名も連絡先も出さない）
  ↓
/r/[token]/after
  「話していて、気になったところ」を1つだけ書く
  ↓
報酬が確定
```

### 回答者に見せないもの

- 相談者の本名・連絡先
- 過去の相談の全文（渡すのは要約だけ）
- 相手（マッチ相手）の写真や識別できる情報

### 報酬

| | 通話 | 報酬 | 粗利 |
|---|---|---|---|
| 10分 | ¥1,980 | ¥500 | 66% |
| 20分 | ¥3,480 | ¥1,000 | 63% |

（AI費を 10分 ¥30 / 20分 ¥50 として計算。決済手数料3.6%・返金引当3%込み）

**この報酬で受けてもらえるかは、確保済みの1人に確認が要る。**

---

## 10. 決済フロー

いまある Stripe の実装をそのまま使う。作り直さない。

```
予約画面 → /api/checkout
             ↓ 人数が足りなければ 409 で止める（既存）
          Stripe Checkout（price_data で動的に作る。既存）
             ↓
          戻り道 + webhook の両方で fulfil()（1回だけ走る。既存）
             ↓
          talks を作って、回答者へ依頼
```

**変えるところ**

- `consultations` ではなく `talks` を作る分岐を `fulfil()` に足す
- 商品を、分数で持つ（いまの `callMinutes` が使える）
- 無料プランは決済を通らない。**決済が無い道を初めて作ることになる**ので、
  「無料で作れるもの」と「払わないと作れないもの」を `ready.ts` の判定に足す

### 料金（採算を計算した結果）

| 商品 | 価格 | 報酬 | AI | 粗利 |
|---|---|---|---|---|
| 10分相談 | ¥1,980 | ¥500 | ¥30 | **66.2%** |
| 20分相談 | ¥3,480 | ¥1,000 | ¥50 | **63.0%** |
| 3人レビュー | ¥2,980 | ¥750×3… | — | **要再計算**（下記） |
| 重要局面相談 | ¥4,980 | ¥1,500 | ¥60 | **61.9%** |

> 3人レビューは、いまの「3人に見せる ¥2,380」と中身が重なる。
> 両方置くと、どちらを買えばいいか分からなくなる。**どちらかに寄せる。**

ご提案の「20分 ¥2,980」は粗利 57.9% で、ほかの商品の下限（60%）を割る。
**¥3,480 なら 63.0%** で揃う。

---

## 11. MVP の順番

### 第1段（これだけで一度出す）

1. 相手を足す・一覧（`relationship_cases` は既にある）
2. 相談の予約 → 決済（Stripe は既にある）
3. 通話の部屋（Daily。既にある）
4. **同意を取る画面**（新規。0-1 の要件）
5. 文字起こし（新規。外部API）
6. 構造化 → `talk_updates`（新規。§7）
7. **更新の確認画面**（新規。ここが商品の肝）
8. 相手カードに反映

### 第2段

9. 相談の履歴
10. 簡単なBI（進行中 / 次回予定 / 返信待ち）
11. 目的別モード

### 第3段

12. 複数人レビューとの統合
13. アプリ別の進み具合

### 作らないもの（この案の範囲外）

- マッチング機能
- 利用者どうしを繋ぐもの
- 相手の点数化
- AI恋愛相談チャット

---

## 12. まとめ：いま決めてほしいこと

| | 決めること | これが決まらないと |
|---|---|---|
| 1 | **Meet か、いまの Daily か**（0-2） | 回答者の匿名性が決まらない。設計の前提 |
| 2 | **録音と文字起こしの同意をどう取るか**（0-1） | プライバシー方針を書き直せない |
| 3 | 片側（男性利用者）で始めるか、両方か（0-6） | 回答者を何人集めるかが決まらない |
| 4 | 20分を ¥3,480 にしてよいか（§10） | 粗利の下限を割る |
| 5 | パネル報酬 ¥250／通話報酬 ¥500 で受けてもらえるか | 売り物にならない |
| 6 | 「3人レビュー」と「3人に見せる」をどちらに寄せるか | 商品が重なる |

**1 と 2 が決まれば、第1段は書き始められる。**
