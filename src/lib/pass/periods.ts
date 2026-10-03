import { PANEL_SIZE, PANEL_REWARD, HUMAN_PER_MONTH, PASS_MARGIN_FLOOR } from "./entitle";

/* ══════════════════════════════════════════════════
   期間と、払い方
   ══════════════════════════════════════════════════

   ── マッチングアプリ本体より安く ────────────────
   タシカメは、アプリと一緒に使うもの。
   アプリより高いと、どちらを切るかの話になる。

   ── 期間と払い方を、別々に選ばせる ──────────────
   組み合わせを1枚に全部並べると7通りになって、選べない。

     1  使う期間を選ぶ（1 / 3 / 6 / 12か月）
     2  払い方を選ぶ（一括 / 月々）

   2段にすると、どの段も選択肢が4つ以下になる。

   ── 月払いは「いつでも解約」ではない ────────────
   ここを曖昧にすると、いちばん大きな苦情になる。

   3か月・6か月・12か月の月払いは、
   期間が決まっていて、支払いだけ分けるもの。
   途中でやめても、残りの請求は止まらない。

   だから画面には必ず「◯か月契約・月払い」と書く。
   「月2,780円」だけを大きく出さない。

   ── 一括のほうが、必ず安いこと ──────────────────
   安くないなら、一括を選ぶ理由が無い。
   下の判定が、逆転したら止める。

   ── 創業メンバー価格は作らない ──────────────────
   一度下げた値段は、上げるときに必ず揉める。
   先着の特典を付けるなら、値段ではなく中身を足す。 */

export type Pay = "lump" | "monthly";

export type Period = {
  /** 何か月か */
  months: number;
  /** 画面に出す名前 */
  label: string;
  /** 一括で払うときの総額（税込） */
  lump: number;
  /** 月々で払うときの1回ぶん。1か月はこれだけ */
  monthly: number;
  /** おすすめとして出すか */
  best?: boolean;
  /** なぜこの期間か。カードの下に1行で出す */
  why: string;
};

export const PERIODS: Period[] = [
  {
    months: 1,
    label: "1か月",
    lump: 2980,
    monthly: 2980,
    why: "まず試すなら。次の更新前にやめられます。",
  },
  {
    months: 3,
    label: "3か月",
    lump: 7980,
    monthly: 2780,
    best: true,
    why: "マッチしてから会うまでが、だいたいこのくらい。",
  },
  {
    months: 6,
    label: "6か月",
    lump: 14400,
    monthly: 2580,
    why: "何人かと並行して進めるなら。",
  },
  {
    months: 12,
    label: "12か月",
    lump: 23760,
    monthly: 2180,
    why: "いちばん安くなる払い方です。",
  },
];

export const BASE_YEN = PERIODS[0].lump;

export function period(months: number): Period {
  const p = PERIODS.find((x) => x.months === months);
  if (!p) throw new Error(`そんな期間はありません（${months}）`);
  return p;
}

/** 一括のときの、1か月あたり */
export function perMonth(p: Period): number {
  return Math.round(p.lump / p.months);
}

/** 月払いの総額 */
export function monthlyTotal(p: Period): number {
  return p.monthly * p.months;
}

/** 一括にすると、いくら安いか。1か月は0 */
export function lumpSaves(p: Period): number {
  return Math.max(0, monthlyTotal(p) - p.lump);
}

/** 期間が決まっている（＝途中でやめても請求が止まらない）か */
export function isFixed(p: Period): boolean {
  return p.months > 1;
}

/**
 * 画面に出す、払い方の名前。
 *
 * 「月々2,780円」だけにしない。必ず期間を付ける。
 * 付けないと、いつでもやめられると読まれる。
 */
export function payLabel(p: Period, pay: Pay): string {
  if (p.months === 1) return "月々";
  return pay === "lump" ? `${p.label}ぶん 一括` : `${p.label}契約・月払い`;
}

/* ══════════════════════════════════════════════════
   先着の特典
   ══════════════════════════════════════════════════
   値段は下げない。中身を足す。

   ── 人の手が要るものを、特典にしない ────────────
   確カメる1回の原価は 3人 × ¥250 = ¥750。
   月額のうち4分の1から3分の1を占める。

   「最初の3か月、人判断を月2回」にすると、
   12か月一括で期間ならし 44.5%、1か月なら 42.1% まで落ちる。
   床（50%）を全部割る。実際に計算した。

   だから特典は、原価がかからないものを主にする。
   追加レビュー1回だけは、長期のプランでなら通る（下の判定）。 */

export type Perk = {
  text: string;
  /** その特典にかかる、1人あたりの原価（円）。期間ぜんぶで1回ぶん */
  cost: number;
  /** 何か月以上のプランに付けるか */
  minMonths: number;
};

export const EARLY_SEATS = 100;

/** もう何人入ったか。達したら特典の表示が消える */
export const EARLY_TAKEN = Number(process.env.EARLY_TAKEN ?? 0);
export const earlyOpen = EARLY_TAKEN < EARLY_SEATS;

