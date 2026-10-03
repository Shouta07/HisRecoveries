import { STAGES } from "../talk/shape";

/* ══════════════════════════════════════════════════
   恋亀が触れるもの
   ══════════════════════════════════════════════════

   ── DBを自由に触らせない ────────────────────────
   話しながらDBを直接書き換えられる形にすると、
   会話の流れ次第で何が起きるか分からなくなる。

   触れるのは、ここに並んだものだけ。
   読むものと、書くものを分けてある。

   ── 消させない ──────────────────────────────────
   消す道具は置かない。
   相手を消すのも、記録を消すのも、本人が画面からやること。
   会話の勢いで消えると、戻せない。

   ── 推測を、事実として書かせない ────────────────
   書き込む道具は、どれも「本人が話したこと」しか受け取らない。
   恋亀が考えたことは、構造化のほう（talk/shape.ts）で
   inference として別に持つ。ここからは入らない。 */

export type ToolKind = "read" | "write" | "ask";

export type Tool = {
  name: string;
  kind: ToolKind;
  /** 恋亀に見せる説明。短く、いつ使うかが分かること */
  description: string;
  /** 受け取るもの。無ければ空 */
  params: { name: string; type: string; required: boolean; note?: string }[];
};

export const TOOLS: Tool[] = [
  /* ── 読む ──────────────────────────────────── */
  {
    name: "get_user_goal",
    kind: "read",
    description: "この人が恋愛に何を望んでいるかを取る。話の方向を決めるのに使う。",
    params: [],
  },
  {
    name: "get_person_context",
    kind: "read",
    description:
      "いま話に出ている相手について、こちらが覚えていることを取る。" +
      "相手の名前が出たら、質問する前にまずこれを呼ぶ。",
    params: [{ name: "nickname", type: "string", required: true, note: "呼び名。本名は扱わない" }],
  },
  {
    name: "get_recent_episodes",
    kind: "read",
    description: "その相手との、最近の出来事を新しい順に取る。前回の続きから話すのに使う。",
    params: [
      { name: "person_id", type: "string", required: true },
      { name: "limit", type: "number", required: false, note: "既定3。多く取らない" },
    ],
  },

  /* ── 書く ──────────────────────────────────── */
  {
    name: "create_person",
    kind: "write",
    description:
      "まだ知らない相手の話が始まったら作る。呼び名と、どこで出会ったかだけ。" +
      "本名・連絡先・勤務先は受け取らない。",
    params: [
      { name: "nickname", type: "string", required: true, note: "本人が呼んでいる呼び名" },
      { name: "source_app", type: "string", required: false, note: "with / Pairs / tapple" },
    ],
  },
  {
    name: "update_person_stage",
    kind: "write",
    description:
      "相手との段階が進んだと本人が話したときだけ呼ぶ。" +
      "推測では呼ばない（「たぶん2回目済んだのでは」では呼ばない）。",
    params: [
      { name: "person_id", type: "string", required: true },
      {
        name: "stage",
        type: `"${STAGES.join('" | "')}"`,
        required: true,
        note: "この一覧の外は受け取らない",
      },
    ],
  },
  {
    name: "create_episode",
    kind: "write",
    description:
      "今回の話をひとまとまりとして残す。会話の終わりに1回だけ呼ぶ。" +
      "途中で何度も呼ばない。",
    params: [
      { name: "person_id", type: "string", required: true },
      { name: "title", type: "string", required: true, note: "「2回目デート」のような短い名前" },
      { name: "summary", type: "string", required: true, note: "本人が話したことだけ" },
    ],
  },
  {
    name: "set_next_action",
    kind: "write",
    description:
      "次にやることを1つだけ決めて残す。会話の終わりに呼ぶ。" +
      "助言を並べない。1つに絞る。",
    params: [
      { name: "person_id", type: "string", required: true },
      { name: "action", type: "string", required: true, note: "「水族館の日程を決める」のような1つ" },
    ],
  },

  /* ── 人に聞く ──────────────────────────────── */
  {
    name: "request_human_feedback",
    kind: "ask",
    description:
      "自分では分からないこと（実在の異性が実際にどう感じるか）に行き当たったときだけ呼ぶ。" +
      "呼ぶと、本人に確認の画面が出る。勝手には進まない。" +
      "1回の会話で1度まで。断られたら、もう提案しない。",
    params: [
      { name: "person_id", type: "string", required: true },
      { name: "question", type: "string", required: true, note: "何を聞きたいか。1つ" },
    ],
  },
];

export function tool(name: string): Tool | undefined {
  return TOOLS.find((t) => t.name === name);
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 消す道具を置かないこと。会話の勢いで消えると、戻せない。
  for (const t of TOOLS) {
    if (/delete|remove|drop|archive|消/.test(t.name)) {
      throw new Error(`道具「${t.name}」が、消すものになっています`);
    }
  }

  // 自由に問い合わせる道具を置かないこと。
  // 1つ置いた時点で、ここに並べた意味が無くなる。
  for (const t of TOOLS) {
    if (/query|sql|exec|raw|search_all/.test(t.name)) {
      throw new Error(`道具「${t.name}」が、自由に問い合わせるものになっています`);
    }
  }

  // 本名や連絡先を受け取る道具が無いこと。
  for (const t of TOOLS) {
    for (const p of t.params) {
      if (/name$|real_name|phone|email|address|company|school/.test(p.name)) {
        if (p.name !== "nickname") {
          throw new Error(`道具「${t.name}」が、個人を特定できる「${p.name}」を受け取ります`);
        }
      }
    }
  }

  // 人に聞く道具は、勝手に進まないこと。
  // ここが抜けると、会話の途中で課金が走る。
  const ask = TOOLS.filter((t) => t.kind === "ask");
  if (ask.length !== 1) {
    throw new Error(`人に聞く道具が ${ask.length} 個あります（1つ）`);
  }
  if (!/本人に確認の画面が出る/.test(ask[0].description)) {
    throw new Error("人に聞く道具に、本人の確認を挟むことが書かれていません");
  }
  if (!/1回の会話で1度まで/.test(ask[0].description)) {
    throw new Error("人に聞く道具に、1回までという制限が書かれていません");
  }

  // 段階は、こちらが決めた一覧の外を受け取らないこと。
  const stage = tool("update_person_stage")?.params.find((p) => p.name === "stage");
  if (!stage || !stage.type.includes(STAGES[0])) {
    throw new Error("段階の道具が、決めた一覧を参照していません");
  }

  // 書く道具には、推測で呼ばないことが書いてあること。
  const upd = tool("update_person_stage");
  if (!upd || !/推測では呼ばない/.test(upd.description)) {
    throw new Error("段階を進める道具に、推測で呼ばない旨が書かれていません");
  }

  // どの道具にも説明があること。説明の無い道具は、間違った場面で呼ばれる。
  for (const t of TOOLS) {
    if (!t.description || t.description.length < 10) {
      throw new Error(`道具「${t.name}」の説明が足りません`);
    }
  }

  // 名前が重なっていないこと。
  if (new Set(TOOLS.map((t) => t.name)).size !== TOOLS.length) {
    throw new Error("道具の名前が重なっています");
  }

  // 多すぎないこと。増やすほど、呼ぶ場面を間違える。
  if (TOOLS.length > 10) {
    throw new Error(`道具が ${TOOLS.length} 個あります（10個まで）`);
  }
}
