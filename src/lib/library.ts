// Library の「目的から探す」導線。
//
// 記事は悩み（清潔感・薄毛・肌…）で書かれているが、読む人は悩みではなく
// 目的で来る。そこでサイト全体と同じ5つの Job で束ね直す。
//
// 束ね方は自動分類ではなくキュレーション：
//   ・desires … 記事が持つ普遍的欲求タグ（clusters.ts の desire）で拾う
//   ・extraSlugs … 欲求タグでは拾えないが、その目的に要る記事を名指しで足す
//   ・starter … 最初の1本（迷わせないために必ず1つ決める）
// 1本の記事が複数の目的に出るのは正しい。分割ではなく編集だから。
//
// question / answer / points は GEO 用でもある。
// 目的レベルの問いと、その1文回答・3つの要点を「可視のテキストとして」置き、
// 同じ内容を FAQPage の構造化データにも出す（見えない内容を schema に
// 書かない、が守るべき線）。効果は断定せず、順番と考え方だけを述べる。

import type { DesireKey } from "@/lib/clusters";
import type { OccasionId } from "@/lib/occasions";

export type LibraryPurpose = {
  id: OccasionId;
  no: string;
  /** 目的（顧客の言葉） */
  label: string;
  /** 検索・AIに投げられる形の問い */
  question: string;
  /** 問いへの1文回答。ここが引用される想定の核 */
  answer: string;
  /** 引用されやすい粒度の要点 */
  points: string[];
  /** この目的に効く欲求タグ */
  desires: DesireKey[];
  /** 欲求では拾えないが、この目的に要る記事 */
  extraSlugs: string[];
  /** はじめの1本 */
  starter: string;
};

export const purposes: LibraryPurpose[] = [
  {
    id: "romance",
    no: "01",
    label: "恋愛で、選ばれる自分になりたい",
    question: "モテたい・彼女が欲しい。見た目は、何から変えればいいのか。",
    answer:
      "出会いの場面は、加点より先に減点で決まります。まず清潔感（髪・眉・肌・服・匂い）を揃え、そのあとで写真と服の精度を上げる。この順番が、いちばん遠回りしません。",
    points: [
      "清潔感は生まれつきではなく、髪・眉・肌・服・匂いの5要素に分解できる",
      "写真は「盛る」より「減点をなくす」ほうが結果が変わりやすい",
      "服は値段より、サイズが合っているかで印象が動く",
    ],
    desires: ["erabaretai"],
    extraSlugs: [
      "seiketsukan-tsukurikata",
      "men-akanuke-junban",
      "mayu-totonoe",
      "mens-hairstyle-seiketsukan",
      "fuku-size-silhouette",
      "nioi-taishu-care-seiketsukan",
    ],
    starter: "seiketsukan-shoutai-5",
  },
  {
    id: "bigday",
    no: "02",
    label: "大切な日に、最高の自分でいたい",
    question: "結婚式・婚活写真・記念写真の前に、男は何を準備すればいいのか。",
    answer:
      "写真は残ります。当日その場で効くもの（髪型・眉・服・撮られ方）と、時間がかかるもの（肌・薄毛）を分け、時間のかかるほうから先に着手するのが基本です。",
    points: [
      "当日だけで動くのは、髪型・眉・服・撮られ方。ここは直前でも効く",
      "肌の質感や薄毛は月単位で動くため、期日から逆算して先に始める",
      "髪型・眉の最終調整は直前すぎないほうが馴染む（3〜7日前が目安）",
    ],
    desires: [],
    extraSlugs: [
      "shashin-utsuri",
      "matching-app-shashin",
      "omiai-fukusou-men",
      "kekkonshiki-mijitaku-men",
      "date-zenjitsu-mijitaku",
      "hatsu-date-fukusou",
      "mens-makeup-hajimete",
      "mens-skincare-junban",
      "mayu-totonoe",
    ],
    starter: "shashin-utsuri",
  },
  {
    id: "work",
    no: "03",
    label: "仕事で、信頼されたい",
    question: "仕事の第一印象を良くしたい。何を整えると、信頼されやすいのか。",
    answer:
      "人前では、能力より先に見た目が読まれます。疲れて見える要素（顔色・むくみ・姿勢）を消し、髪・眉・服のサイズを揃えるところまでが土台です。",
    points: [
      "「怖い」「不機嫌そう」は表情と姿勢の問題であることが多い",
      "疲れ顔は睡眠・むくみなど、その日のうちに動かせる要素を含む",
      "匂いも清潔感の一部。視覚だけを整えても印象は揃わない",
    ],
    desires: ["shinrai"],
    extraSlugs: ["tsukare-gao-kuma", "fuku-size-silhouette", "mens-hairstyle-seiketsukan"],
    starter: "eigyou-business-daiichiinsho",
  },
  {
    id: "family",
    no: "04",
    label: "家族に、誇られる存在でいたい",
    question: "40代から、老けて見られたくない。何が効くのか。",
    answer:
      "老け見えの多くは、衰えそのものではなく手入れで動く要素（髪の生え際・白髪・肌の質感・むくみ・姿勢）です。変えられるものから順に整えます。",
    points: [
      "顔の印象は「変えられる要素」と「変えにくい要素」に分けられる",
      "白髪は隠すより、ぼかすほうが自然に見えることがある",
      "薄毛は進行性のため、早く現在地を知るほど選べる幅が広い",
    ],
    desires: ["wakasa"],
    extraSlugs: ["sleep-totonoe", "tsukare-yasusa-toshi", "dousoukai-mitame-junbi"],
    starter: "fuke-mie-genin",
  },
  {
    id: "restart",
    no: "05",
    label: "もう一度、自分を好きになりたい",
    question: "自分磨きは、何から始めればいいのか。",
    answer:
      "順番があります。清潔感の土台（髪・眉・肌・服）を先に整え、内側（睡眠・習慣）を並行させる。同じ努力でも、順番で効き方が変わります。",
    points: [
      "土台が整う前に個別の対策を足しても、効きが分かりにくい",
      "習慣は意志ではなく仕組みで続く。小さく始めるほど残る",
      "内側（睡眠・疲れ）は、見た目の印象にそのまま出る",
    ],
    desires: ["jishin", "sonae"],
    extraSlugs: [],
    starter: "otoko-jibunmigaki-hajimekata",
  },
];

/**
 * 「決める前に読む」— 目的ではなく、選ぶ局面のための中立記事（kind: "choose"）。
 * 費用・行くかどうか・やらない選択まで扱うので、Job の下に置かず独立させる。
 */
export const decidePurpose = {
  id: "decide",
  no: "06",
  label: "決める前に、損しないために",
  question: "クリニックやサロンに行く前に、何を確認すればいいのか。",
  answer:
    "費用は月額ではなく総額と内訳で見る。効果の断定を避け、やめるときの条件まで先に聞く。「今はやらない」も正当な選択として残しておくことが、後悔を減らします。",
  points: [
    "月額表示ではなく、回数・総額・解約条件まで揃えて比べる",
    "初回カウンセリングで確認すべきことは、事前に文字にしておく",
    "「行かない・今はやらない」も選択肢として最初から並べておく",
  ],
} as const;
