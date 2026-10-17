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
    /* ── 日本語の句読点のあとが、漏れていた ──────────
       前は直前を [\s(（「【] だけに限っていた。
       日本語だと、こう書かれることのほうが多い。

         電話は 090-1234-5678。@my_insta も見てほしい

       「。」は一覧に無いので、@my_insta はそのまま残っていた。
       実際に残っているのを見つけた。

       直前は「アカウント名に使える字でないこと」だけ見る。
       これで句読点・かっこ・日本語の文字が全部入る。

       @ が付いた語をメールアドレスと間違えないこと:
       メールの判定（email）はこれより先に動くので、
       foo@example.com はここへ来る前に伏せられている。

       直前の1文字は $1 で書き戻す。
       消すと「。」が落ちて、文が1つにつながる。

       数字だけのものは、アカウント名にしない:
       広げた直後、「値段は1個@100円でした」の @100 を
       伏せてしまった。日本語で @ は単価の意味でも使う。
       英字か _ が1つは入っていることを求める。 */
    re: /(^|[^A-Za-z0-9._@-])@(?=[0-9.]*[A-Za-z_])[A-Za-z0-9._]{2,30}/g,
    mask: "$1［アカウント名］",
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
    // 日本語の句読点のあと。空白で区切らない書き方のほうが多い
    { in: "連絡はこれだけ。@my_insta も見てほしい", mustGo: "@my_insta", kind: "SNSのアカウント名" },
    { in: "インスタは、@yuki.photo です", mustGo: "@yuki.photo", kind: "SNSのアカウント名" },
    { in: "彼女@kana_0101 のストーリー", mustGo: "@kana_0101", kind: "SNSのアカウント名" },
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

  /* 直前の1文字を、消さないこと。
     アカウント名の判定は直前の1文字を含めて拾うので、
     書き戻さないと「。」が落ちて、前後の文が1つにつながる。 */
  {
    const src = "もう連絡はしない。@my_insta だけ見ている";
    const r = redact(src);
    if (!r.text.includes("しない。")) {
      throw new Error(`アカウント名の手前の文字が消えています: ${src} → ${r.text}`);
    }
  }

  /* メールアドレスを、アカウント名として半分だけ伏せないこと。
     メールの判定が先に動いていることが前提になっている。 */
  {
    const r = redact("taro.yamada@example.co.jp に送った");
    if (/［アカウント名］/.test(r.text)) {
      throw new Error(`メールアドレスがアカウント名として扱われています: ${r.text}`);
    }
    if (!/［メールアドレス］/.test(r.text)) {
      throw new Error(`メールアドレスが伏せられていません: ${r.text}`);
    }
  }

  /* 単価の @ を、アカウント名として伏せないこと。
     日本語では @ を「1個あたり」の意味でも書く。
     伏せると、金額の話が読めなくなる。 */
  for (const s of ["値段は1個@100円でした", "@1200 で買えた", "@2024 の話"]) {
    const r = redact(s);
    if (r.text !== s) {
      throw new Error(`単価の@が伏せられています: ${s} → ${r.text}`);
    }
  }

  if (!mayContainName("ゆいさんに送るLINE")) {
    throw new Error("人名の可能性を拾えていません");
  }
  if (mayContainName("土曜に会う約束をしました")) {
    throw new Error("人名の可能性を過剰に拾っています");
  }
}
