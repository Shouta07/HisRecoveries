import { CITIES } from "../voice";
import { toBoard, type TripCard, type TripRow } from "./board";

/* ══════════════════════════════════════════════════
   トップに出す、旅3つの見本
   ══════════════════════════════════════════════════

   ── 日付を固定で書かない ────────────────────────
   「2026-11-14」と書くと、見ている日によって
   「準備中」が「帰国後」になる。半年後に見た人には、
   3つとも帰国後の画面が出る。

   いまから何日前・何日後か、で持つ。判定でも見る。

   ── 3つの段階を、1枚ずつ出す ────────────────────
   準備中・旅行中・帰国後。
   全部が準備中だと、使ったあとどうなるかが見えない。
   帰国後まで残ることが、この製品の芯なので、必ず1枚入れる。

   ── 全部にNEXTを付けない ────────────────────────
   帰国後の旅に「次にやること」は無くていい。
   全部に付けると、終わらない宿題の一覧に見える。 */

const DAY = 86400000;
const at = (d: number) => {
  const t = new Date(Date.now() + d * DAY);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

const ROWS: TripRow[] = [
  {
    id: "d1",
    city: "バンコク",
    departAt: at(12),
    returnAt: at(15),
    done: "宿確定（スクンビット）",
    next: "空港→宿の移動手段を決める",
    records: 4,
    updatedAt: at(0),
  },
  {
    id: "d2",
    city: "台北",
    departAt: at(-1),
    returnAt: at(2),
    done: "空港からMRTで到着",
    next: "明日の朝ごはんの店を決める",
    records: 7,
    updatedAt: at(0),
  },
  {
    id: "d3",
    city: "ソウル",
    departAt: at(-40),
    returnAt: at(-36),
    done: "帰国。両替は明洞がよかった",
    next: null,
    records: 11,
    updatedAt: at(-36),
  },
];

export const DEMO_BOARD: TripCard[] = toBoard(ROWS);

/* ── 公開の前に止めること ───────────────────────── */
{
  if (DEMO_BOARD.length !== 3) {
    throw new Error(`見本の旅が ${DEMO_BOARD.length} 個です（3つ）`);
  }

  /* 3つの段階が、1つずつ出ていること。
     全部が準備中だと、使ったあとどうなるかが見えない。 */
  for (const p of ["before", "during", "after"] as const) {
    if (!DEMO_BOARD.some((c) => c.phase === p)) {
      throw new Error(`見本に「${p}」の旅がありません（3つの段階を1枚ずつ出すこと）`);
    }
  }

  /* 都市が、対応している3つの中にあること。
     見本にだけ対応していない都市が出ると、
     読んだ人が「自分の行き先もいけそう」と思う。 */
  for (const c of DEMO_BOARD) {
    if (!(CITIES as readonly string[]).includes(c.city)) {
      throw new Error(`見本の都市「${c.city}」が、対応都市にありません`);
    }
  }

  /* 日付を固定で書いていないこと。
     見ている日によって段階が変わってしまう。 */
  if (!DEMO_BOARD.some((c) => c.since === "今日")) {
    throw new Error("見本に、今日動いた旅がありません（日付を固定で書いていませんか）");
  }

  /* 全部にNEXTが付いていないこと。
     終わらない宿題の一覧に見える。 */
  if (DEMO_BOARD.every((c) => c.next)) {
    throw new Error("見本の全部に、次にやることが付いています（帰国後は空でよい）");
  }

  /* 済んだことが、どの旅にも入っていること。
     「次にやること」だけ並ぶと、宿題帳になる。
     終わったことが見えるから、進んでいる感じになる。 */
  for (const c of DEMO_BOARD) {
    if (!c.done) throw new Error(`見本の${c.city}に、済んだことがありません`);
  }
}

/* ══════════════════════════════════════════════════
   AIに渡す文章の見本
   ══════════════════════════════════════════════════
   「前回の続きから相談できます」と書いても、どう続くのか分からない。
   渡す文章そのものを出す。

   ── 箇条書きにしない ────────────────────────────
   都市: バンコク / 日程: 11/14〜 のような形にすると、
   AIに渡したときに「設定を読んでいる」返事になる。
   人が人に説明するときの順番で書く。

   ── 分からないことを、書かない ──────────────────
   「保険: 不明」とは書かない。書くと、AIがそこを埋めにくる。
   分かっていることだけ並べて、最後に今回の相談へ渡す。 */
export const TRIP_BRIEF = [
  "バンコクへ、11/14から3泊4日。海外に一人で行くのは初めて。",
  "宿はスクンビットで取ってある。eSIMも買った。",
  "前回、空港から宿までの行き方で迷っていた。まだ決まっていない。",
  "次は、空港→宿の移動手段を決めるところ。",
  "今回の相談はここからです。",
].join("\n");

{
  /* 箇条書きの設定表になっていないこと。
     「都市:」「日程:」が出たら、それは渡す文章ではない。 */
  if (/[:：]\s*\S/.test(TRIP_BRIEF)) {
    throw new Error("AIに渡す文章が、項目と値の一覧になっています");
  }
  /* 分からないことを書いていないこと。 */
  for (const w of ["不明", "未定です", "分かりません", "なし"]) {
    if (TRIP_BRIEF.includes(w)) {
      throw new Error(`AIに渡す文章に「${w}」が入っています。分かっていることだけ書いてください`);
    }
  }
  /* 今回の相談へ渡して終わること。 */
  if (!TRIP_BRIEF.endsWith("今回の相談はここからです。")) {
    throw new Error("AIに渡す文章が、今回の相談へ渡して終わっていません");
  }
  /* 旅だと分かること。都市と、一人だと書いてあること。 */
  if (!/一人/.test(TRIP_BRIEF)) {
    throw new Error("AIに渡す文章に、一人で行くことが書かれていません");
  }
  if (!CITIES.some((c) => TRIP_BRIEF.includes(c))) {
    throw new Error("AIに渡す文章に、対応都市が書かれていません");
  }
  if (TRIP_BRIEF.length > 400) {
    throw new Error(`AIに渡す文章が ${TRIP_BRIEF.length} 字あります（400字まで）`);
  }
}
