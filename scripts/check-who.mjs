// 誰に聞くのか、の言い方を1つに保つ。
//
// ══════════════════════════════════════════════════
// なぜ要るか
// ══════════════════════════════════════════════════
// 1つの画面に、2つの言い方が並んでいた。
//
//   ヘッダーとボタン   女性に確カメる     （page.tsx に直書き）
//   本文               実在する異性にも   （voice.ts の DEFINITION）
//
// 直書きする場所と、lib/who.ts から引く場所が別々にあったので、
// 片方だけ直しても、もう片方が残った。
// 読んだ人には、何のサービスなのかが揺れて見える。
//
// 言い方は lib/who.ts の advisorWord() が1つ持つ。
// 画面はそこから引く。
//
// ══════════════════════════════════════════════════
// 3つを見る
// ══════════════════════════════════════════════════
// 1. 「◯◯に確カメる」を直書きしていないこと
// 2. 1画面目に、使えない向きの断りが出ていること
// 3. 会話の相手に、亀の絵文字を使っていないこと
//
//    「異性」と書くと、どちらの向きも開いているように読める。
//    実際に開いているのは片方だけ（ASKER_OPEN）。
//    断りが 6500px の下のほうにしか無いと、
//    1画面目で「使える」と思った人はそこまで読まない。
//
// ══════════════════════════════════════════════════
// 何を見ないか
// ══════════════════════════════════════════════════
// いま登録している回答者そのものを指す文は、事実なので直さない。
//   「{age}歳・女性」          回答者の年代ラベル
//   「審査を通った女性だけ」    いまの回答者は実際に女性だけ
//   「友達の女性は」            相談する人の友達の話
// これらは advisorWord() に置き換えると、かえって嘘になる。

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
/* src/lib も見る。
   最初は画面のファイルだけ見ていたが、タブの名乗り（voice.ts の
   TAB_TITLE）と1画面目の2行目（koi/gate.ts）が lib にあり、
   どちらも「女性に確かめる」のまま残っていた。
   検索結果に出る1行が、いちばん見られる場所だった。 */
const LOOK = ["src/app", "src/components", "src/lib"];

/** 運営だけが見る画面。売り文句ではない */
const SKIP = [
  "src/app/admin/",
  // 言い方を決めている場所そのもの
  "src/lib/who.ts",
  /* ══════════════════════════════════════════════
     利用規約は、ここで直さない
     ══════════════════════════════════════════════
     第3条に、こう書いてある。

       当社が業務を委託した成人女性の回答者（以下「回答者」）に対し、
       当該相談について実際の女性としてどのように受け取るかという
       反応の提供を依頼します。

     これは商品の売り文句ではなく、いま実際に誰と業務委託契約を
     しているかを書いた条項。委託先は実際に女性だけ。

     男性の回答者が入ったときに、この条項をどう書き換えるかは
     法律の文言の話で、こちらで決めない（［要確認］）。
     合わせて直すために、ここは判定から外す。 */
  "src/lib/terms.ts",
];

/**
 * 直書きしてはいけない言い方。
 *
 * 「確カメる」「確かめる」の直前に性別を置いた形。
 * ここは advisorWord() から引く。
 */
const HARDCODED = [
  /* ══════════════════════════════════════════════
     誰に聞くのかを、画面に直書きしない
     ══════════════════════════════════════════════
     マチアプ版では「女性に確カメる」と「実在する異性にも」が
     1つの画面に並んでいた。直書きする場所と、who.ts から引く
     場所が別々にあったので、片方だけ直しても残った。

     旅版で同じことが起きるのは、こういう形。
       経験者に聞く        ← 誰が答えるのか分からない
       現地に詳しい人に聞く ← 在住者を呼び込む
       旅のプロに聞く      ← 別の商売になる

     聞けるのは「直近90日以内に、同じ都市へ、一人で行った日本人」。
     lib/who.ts の advisorWord() から引くこと。 */
  /(経験者|詳しい人|旅のプロ|現地の人|在住者|ガイド)に(聞|確カメ|確かめ)/,
  /(現地|旅)に詳しい/,
  /旅行のプロ/,
  /(添乗員|ツアーガイド|コンシェルジュ)/,
];


