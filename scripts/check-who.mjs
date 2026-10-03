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
// 2つを見る
// ══════════════════════════════════════════════════
// 1. 「◯◯に確カメる」を直書きしていないこと
// 2. 1画面目に、使えない向きの断りが出ていること
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

/* ── 2. 1画面目で断っていること ────────────────────── */
const lp = await readFile(join(ROOT, "src/app/page.tsx"), "utf8");

const hero = lp.indexOf('from="hero"');
const note = lp.indexOf("notYetNote()");

if (hero < 0) {
  console.error("トップに1画面目のボタン（from=\"hero\"）が見つかりません。");
  console.error("このファイルの判定が、画面の作りに追いつけていません。");
  process.exit(1);
}
if (note < 0) {
  console.error("トップに、使えない向きの断り（notYetNote）がありません。");
  console.error("");
  console.error("相手を「異性」と呼んでいるので、どちらの向きも");
  console.error("開いているように読めます。実際は片方だけです（lib/who.ts）。");
  process.exit(1);
}

/* 1画面目のボタンの近くにあること。
   「近く」を字数で見る。節をまたぐと必ず 2000 字を超える。
   下のほう（料金の節）にしか無いと、ここで止まる。 */
const NEAR = 2000;
if (note < hero || note - hero > NEAR) {
  console.error("使えない向きの断りが、1画面目から離れています。");
  console.error("");
  console.error(`  1画面目のボタン  ${hero} 文字目`);
  console.error(`  断り             ${note} 文字目`);
  console.error("");
  console.error("1画面目で「使える」と思った人は、下まで読みません。");
  console.error("押す場所のすぐ下に置いてください。");
  process.exit(1);
}

console.log("who チェック: 直書き0件 — 1画面目で断っています");
