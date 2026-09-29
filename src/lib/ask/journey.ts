// 恋愛のどこにいるか。
//
// ══════════════════════════════════════════════════
// 「悩み」ではなく「分岐点」を置く
// ══════════════════════════════════════════════════
// 「メッセージで悩んでいる」は、状態。
// 「いま返すか、少し待つか」は、選択。
//
// 状態だけを並べると、相談窓口の一覧になる。
// 困った人が、困ったときに開くもの。それでは続かない。
//
// 選択を並べると、次の一手を決める前に開くものになる。
// 恋愛は一度の大勝負ではなく、この小さな選択の積み重ねで
// 状況が変わっていくので、こちらのほうが実際に近い。
//
// だから各段に choices を持たせる。
// そこで実際に迷う問いを、問いの形のまま置くこと。
//
// ══════════════════════════════════════════════════
// 受け取れない選択を、置かない
// ══════════════════════════════════════════════════
// 「この写真でいい？」「この服で行く？」は置けない。
// 画像を受け取る口が無いので、選んだ人が送れずに止まる。
// 下の判定が、文字で答えられない問いを弾く。
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

import { assertPlain, assertNotScary } from "../voice";
import { plan, type PlanId } from "./plans";
import { CASES, OPEN_CASES } from "./cases";

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
   * その段を一息で言ったもの。道のりの絵に出す。
   *
   * pain は「困っていること」、choices は「そこで迷う選択」。
   * これは「その段で何をするか」。3つとも役目が違う。
   */
  summary: string;
  /** 道のりの絵に出す絵柄。lib ではキーだけ持ち、形は画面側 */
  icon: "profile" | "chat" | "call" | "date" | "heart";
  /**
   * その段で出す場面（cases.ts の id）。
   *
   * 段の一覧と場面の一覧を別々の節に置いていたが、
   * 同じことを2回言っていた。段を押したらその場で場面が開く形にして、
   * どの段にどの場面が付くかをここで持つ。
   */
  cases: string[];
  /**
   * その段で実際に迷う選択。問いの形のまま置く。
   *
   * ここがこのサービスの中身。
   * 「メッセージの添削」ではなく「いま返すか、少し待つか」を
   * 選ぶ前に確かめられる、が売っているもの。
   */
  choices: string[];
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
    choices: ["この自己紹介文でいい？", "最初の一行、どっちにする？", "趣味はどこまで書く？"],
    summary: "自己紹介文とプロフィールを整える",
    icon: "profile",
    cases: ["photo"],
    plan: "review",
    category: "photo",
  },
  {
    id: "matched",
    label: "マッチした・やりとり中",
    pain: "この文面を送っていいのか、送信ボタンの前で止まる",
    items: ["初回メッセージ", "LINEへの移行", "デートの誘い方", "返信が遅いとき", "追いLINE"],
    choices: ["いま返す？ 少し待つ？", "この文面で送る？", "そろそろ誘う？"],
    summary: "返信・会話・誘い方を確かめる",
    icon: "chat",
    cases: ["message", "date"],
    plan: "review",
    next: "call15",
    category: "message",
  },
  {
    id: "before_meet",
    label: "会う前・話す前",
    pain: "電話や当日の会話で、変な間ができないか不安",
    items: ["メッセージの練習", "電話の練習", "当日の会話", "話す速度と間"],
    choices: ["電話する？", "この店でいい？", "どこまで先に話しておく？"],
    summary: "電話や初対面の前の不安を減らす",
    icon: "call",
    cases: ["call"],
    plan: "call15",
    category: "message",
  },
  {
    id: "date",
    label: "デートの前後",
    pain: "温度差が読めない。次にどう動けばいいか分からない",
    items: ["初デート前", "デート後のLINE", "次の誘い方", "一度引くべきか"],
    choices: ["今日送る？ 明日にする？", "次に誘う？", "好意を出す？ 一旦引く？"],
    summary: "本番の前後の反応と、次の一手を確かめる",
    icon: "date",
    cases: ["signal"],
    plan: "review",
    next: "mockdate",
    category: "signal",
  },
  {
    id: "deeper",
    label: "関係を進めたい",
    pain: "告白や関係の確認を、どの言い方で切り出すか",
    items: ["告白の前", "関係を確かめる", "交際前の距離感"],
    choices: ["告白する？ まだ待つ？", "関係について聞く？", "次の一手は何にする？"],
    summary: "告白・距離感・次の進め方を決める",
    icon: "heart",
    cases: ["romance"],
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
    for (const t of [st.label, st.pain, st.summary, ...st.items, ...st.choices]) {
      assertPlain(t, `段階「${st.id}」`);
      assertNotScary(t, `段階「${st.id}」`);
    }
  }

  // 一息で言った行にも、受け取れないものを書かない。
  // 「写真・プロフィールを整える」と書くと、写真を送れると思われる。
  for (const st of STEPS) {
    if (!st.summary) throw new Error(`段階「${st.id}」に、一息で言った行がありません`);
    if (st.summary.length > 22) {
      throw new Error(`段階「${st.id}」の行が長すぎます（${st.summary.length}文字）`);
    }
    if (/写真|画像|服装|スクショ/.test(st.summary)) {
      throw new Error(
        `段階「${st.id}」の行が画像を受け取れる前提になっています（${st.summary}）`,
      );
    }
  }

  // 段と場面が、ちゃんとつながっていること。
  // 押しても何も出ない段があると、その段だけ行き止まりになる。
  for (const st of STEPS) {
    if (st.cases.length === 0) throw new Error(`段階「${st.id}」に場面がありません`);
    for (const id of st.cases) {
      if (!CASES.some((c) => c.id === id)) {
        throw new Error(`段階「${st.id}」が、無い場面「${id}」を指しています`);
      }
    }
  }
  // 受け付けている場面が、どこからも開けないまま残っていないこと。
  for (const c of OPEN_CASES) {
    if (!STEPS.some((st) => st.cases.includes(c.id))) {
      throw new Error(`場面「${c.id}」が、どの段からも開けません`);
    }
  }

  // 分岐点は、問いの形で置く。
  // 「メッセージの書き方」は選択ではなく、ただの話題になる。
  for (const st of STEPS) {
    if (st.choices.length < 2) {
      throw new Error(`段階「${st.id}」の分岐点が足りません（そこで迷う選択を2つ以上）`);
    }
    for (const c of st.choices) {
      if (!c.endsWith("？")) {
        throw new Error(`段階「${st.id}」の「${c}」が問いになっていません`);
      }
      // 受け取れないものを選ばせない。画像を送る口はまだ無い。
      if (/写真|画像|服|髪|顔|スクショ/.test(c)) {
        throw new Error(
          `段階「${st.id}」の「${c}」は、文字だけでは答えられません（画像を受け取る口がまだありません）`,
        );
      }
      // こちらが答えを決める書き方にしない。決めるのは本人。
      if (/すべき|したほうがいい|正解/.test(c)) {
        throw new Error(`段階「${st.id}」の「${c}」が、答えを決める書き方になっています`);
      }
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
