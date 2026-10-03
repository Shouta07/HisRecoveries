import { TOOLS, tool, type Tool } from "./tools";
import { isStage } from "../talk/shape";
import { MIND_READING } from "../ask/model";

/* ══════════════════════════════════════════════════
   恋亀が道具を呼んだとき、何が起きるか
   ══════════════════════════════════════════════════

   ── ここがいちばん壊れると困る ──────────────────
   話している最中に、モデルが道具を呼ぶ。
   そのまま実行すると、会話の流れ次第で何が書かれるか分からない。

   起きうること。
     本人が言っていない段階に進む
     相手が勝手に増える（聞き違いで「Bさん」が作られる）
     本名が呼び名として入る
     会話の途中で、人への依頼（＝課金）が飛ぶ

   どれも、起きたあとで気づく。だから呼ばれた時点で止める。

   ── 判断はしない。形だけ見る ────────────────────
   ここでやるのは、受け取ってよい形かどうかだけ。
   「この段階に進むのは早いのでは」のような判断はしない。
   それをやり始めると、どこで何が決まるのか分からなくなる。

   ── 実行はしない ────────────────────────────────
   このファイルはDBに触らない。
   「通してよいか」と「通すなら何を渡すか」を返すだけ。
   実際に書くのは呼ぶ側。分けておくと、ここだけで試せる。 */

export type Call = { name: string; args: Record<string, unknown> };

export type Allowed = { ok: true; tool: Tool; args: Record<string, unknown>; confirm: boolean };
export type Blocked = { ok: false; why: string };
export type Decision = Allowed | Blocked;

/** 呼ばれた回数。1回の会話のあいだ持ち回る */
export type Used = Record<string, number>;

/** 呼び名に使えない形。本名が入り込むのを防ぐ */
const LOOKS_LIKE_REAL_NAME =
  /[一-龯]{2,4}\s*[一-龯]{2,4}(さん|くん|ちゃん)?$|[ぁ-ん]{3,}\s+[ぁ-ん]{3,}/;

/** 呼び名に入ってはいけないもの */
const CONTACT = /@|＠|\d{2,4}-?\d{2,4}-?\d{3,4}|https?:\/\/|line\.me|instagram|twitter|x\.com/i;

function str(x: unknown, max: number): string | null {
  if (typeof x !== "string") return null;
  const t = x.trim();
  if (!t || t.length > max) return null;
  return t;
}

/**
 * 道具の呼び出しを、通してよいか決める。
 *
 * used は、この会話でそれぞれ何回呼ばれたか。
 * 呼ぶ側が持ち回って渡す。
 */
