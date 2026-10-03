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
import { readFileSync } from "node:fs";
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
  /(女性|男性)に確カメる/,
  /(女性|男性)に確かめる/,
  /(女性|男性)\{[^}]*\}人に確かめる/,
  /* 「◯◯に確カメる」だけでは足りなかった。
     この形で、3つが残っていた。
       これ、実際の女性にも聞いてみる？   （恋亀のデモ）
       送る前に、女性の目で見てもらう。   （商品の説明）
       実在女性が回答                     （1画面目の印）
     どれも商品の約束なので、advisorWord() から引く。 */
  /実在(する|の)?(女性|男性)/,
  /実際の(女性|男性)/,
  /(女性|男性)の目(で|を)/,
  /* さらに、この形でも残っていた。
       まず1件、女性に読んでもらう。      （商品の売り文句）
       女性から見た第一印象               （返ってくるものの一覧）
       審査を通った女性と話しながら       （通話の説明）
       どの女性でも / こんな女性が読んで  （回答者の面の見出し） */
  /(女性|男性)(に読んで|から見た|側がそう|と話し)/,
  /(審査を通った|こんな|どの)(女性|男性)/,
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

/* ── 2. 1画面目で、誰に向けた製品かを名乗っていること ── */
/* ── コメントを外してから測る ──────────────────────
   前は生のファイルで字数を測っていた。

   このファイルは、なぜそうしたかを日本語のコメントで
   たくさん書いてある。CTAを入れ替えた理由を1つ足しただけで
   距離が4,273字になり、判定が落ちた。

   画面に出ない字で距離が伸びるのは、測り方が違う。
   コメントを外した状態で測る。 */
const lp = stripComments(await readFile(join(ROOT, "src/app/page.tsx"), "utf8"));

/* 1画面目の目印。
   前は from="hero" のボタンそのものを探していた。
   第一CTAをただのリンクに変えたとき、目印ごと消えて判定が落ちた。
   目印は、ボタンではなく1画面目の見出しにする。
   見出しは、CTAを入れ替えても残る。 */
const hero = lp.indexOf("{HERO_A}");

if (hero < 0) {
  console.error("トップに1画面目の見出し（HERO_A）が見つかりません。");
  console.error("このファイルの判定が、画面の作りに追いつけていません。");
  process.exit(1);
}

/* ══════════════════════════════════════════════════
   断りを置く場所を、1画面目から下へ移した
   ══════════════════════════════════════════════════
   前はこう見ていた。

     1画面目の押す場所のすぐ下（2000字以内）に
     notYetNote（いま確カメるをお使いいただけるのは…）があること

   狙いは正しかった。1画面目で「使える」と思った人が、
   買ってから使えないと気づくのを防ぐためのもの。

   ただ、置いた結果がよくなかった。
   押す場所の真下でいちばん目に入るのが断りで、しかも
   来た男性にとっては1行も自分の話ではない。

   有料100人までは、男性のマチアプ利用者だけに絞ると決めた。
   絞るなら、断るより先に名乗るほうが早い。

     1画面目   男性のマチアプ恋愛を、マッチ後からまとめる。
     断り      よくある質問・フッター・買う場所

   だから、見るものを入れ替える。

     ① 1画面目に、開いている向きが書いてあること（名乗り）
     ② 断りが、どこかには出ていること（逃げ場をなくさない）
     ③ 買う場所に、断りがあること（お金が動く前に言う）

   ①が守られていれば、②を1画面目に置く必要はない。
   両方の向きが開いたら、①も②も要らなくなる（下で外れる）。 */

/* who.ts は TypeScript なので、node からそのままは読み込めない
   （型の構文があるので import すると落ちる）。
   読むのは1つの定数だけなので、ファイルの中身から拾う。 */
function openSideLabels() {
  const who = readFileSync(join(ROOT, "src/lib/who.ts"), "utf8");
  const block = who.match(/ASKER_OPEN[^=]*=\s*\{([\s\S]*?)\}/);
  if (!block) {
    console.error("lib/who.ts に ASKER_OPEN が見つかりません。");
    console.error("このファイルの判定が、who.ts の作りに追いつけていません。");
    process.exit(1);
  }
  const label = { male: "男性", female: "女性" };
  const open = [];
  for (const [, g, v] of block[1].matchAll(/(male|female)\s*:\s*(true|false)/g)) {
    if (v === "true") open.push(label[g]);
  }
  if (open.length === 0) {
    console.error("lib/who.ts で、どの向きも開いていません。");
    process.exit(1);
  }
  // 両方開いていたら、名乗る必要は無い
  return open.length === 2 ? [] : open;
}

