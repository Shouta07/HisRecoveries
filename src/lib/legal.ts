import { site } from "./site";
import { stripeEnabled } from "./stripe";

/* ══════════════════════════════════════════════════
   事業者情報
   ══════════════════════════════════════════════════

   ── 特商法の表記では、なくなった ────────────────
   ここは長いあいだ「特定商取引法に基づく表記」だった。
   通信販売で対価を受け取るための表記で、
   揃っていなければ決済を止める、という作りにしてあった。

   いま売っているものが無い。

   特商法11条の表示義務は、通信販売をする事業者にかかる。
   売っていないなら、その表記をする相手ではない。

   それでも、この面を消さなかった。理由は2つ。

     1 構想について連絡をもらう面なので、
       誰がやっているのかが分かる必要がある
     2 売り始めた日に、ここを作り直すより
       埋めるだけで済むようにしておきたい

   なので「事業者情報」として残し、
   売るときに要る欄は、売っていないあいだ空にしておく。

   ── 売る口が開いていないことを、確かめる ──────────
   いちばん危ないのは、Stripe の鍵だけ先に入っていて、
   表記が無いまま決済が通る形。

   stripeEnabled を見て、鍵があるのに
   売り物の欄が空なら、公開の前に止める。 */

export type LegalField = {
  key: string;
  label: string;
  /** 揃っていない項目は null のまま。埋めたら値を入れる */
  value: string | null;
  /** 事業者として、いま出しておくべきか */
  required: boolean;
};

/** 環境変数から読む。空文字は「無い」として扱う */
function fromEnv(name: string): string | null {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

/**
 * 売り始めるときに、埋める欄。
 *
 * 空のあいだは画面に出ない（売っていないので、出すと
 * 「準備中の商品がある」ように読まれる）。
 *
 * 埋めたら、特定商取引法に基づく表記として出し直すこと。
 * 販売価格・支払時期・提供時期・返品の条件が要る。
 */
export const SELLING_FIELDS = [
  "販売価格",
  "支払方法と支払時期",
  "役務の提供時期",
  "返品・キャンセルの条件",
  "電話番号",
] as const;

export const LEGAL: LegalField[] = [
  {
    key: "name",
    label: "事業者",
    value: site.company.name,
    required: true,
  },
  {
    key: "rep",
    label: "代表者",
    /* 代表者名はコードに置く。
       登記にも載っている公開情報で、個人の携帯番号とは
       残ることの重さが違う。環境変数が入っていれば、そちらが勝つ。 */
    value: fromEnv("LEGAL_REP_NAME") ?? "山本翔太",
    required: true,
  },
  {
    key: "address",
    label: "所在地",
    value: `${site.company.postalCode} ${site.company.address}`,
    required: true,
  },
  {
    key: "email",
    label: "連絡先",
    value: site.company.email,
    required: true,
  },
  {
    key: "business",
    label: "いま行っていること",
    value:
      "旅先での体験と宿泊空間をつなぐ仕組みの構想および検討。" +
      "本サイトは、その構想を公開し、ご関心をお持ちの方からご連絡をいただくためのものです。",
    required: true,
  },
  {
    key: "selling",
    label: "販売している商品・役務",
    value:
      "現在、本サイトで販売している商品および役務はありません。" +
      "注文の受付、料金の請求、決済のいずれも行っていません。",
    required: true,
  },
];

/** まだ埋まっていない必須項目 */
export function missingLegal(): LegalField[] {
  return LEGAL.filter((f) => f.required && !f.value);
}

/**
 * いま、売ってよいか。
 *
 * 常に false。売り物が無く、特商法の表記も作っていない。
 * 売り始めるときは、SELLING_FIELDS を埋めて
 * この関数ごと作り直すこと。
 */
export function canCharge(): boolean {
  return false;
}

export function whyCannotCharge(): string | null {
  return "現在、販売している商品・役務はありません";
}

/* ── 公開の前に止めること ─────────────────────────
   ここが緩むと、売っていないのに売れる形になる。 */
{
  /* ── 事業者として出すべき欄が、埋まっていること ──── */
  for (const f of LEGAL) {
    if (f.required && !f.value) {
      throw new Error(`事業者情報の「${f.label}」が空です`);
    }
    if (f.value && /準備中|未定|TBD|調整中|追って/.test(f.value)) {
      throw new Error(`事業者情報の「${f.label}」が実質空欄です（${f.value}）`);
    }
  }

  /* ── 売っていないと、はっきり書いてあること ────────
     ここが抜けると、連絡先だけが載った面になり、
     何か買えるのかどうかが読み取れなくなる。 */
  const selling = LEGAL.find((f) => f.key === "selling");
  if (!selling?.value || !/販売している商品および役務はありません/.test(selling.value)) {
    throw new Error("事業者情報に、いま販売しているものが無いことが書かれていません");
  }

  /* ── 値段が、どこにも入っていないこと ──────────────
     売っていないので、金額が出る理由が無い。 */
  const all = LEGAL.map((f) => `${f.label}${f.value ?? ""}`).join("\n");
  for (const re of [/[0-9][0-9,]*\s*円/, /¥\s*[0-9]/]) {
    if (re.test(all)) {
      throw new Error(`事業者情報に金額が書かれています（${all.match(re)?.[0]}）`);
    }
  }

  /* ══════════════════════════════════════════════
     鍵だけ先に入る、を止める
     ══════════════════════════════════════════════
     いちばん危ない形がこれ。

     Stripe の鍵を環境変数に入れた時点で、
     決済を作れるコードが動く状態になる。
     表記は「販売しているものはありません」のまま。

     売っていないと書いてある面の裏で請求が通ると、
     特商法の表示義務を欠いたまま通信販売をしたことになる。

     鍵が入っているのに売り物が無いなら、公開の前に止める。 */
  if (stripeEnabled) {
    throw new Error(
      "Stripe の鍵が設定されていますが、販売している商品・役務がありません。" +
        "売り始めるなら、特定商取引法に基づく表記（" +
        SELLING_FIELDS.join("・") +
        "）を先に用意してください。売らないなら STRIPE_SECRET_KEY を消してください",
    );
  }
  if (canCharge()) {
    throw new Error("売り物が無いのに、決済できる形になっています");
  }
}