export const PERKS: Perk[] = [
  { text: "新しい機能を、先に使えます", cost: 0, minMonths: 1 },
  { text: "作っている途中のものに、意見を出せます", cost: 0, minMonths: 1 },
  { text: `${advisorCount()}人に確カメるのが、期間中に1回ぶん多く使えます`, cost: PANEL_SIZE * PANEL_REWARD, minMonths: 3 },
];

function advisorCount(): number {
  return PANEL_SIZE;
}

/** その期間に付く特典 */
export function perksFor(p: Period): Perk[] {
  if (!earlyOpen) return [];
  return PERKS.filter((x) => p.months >= x.minMonths);
}

/* ══════════════════════════════════════════════════
   採算
   ══════════════════════════════════════════════════ */

/** 1か月あたりの収入に対する、変動費 */
function monthlyVariable(revenuePerMonth: number): number {
  const fee = revenuePerMonth * 0.036;
  const refund = revenuePerMonth * 0.03;
  const misc = 10;
  const human = PANEL_SIZE * PANEL_REWARD * HUMAN_PER_MONTH;
  const ai = 20;
  return fee + refund + misc + human + ai;
}

/** 期間ぜんぶをならしたときの、限界利益率 */
export function marginOf(p: Period, pay: Pay): number {
  const revenue = pay === "lump" ? p.lump : monthlyTotal(p);
  const perMonthRevenue = revenue / p.months;
  const variable = monthlyVariable(perMonthRevenue) * p.months
    + perksFor(p).reduce((a, x) => a + x.cost, 0);
  return (revenue - variable) / revenue;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  if (PERIODS.length < 2) throw new Error("期間が1つしかありません");

  // おすすめは1つだけ。2つあると、どちらでもよく見える。
  const best = PERIODS.filter((p) => p.best);
  if (best.length !== 1) throw new Error(`おすすめが ${best.length} 個あります（1つ）`);
  if (best[0].months === 1) throw new Error("いちばん短いものを、おすすめにしています");

  for (const p of PERIODS) {
    /* 一括のほうが、必ず安いこと。
       安くないなら、一括を選ぶ理由が無い。 */
    if (p.months > 1 && p.lump >= monthlyTotal(p)) {
      throw new Error(
        `${p.label}は一括 ¥${p.lump.toLocaleString()} が、月払いの合計 ` +
          `¥${monthlyTotal(p).toLocaleString()} より安くありません`,
      );
    }
    /* 長いほど、月あたりが安いこと。
       逆転すると、長く契約する理由が無い。 */
    const shorter = PERIODS.filter((x) => x.months < p.months);
    for (const s of shorter) {
      if (perMonth(p) > perMonth(s)) {
        throw new Error(
          `${p.label}の月あたり ¥${perMonth(p)} が、${s.label}の ¥${perMonth(s)} より高いです`,
        );
      }
    }
    /* 採算。一括でも月払いでも、床を割らないこと。
       長いものほど月あたりが安いので、いちばん長いものが危ない。 */
    for (const pay of ["lump", "monthly"] as const) {
      if (p.months === 1 && pay === "lump") continue;
      const m = marginOf(p, pay);
      if (m < PASS_MARGIN_FLOOR) {
        throw new Error(
          `${p.label}・${payLabel(p, pay)}の限界利益率が ${(m * 100).toFixed(1)}% です` +
            `（${Math.round(PASS_MARGIN_FLOOR * 100)}% 以上）。` +
            `値段か、確カメるの回数か、特典を見直してください`,
        );
      }
    }
    // なぜこの期間かが、1行で書いてあること。
    if (!p.why) throw new Error(`${p.label}に、選ぶ理由が書かれていません`);
  }

  /* 期間が決まっているものは、画面の名前にそれが出ること。
     「月々2,780円」だけだと、いつでもやめられると読まれる。 */
  for (const p of PERIODS) {
    if (!isFixed(p)) continue;
    const l = payLabel(p, "monthly");
    if (!l.includes("契約")) {
      throw new Error(`${p.label}の月払いの名前に、契約期間が入っていません（${l}）`);
    }
    if (!l.includes(p.label)) {
      throw new Error(`${p.label}の月払いの名前に、期間が入っていません（${l}）`);
    }
  }

  /* 先着の特典に、値引きを混ぜないこと。
     一度下げた値段は、上げるときに必ず揉める。 */
  for (const k of PERKS) {
    if (/円|¥|割引|オフ|安く/.test(k.text)) {
      throw new Error(`特典「${k.text}」が、値引きになっています`);
    }
  }
  /* 人の手が要る特典を、短いプランに付けないこと。
     確カメる1回の原価は月額の4分の1から3分の1を占める。 */
  for (const k of PERKS) {
    if (k.cost > 0 && k.minMonths < 3) {
      throw new Error(`原価のかかる特典「${k.text}」が、${k.minMonths}か月から付いています`);
    }
  }
  // 原価ゼロの特典が、1つはあること（短いプランにも何か付くように）
  if (!PERKS.some((k) => k.cost === 0)) {
    throw new Error("原価のかからない特典が1つもありません");
  }
  if (EARLY_TAKEN >= EARLY_SEATS && earlyOpen) {
    throw new Error("人数に達しているのに、特典がまだ開いています");
  }
}