const open = openSideLabels();

if (open.length > 0) {
  /* ① 1画面目で名乗っていること。

     名乗りの文そのものは page.tsx には書いていない。
     lib/koi/gate.ts の heroSubLines が持っていて、画面はそれを出す。
     （恋亀と話せるかどうかで中身が変わるので、1か所にまとめてある）

     だから2段で見る。
       1画面目の近くで heroSubLines を出していること
       heroSubLines のほうに、開いている向きが書いてあること

     どちらか片方だけだと素通りする。
     画面が別の文を直書きしても、gate.ts だけ直しても、ここで止まる。 */
  const NEAR = 1200;
  const head = lp.slice(hero, hero + 20000).replace(/\s+/g, "");
  const marks = [...open, "heroSubLines"];
  const at = marks.map((w) => head.indexOf(w)).filter((i) => i >= 0);
  const found = at.length > 0 ? Math.min(...at) : -1;

  if (found < 0 || found > NEAR) {
    console.error("1画面目に、誰に向けた製品かが書かれていません。");
    console.error("");
    console.error(`  いま開いているのは  ${open.join("・")}`);
    console.error(`  1画面目からの字数  ${found < 0 ? "見つからず" : found}（${NEAR} 字まで）`);
    console.error("");
    console.error("片方の向きしか開いていないあいだは、1画面目で名乗ってください。");
    console.error("名乗らないと、使えない人が読み進めてから気づくことになります。");
    console.error("（lib/koi/gate.ts の heroSubLines が、その行を持っています）");
    process.exit(1);
  }

  /* 名乗りの中身。gate.ts の、恋亀と話せないときの2行目を見る。
     ここが「複数人のマッチ後を、1つに整理。」のような
     誰のためか書いていない文に戻ったら、止める。 */
  {
    const gate = stripComments(await readFile(join(ROOT, "src/lib/koi/gate.ts"), "utf8"));
    const said = open.some((w) => gate.includes(w));
    if (!said) {
      console.error("1画面目の2行目に、誰に向けた製品かが書かれていません。");
      console.error("");
      console.error(`  いま開いているのは  ${open.join("・")}`);
      console.error("");
      console.error("lib/koi/gate.ts の SUB_NOW に書いてください。");
      console.error("画面はそこから引いているので、ここを直せば1画面目も変わります。");
      process.exit(1);
    }
  }

  /* ② 断りが、どこかには出ていること。
     名乗っただけでは「いつ開くのか」が分からない。 */
  if (lp.indexOf("notYetNote()") < 0) {
    console.error("トップに、まだ開いていない向きの断り（notYetNote）がありません。");
    console.error("");
    console.error("1画面目で名乗るのとは別に、いつ開くのかを書く場所が要ります。");
    console.error("よくある質問とフッターに置いてください。");
    process.exit(1);
  }

  /* ③ 買う場所にも、断りがあること。
     買ったあとで「使えなかった」と気づくのが、いちばん悪い。
     料金の節（id="price"）から、次の節までのあいだを見る。 */
  const price = lp.indexOf('id="price"');
  if (price < 0) {
    console.error("トップに料金の節（id=\"price\"）が見つかりません。");
    console.error("このファイルの判定が、画面の作りに追いつけていません。");
    process.exit(1);
  }
  const priceEnd = lp.indexOf('id="faq"', price);
  const inPrice = lp.slice(price, priceEnd > 0 ? priceEnd : price + 20000);
  if (!inPrice.includes("notYetNote()")) {
    console.error("買う場所に、まだ開いていない向きの断りがありません。");
    console.error("");
    console.error("本文のどこかにあるだけでは足りません。");
    console.error("お金が動く前に、その場で言ってください。");
    process.exit(1);
  }
}

/* ── 3. 会話の相手が、恋亀であること ───────────────
   吹き出しの横は、ずっと 🐢 の絵文字だった。
   絵文字は端末が描くので、こちらの恋亀とは別の亀が出る。
   iPhone・Android・Windows で、それぞれ違う顔の亀になる。

   恋亀はこの製品で唯一ずっと出てくる相手なので、
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
  `who チェック: 直書き0件 — 1画面目で${open.length > 0 ? open.join("・") + "と名乗っています" : "名乗り不要（両方開いています）"} — 相手は恋亀です`,
);
