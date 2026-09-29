import type { Verdict } from "./model";

// こういう相談が来ます。
//
// ══════════════════════════════════════════════════
// 体験談にしない
// ══════════════════════════════════════════════════
// 見本では「27歳・ITエンジニア」「マッチはするけど、メッセージが噛み合ない…」
// のように、名前と年齢と職業が付いた声として並んでいた。
//
// それは体験談で、体験談は実在の利用者のものでないと書けない。
// 利用者はまだ0人なので、書けば作り話になる。
//
// なので年齢も職業も名前も付けない。
// 出すのは「どういう相談が来るか」という種類だけ。
// 悩みの言葉そのものは、種類の説明として使ってよい。
//
// ── 場面の写真は置かない ──────────────────────────
// 素材は 226×162 の切り抜きで、帯にすると顔が切れて髪だけが写る。
// 上に文面の箱を重ねるので、写真は箱の裏の模様にしかならなかった。
// 見せたいのは、送る文面と返ってくる言葉のほう。
//
// ── 返ってくる言葉の見本 ──────────────────────────
// 「何が返るのか」は、書いて説明するより1つ見せたほうが早い。
// ただし、これは画面の見本であって実際の回答ではない。
// 年代だけを付け、職業は付けない（顔写真の横に職業が並んだ時点で
// 実在の回答者の名簿に見える）。
//
// 全部が「このままでOK」になると、聞く必要が無かったことになる。
// 逆に全部が指摘だと、粗探しの道具に見える。
// どちらもビルド時に止める。

export type CaseSay = {
  /** 年代だけ。職業は付けない */
  age: number;
  verdict: Verdict;
  say: string;
};

export type Case = {
  id: string;
  /** 相談の種類 */
  tag: string;
  /** その場面の見出し */
  scene: string;
  /**
   * そこで迷っている選択。問いの形のまま置く。
   *
   * 「メッセージを見てもらう」ではなく「この文面で送る？」。
   * 売っているのは添削ではなく、選ぶ前に確かめられることなので、
   * 場面の頭には必ず選択を置く。
   */
  decision: string;
  /** そのとき頭にあること */
  worry: string;
  /** 何を見てもらうのか */
  what: string;
  /** 送るものの見本。名前も職業も住んでいる場所も付けない */
  draft: { label: string; text: string };
  /** 返ってくる言葉の見本 */
  says: CaseSay[];
  /**
   * 反応を見たあと、この人が決めたこと。
   *
   * こちらが「こうしてください」と書く欄ではない。
   * 材料を見て本人が決める、という形を、見本の中でも崩さない。
   */
  decided: string;
  /** 相談に進むときのカテゴリ */
  category: string;
  /** いま受け付けているか */
  open: boolean;
};

export const CASES: Case[] = [
  {
    id: "message",
    tag: "メッセージ",
    scene: "LINEを送る前",
    decision: "この文面で送る？",
    worry: "このLINE、送っても大丈夫ですか？",
    what: "デート後のLINEで迷ってしまい、送る前に確認したい。",
    draft: { label: "送ろうとしている文面", text: "明日楽しみにしてる！お店は19時でどう？" },
    says: [
      { age: 25, verdict: "as_is", say: "自然でいいと思います。楽しみにしてる感じが伝わります。" },
      { age: 27, verdict: "slight", say: "少し柔らかい言い方にすると、もっと好印象です。" },
    ],
    decided: "時間の書き方だけ変えて、そのまま送る",
    category: "message",
    open: true,
  },
  {
    id: "photo",
    tag: "自己紹介文",
    scene: "プロフィールを見直したい",
    decision: "この自己紹介文でいい？",
    worry: "自己紹介文に何を書けばいいか分からない",
    what: "マッチしても続かないので、女性の目で自己紹介文を読んでほしい。",
    draft: {
      label: "いまの自己紹介文",
      text: "カフェ巡りや映画が好きです。一緒に楽しめる方と、素敵な時間を過ごしたいです。",
    },
    says: [
      { age: 24, verdict: "as_is", say: "誠実そうで安心感があります。" },
      { age: 29, verdict: "slight", say: "1文目を短くすると、もっと読みやすいです。" },
    ],
    decided: "1文目を短くして、残りはそのまま残す",
    category: "photo",
    open: true,
  },
  {
    id: "date",
    tag: "デート",
    scene: "誘う前に確かめたい",
    decision: "そろそろ誘う？",
    worry: "この誘い方で、重く思われませんか？",
    what: "次に誘うときの言い方と店選びを、女性の目で見てほしい。",
    draft: { label: "送ろうとしている誘い方", text: "今度の土曜、前に話してたお店に行きませんか？" },
    says: [
      { age: 26, verdict: "as_is", say: "具体的でいいと思います。予定が立てやすいです。" },
      { age: 28, verdict: "change", say: "お店だけだと少し重いかも。時間も書いてあると気楽です。" },
    ],
    decided: "時間も足して、今週のうちに誘う",
    category: "date",
    open: true,
  },
  {
    id: "signal",
    tag: "デートの後",
    scene: "デートのあと、今日送るか",
    decision: "今日送る？ 明日にする？",
    worry: "楽しかったけど、温度感が読めません",
    what: "デートのあとのLINEを、今日出すか明日にするかで迷っている。",
    draft: {
      label: "送ろうとしている文面",
      text: "今日はありがとう！楽しかったです。また行きましょう。",
    },
    says: [
      { age: 28, verdict: "as_is", say: "これで十分です。すぐ来ると、楽しかったんだなと伝わります。" },
      { age: 25, verdict: "slight", say: "「また」だけだと社交辞令に見えます。店の名前が入ると本気度が違います。" },
    ],
    decided: "店の名前を足して、その日のうちに送る",
    category: "signal",
    open: true,
  },
  {
    id: "romance",
    tag: "関係を進める",
    scene: "切り出す前",
    decision: "いま言う？ まだ待つ？",
    worry: "このタイミングで言っていいのか分かりません",
    what: "関係を進めたいので、切り出し方とタイミングを見てほしい。",
    draft: {
      label: "言おうとしている言葉",
      text: "ちゃんと付き合う前提で、会いたいと思っています。",
    },
    says: [
      { age: 29, verdict: "slight", say: "言うのはいいと思います。ただ電話より、会ったときのほうが受け取りやすいです。" },
      { age: 26, verdict: "change", say: "いきなり前提の話だと構えます。まず今どう思っているかを聞かれたいです。" },
    ],
    decided: "言葉を短くして、次に会ったときに切り出す",
    category: "romance",
    open: true,
  },
  {
    id: "call",
    tag: "会話・デート",
    scene: "話す前に練習したい",
    decision: "電話する？",
    worry: "電話や初デートで何を話せばいいか不安です",
    what: "実際の会話の流れで練習して、直すところを知りたい。",
    draft: { label: "受付前", text: "順番待ちに入れます。" },
    says: [],
    decided: "受け付けを始めたら知らせてもらう",
    category: "message",
    open: false,
  },
];

