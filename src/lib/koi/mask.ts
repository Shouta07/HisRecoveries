import { redact } from "../ask/redact";

/* ══════════════════════════════════════════════════
   文字起こしを、構造化へ渡す前に伏せる
   ══════════════════════════════════════════════════

   ── 順番が、いちばん大事 ────────────────────────
   構造化のあとに伏せるのでは遅い。
   途中でAIが実名を要約に含めてしまい、そのまま残る。

   伏せてから渡せば、そもそも入らない。

   ── 忘れられないようにする ──────────────────────
   「伏せてから渡すこと」と書いておくだけでは、いつか忘れる。
   忘れたことは、漏れるまで分からない。

   だから型で縛る。
   構造化へ渡す関数は Masked しか受け取らない。
   生の文字起こしを渡すと、ビルドが落ちる。

   ── 伏せ漏れは起きる ────────────────────────────
   話し言葉なので、文字の相談より取りこぼす。
   「それでね、たかしくんが」のような呼びかけは拾えない。

   だから伏せることだけに頼らない。
     文字起こしの本文は、構造化が済んだら消す（残れば漏れ続ける）
     構造化の結果にも、もう一度かける
     画面に出す前に、3回目をかける */

/** 伏せ字を通した文字列。構造化へ渡せるのは、これだけ */
export type Masked = string & { readonly __masked: unique symbol };

export type MaskResult = {
  text: Masked;
  /** 何を伏せたか。中身は残さない（残したら伏せた意味が無い） */
  found: string[];
};

/* ══════════════════════════════════════════════════
   話し言葉で出てくるもの
   ══════════════════════════════════════════════════
   redact.ts は書き言葉向け（URL・メール・ID）。
   通話では、固有名詞が声で出てくる。 */

const VOICE_RULES: { label: string; re: RegExp; mask: string }[] = [
  /* 話し言葉のSNS。
     redact.ts は「インスタ → yuki.photo」のように記号が要る形で、
     声で言うときの「インスタの yuki.photo」に当たらなかった。
     判定を書いたときに見つけた。あちらは書き言葉向けなので、
     あちらを広げずに、こちらで拾う。 */
  {
    label: "SNSのアカウント名",
    re: /(?:インスタ|Instagram|instagram|ツイッター|Twitter|twitter|TikTok|tiktok)(?:のアカウント|の|、|\s)*\s*@?[A-Za-z0-9._]{3,30}/g,
    mask: "［アカウント名］",
  },
  // 勤務先。「〜株式会社」「株式会社〜」「〜商事」など
  {
    label: "勤務先",
    re: /(株式会社|有限会社|合同会社)\s*[^\s、。]{1,12}|[^\s、。]{1,12}\s*(株式会社|商事|物産|工業|製作所)/g,
    mask: "［勤務先］",
  },
  // 学校
  {
    label: "学校名",
    re: /[^\s、。]{1,10}(大学院|大学|高校|高等学校|中学校|専門学校)/g,
    mask: "［学校］",
  },
  // 駅・地名。待ち合わせの話でよく出る
  {
    label: "駅名",
    re: /[^\s、。]{1,8}駅/g,
    mask: "［駅］",
  },
  // 店名らしきもの。「〜ってお店」「〜という店」
  {
    label: "店名",
    re: /[^\s、。]{1,12}(って|という)(お店|店)/g,
    mask: "［店］",
  },
];

/**
 * 伏せる。
 *
 * ここを通したものだけが、構造化へ渡せる。
 */
export function mask(input: string): MaskResult {
  // 先に書き言葉のほう（URL・メール・電話・住所）。
  // 順番を変えると、URLの中の数字を電話番号として拾う。
  const first = redact(input);
  let text = first.text;
  const found = first.findings.map((f) => f.label);

  for (const r of VOICE_RULES) {
    if (r.re.test(text)) {
      found.push(r.label);
      text = text.replace(r.re, r.mask);
    }
    r.re.lastIndex = 0;
  }

  return { text: text as Masked, found: [...new Set(found)] };
}

/**
 * 伏せ字を通していないものを、無理やり通す。
 *
 * 試すときだけ使う。本番の道で呼ばない。
 * 名前を長くしてあるのは、うっかり使われないため。
 */
export function unsafeAssumeMaskedForTest(s: string): Masked {
  return s as Masked;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 実際に出てきそうな話し言葉で確かめる。
     正規表現は、書いた本人が思っているようには当たらない。 */
  const CASES: { say: string; mustGo: string; what: string }[] = [
    { say: "彼女、株式会社ニコニコに勤めてるらしい", mustGo: "ニコニコ", what: "勤務先" },
    { say: "相手は早稲田大学の出身みたい", mustGo: "早稲田", what: "学校名" },
    { say: "渋谷駅で待ち合わせした", mustGo: "渋谷", what: "駅名" },
    { say: "連絡先は 090-1234-5678 やって", mustGo: "090-1234-5678", what: "電話番号" },
    { say: "インスタの yuki.photo 見せてもらった", mustGo: "yuki.photo", what: "SNS" },
  ];
  for (const c of CASES) {
    const r = mask(c.say);
    if (r.text.includes(c.mustGo)) {
      throw new Error(`「${c.say}」から ${c.what}「${c.mustGo}」が消えていません`);
    }
    if (r.found.length === 0) {
      throw new Error(`「${c.say}」で、何を伏せたかが残っていません`);
    }
  }

  // ふつうの話は、消しすぎないこと。
  // 伏せすぎると、構造化する中身が無くなる。
  {
    const plain = "昨日2回目のデートに行って、向こうから水族館行きたいって言われた";
    const r = mask(plain);
    if (r.text !== plain) {
      throw new Error(`ふつうの話が変わっています：${r.text}`);
    }
  }

  // 伏せたものの中身を、持ち回らないこと。
  // 「何を伏せたか」は要るが、「何だったか」は残さない。
  {
    const r = mask("連絡先は 090-1234-5678 やって");
    for (const f of r.found) {
      if (/\d{3}/.test(f)) throw new Error(`伏せた中身が、記録に残っています：${f}`);
    }
  }

  // 複数まとめて出てきても、全部消えること。
  {
    const mixed = "田中商事の人で、渋谷駅で会って、LINE ID: taro_1234 交換した";
    const r = mask(mixed);
    for (const x of ["田中商事", "渋谷駅", "taro_1234"]) {
      if (r.text.includes(x)) throw new Error(`まとめて出たとき「${x}」が残っています`);
    }
  }

  // 空でも落ちないこと。通話が無音で終わることがある。
  if (mask("").text !== "") throw new Error("空の文字起こしで、おかしくなっています");
}
