import { FRAME, TIME } from "./theme";

// ============================================================
// Film — 「1本の動画 = カットの配列」という定義。
//
// 量産の肝はここ。新作を作るときに触るのは data/films/<name>.ts だけで、
// コンポーネントは一切書かない。カットは既存のレイアウトを組み替えるだけ。
//
//   const film = defineFilm({ cuts: [ {...}, {...} ] })
//
// ============================================================

/** カメラの位置。素材のどこを、どれだけ寄って見せるか。 */
export type Camera = {
  /** 拡大率。1 = cover ぴったり。1.3 で寄る。 */
  scale: number;
  /**
   * 素材のどこを画面中央に置くか（object-position 相当・％）。
   * x=0 で左端、100 で右端。縦持ち素材の顔を出す、横持ち素材の
   * 写り込みを外す、といったフレーミングはここで決める。
   */
  x: number;
  y: number;
};

/** Ken Burns = カメラを from から to へ、ゆっくり動かすこと。 */
export type Move = { from: Camera; to: Camera };

/** 素材。画像 or 手続き生成の光プレート。差し替えは src を書き換えるだけ。 */
export type Media =
  | {
      kind: "image";
      /** packages/video/public からの相対パス */
      src: string;
      /** 素材が届くまでの仮。true の間は README の「未撮影」一覧に出す。 */
      placeholder?: boolean;
    }
  | {
      kind: "plate";
      /** 光の角度（度）。斜光の向き。 */
      angle?: number;
      /** 光の強さ 0–1 */
      intensity?: number;
    };

/** 文字の置き場所。中央には置かない（映像を殺すため）。 */
export type Anchor = "lower-left" | "lower-right" | "upper-left" | "center";

/** レイアウト＝カットの型。増やすときはここに1つ足して layouts/ に実装する。 */
export type Layout =
  | {
      /** 画だけ。文字を置かない「息継ぎ」のカット。 */
      kind: "silent";
    }
  | {
      /** 単語ひとつ（肌。体。清潔感。） */
      kind: "word";
      word: string;
      anchor?: Anchor;
    }
  | {
      /** 1文。1行ずつ順に現れる。 */
      kind: "statement";
      lines: string[];
      anchor?: Anchor;
      /** 強調する語。ブラウンになる。1カットに1語まで。 */
      accent?: string;
    }
  | {
      /** ブランドカード。地は黒、素材は敷かない。 */
      kind: "brand";
      tagline: string;
      cta?: string;
      handle?: string;
    };

export type CutSpec = {
  /** 尺（秒）。合計がフィルムの尺になる。 */
  seconds: number;
  media: Media;
  move: Move;
  layout: Layout;
  /** このカットの意味。編集意図をコードに残す（レビュー時に効く）。 */
  intent?: string;
};

export type FilmSpec = {
  id: string;
  /** ナレーション／アンビエント。public からの相対パス。無ければ無音。 */
  audioSrc?: string;
  /** 音量 0–1。アンビエントは小さく敷く。 */
  audioVolume?: number;
  cuts: CutSpec[];
};

/** 尺表つきのカット（defineFilm が計算する）。 */
export type Cut = CutSpec & {
  index: number;
  from: number;
  duration: number;
  /** 次のカットへ食い込む分を含めた実尺（ディゾルブ用） */
  span: number;
  isFirst: boolean;
  isLast: boolean;
};

export type Film = Omit<FilmSpec, "cuts"> & {
  cuts: Cut[];
  durationInFrames: number;
};

/**
 * 秒指定のカット列を、フレーム単位の尺表に変換する。
 *
 * 各カットは次のカットへ TIME.dissolve ぶん食い込ませる。抜けのフェードと
 * 入りのフェードが重なって、切れ目のないディゾルブになる（＝映画の繋ぎ）。
 * 最後のカットだけは食い込ませない。
 */
export function defineFilm(spec: FilmSpec): Film {
  let at = 0;
  const cuts: Cut[] = spec.cuts.map((c, index) => {
    const duration = Math.round(c.seconds * FRAME.fps);
    const cut: Cut = {
      ...c,
      index,
      from: at,
      duration,
      span: duration,
      isFirst: index === 0,
      isLast: index === spec.cuts.length - 1,
    };
    at += duration;
    return cut;
  });

  for (const cut of cuts) {
    cut.span = cut.isLast ? cut.duration : cut.duration + TIME.dissolve;
  }

  return { ...spec, cuts, durationInFrames: at };
}

/** よく使うカメラワークのプリセット。data 側の記述を短く保つ。 */
export const CAMERA = {
  /** ゆっくり寄る */
  push: (x = 50, y = 50, from = 1.0, to = 1.09): Move => ({
    from: { scale: from, x, y },
    to: { scale: to, x, y },
  }),
  /** ゆっくり引く */
  pull: (x = 50, y = 50, from = 1.12, to = 1.0): Move => ({
    from: { scale: from, x, y },
    to: { scale: to, x, y },
  }),
  /** 横に流れる（寄りは固定） */
  drift: (x1: number, x2: number, y = 50, scale = 1.14): Move => ({
    from: { scale, x: x1, y },
    to: { scale, x: x2, y },
  }),
  /** 寄りながら流れる */
  pushDrift: (from: Camera, to: Camera): Move => ({ from, to }),
} as const;
