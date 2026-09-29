// 機能を足すかどうかの決め方。
//
// ══════════════════════════════════════════════════
// なぜこれがコードの中にあるか
// ══════════════════════════════════════════════════
// 作っていると、面白い機能を思いつく。思いついたものは作りたくなる。
// そして「新規性のための機能」が1つ入ると、次から歯止めが無くなる。
//
// この会社は、アイデアを検証する会社ではない。
// 既に検証済みの需要を、日本で取りにいく会社。
//
// だから判断の順番を、コメントではなくコードに置く。
// 新しいものを足すときは、ここに1行足してからにする。
// 足せないなら、その機能は入れない。
//
// ══════════════════════════════════════════════════
// 順番
// ══════════════════════════════════════════════════
//   1 海外で既に有料販売されているか
//   2 国内で既に類似の需要が確認されているか
//   3 既にいる利用者の、恋愛プロセス上の隣の課題か
//   4 LTV を上げるか
//   5 回答者ネットワークかデータ資産を強くするか
//
// 1と2のどちらも無いものは、原則入れない。
// 3〜5だけで通そうとしているものは、たいてい思いつきの機能。

export type Evidence = {
  /** 何の機能か */
  feature: string;
  /**
   * 海外で有料販売されている形。
   * サービス名ではなく「どういう商品として売られているか」を書く。
   * 他社の文章・画面・コードは写さない。写すのは価値の構造だけ。
   */
  abroad: string | null;
  /** 国内で確認できている類似の需要 */
  domestic: string | null;
  /** 恋愛プロセスのどこの話か */
  step: string;
  /** 入れてよいか */
  adopted: boolean;
  /** 入れていないなら、その理由 */
  why?: string;
};

export const ADOPTED: Evidence[] = [
  {
    feature: "写真を複数人に見てもらい、第一印象を返す",
    abroad: "実在の利用者が互いの写真を評価し、結果を早く見るために課金する形",
    domestic: "写真の撮影・選定を有料で代行するサービスが複数ある",
    step: "出会う前",
    adopted: true,
  },
  {
    feature: "プロフィール文章のレビュー",
    abroad: "プロフィールのレビューを単体の商品として売る形",
    domestic: "プロフィール文章の作成代行が有料で成立している",
    step: "出会う前",
    adopted: true,
  },
  {
    feature: "送る前のメッセージを添削してもらう",
    abroad: "送信前の文面を人がレビューする商品",
    domestic: "メッセージ添削・送信前相談が有料で成立している",
    step: "マッチ後",
    adopted: true,
  },
  {
    feature: "直す → 別の人にもう一度見てもらう（Test → Improve → Retest）",
    abroad: "改善前と改善後を別の評価者に通し、差を見せる形",
    domestic: "写真の撮り直しと再提出は、同じ構造で既に行われている",
    step: "全体",
    adopted: true,
  },
  {
    feature: "実在の人と会話を練習する（模擬チャット）",
    abroad: "実在の相手と模擬的なやりとりを行い、所見を返す商品",
    domestic: "模擬デート・会話練習を有料で提供する形がある",
    step: "会う前",
    adopted: true,
  },
  {
    feature: "実在の人と話す練習（模擬電話）",
    abroad: "音声での模擬デート・コーチングが有料で成立している",
    domestic: "模擬デートの対面版が有料で提供されている",
    step: "会う前",
    adopted: true,
  },
  {
    feature: "デート前後の状況相談",
    abroad: "デーティングコーチが扱う定番の相談内容",
    domestic: "恋愛相談が有料で成立している",
    step: "デート前後",
    adopted: true,
  },
  {
    feature: "相手に近い属性の回答者を選ぶ",
    abroad: "狙う層に近いレビュアーを指定できる形",
    domestic: "年代や立場を指定した相談は、既に行われている",
    step: "全体",
    adopted: true,
  },
];

/** 検討して、入れなかったもの。入れない理由を残す */
export const REJECTED: Evidence[] = [
  {
    feature: "相手の脈あり度を判定する",
    abroad: null,
    domestic: null,
    step: "全体",
    adopted: false,
    why: "相手本人を見ていないので、判定のしようがない。根拠の無い数字になる",
  },
  {
    feature: "回答者のランキングを公開する",
    abroad: null,
    domestic: null,
    step: "全体",
    adopted: false,
    why: "順位を出すと、良い回答より多い回答をする人が増える",
  },
  {
    feature: "利用者どうしのコミュニティ",
    abroad: null,
    domestic: null,
    step: "全体",
    adopted: false,
    why: "使う瞬間が恥ずかしい瞬間なので、人前に出したがらない。運営の負担だけが増える",
  },
  {
    feature: "連続利用のバッジ・レベル",
    abroad: null,
    domestic: null,
    step: "全体",
    adopted: false,
    why: "毎日使う製品ではない。続けさせる仕掛けは、必要のない相談を生む",
  },
  {
    feature: "成功率・失敗確率の表示",
    abroad: null,
    domestic: null,
    step: "全体",
    adopted: false,
    why: "数えられない。出せるのは「5人中3人」だけ",
  },
];

/** その機能を入れてよいか。1と2のどちらも無いものは通さない */
export function passes(e: Evidence): boolean {
  return Boolean(e.abroad || e.domestic);
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 入れたものは、全部どこかで既に売られていること。
  for (const e of ADOPTED) {
    if (!passes(e)) {
      throw new Error(
        `「${e.feature}」は、海外にも国内にも先例がありません。思いつきの機能は入れません`,
      );
    }
    if (!e.adopted) throw new Error(`「${e.feature}」が ADOPTED にありますが adopted が false です`);
  }
  // 入れなかったものには、理由が残っていること。
  for (const e of REJECTED) {
    if (e.adopted) throw new Error(`「${e.feature}」が REJECTED にありますが adopted が true です`);
    if (!e.why) throw new Error(`「${e.feature}」を入れない理由が書かれていません`);
  }
  // 先例として、具体的な社名を書かない。
  // 書くと、そこの文章や画面を写しにいきたくなる。写すのは価値の構造だけ。
  const NAMES = /Photofeeler|RMH|Photojoy|モギジョイ|Tinder|Bumble|Pairs|with|Omiai/;
  for (const e of [...ADOPTED, ...REJECTED]) {
    for (const t of [e.abroad ?? "", e.domestic ?? "", e.feature]) {
      if (NAMES.test(t)) {
        throw new Error(`「${e.feature}」に他社名が入っています（写すのは価値の構造だけ）`);
      }
    }
  }
}
