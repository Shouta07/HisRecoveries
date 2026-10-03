import { buildSystemPrompt, FIRST_LINE, VERSION, type Memory } from "./prompt";

/* ══════════════════════════════════════════════════
   ChatGPT で話してもらって、結果を持ち帰る
   ══════════════════════════════════════════════════

   ── なぜ、こちらで喋らせないか ──────────────────
   声でつなぐと、1人あたり月 ¥400 の原価が乗る。
   それを払ってまで、こちらで喋らせる理由は薄い。

     相談する人の多くは、もう ChatGPT を使っている
     こちらの取り分は「会話」ではなく「残ること」
     会話を自前で持つと、鍵が入るまで何も動かせない

   会話は向こうで、記録はこちらで。
   これで、鍵が1本も無くても今日から動く。

   ── 持ち帰るものは、会話そのもの ────────────────
   ChatGPT に「まとめて」とは言わせない。
   まとめさせると、まとめ方が毎回変わる。
   こちらが受け取るのは生の会話で、整理は structure.ts がやる。

   だから渡すプロンプトには、JSONの話を一切書かない。
   本人は、ふつうに話すだけでよい。

   ── 人格は1か所 ─────────────────────────────────
   恋亀が何者かは prompt.ts が持っている。
   ここで書き直すと、ChatGPT の恋亀と /koi の恋亀が別人になる。
   そのまま使い、ChatGPT 向けの言い方だけ足す。 */

/** 渡すプロンプトの版。持ち帰ったものと突き合わせる */
export const HANDOFF_VERSION = VERSION;

/**
 * ChatGPT に貼ってもらう文。
 *
 * 前回までのことが分かっていれば、それも渡す。
 * 渡すと、向こうの恋亀が「前回の続き」から始められる。
 * ここが、毎回いちから説明しなくてよくなる仕組みそのもの。
 */
export function handoffPrompt(m: Memory = {}): string {
  return [
    buildSystemPrompt(m),
    "",
    "――",
    "",
    "【この会話の目的】",
    "ただの恋愛相談ではありません。",
    "複数のマッチングアプリで、複数人と同時にやり取りすることで生まれる",
    "「判断疲れ」を減らすために、相手ごとに次のことを整理します。",
    "　誰との話か ／ どのアプリか ／ いまどの段階か ／ 何が起きたか",
    "　何に迷っているか ／ 次に何をするか ／ いつ動くか",
    "　相手待ちなのか ／ 実際どうなったか",
    "",
    "【声で話すとき】",
    "電話のように、短く、テンポよく。1回の返事は2文まで。質問は1つずつ。",
    "尋問にしない。全部を聞き出そうとしない。今回の相談に要ることだけ。",
    "",
    "【相談の進め方】",
    "1. まず状況を整理する",
    "2. 足りない大事なことだけ確認する",
    "3. 選択肢を並べる",
    "4. いちばん自然な次の一手を1つ決める",
    "5. いつ動くかも、分かれば決める",
    "6. いま「動く」のか「待つ」のかを、はっきりさせる",
    "7. 前回の相談があるなら、その後どうなったかを必ず聞く",
    "",
    "【人に確カメたほうがよい場面】",
    "このLINEを実際にどう感じるか／誘い方が自然か／デート後の印象など、",
    "実在の異性の感覚を聞く価値が高いときは、そう伝えてください。",
    "人に聞くのは正解を出すためではなく、判断材料を増やすためです。",
    "",
    "【終わりの合図】",
    "「まとめて」「終了」「タシカメに保存」のどれかを言われたら、終わります。",
    "",
    "【終わるときに出すもの】",
    "まず、本人向けに短くこれを出してください。",
    "　【今回の整理】",
    "　・いまの状況 ・今回の悩み ・考えられる選択肢 ・次の一手",
    "　・いつ動くか ・いまは動く / 待つ ・気をつけること",
    "　・実在の異性に確カメるとよいこと",
    "",
    "そのあと、下のJSONだけを続けて出してください。",
    `JSONの前後に説明は書かないでください。キー名と階層は変えないでください。`,
    "分からないことは推測せず、文字列は空、数値と真偽値は null にしてください。",
    "",
    SCHEMA,
    "",
    "【決まった言葉から選ぶもの】",
    `current_stage: ${STAGES_OUT.join(" / ")}`,
    `waiting_on: ${WAITING.join(" / ")}`,
    "",
    "この形を埋めるためだけに、質問しないでください。",
    "会話から分かる範囲だけ入れて、分からないものは空のままにしてください。",
    "",
    "today_action は、今日やることがあるときだけ書いてください。",
    "何もしないほうがよいときは「今日は待つ」と書いてください。",
    "human_review.recommended は、実在の異性に聞く価値が高いときだけ true。",
    "timeline.timeline_summary は、次にこの相手の話をするときに",
    "前回の状況が一文で分かる要約にしてください。",
    "",
    "まとめや要約は、終わりの合図があるまで出さないでください。",
    "それまでは、ふつうに会話してください。",
    `最初のひとことは「${FIRST_LINE}」でお願いします。`,
  ].join("\n");
}

