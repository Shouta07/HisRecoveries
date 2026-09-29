import { tokenSeconds } from "./session";

// 通話の部屋。
//
// ══════════════════════════════════════════════════
// 自分で作らない
// ══════════════════════════════════════════════════
// WebRTC の土台は作らない。外のサービスに任せる。
// いまは Daily（REST だけで部屋と入室券が作れる）。
//
// Stripe と同じ作り方にしている。SDK を入れず fetch だけで話す。
// edge でも動き、増える依存も無い。
//
// ══════════════════════════════════════════════════
// 音だけ
// ══════════════════════════════════════════════════
// 部屋を作るときに映像を切っておく。
// 画面側で切るだけだと、URL を直に叩かれたときに映る。
// 「顔は出ない」は約束（responder/policy.ts）なので、
// 部屋の側で出せないようにしておく。
//
// ══════════════════════════════════════════════════
// 録らない
// ══════════════════════════════════════════════════
// 録画も録音も頼まない。頼む口をここに作らない。
// 「録音しません」と約束している以上、
// 設定を1つ変えるだけで録れる形にしておかない。
//
// ══════════════════════════════════════════════════
// 入室券は、終わる時刻を越えない
// ══════════════════════════════════════════════════
// 券の寿命は残り時間そのもの（tokenSeconds）。
// 越える券を出すと、閉じて開き直すだけで時間が延びる。

const API = "https://api.daily.co/v1";

const KEY = process.env.DAILY_API_KEY ?? "";

/** 通話の土台が使える状態か。鍵が無ければ、部屋は作らない */
export const callEnabled = Boolean(KEY);

/** なぜ使えないか。画面と API で同じ言葉を使う */
export function whyCallDisabled(): string | null {
  if (!KEY) return "通話の設定が入っていません";
  return null;
}

type Json = Record<string, unknown>;

async function call(path: string, init: RequestInit): Promise<Json> {
  if (!KEY) throw new Error("通話の設定が入っていません");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let json: Json = {};
  try {
    json = text ? (JSON.parse(text) as Json) : {};
  } catch {
    // 本文が JSON でないこともある。そのときは本文をそのまま理由にする。
  }
  if (!res.ok) {
    const why = typeof json.info === "string" ? json.info : text.slice(0, 200);
    throw new Error(`通話の${init.method === "POST" ? "作成" : "操作"}に失敗しました: ${why}`);
  }
  return json;
}

export type Room = { name: string; url: string };

/**
 * 部屋を作る。
 *
 * exp を置いておくと、その時刻に部屋そのものが消える。
 * 券の期限とは別に、部屋の側にも期限を持たせる（二重に止める）。
 */
export async function createRoom(opts: {
  /** 部屋の名前。相談の鍵から作る（推測できない文字列） */
  name: string;
  /** 部屋が消える時刻 */
  expiresAt: Date;
}): Promise<Room> {
  const json = await call("/rooms", {
    method: "POST",
    body: JSON.stringify({
      name: opts.name,
      privacy: "private",
      properties: {
        // 音だけ。映像は部屋の側で切っておく。
        start_video_off: true,
        enable_screenshare: false,
        // 録らない。頼む口を作らない。
        enable_recording: false,
        // 余計なものを出さない。話すことだけに使う。
        enable_chat: false,
        enable_knocking: false,
        // 2人だけ。3人目が入れる部屋にしない。
        max_participants: 2,
        exp: Math.floor(opts.expiresAt.getTime() / 1000),
        eject_at_room_exp: true,
      },
    }),
  });
  const name = typeof json.name === "string" ? json.name : opts.name;
  const url = typeof json.url === "string" ? json.url : "";
  if (!url) throw new Error("通話の部屋を作れませんでした");
  return { name, url };
}

/**
 * 入室券。
 *
 * 券の寿命は、終わる時刻までの残り。越える券は出さない。
 * 名前は「相談した人」「答える人」のどちらかだけ。
 * 本名も年齢も入れない（相手の画面に出る場所なので）。
 */
export async function createToken(opts: {
  room: string;
  /** 相談した側か、答える側か */
  side: "asker" | "responder";
  /** 終わる時刻。まだ始まっていなければ null */
  endsAt: string | null;
  now?: Date;
}): Promise<{ token: string; seconds: number }> {
  const seconds = tokenSeconds(opts.endsAt, opts.now ?? new Date());
  if (seconds <= 0) throw new Error("この通話はもう終わっています");

  const json = await call("/meeting-tokens", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        room_name: opts.room,
        // 相手の画面に出る名前。ここに本名や年齢を入れない。
        user_name: opts.side === "asker" ? "相談した人" : "答える人",
        // 券そのものの期限。残り時間を越えない。
        exp: Math.floor((Date.now() + seconds * 1000) / 1000),
        // 音だけ。券の側でも映像を切る。
        start_video_off: true,
        enable_screenshare: false,
        enable_recording: false,
      },
    }),
  });
  const token = typeof json.token === "string" ? json.token : "";
  if (!token) throw new Error("入室券を作れませんでした");
  return { token, seconds };
}

/**
 * 部屋を消す。
 *
 * 時間が来たとき、終わったとき、取り消したときに呼ぶ。
 * 消せば、券が残っていても入れない。
 * 既に無い部屋を消そうとしても、失敗として扱わない。
 */
export async function deleteRoom(name: string): Promise<void> {
  if (!KEY) return;
  try {
    await call(`/rooms/${encodeURIComponent(name)}`, { method: "DELETE" });
  } catch {
    // もう無い部屋だった、で構わない。ここで例外を投げると、
    // 通話を終わらせる処理そのものが止まる。
  }
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 録る口を作っていないこと。
  // ここに録画・録音の設定を足したら、約束のほう（policy.ts）も直すこと。
  const src = String(createRoom) + String(createToken);
  if (/enable_recording:\s*true|start_recording|recordings/.test(src)) {
    throw new Error("通話に録音・録画の設定が入っています（録らないと約束しています）");
  }
  // 映像を出す設定になっていないこと。
  if (/start_video_off:\s*false/.test(src)) {
    throw new Error("通話で映像が出る設定になっています（音だけです）");
  }
}