/**
 * コメントを、同じ長さの空白に置き換える。
 *
 * 消すと行番号がずれて、どこを直せばいいか分からなくなる。
 * 改行はそのまま残す。
 */
function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      if (c === "\\") { out += c + (next ?? ""); i += 2; continue; }
      if (c === quote) quote = null;
      out += c;
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; i += 1; continue; }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i += 1; }
      continue;
    }
    if (c === "/" && next === "*") {
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i += 1;
      }
      out += "  ";
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

async function files(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = `${dir}/${e.name}`;
    if (SKIP.some((s) => rel.startsWith(s))) continue;
    if (e.isDirectory()) out.push(...(await files(rel)));
    else if (/\.tsx?$/.test(e.name)) out.push(rel);
  }
  return out;
}

/* ── 1. 直書きしていないこと ───────────────────────── */
const hits = [];

for (const dir of LOOK) {
  for (const f of await files(dir)) {
    const src = await readFile(join(ROOT, f), "utf8");
    /* コメントは見ない（直した経緯として、古い言い方が書いてある）。

       最初は行頭が // や * かどうかで見ていたが、ブロックコメントの
       途中の行は、どちらでも始まらない。実際にその2行を見逃していた。
       本物の構文で外し、行番号がずれないよう空白に置き換える。 */
    stripComments(src).split("\n").forEach((line, n) => {
      const t = line.trim();
      /* 判定そのものの言葉は見ない。
         throw の中の文は、運営が読むエラーで、画面には出ない。 */
      if (/throw new Error/.test(t)) return;
      for (const re of HARDCODED) {
        if (re.test(line)) {
          hits.push({ f, n: n + 1, line: t.slice(0, 90) });
          return;
        }
      }
    });
  }
}

if (hits.length > 0) {
  console.error("誰に聞くのかを、直書きしています。");
  console.error("");
  for (const h of hits) console.error(`  ${h.f}:${h.n}\n    ${h.line}`);
  console.error("");
  console.error("lib/who.ts の advisorWord() から引いてください。");
  console.error("直書きすると、開いている向きが変わった日に、そこだけ残ります。");
  process.exit(1);
}

/* ══════════════════════════════════════════════════
   2. 書けないことを、書いていないこと
   ══════════════════════════════════════════════════
   確認できているのは「15の国・地域に行ったことがある」まで。
   都市・時期・回数・一人旅だったか・語学力は未確認。

   lib/been.ts が、持ちもの側で止める。
   ここは、画面側で勝手に足していないかを見る。 */
const lp = stripComments(await readFile(join(ROOT, "src/app/(ja)/page.tsx"), "utf8"));

