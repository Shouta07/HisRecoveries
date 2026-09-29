// 恋愛のどこにいるか。
//
// ══════════════════════════════════════════════════
// 機能の一覧にしない
// ══════════════════════════════════════════════════
// 「写真チェック」「メッセージチェック」「模擬電話」を横に並べると、
// 道具箱になる。道具箱は、必要なときに開くもので、続かない。
//
// 男性の恋愛は、順番に進む。
//   写真 → プロフィール → マッチ → メッセージ → 電話 → デート → 次
// その各段で、必要なときだけ相談できる、という形にする。
//
// ══════════════════════════════════════════════════
// 新しい需要を作らない
// ══════════════════════════════════════════════════
// ここに並んでいるのは、海外か国内で既にお金が払われている行動だけ。
//   写真を人に評価してもらう
//   プロフィールをレビューしてもらう
//   メッセージを添削してもらう
//   人間相手に会話を練習する
//   デート前後に相談する
//
// 思いついた面白い機能を足さない。
// 足すかどうかは lib/decision.ts の順番で決める。

import { assertPlain } from "../voice";
import { plan, type PlanId } from "./plans";

export type StepId = "before" | "matched" | "before_meet" | "date" | "deeper";

export type Step = {
  id: StepId;
  /** 画面に出す、その人の状況 */
  label: string;
  /** その人がいま困っていること */
  pain: string;
  /** そこで相談できるもの */
  items: string[];
  /**
   * この段でまず出す商品。
   *
   * 段と商品を別々に管理すると、受付前の商品へ進める段ができる。
   * 「受け付けているか」はここから引く（open を手で書かない）。
   */
  plan: PlanId;
  /**
   * 同じ段で、もっと本番に近いところまでやる商品。
   * まだ開いていないものは「受付前」として名前だけ出す。
   */
  next?: PlanId;
  /** 相談に進むときのカテゴリ */
  category: string;
};

export const STEPS: Step[] = [
  {
    id: "before",
    label: "まだマッチしていない",
    pain: "自己紹介文で、最初から損をしていないか分からない",
    items: ["自己紹介文を読んでもらう", "AとBを比べる", "書き出しの一行", "趣味の書き方"],
    plan: "review",
    category: "photo",
  },
  {
    id: "matched",
    label: "マッチした・やりとり中",
    pain: "この文面を送っていいのか、送信ボタンの前で止まる",
    items: ["初回メッセージ", "LINEへの移行", "デートの誘い方", "返信が遅いとき", "追いLINE"],
    plan: "review",
    next: "mockchat",
    category: "message",
  },
  {
    id: "before_meet",
    label: "会う前・話す前",
    pain: "電話や当日の会話で、変な間ができないか不安",
    items: ["メッセージの練習", "電話の練習", "当日の会話", "話す速度と間"],
    plan: "mockchat",
    category: "message",
  },
  {
    id: "date",
    label: "デートの前後",
    pain: "温度差が読めない。次にどう動けばいいか分からない",
    items: ["初デート前", "デート後のLINE", "次の誘い方", "一度引くべきか"],
    plan: "review",
    next: "mockdate",
    category: "signal",
  },
  {
    id: "deeper",
    label: "関係を進めたい",
    pain: "告白や関係の確認を、どの言い方で切り出すか",
    items: ["告白の前", "関係を確かめる", "交際前の距離感"],
    plan: "review",
    next: "session",
    category: "romance",
  },
];

/**
 * いま受け付けているか。
 *
 * 段の側に true と書かせない。商品が開いていなければ、段も開かない。
 * ここを人の手で書けるようにしておくと、
 * 買えない商品へ進む入口が残る。
 */
export function isOpen(s: Step): boolean {
  return plan(s.plan).available;
}

export function step(id: StepId): Step {
  const s = STEPS.find((x) => x.id === id);
  if (!s) throw new Error(`未定義の段階: ${id}`);
  return s;
}

export function isStepId(x: unknown): x is StepId {
  return typeof x === "string" && STEPS.some((s) => s.id === x);
}

/** 次の段階。最後なら null */
export function nextStep(id: StepId): Step | null {
  const i = STEPS.findIndex((s) => s.id === id);
  return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1] : null;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 硬い言葉を混ぜない。読むのは29歳の会社員で、
  // いま LINE の下書きを前に止まっている人。
  for (const st of STEPS) {
    for (const t of [st.label, st.pain, ...st.items]) {
      assertPlain(t, `段階「${st.id}」`);
    }
  }

  if (STEPS.length < 4) throw new Error("恋愛の段階が少なすぎます");
  if (new Set(STEPS.map((s) => s.id)).size !== STEPS.length) {
    throw new Error("段階のIDが重複しています");
  }
  // 順番が意味を持つので、最初は「まだマッチしていない」であること。
  if (STEPS[0].id !== "before") {
    throw new Error("最初の段階が「まだマッチしていない」ではありません");
  }
  // どの段階にも、そこで相談できるものが要る。
  // 無い段階を置くと、選んだ人が行き止まりに着く。
  for (const s of STEPS) {
    if (s.items.length === 0) throw new Error(`段階「${s.id}」に相談できるものがありません`);
    if (!s.pain) throw new Error(`段階「${s.id}」に、困っていることが書かれていません`);
  }
  // 受け付けている段階が、1つ以上あること。
  if (!STEPS.some(isOpen)) throw new Error("受け付けている段階がありません");
  // 「もっと深いところ」に、いま出している商品と同じものを置かない。
  for (const s of STEPS) {
    if (s.next === s.plan) throw new Error(`段階「${s.id}」の次が、同じ商品になっています`);
  }
  // 最初の段階は、必ず買える商品につながっていること。
  // ここが受付前だと、いちばん人が多いところで行き止まりになる。
  if (!isOpen(STEPS[0])) {
    throw new Error("最初の段階が受付前の商品につながっています");
  }
}