export function decide(call: Call, used: Used = {}): Decision {
  const t = tool(call.name);
  if (!t) return { ok: false, why: `知らない道具「${call.name}」です` };

  const a = call.args ?? {};

  // 要るものが揃っていること。
  for (const p of t.params) {
    if (p.required && a[p.name] === undefined) {
      return { ok: false, why: `「${t.name}」に ${p.name} がありません` };
    }
  }
  // 知らないものを受け取らない。
  for (const k of Object.keys(a)) {
    if (!t.params.some((p) => p.name === k)) {
      return { ok: false, why: `「${t.name}」が知らない ${k} を渡しています` };
    }
  }

  switch (t.name) {
    case "create_person": {
      const nickname = str(a.nickname, 20);
      if (!nickname) return { ok: false, why: "呼び名が、受け取れる形ではありません" };
      // 本名らしきものを、呼び名として受け取らない。
      // 一度入ると、以後ずっとその名前で残る。
      if (LOOKS_LIKE_REAL_NAME.test(nickname)) {
        return { ok: false, why: `呼び名「${nickname}」が、本名のように見えます` };
      }
      if (CONTACT.test(nickname)) {
        return { ok: false, why: "呼び名に、連絡先らしきものが入っています" };
      }
      const app = a.source_app === undefined ? undefined : str(a.source_app, 12);
      if (a.source_app !== undefined && !app) {
        return { ok: false, why: "出会ったところが、受け取れる形ではありません" };
      }
      return { ok: true, tool: t, args: { nickname, source_app: app }, confirm: false };
    }

    case "update_person_stage": {
      const id = str(a.person_id, 64);
      if (!id) return { ok: false, why: "相手が指定されていません" };
      if (!isStage(a.stage)) {
        return { ok: false, why: `知らない段階「${String(a.stage)}」です` };
      }
      /* 段階が進むのは、本人が話したときだけ。
         ただしここでは「本当に話したか」までは分からない。
         分からないので、確認を挟む（confirm）。

         交際開始・終了は、間違えると重い。
         勝手に「交際中」になっていたら、次の相談が全部ずれる。 */
      const heavy = a.stage === "dating" || a.stage === "ended";
      return { ok: true, tool: t, args: { person_id: id, stage: a.stage }, confirm: heavy };
    }

    case "create_episode": {
      const id = str(a.person_id, 64);
      const title = str(a.title, 24);
      const summary = str(a.summary, 400);
      if (!id) return { ok: false, why: "相手が指定されていません" };
      if (!title) return { ok: false, why: "見出しが、受け取れる形ではありません" };
      if (!summary) return { ok: false, why: "中身が、受け取れる形ではありません" };
      // 相手の気持ちを当てる言い方を、残さない。
      for (const x of [title, summary]) {
        if (MIND_READING.test(x)) {
          return { ok: false, why: `「${x}」が、相手の気持ちの判定になっています` };
        }
      }
      // 1回の会話で1つだけ。何度も呼ばれると、話が刻まれて残る。
      if ((used.create_episode ?? 0) >= 1) {
        return { ok: false, why: "この会話では、もうエピソードを作っています" };
      }
      return { ok: true, tool: t, args: { person_id: id, title, summary }, confirm: false };
    }

    case "set_next_action": {
      const id = str(a.person_id, 64);
      const action = str(a.action, 60);
      if (!id) return { ok: false, why: "相手が指定されていません" };
      if (!action) return { ok: false, why: "次にやることが、受け取れる形ではありません" };
      if (MIND_READING.test(action)) {
        return { ok: false, why: `「${action}」が、相手の気持ちの判定になっています` };
      }
      // 助言を並べない。「と」「、」でつないだ複数は受け取らない。
      if (/[、,]|および|したうえで/.test(action)) {
        return { ok: false, why: `次にやることが1つになっていません（${action}）` };
      }
      return { ok: true, tool: t, args: { person_id: id, action }, confirm: false };
    }

    case "request_human_feedback": {
      const id = str(a.person_id, 64);
      const q = str(a.question, 120);
      if (!id) return { ok: false, why: "相手が指定されていません" };
      if (!q) return { ok: false, why: "聞きたいことが、受け取れる形ではありません" };
      if (MIND_READING.test(q)) {
        return { ok: false, why: `「${q}」が、相手の気持ちの判定になっています` };
      }
      // 1回の会話で1度まで。断られたら、もう提案しない。
      if ((used.request_human_feedback ?? 0) >= 1) {
        return { ok: false, why: "この会話では、もう提案しています" };
      }
      /* ここは必ず確認を挟む。
         通すと人への依頼になり、お金が動く。
         会話の勢いで課金が走るのが、いちばんまずい。 */
      return { ok: true, tool: t, args: { person_id: id, question: q }, confirm: true };
    }

    default:
      // 読むだけの道具は、そのまま通す。
      if (t.kind === "read") return { ok: true, tool: t, args: a, confirm: false };
      return { ok: false, why: `「${t.name}」の扱いが決まっていません` };
  }
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const ok = (c: Call, u?: Used) => decide(c, u);

  // 知らない道具を通さないこと。
  if (ok({ name: "drop_all", args: {} }).ok) throw new Error("知らない道具が通ります");

  // 本名らしき呼び名を通さないこと。
  // 一度入ると、以後ずっとその名前で残る。
  for (const n of ["山田太郎", "佐藤 花子"]) {
    if (ok({ name: "create_person", args: { nickname: n } }).ok) {
      throw new Error(`本名らしき呼び名「${n}」が通ります`);
    }
  }
  // 連絡先が入った呼び名を通さないこと。
  if (ok({ name: "create_person", args: { nickname: "A@example.com" } }).ok) {
    throw new Error("連絡先の入った呼び名が通ります");
  }
  // ふつうの呼び名は通ること。
  if (!ok({ name: "create_person", args: { nickname: "Aさん", source_app: "with" } }).ok) {
    throw new Error("ふつうの呼び名が通りません");
  }

  // 知らないものを渡されたら、止めること。
  if (ok({ name: "create_person", args: { nickname: "Aさん", phone: "090" } }).ok) {
    throw new Error("知らない項目が通ります");
  }

  // 知らない段階を通さないこと。
  if (ok({ name: "update_person_stage", args: { person_id: "x", stage: "こくはく" } }).ok) {
    throw new Error("知らない段階が通ります");
  }
  // 交際開始・終了は、確認を挟むこと。
  for (const s of ["dating", "ended"]) {
    const d = ok({ name: "update_person_stage", args: { person_id: "x", stage: s } });
    if (!d.ok || !d.confirm) throw new Error(`「${s}」に確認が挟まっていません`);
  }
  // ふつうの段階は、確認を挟まない（毎回聞くと邪魔になる）。
  {
    const d = ok({ name: "update_person_stage", args: { person_id: "x", stage: "messaging" } });
    if (!d.ok || d.confirm) throw new Error("ふつうの段階にまで確認が挟まっています");
  }

  // 人への依頼は、必ず確認を挟むこと。
  // ここが抜けると、会話の勢いで課金が走る。
  {
    const d = ok({ name: "request_human_feedback", args: { person_id: "x", question: "どう見える？" } });
    if (!d.ok) throw new Error("人への依頼が通りません");
    if (!d.confirm) throw new Error("人への依頼に、確認が挟まっていません");
  }
  // 2度目は通さないこと。
  {
    const d = ok(
      { name: "request_human_feedback", args: { person_id: "x", question: "もう一回" } },
      { request_human_feedback: 1 },
    );
    if (d.ok) throw new Error("人への依頼が、1回の会話で2度通ります");
  }

  // エピソードは1回の会話で1つだけ。
  {
    const d = ok(
      { name: "create_episode", args: { person_id: "x", title: "2回目", summary: "話した" } },
      { create_episode: 1 },
    );
    if (d.ok) throw new Error("エピソードが、1回の会話で2つ作れます");
  }

  // 相手の気持ちを当てる言い方を、残さないこと。
  for (const c of [
    { name: "create_episode", args: { person_id: "x", title: "脈あり確認", summary: "いけそう" } },
    { name: "set_next_action", args: { person_id: "x", action: "脈ありか見極める" } },
    { name: "request_human_feedback", args: { person_id: "x", question: "脈ありだと思う？" } },
  ] as Call[]) {
    if (ok(c).ok) throw new Error(`「${c.name}」で、相手の気持ちの判定が通ります`);
  }

  // 次にやることは1つだけ。並べない。
  if (ok({ name: "set_next_action", args: { person_id: "x", action: "日程を決める、写真も変える" } }).ok) {
    throw new Error("次にやることが、複数のまま通ります");
  }
  if (!ok({ name: "set_next_action", args: { person_id: "x", action: "水族館の日程を決める" } }).ok) {
    throw new Error("ふつうの次にやることが通りません");
  }

  // 読むだけの道具は、そのまま通ること。
  for (const t of TOOLS.filter((x) => x.kind === "read")) {
    const args: Record<string, unknown> = {};
    for (const p of t.params) if (p.required) args[p.name] = "x";
    const d = ok({ name: t.name, args });
    if (!d.ok) throw new Error(`読む道具「${t.name}」が通りません（${d.why}）`);
    if (d.confirm) throw new Error(`読む道具「${t.name}」に確認が挟まっています`);
  }

  // 書く道具・人に聞く道具が、全部ここで扱われていること。
  // 増やしたのに扱いを書き忘れると、既定で落ちる（落ちるのは正しいが、気づきたい）。
  for (const t of TOOLS.filter((x) => x.kind !== "read")) {
    const args: Record<string, unknown> = {};
    for (const p of t.params) if (p.required) args[p.name] = "x";
    const d = ok({ name: t.name, args });
    if (!d.ok && d.why.includes("扱いが決まっていません")) {
      throw new Error(`道具「${t.name}」の扱いが、dispatch に書かれていません`);
    }
  }
}
