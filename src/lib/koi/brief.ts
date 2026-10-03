import type { KoiCase } from "./store";
import { appLabel } from "./board";
import { STAGE_LABEL } from "../talk/diff";
import type { Stage } from "../talk/shape";
import { MIND_READING } from "../ask/model";

/* ══════════════════════════════════════════════════
   AIに渡す、これまでの文章
   ══════════════════════════════════════════════════

   ── この製品の中心 ──────────────────────────────
   「毎回いちから説明しなくていい」を本当にするのは、ここ。

   前は、人格のプロンプトの中に箇条書きで混ぜていた。
   それだと本人が読めない。読めないと、何を渡しているのか
   分からないまま貼ることになる。

   読める文章にして、画面にも出す。
   渡すものが見えていれば、間違っていたら直せる。

   ── ふつうの文で書く ────────────────────────────
   項目を並べると、AIがそれを埋める作業に入る。
   「Aさんとはwithでマッチ。2回デート済み。」のように、
   人が人に話すときの形で書く。

   ── 無いことは、書かない ────────────────────────
   分かっていない項目を「不明」と書くと、
   AIがそこを最初に聞きにいく。それが聞き取りの始まり。
   無いものは、文ごと落とす。

   ── 相手の気持ちを、持ち込まない ────────────────
   こちらが「脈あり」と書いて渡すと、
   そこから先の会話が全部それを前提に進む。
   判定で落とす。 */

export type Brief = {
  /** AIに渡す文章。そのままコピーできる */
  text: string;
  /** 何も渡せるものが無いか */
  empty: boolean;
};

function sentences(c: KoiCase): string[] {
  const who = (c.partner_label ?? "").trim() || "この人";
  const out: string[] = [];

  // どこで出会ったか
  const app = appLabel(c.dating_app);
  out.push(app ? `${who}とは${app}でマッチ。` : `${who}の話です。`);

  // いまどこまで
  const stage =
    (c.status_label ?? "").trim() ||
    (c.current_stage ? STAGE_LABEL[c.current_stage as Stage] : null);
  if (stage) out.push(`${stage}。`);

  // 直近に何があったか
  if (c.timeline_summary?.trim()) out.push(`${c.timeline_summary.trim()}`);

  // 次の予定
  if (c.next_scheduled_event?.trim()) out.push(`次は${c.next_scheduled_event.trim()}の予定。`);

  /* 前回決めたこと。
     「前回、」で始めない。timeline_summary が
     「前回、〜」で始まることが多く、2文続けて同じ出だしになる。 */
  if (c.last_decision?.trim()) out.push(`次は、${c.last_decision.trim()}ところ。`);

  // いま誰待ちか
  if (c.waiting_on === "partner") out.push("いまは相手の返事待ち。");
  else if (c.waiting_on === "user") out.push("いまはこちらが動く番。");

  return out;
}

export function briefFor(c: KoiCase): Brief {
  const body = sentences(c)
    // 相手の気持ちを当てた文は、持ち込まない
    .filter((x) => !MIND_READING.test(x))
    .map((x) => x.trim())
    .filter(Boolean);

  // 1文だけ（呼び名の行だけ）なら、渡す意味が無い
  if (body.length <= 1) return { text: "", empty: true };

  return {
    text: `${body.join("\n")}\n今回の相談はここからです。`,
    empty: false,
  };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const base: KoiCase = {
    id: "x", token: "c", partner_label: "Aさん", dating_app: "with",
    current_stage: "second_date_completed", last_decision: "水族館の日程を決める",
    updated_at: new Date().toISOString(),
    today_action: null, waiting_on: "user", status_label: "2回目デート後",
    next_action_due: null, timeline_summary: "前回、水族館に行きたいと相手から話が出た。",
    last_contact_at: null, next_scheduled_event: null,
  };
  const b = briefFor(base);

  // 渡す文章に、要るものが入っていること。
  for (const t of ["Aさん", "with", "2回目デート後", "水族館"]) {
    if (!b.text.includes(t)) throw new Error(`渡す文章に「${t}」が入っていません`);
  }
  // 「今回の相談はここから」で終わること。AIが続きを始められる形。
  if (!b.text.endsWith("今回の相談はここからです。")) {
    throw new Error("渡す文章が、相談の始まりにつながっていません");
  }

  /* 項目を並べないこと。
     「相手：Aさん」のような形だと、AIが埋める作業に入る。 */
  if (/[：:]\s*$|^- /m.test(b.text)) {
    throw new Error("渡す文章が、項目の並びになっています");
  }

  /* 無いことを「不明」と書かないこと。
     書くと、AIがそこを最初に聞きにいく。 */
  {
    const thin = briefFor({ ...base, status_label: null, current_stage: null, timeline_summary: null });
    if (/不明|未設定|なし|わからない/.test(thin.text)) {
      throw new Error(`無いことを書いています（${thin.text}）`);
    }
  }

  // 何も分かっていなければ、空で返すこと。渡す意味が無い。
  {
    const none = briefFor({
      ...base, dating_app: null, current_stage: null, status_label: null,
      last_decision: null, timeline_summary: null, waiting_on: null, next_scheduled_event: null,
    });
    if (!none.empty) throw new Error("何も分かっていないのに、渡す文章ができています");
  }

  /* 相手の気持ちを持ち込まないこと。
     こちらが「脈あり」と渡すと、そこから先の会話が全部それを前提に進む。 */
  {
    const bad = briefFor({ ...base, timeline_summary: "脈ありだと思う。" });
    if (MIND_READING.test(bad.text)) {
      throw new Error("渡す文章に、相手の気持ちの判定が入っています");
    }
  }

  // 誰待ちかが、言葉で出ること。
  {
    const w = briefFor({ ...base, waiting_on: "partner" });
    if (!w.text.includes("相手の返事待ち")) {
      throw new Error("誰待ちかが、渡す文章に出ていません");
    }
  }

  /* 同じ出だしの文が、続かないこと。
     読んだときに、まとめが下手に見える。 */
  {
    const heads = b.text.split("\n").map((x) => x.slice(0, 3));
    for (let i = 1; i < heads.length; i += 1) {
      if (heads[i] && heads[i] === heads[i - 1]) {
        throw new Error(`渡す文章で、同じ出だし（${heads[i]}）が続いています`);
      }
    }
  }

  // 長すぎないこと。長いと、AIがそれを読むだけで1往復使う。
  if (b.text.length > 400) {
    throw new Error(`渡す文章が ${b.text.length} 字あります（400字まで）`);
  }
}
