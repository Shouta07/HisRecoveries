import { STAGES_OUT, MOMENTUM, PRIORITY, WAITING, INPUT_MODE } from "./handoff";
import { MIND_READING } from "../ask/model";

/* ══════════════════════════════════════════════════
   貼られたものから、JSONを読み取る
   ══════════════════════════════════════════════════

   ── 整理のAIを、呼ばなくてよくなった ────────────
   話したAI自身が、終わりの合図でJSONを出す。
   こちらで呼び直す必要が無い。

   呼び出しが1回減って、記録1件あたりの原価がほぼゼロになる。
   無料枠（10記録）の原価 ¥200 も、ほぼ消える。

   ── 読めなかったら、捨てずに前の道へ ────────────
   JSONが無い／壊れている貼り付けは必ず来る。
     本人が【今回の整理】だけコピーした
     JSONの途中で切れた
     合図を言わずに貼った

   そのときは、会話そのものを整理する前の道（structure.ts）へ回す。
   捨てると、話した時間が丸ごと無駄になる。

   ── 推測で埋めない ──────────────────────────────
   「分からないことは推測しない」と頼んである。
   それでも埋めてくる分は、こちらで落とす。

   決まった言葉から外れたものは、そのまま捨てて "unclear" にしない。
   null のままにする。知らないことを、知っているように見せない。

   ── 相手の気持ちを当てたものは、落とす ──────────
   「脈あり」「本命」は利用規約 第12条で扱わないと決めている。
   出てきた項目ごと落とす（その項目だけ。全部は捨てない）。 */

export type Intake = {
  person: { name: string; app: string | null; metCount: number | null; called: boolean | null };
  state: {
    stage: string | null;
    momentum: string | null;
    lastContactAt: string | null;
    nextEvent: string | null;
  };
  talk: {
    mainIssue: string | null;
    goal: string | null;
    options: string[];
    nextAction: string | null;
    nextActionDue: string | null;
    suggested: string | null;
    cautions: string[];
  };
  manage: {
    priority: string | null;
    waitingOn: string | null;
    statusLabel: string | null;
    todayAction: string | null;
  };
  human: { recommended: boolean; question: string | null };
  result: {
    previousAction: string | null;
    previousOutcome: string | null;
    currentAction: string | null;
    currentOutcome: string | null;
  };
  timeline: { event: string | null; summary: string | null };
  source: { provider: string | null; mode: string | null };
  followUp: string | null;
  /** 落としたもの。黙って消さない */
  dropped: string[];
};

const TEXT_MAX = 400;

function str(v: unknown, max = TEXT_MAX): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : null;
}

function bool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

/** 決まった言葉から外れたら null。"unclear" に寄せない */
function pick(v: unknown, allowed: readonly string[]): string | null {
  const t = str(v, 40);
  if (!t) return null;
  return allowed.includes(t) ? t : null;
}

function list(v: unknown, max = 5): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => str(x, 120)).filter((x): x is string => x !== null).slice(0, max);
}

/**
 * 貼られた文の中から、JSONの塊を取り出す。
 *
 * 【今回の整理】のあとに続いている想定だが、
 * コードブロックに入っていたり、前後に文が付くこともある。
 * いちばん外側の { から } までを取る。
 */