/** 相談の段階。JSONで受け取る語 */
export const STAGES_OUT = [
  "matched", "messaging", "line_exchanged", "calling",
  "before_first_date", "after_first_date", "dating_multiple_times",
  "before_confession", "in_relationship", "paused", "ended", "unclear",
] as const;

export const MOMENTUM = ["improving", "stable", "slowing", "waiting", "unclear"] as const;
export const PRIORITY = ["high", "medium", "low"] as const;
export const WAITING = ["user", "partner", "scheduled_event", "none", "unclear"] as const;
export const INPUT_MODE = ["voice", "text", "unknown"] as const;

/**
 * 受け取るJSONの形。
 *
 * ここを直したら、intake.ts の読み取りも一緒に直すこと。
 * 片方だけ直すと、AIは新しい形で返すのに、こちらが読めない。
 */
const SCHEMA = `{
  "person": { "name": "", "dating_app": "" },
  "relationship_state": { "current_stage": "", "last_contact_at": "", "next_scheduled_event": "" },
  "consultation": { "main_issue": "", "user_goal": "", "next_action": "", "next_action_due": "", "suggested_message": "" },
  "management": { "waiting_on": "", "today_action": "", "status_label": "" },
  "human_review": { "recommended": false, "question_to_ask": "" },
  "result": { "previous_outcome": "", "current_outcome": "" },
  "timeline": { "event_summary": "", "timeline_summary": "" }
}`;

/* ══════════════════════════════════════════════════
   貼られたものを、会話に戻す
   ══════════════════════════════════════════════════

   ChatGPT の画面をそのままコピーすると、行の頭が揃っていない。
   「あなた:」「ChatGPT:」が付くこともあれば、付かないこともある。

   付いていれば、それで分ける。
   付いていなければ、空行で区切られた塊を交互に見る
   （ChatGPT の画面は、発言ごとに段落が変わる）。

   どちらでも読めなければ、全部を本人の発言として扱う。
   読めないからといって捨てない。捨てると、貼り直させることになる。 */

export type Line = { who: "koi" | "me"; say: string };

/** 頭に付く名前。ChatGPT の画面と、こちらの画面の両方 */
const HEAD_ME = /^\s*(あなた|You|わたし|私|自分|me)\s*[:：]\s*/i;
const HEAD_KOI = /^\s*(ChatGPT|GPT|恋亀|アシスタント|Assistant)\s*[:：]\s*/i;

/** 1回に受け取る上限。長すぎるものは、料金も時間も伸びる */
export const PASTE_MAX = 12000;

