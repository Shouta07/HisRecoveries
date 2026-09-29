// ほかの選び方と、どう違うか。
//
// ══════════════════════════════════════════════════
// 比べるなら、正確に比べる
// ══════════════════════════════════════════════════
// 比較広告は景表法の対象で、
//   ・主張に実証があること
//   ・引用が正確であること
//   ・比べ方が公正であること
// の3つが要る。どれか欠けると、そのまま不当表示になる。
//
// ── 他社の金額は書かない ──────────────────────────
// 「月額1万〜＋入会金」のような数字は、出典が無いと書けない。
// 各社で違うものを1つの数字にまとめると、それだけで不正確になる。
// 書くのは料金の「かたち」まで（1回ごとか、続けて払うか）。
//
// ── 事実に反することを書かない ────────────────────
// 「AI相談は月額料金が必要」は誤り。無料で使えるものが多い。
// 相手を実際より悪く書くと、こちらの主張まで疑われる。
//
// ── 全部の行で勝とうとしない ──────────────────────
// 勝てない行は勝てないまま出す。
// 全部に丸が付いている表は、読む人がいちばん信じない。

export type Alternative = {
  id: string;
  label: string;
  /** これは自分たちか */
  us?: boolean;
};

export const ALTERNATIVES: Alternative[] = [
  { id: "us", label: "タシカメ", us: true },
  { id: "agency", label: "結婚相談所" },
  { id: "friend", label: "友達に聞く" },
  { id: "ai", label: "AIに聞く" },
];

export type CompareRow = {
  id: string;
  label: string;
  /** ALTERNATIVES の id ごとの説明 */
  cells: Record<string, string>;
};

export const COMPARE: CompareRow[] = [
  {
    id: "when",
    label: "使うとき",
    cells: {
      us: "送る前・会う前に、そのつど",
      agency: "入会して、続けて使う",
      friend: "相手の都合がつくとき",
      ai: "いつでも",
    },
  },
  {
    id: "price",
    label: "料金のかたち",
    cells: {
      us: "1回ごと。月額なし",
      agency: "入会金と月会費がかかるのが一般的",
      friend: "かからない",
      ai: "無料で使えるものが多い",
    },
  },
  {
    id: "answer",
    label: "返ってくるもの",
    cells: {
      us: "実在の女性が読んで、実際にどう受け取ったか",
      agency: "担当者の助言",
      friend: "その人の意見。多くは同性の目線",
      ai: "こう思われるだろう、という予測",
    },
  },
  {
    id: "scope",
    label: "扱う範囲",
    cells: {
      us: "送る前のLINE、自己紹介文、誘い方",
      agency: "結婚を前提にした出会いと、その進め方",
      friend: "その人に話せる範囲",
      ai: "文章を作る。考えをまとめる",
    },
  },
  {
    id: "who_knows",
    label: "知られるか",
    cells: {
      us: "匿名。相手にも知り合いにも伝わらない",
      agency: "入会のときに本人確認がある",
      friend: "知り合いに知られる",
      ai: "知られない",
    },
  },
];

/** 表の下に必ず出す断り書き。消すとビルドが落ちる */
export const COMPARE_NOTE =
  "※ ほかの選び方は、一般的なかたちを書いたものです。料金も内容も、各社・各サービスで異なります。";

/* ── 公開の前に止めること ─────────────────────────
   比較は、こちらが有利になるほど危ない。
   数字と断定を、ここで機械的に止める。 */
{
  const ids = ALTERNATIVES.map((a) => a.id);
  if (ALTERNATIVES.filter((a) => a.us).length !== 1) {
    throw new Error("比較の表で、どれが自分たちか分からなくなっています");
  }

  for (const r of COMPARE) {
    for (const id of ids) {
      const v = r.cells[id];
      if (!v) throw new Error(`比較の「${r.label}」に ${id} の中身がありません`);

      // 自分たち以外の金額を書かない。出典が無いものは書けない。
      const other = !ALTERNATIVES.find((a) => a.id === id)?.us;
      if (other && /[¥￥]|\d+\s*(円|万|千)/.test(v)) {
        throw new Error(
          `比較の「${r.label}」で ${id} の金額を書いています（${v}）。出典のない金額は書けません`,
        );
      }

      // 相手を断定で悪く書かない。
      const UNFAIR = /できない|使えない|意味がない|役に立たない|劣る|ダメ|最悪/;
      if (other && UNFAIR.test(v)) {
        throw new Error(`比較の「${r.label}」で ${id} を断定で悪く書いています（${v}）`);
      }
    }
  }

  // 全部の行で自分たちが勝つ表は、読む人がいちばん信じない。
  // 「知られるか」は AI も同じ。ここが残っているかを見る。
  const tie = COMPARE.find((r) => r.id === "who_knows");
  if (!tie || !/知られない/.test(tie.cells.ai ?? "")) {
    throw new Error("比較が、こちらに都合よく片寄っています（勝てない行を消さないでください）");
  }

  if (!COMPARE_NOTE.includes("異なります")) {
    throw new Error("比較の断り書きが弱くなっています");
  }
  if (COMPARE.length < 4) throw new Error("比較の行が少なすぎます");
}
