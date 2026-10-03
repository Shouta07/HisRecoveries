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
  const lines = [
    buildSystemPrompt(m),
    "",
    "――",
    "",
    "この指示のとおりに、わたしの恋愛相談に乗ってください。",
    "まとめや要約は要りません。ふつうに会話してください。",
    `最初のひとことは「${FIRST_LINE}」でお願いします。`,
  ];
  return lines.join("\n");
}

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

  /* まとめさせないこと。
     まとめさせると、まとめ方が毎回変わって、整理が効かなくなる。 */
  if (!/まとめや要約は要りません/.test(p)) {
    throw new Error("渡すプロンプトに、まとめさせない指示がありません");
  }

  /* JSONの話を書かないこと。
     本人はふつうに話すだけでよい。構造はこちらで作る。 */
  for (const w of ["JSON", "json", "{", "}"]) {
    if (p.includes(w)) {
      throw new Error(`渡すプロンプトに「${w}」が入っています（本人に構造を見せない）`);
    }
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