export function readPaste(input: string): Line[] {
  const text = input.slice(0, PASTE_MAX).replace(/\r\n?/g, "\n").trim();
  if (!text) return [];

  // 1. 頭に名前が付いている形
  const named: Line[] = [];
  let hasHead = false;
  let cur: Line | null = null;
  for (const raw of text.split("\n")) {
    const me = HEAD_ME.test(raw);
    const koi = HEAD_KOI.test(raw);
    if (me || koi) {
      hasHead = true;
      if (cur) named.push(cur);
      cur = { who: me ? "me" : "koi", say: raw.replace(me ? HEAD_ME : HEAD_KOI, "").trim() };
      continue;
    }
    if (cur) cur.say = `${cur.say}\n${raw}`.trim();
  }
  if (cur) named.push(cur);
  if (hasHead) {
    return named.filter((l) => l.say).map((l) => ({ ...l, say: l.say.trim() }));
  }

  /* 2. 名前が付いていない形。
     空行で割って、交互に見る。
     最初が恋亀なのは、渡したプロンプトで
     恋亀から話し始めるように頼んでいるから。 */
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length >= 2) {
    return blocks.map((say, i) => ({ who: i % 2 === 0 ? "koi" : "me", say }));
  }

  // 3. どちらでもない。全部を本人の話として扱う
  return [{ who: "me", say: text }];
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const p = handoffPrompt();

  /* 人格が prompt.ts から来ていること。
     ここで書き直すと、ChatGPT の恋亀と /koi の恋亀が別人になる。 */
  if (!p.includes(buildSystemPrompt())) {
    throw new Error("渡すプロンプトの人格が、prompt.ts のものと違います");
  }

  /* ══════════════════════════════════════════════
     まとめは、合図があるまで出させない
     ══════════════════════════════════════════════
     前は「まとめや要約は要りません」と書いて、
     整理はこちらのAIでやっていた（structure.ts）。

     話したAI自身にJSONを出させる形に変えた。
     呼び出しが1回減り、記録1件あたりの原価がほぼゼロになる。

     ただし、途中でまとめ始められると会話が止まる。
     合図（まとめて / 終了 / タシカメに保存）まで出させない。 */
  if (!/終わりの合図があるまで出さない/.test(p)) {
    throw new Error("渡すプロンプトに、合図までまとめさせない指示がありません");
  }
  for (const w of ["まとめて", "終了", "タシカメに保存"]) {
    if (!p.includes(w)) throw new Error(`終わりの合図に「${w}」がありません`);
  }

  /* 受け取る形が、書いてあること。
     キー名か階層が抜けると、こちらが読めないものが返る。 */
  for (const k of [
    "person", "relationship_state", "consultation",
    "management", "human_review", "result", "timeline",
  ]) {
    if (!p.includes(`"${k}"`)) throw new Error(`渡すJSONの形に「${k}」がありません`);
  }
  /* ダッシュボードを動かすのに要る4つが、必ず入っていること。
     ここが欠けると、今日やること／誰待ち／前回どうなったが出せない。 */
  for (const k of ["today_action", "waiting_on", "next_action_due", "previous_outcome"]) {
    if (!p.includes(k)) throw new Error(`渡すJSONの形に「${k}」がありません`);
  }
  /* 決まった言葉から選ばせること。
     自由に書かせると、段階が毎回ちがう言葉になって集計できない。 */
  for (const v of ["matched", "partner"]) {
    if (!p.includes(v)) throw new Error(`選ばせる言葉に「${v}」がありません`);
  }
  // 推測させないこと。
  if (!/分からないことは推測せず/.test(p)) {
    throw new Error("渡すプロンプトに、推測させない指示がありません");
  }
  /* 形を埋めるために質問させないこと。
     ここが抜けると、聞き取りの長い恋亀になる。
     それはこの製品がいちばん避けたい形。 */
  if (!/埋めるためだけに、質問しないで/.test(p)) {
    throw new Error("渡すプロンプトに、形を埋めるために質問させない指示がありません");
  }
  // 待つことも書かせること。
  if (!/今日は待つ/.test(p)) {
    throw new Error("渡すプロンプトに、待つときの書き方がありません");
  }

  // 前回までのことを渡せること。ここが「続きから」の仕組みそのもの。
  {
    const withMemory = handoffPrompt({ person: "Aさん", lastNext: "水族館の日程を決める" });
    if (!withMemory.includes("Aさん") || !withMemory.includes("水族館の日程を決める")) {
      throw new Error("前回までのことが、渡すプロンプトに入りません");
    }
    if (withMemory === p) {
      throw new Error("前回までのことを渡しても、プロンプトが変わりません");
    }
  }

  /* ── 貼られたものが読めること ───────────────────── */

  // 名前が付いている形
  {
    const r = readPaste("あなた: 先週デート行ってきた\nChatGPT: お、どうやった？\nあなた: よかった");
    if (r.length !== 3) throw new Error(`名前付きの貼り付けが ${r.length} 行になりました（3行）`);
    if (r[0].who !== "me" || r[1].who !== "koi") {
      throw new Error("名前付きの貼り付けで、話し手が取れていません");
    }
    if (r[0].say !== "先週デート行ってきた") {
      throw new Error(`頭の名前が残っています（${r[0].say}）`);
    }
  }

  // 名前が付いていない形。空行で交互に見る
  {
    const r = readPaste("最近どう？\n\n先週デート行ってきた\n\nお、よかったやん");
    if (r.length !== 3) throw new Error(`空行区切りが ${r.length} 行になりました（3行）`);
    if (r[0].who !== "koi" || r[1].who !== "me") {
      throw new Error("空行区切りで、話し手が交互になっていません");
    }
  }

  // 1かたまりだけ。捨てずに、本人の話として受け取ること
  {
    const r = readPaste("先週デート行ってきたけど、次どう誘えばいいか分からない");
    if (r.length !== 1 || r[0].who !== "me") {
      throw new Error("1かたまりの貼り付けが、受け取れていません");
    }
  }

  // 空のものは、空で返すこと（呼ぶ側が止める）
  if (readPaste("   \n  ").length !== 0) {
    throw new Error("空の貼り付けから、行ができています");
  }

  // 長すぎるものは切ること
  {
    const r = readPaste("あ".repeat(PASTE_MAX + 500));
    const len = r.map((l) => l.say).join("").length;
    if (len > PASTE_MAX) throw new Error(`貼り付けが ${len} 字まで通りました（${PASTE_MAX}字まで）`);
  }

  // 複数行の発言が、1つにまとまること
  {
    const r = readPaste("あなた: 1行目\n2行目\nChatGPT: 返事");
    if (r.length !== 2) throw new Error("続きの行が、別の発言になっています");
    if (!r[0].say.includes("2行目")) throw new Error("続きの行が落ちています");
  }
}