export function findJson(input: string): unknown | null {
  const text = input.replace(/```(?:json)?/gi, " ");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" ? (v as Obj) : {});

/** 相手の気持ちを当てている項目は、落とす */
function clean(v: string | null, where: string, dropped: string[]): string | null {
  if (!v) return null;
  if (MIND_READING.test(v)) {
    dropped.push(where);
    return null;
  }
  return v;
}

export function readIntake(raw: unknown): Intake | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Obj;
  const dropped: string[] = [];

  const person = obj(r.person);
  const name = str(person.name, 40);
  // 呼び名が無いものは、誰の記録か分からない。受け取らない
  if (!name) return null;

  const st = obj(r.relationship_state);
  const co = obj(r.communication);
  const cs = obj(r.consultation);
  const mg = obj(r.management);
  const hr = obj(r.human_review);
  const rs = obj(r.result);
  const tl = obj(r.timeline);
  const sc = obj(r.source);
  const fu = obj(r.follow_up);

  return {
    person: {
      name,
      app: str(person.dating_app, 20),
      metCount: num(person.met_count),
      called: bool(person.called),
    },
    state: {
      stage: pick(st.current_stage, STAGES_OUT),
      momentum: pick(st.momentum, MOMENTUM),
      lastContactAt: str(st.last_contact_at, 40),
      nextEvent: str(st.next_scheduled_event, 120),
    },
    talk: {
      mainIssue: clean(str(cs.main_issue), "今回の悩み", dropped),
      goal: str(cs.user_goal),
      options: list(cs.options).filter((x) => {
        if (MIND_READING.test(x)) {
          dropped.push("選択肢");
          return false;
        }
        return true;
      }),
      nextAction: clean(str(cs.next_action, 120), "次の一手", dropped),
      nextActionDue: str(cs.next_action_due, 40),
      suggested: str(cs.suggested_message, 600),
      cautions: list(cs.cautions),
    },
    manage: {
      priority: pick(mg.priority, PRIORITY),
      waitingOn: pick(mg.waiting_on, WAITING),
      statusLabel: clean(str(mg.status_label, 24), "状態", dropped),
      todayAction: clean(str(mg.today_action, 120), "今日やること", dropped),
    },
    human: {
      recommended: bool(hr.recommended) ?? false,
      question: clean(str(hr.question_to_ask, 200), "人に聞くこと", dropped),
    },
    result: {
      previousAction: str(rs.previous_action_taken, 200),
      previousOutcome: str(rs.previous_outcome, 200),
      currentAction: str(rs.current_action_taken, 200),
      currentOutcome: str(rs.current_outcome, 200),
    },
    timeline: {
      event: str(tl.event_summary, 120),
      summary: str(tl.timeline_summary, 300),
    },
    source: {
      provider: str(sc.ai_provider, 20),
      mode: pick(sc.input_mode, INPUT_MODE),
    },
    followUp: str(fu.next_follow_up_question, 200),
    dropped,
  };
}

/** 貼られた文から、そのまま読み取る。読めなければ null */
export function intakeFromPaste(input: string): Intake | null {
  const j = findJson(input);
  return j ? readIntake(j) : null;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const full = {
    person: { name: "Aさん", dating_app: "with", matched_at: "", met_count: 2, called: true },
    relationship_state: {
      current_stage: "dating_multiple_times", momentum: "improving",
      last_contact_at: "2026-10-03", next_scheduled_event: "水族館",
    },
    communication: {
      message_frequency: "1日1回", latest_event: "2回目デート",
      partner_reaction: "水族館に行きたいと言われた", user_action: "お礼を送った",
    },
    consultation: {
      main_issue: "いつ誘うか", user_goal: "次につなげたい",
      interpretation: ["向こうから提案が出ている"],
      options: ["今日誘う", "明日まで待つ"],
      next_action: "水族館の日程を出す", next_action_due: "今日の夜",
      suggested_message: "土曜どう？", cautions: ["詰めすぎない"],
    },
    management: {
      priority: "high", waiting_on: "user",
      status_label: "2回目デート後", today_action: "水族館の日程を出す",
    },
    human_review: { recommended: true, question_to_ask: "この誘い方は自然に見えるか" },
    result: {
      previous_action_taken: "お礼を送った", previous_outcome: "返事が来た",
      current_action_taken: "", current_outcome: "", next_step: "日程を決める",
    },
    timeline: { event_summary: "2回目デート", timeline_summary: "2回目まで進んでいる" },
    source: { ai_provider: "ChatGPT", input_mode: "voice" },
    follow_up: { next_follow_up_question: "水族館の日程は決まった？" },
  };

  const i = readIntake(full);
  if (!i) throw new Error("正しい形が読み取れません");

  /* ダッシュボードを動かすのに要る4つが、取れること。
     ここが取れないと、今日やること／誰待ち／いつまでに／
     前回どうなったが、画面に出せない。 */
  if (i.manage.todayAction !== "水族館の日程を出す") throw new Error("今日やることが取れていません");
  if (i.manage.waitingOn !== "user") throw new Error("誰待ちが取れていません");
  if (i.talk.nextActionDue !== "今日の夜") throw new Error("いつ動くかが取れていません");
  if (i.result.previousOutcome !== "返事が来た") throw new Error("前回どうなったかが取れていません");

  // 呼び名が無いものは受け取らないこと。誰の記録か分からない。
  if (readIntake({ ...full, person: { name: "" } }) !== null) {
    throw new Error("呼び名が無いのに、受け取っています");
  }

  /* 決まった言葉から外れたら null にすること。
     "unclear" に寄せると、知らないことを知っているように見せる。 */
  {
    const x = readIntake({
      ...full,
      relationship_state: { ...full.relationship_state, current_stage: "こくはく" },
      management: { ...full.management, priority: "さいこう", waiting_on: "neko" },
    });
    if (x?.state.stage !== null) throw new Error("知らない段階を受け取っています");
    if (x?.manage.priority !== null) throw new Error("知らない優先度を受け取っています");
    if (x?.manage.waitingOn !== null) throw new Error("知らない待ち先を受け取っています");
  }

  /* 相手の気持ちを当てた項目は、落とすこと（利用規約 第12条）。
     落とすのはその項目だけ。全部は捨てない。 */
  {
    const x = readIntake({
      ...full,
      consultation: { ...full.consultation, next_action: "脈ありか見極める" },
      management: { ...full.management, status_label: "脈あり" },
    });
    if (x?.talk.nextAction !== null) throw new Error("気持ちを当てた次の一手が通ります");
    if (x?.manage.statusLabel !== null) throw new Error("気持ちを当てた状態が通ります");
    // ほかは残っていること。
    if (x?.manage.todayAction !== "水族館の日程を出す") {
      throw new Error("1つ落としたせいで、ほかまで落ちています");
    }
    if ((x?.dropped.length ?? 0) < 2) throw new Error("落としたことを記録していません");
  }

  /* 貼られた文の中から、JSONを取り出せること。
     【今回の整理】が前に付く／コードブロックに入る、は必ず来る。 */
  {
    const pasted = `【今回の整理】
・いまの状況 2回目デートが終わった
・次の一手 水族館の日程を出す

\`\`\`json
${JSON.stringify(full)}
\`\`\``;
    const x = intakeFromPaste(pasted);
    if (!x) throw new Error("【今回の整理】が前に付いた貼り付けが読めません");
    if (x.person.name !== "Aさん") throw new Error("貼り付けから呼び名が取れていません");
  }

  // JSONが無いものは、null を返すこと（呼ぶ側が前の道へ回す）
  if (intakeFromPaste("【今回の整理】\n・次の一手 水族館の日程を出す") !== null) {
    throw new Error("JSONが無いのに、読み取れたことになっています");
  }
  // 壊れたJSONも、null。
  if (intakeFromPaste('{"person": {"name": "Aさん"') !== null) {
    throw new Error("壊れたJSONを受け取っています");
  }

  // 配列は配列のまま。文字列が来ても落ちないこと。
  {
    const x = readIntake({ ...full, consultation: { ...full.consultation, options: "今日誘う" } });
    if (!Array.isArray(x?.talk.options) || x?.talk.options.length !== 0) {
      throw new Error("配列でないものを、配列として受け取っています");
    }
  }

  // 推測で埋めないこと。空は空のまま。
  {
    const x = readIntake({ ...full, result: { ...full.result, previous_outcome: "" } });
    if (x?.result.previousOutcome !== null) throw new Error("空のものを、埋めています");
  }
}
