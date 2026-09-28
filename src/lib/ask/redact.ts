// 個人情報を伏せる。
//
// ── なぜ機械でやるか ──────────────────────────────
// 相談は見ず知らずの回答者に配られる。相談者が気をつけていても、
// 貼り付けた文面の中に相手のIDや番号が残っていることがある。
// 出す前に、こちらで消す。
//
// ── ここで消せないもの ────────────────────────────
// 人名は、規則では見つけられない。「佐藤」も「ゆうき」も普通の語なので、
// 機械的に消すと文が読めなくなり、残せば漏れる。
// だから人名は消せないものとして扱い、投稿画面で本人に確認してもらう。
// 画像の中の文字と顔も同じ。こちらでは消せないので、人が見てから配る。
//
// できることとできないことを混ぜない。
// 「AIが個人情報を検出します」と書いて実際は素通り、がいちばん危ない。

export type Finding = {
  kind: string;
  /** 画面に出す説明。何が見つかったかを、本人に分かる言葉で */
  label: string;
};

export type Redacted = {
  text: string;
  findings: Finding[];
};

type Rule = {
  kind: string;
  label: string;
  re: RegExp;
  mask: string;
};

// 順番に意味がある。URL を先に消さないと、
// URL の中の数字を電話番号として拾ってしまう。
const RULES: Rule[] = [
  {
    kind: "url",
    label: "リンク",
    re: /https?:\/\/[^\s<>"']+/g,
    mask: "［リンク］",
  },
  {
    kind: "email",
    label: "メールアドレス",
    re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    mask: "［メールアドレス］",
  },
  {
    // 「LINE ID: xxx」「ライン→xxx」のように、ラベルのすぐ後ろに来るものだけ消す。
    // ラベル無しの英数字列まで消すと、店名や商品名まで伏せ字になる。
    kind: "line_id",
    label: "LINE ID",
    re: /(?:LINE|line|ライン)\s*(?:ID|id|アイディー|アカウント)?\s*[:：=＝\->→]+\s*[A-Za-z0-9._-]{3,}/g,
    mask: "［LINE ID］",
  },
  {
    kind: "sns",
    label: "SNSのアカウント名",
    re: /(?:^|[\s(（「【])@[A-Za-z0-9._]{2,30}/g,
    mask: " ［アカウント名］",
  },
  {
    kind: "sns_labeled",
    label: "SNSのアカウント名",
    re: /(?:Instagram|instagram|インスタ|Twitter|twitter|X|TikTok|tiktok)\s*(?:ID|id|アカウント)?\s*[:：=＝\->→]+\s*@?[A-Za-z0-9._]{2,30}/g,
    mask: "［アカウント名］",
  },
  {
    // 日本の携帯・固定。区切りありなし両方。
    kind: "phone",
    label: "電話番号",
    re: /(?:\+81[-\s]?|0)\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}/g,
    mask: "［電話番号］",
  },
  {
    kind: "postal",
    label: "郵便番号",
    re: /〒?\s?\d{3}[-－]\d{4}/g,
    mask: "［郵便番号］",
  },
  {
    // 番地まで書かれた住所。都道府県から丁目・番地までが続くときだけ。
    kind: "address",
    label: "住所",
    re: /[一-龥ぁ-んァ-ヶA-Za-z0-9]{1,8}(?:都|道|府|県)[^\s、。]{1,20}(?:市|区|町|村)[^\s、。]{0,20}\d+[-−ー－]?\d*/g,
    mask: "［住所］",
  },
];

/**
 * 伏せ字にした文と、何を伏せたかを返す。
 * 何も見つからなければ findings は空になる。
 */
export function redact(input: string): Redacted {
  let text = input;
  const found = new Map<string, Finding>();

  for (const r of RULES) {
    // 正規表現に g を付けているので、使い回す前に位置を戻す。
    r.re.lastIndex = 0;
    if (!r.re.test(text)) continue;
    r.re.lastIndex = 0;
    text = text.replace(r.re, r.mask);
    found.set(r.label, { kind: r.kind, label: r.label });
  }

  return { text, findings: [...found.values()] };
}

/**
 * 人名が残っているかもしれない、と本人に伝えるべきか。
 *
 * 判定はしない。できないから。
 * 「さん」「くん」「ちゃん」が付いた語があれば、確認を促すだけにする。
 * 消す判断は本人がする。こちらが黙って消すと、文の意味が変わる。
 */
export function mayContainName(text: string): boolean {
  return /[一-龥ぁ-んァ-ヶA-Za-zｱ-ﾝ]{1,10}(さん|くん|君|ちゃん)/.test(text);
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const cases: { in: string; mustGo: string; kind: string }[] = [
    { in: "連絡先は 090-1234-5678 です", mustGo: "090-1234-5678", kind: "電話番号" },
    { in: "test.user@example.com に送った", mustGo: "test.user@example.com", kind: "メールアドレス" },
    { in: "LINE ID: taro_1234 を交換した", mustGo: "taro_1234", kind: "LINE ID" },
    { in: "インスタ → yuki.photo みてほしい", mustGo: "yuki.photo", kind: "SNSのアカウント名" },
    { in: "彼女の @kana_0101 を見た", mustGo: "@kana_0101", kind: "SNSのアカウント名" },
    { in: "https://example.com/abc を送った", mustGo: "https://example.com/abc", kind: "リンク" },
    { in: "〒150-0001 に住んでいる", mustGo: "150-0001", kind: "郵便番号" },
    { in: "東京都渋谷区神宮前1-2-3 で待ち合わせ", mustGo: "神宮前1-2-3", kind: "住所" },
  ];

  for (const c of cases) {
    const out = redact(c.in);
    if (out.text.includes(c.mustGo)) {
      throw new Error(`「${c.kind}」が伏せられていません: ${c.in} → ${out.text}`);
    }
    if (out.findings.length === 0) {
      throw new Error(`「${c.kind}」を見つけたのに、見つけたと記録していません: ${c.in}`);
    }
  }

  // 消しすぎないこと。普通の相談文が伏せ字だらけになると、回答できなくなる。
  const plain = "土曜の19時に会う約束をしました。3回目です。何を話せばいいか分かりません。";
  const out = redact(plain);
  if (out.text !== plain) {
    throw new Error(`普通の文が書き換わっています: ${plain} → ${out.text}`);
  }
  if (out.findings.length !== 0) {
    throw new Error("普通の文から個人情報を検出しています（過検出）");
  }

  if (!mayContainName("ゆいさんに送るLINE")) {
    throw new Error("人名の可能性を拾えていません");
  }
  if (mayContainName("土曜に会う約束をしました")) {
    throw new Error("人名の可能性を過剰に拾っています");
  }
}