{
  /* ── 行った国を、画面に直書きしないこと ──────────
     一覧は lib/been.ts が持つ。画面で足せる形にすると、
     未確認の国がそこだけ増える。 */
  const been = stripComments(await readFile(join(ROOT, "src/lib/been.ts"), "utf8"));
  const list = been.match(/BEEN[^=]*=\s*\[([\s\S]*?)\]/);
  if (!list) {
    console.error("lib/been.ts に、行った国の一覧がありません。");
    process.exit(1);
  }
  const names = [...list[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (names.length !== 15) {
    console.error(`行った国・地域が ${names.length} 個です（確認できているのは15）。`);
    process.exit(1);
  }
  if (!lp.includes("BEEN")) {
    console.error("トップが、行った国の一覧（BEEN）を出していません。");
    console.error("");
    console.error("どこの相談を受けられるかは、買う前に知りたいことです。");
    process.exit(1);
  }

  /* ── 詳しい・専門家だと名乗らないこと ────────────
     行ったことと、詳しいことは別。 */
  for (const w of ["精通", "熟知", "全域", "最新事情", "専門家です", "プロガイド", "現地在住"]) {
    if (lp.includes(w)) {
      console.error(`トップに「${w}」が入っています。`);
      console.error("");
      console.error("確認できているのは、行ったことがある、までです。");
      process.exit(1);
    }
  }

  /* ── 複数で待機しているように見せないこと ────────
     対応するのは運営者1人。 */
  for (const w of ["専門家が待機", "スタッフが", "チームが", "複数の専門家"]) {
    if (lp.includes(w)) {
      console.error(`トップに「${w}」が入っています。対応するのは1人です。`);
      process.exit(1);
    }
  }
}

/* ══════════════════════════════════════════════════
   3. 「し放題」を、単独で出していないこと
   ══════════════════════════════════════════════════
   回数に上限が無いのは本当だが、無条件ではない。
   期間（出発7日前〜帰国日）と、返信（原則24時間以内）が
   離れていると、買った人が最初に困る。

   3つは lib/service.ts が組（UNLIMITED_SET）で持っている。
   画面が3つとも出しているかを見る。 */
{
  for (const [sym, what] of [
    ["UNLIMITED_LINE", "回数に上限が無いこと"],
    ["WINDOW_LINE", "使える期間"],
    ["REPLY_LINE", "返信の目安"],
  ]) {
    if (!lp.includes(sym)) {
      console.error(`トップが、${what}（${sym}）を出していません。`);
      console.error("");
      console.error("「相談し放題」は、期間と返信の条件とセットでしか出せません。");
      console.error("小さい注意書きに隠すと、買った人が最初に困ります。");
      process.exit(1);
    }
  }

  /* すぐ返すと、読ませないこと。
     「24時間以内」と「24時間対応」は別物。 */
  for (const w of ["24時間対応", "即レス", "すぐに返信します", "いつでも返信"]) {
    if (lp.includes(w)) {
      console.error(`トップに「${w}」が入っています。返すのは原則24時間以内です。`);
      process.exit(1);
    }
  }

  /* 緊急を引き受けると、読ませないこと。
     ここは命に関わる誤解になる。 */
  if (!lp.includes("緊急")) {
    console.error("トップに、緊急時を引き受けないことが書かれていません。");
    console.error("");
    console.error("助けを呼べる先だと思われると、命に関わります。");
    process.exit(1);
  }
}

/* ══════════════════════════════════════════════════
   4. 無いものを、あるように見せていないこと
   ══════════════════════════════════════════════════
   LINEのURLも決済のURLも、まだ入っていない。
   入っていないときに押せる形にすると、どこにも行けない。

   画面は lineReady を見て出し分ける。 */
{
  if (!lp.includes("lineReady")) {
    console.error("トップが、LINEの口が開いているか（lineReady）を見ていません。");
    console.error("");
    console.error("URLが無いときに押せる形にすると、押した人がどこにも行けません。");
    process.exit(1);
  }
  /* 買う前が無料で、相談は支払い後。
     黙っていると「無料で相談し放題」に見える。 */
  for (const sym of ["FREE_CHECK_JA", "PAID_START_JA"]) {
    if (!lp.includes(sym)) {
      console.error(`トップが、${sym}（無料と有料の境目）を出していません。`);
      process.exit(1);
    }
  }
}

/* ── 3. 会話の相手が、旅亀であること ───────────────
   吹き出しの横は、ずっと 🐢 の絵文字だった。
   絵文字は端末が描くので、こちらの旅亀とは別の亀が出る。
   iPhone・Android・Windows で、それぞれ違う顔の亀になる。

   旅亀はこの製品で唯一ずっと出てくる相手なので、
   そこだけは、見る人の端末によらず同じ顔にする。
   components/koi/KoiFace.tsx を使うこと。 */
{
  const turtle = [];
  for (const dir of ["src/app", "src/components"]) {
    for (const f of await files(dir)) {
      if (f.endsWith("KoiFace.tsx")) continue; // 経緯を書いてある
      const src = stripComments(await readFile(join(ROOT, f), "utf8"));
      src.split("\n").forEach((line, n) => {
        if (line.includes("\u{1F422}")) {
          turtle.push({ f, n: n + 1, line: line.trim().slice(0, 70) });
        }
      });
    }
  }
  if (turtle.length > 0) {
    console.error("会話の相手に、亀の絵文字を使っています。");
    console.error("");
    for (const h of turtle) console.error(`  ${h.f}:${h.n}\n    ${h.line}`);
    console.error("");
    console.error("絵文字は端末が描くので、iPhone・Android・Windows で");
    console.error("それぞれ違う顔の亀が出ます。");
    console.error("components/koi/KoiFace.tsx を使ってください。");
    process.exit(1);
  }
}

console.log(
  "who チェック: 直書き0件 — 行った国15・し放題の条件・無い口の出し分け、すべて出ています",
);