/** 画面に出す相談の種類。受付前のものは混ぜない */
export const OPEN_CASES = CASES.filter((c) => c.open);

/* ── 公開の前に止めること ───────────────────────── */
{
  // 年齢・職業・名前を付けない。付いた時点で体験談になる。
  const PERSON = /\d+歳|エンジニア|営業|コンサル|公務員|経営企画|メーカー|看護師|美容系|事務職|大学生|会社員|さん」|さんの声/;
  for (const c of CASES) {
    for (const t of [c.tag, c.scene, c.decision, c.worry, c.what, c.draft.label, c.draft.text, c.decided]) {
      if (PERSON.test(t)) {
        throw new Error(
          `「${c.id}」に年齢や職業が入っています。利用者はまだ0人なので、体験談は書けません`,
        );
      }
    }
    // 回答の見本にも、職業は付けない（年代は says.age で別に持つ）
    for (const s of c.says) {
      if (PERSON.test(s.say)) {
        throw new Error(`「${c.id}」の回答の見本に、年齢か職業が入っています`);
      }
      if (/\d+\s*%|成功率|確率/.test(s.say)) {
        throw new Error(`「${c.id}」の回答の見本に、根拠のない数字が入っています`);
      }
    }
  }
  if (OPEN_CASES.length < 2) throw new Error("受け付けている相談の種類がありません");

  // 場面の頭は、必ず選択にする。
  // 「メッセージを見てもらう」だと、添削屋の品書きになる。
  for (const c of CASES) {
    if (!c.decision.endsWith("？")) {
      throw new Error(`「${c.id}」の分岐点が問いになっていません（${c.decision}）`);
    }
    if (!c.decided) throw new Error(`「${c.id}」に、決めたことが書かれていません`);
    // 決めるのは本人。こちらが指図する書き方にしない。
    if (/してください|すべき|必ず|正解は/.test(c.decided)) {
      throw new Error(`「${c.id}」の決めたことが、こちらの指図になっています（${c.decided}）`);
    }
    // 文字で答えられない問いを出さない。画像を受け取る口はまだ無い。
    if (c.open && /写真|画像|服|髪|スクショ/.test(c.decision)) {
      throw new Error(`「${c.id}」の分岐点は、文字だけでは答えられません（${c.decision}）`);
    }
  }

  // 恋愛の1か所だけを扱うサービスに見えないこと。
  // 文面だけなら添削屋で、それは「選ぶ前に確かめる」ではない。
  const scenes = new Set(OPEN_CASES.map((c) => c.category));
  if (scenes.size < 4) {
    throw new Error(
      `扱っている場面が${scenes.size}種類しかありません。恋愛の一部だけを扱うサービスに見えます`,
    );
  }

  // 1つの場面が「全部このままでOK」になると、聞く必要が無かったことになる。
  for (const c of OPEN_CASES) {
    if (c.says.length < 2) throw new Error(`「${c.id}」の回答の見本が足りません`);
    if (c.says.every((s) => s.verdict === "as_is")) {
      throw new Error(`「${c.id}」の回答が全部「このままでOK」です。払う理由が消えます`);
    }
  }
  // 逆に、どこにも「このままでOK」が無いと、粗探しの道具に見える。
  if (!OPEN_CASES.some((c) => c.says.some((s) => s.verdict === "as_is"))) {
    throw new Error("どの場面にも「このままでOK」がありません。粗探しの道具に見えます");
  }
}
