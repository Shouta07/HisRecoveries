import { TOOLS, type Tool } from "./tools";
import { buildSystemPrompt, VERSION } from "./prompt";
import { VOICE_MODEL_ASSUMED } from "../pass/entitle";

/* ══════════════════════════════════════════════════
   恋亀と話すときの、設定
   ══════════════════════════════════════════════════

   ── ChatGPT の音声モードは使えない ──────────────
   アプリの音声モードを外のアプリに入れる口は無い。
   仮にあっても、会話が向こうのアプリの中で起きるので、

     話した内容が取れない      → EPが作れない
     人格（prompt.ts）を固定できない
     道具の判定（dispatch.ts）を効かせられない
     伏せ字（mask.ts）を通せない

   「話すだけで、ひとりでに残る」が売りなので、ここは譲れない。
   使うのは Realtime API（speech-to-speech）。

   ── 鍵は、ブラウザに渡さない ────────────────────
   REALTIME_API_KEY は本物の鍵で、漏れると他人が使える。
   ブラウザへ渡すのは、短い間だけ有効な使い捨ての鍵。
   作るのはサーバー側（api/koi/session）。

   ── 人格と道具を、ここで直書きしない ────────────
   人格は prompt.ts、道具は tools.ts が持っている。
   ここで書き直すと、判定を通っていない恋亀が喋る。
   形を変えて渡すだけにする。 */

/**
 * 使う音声モデル。
 *
 * ［要確認］名前は OpenAI 側で変わる。
 * 環境変数で差し替えられるようにしてある。
 *
 * 既定は mini。採算（pass/entitle.ts）が mini を前提に
 * 置いてあるので、フルに変えるなら話せる分数も一緒に見直す。
 */
export const REALTIME_MODEL = process.env.REALTIME_MODEL ?? VOICE_MODEL_ASSUMED;

/**
 * 声。
 *
 * ［要確認］選べる名前は OpenAI 側で決まっている。
 * 恋亀は関西弁で、急かさない相手。低すぎず、速すぎない声にする。
 */
export const REALTIME_VOICE = process.env.REALTIME_VOICE ?? "alloy";

/**
 * 1回の会話で、話せる上限（分）。
 *
 * 入れておかないと、つなぎっぱなしで課金が走る。
 * 月の上限（VOICE_MINUTES_PER_MONTH = 50）の中で、
 * 1回が全部を食い潰さない長さにする。
 */
export const MAX_MINUTES_PER_CALL = 15;

/** OpenAI に渡す道具の形 */
type FnTool = {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description?: string }>;
    required: string[];
  };
};

/** tools.ts の形を、OpenAI の形に変える。中身は足さない */
export function toolsForRealtime(list: Tool[] = TOOLS): FnTool[] {
  return list.map((t) => ({
    type: "function" as const,
    name: t.name,
    description: t.description,
    parameters: {
      type: "object" as const,
      properties: Object.fromEntries(
        t.params.map((p) => [
          p.name,
          // 段階のように "a|b|c" と書いてあるものは、そのまま説明に入れる。
          // 型は string に寄せ、受け取ってよい値かは dispatch.ts が見る。
          { type: p.type.includes("|") ? "string" : p.type, description: p.note },
        ]),
      ),
      required: t.params.filter((p) => p.required).map((p) => p.name),
    },
  }));
}

export type SessionConfig = {
  model: string;
  voice: string;
  instructions: string;
  tools: FnTool[];
  /** 人格の版。どの恋亀が喋ったかを、あとで追えるようにする */
  promptVersion: string;
};

/** 話し始めるときの設定を作る */
export function sessionConfig(): SessionConfig {
  return {
    model: REALTIME_MODEL,
    voice: REALTIME_VOICE,
    instructions: buildSystemPrompt(),
    tools: toolsForRealtime(),
    promptVersion: VERSION,
  };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const c = sessionConfig();

  /* 人格が、prompt.ts から来ていること。
     ここで書き直すと、判定を通っていない恋亀が喋る。 */
  if (c.instructions !== buildSystemPrompt()) {
    throw new Error("話すときの人格が、prompt.ts のものと違います");
  }
  if (!c.promptVersion) {
    throw new Error("人格の版が入っていません（どの恋亀が喋ったか追えません）");
  }

  /* 道具が、tools.ts の数と同じであること。
     ここで足すと、判定（dispatch.ts）を通らない道具が増える。 */
  if (c.tools.length !== TOOLS.length) {
    throw new Error(
      `渡す道具が ${c.tools.length} 個で、tools.ts の ${TOOLS.length} 個と違います`,
    );
  }
  for (const t of c.tools) {
    if (!TOOLS.some((x) => x.name === t.name)) {
      throw new Error(`tools.ts に無い道具「${t.name}」を渡しています`);
    }
    if (!t.description) {
      throw new Error(`道具「${t.name}」に説明がありません（いつ使うか分かりません）`);
    }
  }

  /* 要るものが、要るままであること。
     required が落ちると、空のまま呼ばれて、
     dispatch.ts が弾くところまで行かずに空の行ができる。 */
  for (const src of TOOLS) {
    const got = c.tools.find((x) => x.name === src.name);
    const want = src.params.filter((p) => p.required).map((p) => p.name).sort();
    const have = [...(got?.parameters.required ?? [])].sort();
    if (want.join(",") !== have.join(",")) {
      throw new Error(`道具「${src.name}」の必須が変わっています（${have} / ${want}）`);
    }
  }

  /* 1回の会話に、終わりがあること。
     無いと、つなぎっぱなしで課金が走る。 */
  if (!(MAX_MINUTES_PER_CALL > 0) || MAX_MINUTES_PER_CALL > 30) {
    throw new Error(`1回の上限が ${MAX_MINUTES_PER_CALL} 分です（1〜30分）`);
  }

  /* 採算の前提と、実際に呼ぶモデルが揃っていること。
     ここがずれると、mini の値段で計算したまま
     フルを呼ぶ、が起きる（限界利益率が17%まで落ちる）。
     環境変数で変えたときは、採算のほうも見直す。 */
  if (!process.env.REALTIME_MODEL && REALTIME_MODEL !== VOICE_MODEL_ASSUMED) {
    throw new Error(
      `呼ぶモデル（${REALTIME_MODEL}）が、採算の前提（${VOICE_MODEL_ASSUMED}）と違います`,
    );
  }

  /* 本物の鍵を、設定に混ぜないこと。
     この設定はブラウザへ渡る。 */
  const flat = JSON.stringify(c);
  for (const bad of ["sk-", "REALTIME_API_KEY", "SUPABASE", "STRIPE"]) {
    if (flat.includes(bad)) {
      throw new Error(`ブラウザへ渡す設定に「${bad}」が入っています`);
    }
  }
}
