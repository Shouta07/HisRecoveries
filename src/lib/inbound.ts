import { PRICE_YEN, WINDOW_BEFORE_DAYS, MAX_TRIP_DAYS, REPLY_HOURS, MEET_MINUTES } from "./service";

/* ══════════════════════════════════════════════════
   日本へ来る人向けの言葉（英語・簡体字）
   ══════════════════════════════════════════════════

   ── 翻訳ではない ────────────────────────────────
   日本語の面は「海外へ行く日本人」向け。
   こちらは「日本へ来る人」向け。

   顧客も、旅行先も、相談の中身も違う。
   だから訳すのではなく、別に書く。

   ── 言語ができるとは、書かない ──────────────────
   英語と中国語の面があることと、
   運営者がその言語で相談を受けられることは、別の話。

   実際に対応できる言語も、翻訳の道具を使うかも、未確認。
   確認できるまで、これらの面では
   「買える」導線を置かない。問い合わせまでにする。

   下の judge が、buyable を false で固定している。
   対応言語が決まったら、そこを開く。

   ── 約束しない言い方 ────────────────────────────
   24/7、instant、always available は使わない。
   友だちになる、現地で会う、ずっと付き添う、も使わない。
   判定で止める。 */

export type Lang = "en" | "zh";

/** いまは、どの言語でも買える導線を出さない */
export const BUYABLE: Record<Lang, boolean> = { en: false, zh: false };

export type InboundCopy = {
  lang: Lang;
  htmlLang: string;
  title: string;
  description: string;
  /** 対象が日本語版と違うことを、冒頭で言う */
  audience: string;
  heroA: string;
  heroB: string;
  lead: string;
  priceLine: string;
  unlimited: string;
  /** 出発前のオンライン相談。回数と分数を必ず含める */
  meet: string;
  /** 値段のすぐ下に置く、中身の1行 */
  priceWhat: string;
  window: string;
  reply: string;
  /** LINEで最初に送ってもらう4つ */
  askItemsTitle: string;
  askItems: string[];
  askTitle: string;
  asks: string[];
  imageNote: string;
  whoTitle: string;
  who: string;
  langNote: string;
  notIncludedTitle: string;
  notIncluded: string[];
  stepsTitle: string;
  steps: [string, string][];
  faqTitle: string;
  faq: { q: string; a: string }[];
  cta: string;
  freeCheck: string;
  paidStart: string;
  lineNeeded: string;
  closing: string;
};

export const EN: InboundCopy = {
  lang: "en",
  htmlLang: "en",
  title: "Travel solo in Japan — someone to ask | Tabi no Tashikame",
  description:
    "Ask someone who lives in Japan about everyday travel questions, before you arrive and while you are here. JPY 3,980 per trip, tax included. Message replies within about 24 hours. Not an emergency service.",
  audience: "This page is for people travelling to Japan. If you live in Japan and are travelling abroad, see the Japanese page.",
  heroA: "Travel solo in Japan.",
  heroB: "Have someone to ask.",
  lead: `We talk once on video before you arrive, ${MEET_MINUTES} minutes, and go through your plan together. While you are here, you keep asking the same person by message on LINE.`,
  priceLine: `JPY ${PRICE_YEN.toLocaleString()} per trip, tax included`,
  priceWhat: `One ${MEET_MINUTES}-minute video call before you arrive, plus unlimited LINE messages during your trip`,
  unlimited: "No limit on how many LINE messages you send during your trip window",
  meet: `One video call on Google Meet before you arrive, ${MEET_MINUTES} minutes. We agree a time over LINE first`,
  window: `From ${WINDOW_BEFORE_DAYS} days before you arrive until the day you leave (trips of up to ${MAX_TRIP_DAYS} days)`,
  reply: `Replies within about ${REPLY_HOURS} hours, usually in the evening, Japan time`,
  askItemsTitle: "Send us these four things on LINE",
  askItems: [
    "Where you are going (country and city)",
    "Your arrival and departure dates",
    "Whether this is your first time travelling alone",
    "The one thing you are most unsure about",
  ],
  askTitle: "What you can ask",
  asks: [
    "What a sign, notice or announcement in Japanese means",
    "How to use a train or bus line you are not sure about",
    "Basic etiquette at a restaurant, an onsen or a shrine",
    "Whether your plan for the day is realistic",
    "How to change tomorrow's plan now that you are tired",
    "What to do on your own for an evening",
  ],
  imageNote:
    "You can send a photo of a short sign or notice. Long documents, contracts and phone interpreting are not included. Please cover any booking numbers or personal details before you send a photo. That part is up to you.",
  whoTitle: "Who answers",
  who: "One person, living in Japan. Not a licensed guide, not a travel agency, not an interpreter. Someone who can tell you what everyday travel here is actually like.",
  langNote:
    "We are still confirming which languages we can answer in. Until that is settled, you cannot buy from this page — please message us first and we will tell you whether we can help.",
  notIncludedTitle: "What is not included",
  notIncluded: [
    "Emergencies, or anyone coming to where you are",
    "Replies on demand — we answer within about 24 hours, not straight away",
    "Booking, reservations or acting on your behalf",
    "Interpreting by phone, or translating long documents",
  ],
  stepsTitle: "How it works",
  steps: [
    ["Add us on LINE and send four things", "Where you are going, your dates, whether this is your first solo trip, and the one thing you are most unsure about. This part is free."],
    ["We check whether we can help", "We will also confirm which language we can answer in. If we cannot help, we will say so."],
    ["We tell you what is covered", "What we can answer, your trip window, how fast replies come, and the price."],
    ["You pay", `JPY ${PRICE_YEN.toLocaleString()} per trip, by card. One payment, no renewal. We send the link over LINE.`],
    ["We agree a time for the call", "Over LINE. We send the Google Meet link once the time is set."],
    [`We talk for ${MEET_MINUTES} minutes before you arrive`, "We go through your plan and stop wherever you are unsure."],
    ["You keep asking over LINE", "From before you arrive until the day you leave, in the same chat."],
  ],
  faqTitle: "Questions",
  faq: [
    {
      q: "Who is this for?",
      a: "People travelling to Japan for the first time, or travelling alone for the first time, who have already decided to come.",
    },
    {
      q: "Which places can I ask about?",
      a: "We cannot claim to know all of Japan. Tell us your cities and what you want to ask, and we will say whether we can help before you pay.",
    },
    {
      q: "How many times can I message?",
      a: `There is no limit during your trip window. Replies come within about ${REPLY_HOURS} hours, so this is not for anything urgent.`,
    },
    {
      q: "When can I use it?",
      a: `From ${WINDOW_BEFORE_DAYS} days before you arrive until the day you leave, for trips of up to ${MAX_TRIP_DAYS} days.`,
    },
    {
      q: "Can you help in an emergency?",
      a: "No. For an emergency in Japan, call 110 for police or 119 for fire and ambulance, and contact your insurer and your embassy.",
    },
    {
      q: "Can we talk on the phone?",
      a: "No. Text messages only. Calls and video are not included.",
    },
    {
      q: "Which language will you reply in?",
      a: "We are still confirming this. Please message us first — that is why there is no payment link on this page yet.",
    },
    {
      q: "Do I need LINE?",
      a: "Yes, for now. LINE is the messaging app used in Japan. If you would rather not install it, email us instead and we will tell you what is possible.",
    },
  ],
  cta: "Check if we can help",
  freeCheck: "Checking whether we can help is free",
  paidStart: "Consultations begin after payment",
  lineNeeded: "You will need LINE, a messaging app widely used in Japan.",
  closing: "Tell us where you are going and what you want to ask.",
};

export const ZH: InboundCopy = {
  lang: "zh",
  htmlLang: "zh-Hans",
  title: "一个人来日本，也有可以问的人 | 旅のタシカメ",
  description:
    "出发前和旅行中，都可以向住在日本的人咨询旅行中的小问题。每次旅行 3,980 日元（含税）。约 24 小时内回复。不提供紧急救援。",
  audience: "本页面面向来日本旅行的人。如果您住在日本并要去海外旅行，请看日语页面。",
  heroA: "一个人来日本，",
  heroB: "也有可以问的人。",
  lead: `抵达前先通过视频通话聊 ${MEET_MINUTES} 分钟，一起过一遍您的行程。旅行期间，可以继续用 LINE 向同一个人咨询。`,
  priceLine: `每次旅行 ${PRICE_YEN.toLocaleString()} 日元（含税）`,
  priceWhat: `抵达前 ${MEET_MINUTES} 分钟在线通话，加上旅行期间不限次数的 LINE 咨询`,
  unlimited: "在对应期间内，LINE 文字咨询的次数不限",
  meet: `抵达前使用 Google Meet 通话 1 次，${MEET_MINUTES} 分钟。时间先通过 LINE 商定`,
  window: `从抵达前 ${WINDOW_BEFORE_DAYS} 天到离开当天（旅行最长 ${MAX_TRIP_DAYS} 天）`,
  reply: `约 ${REPLY_HOURS} 小时内回复，主要在日本时间的晚上`,
  askItemsTitle: "请在 LINE 上发送以下四项",
  askItems: [
    "目的地（国家和城市）",
    "抵达日期和离开日期",
    "是否是第一次独自旅行",
    "目前最不确定的一件事",
  ],
  askTitle: "可以咨询的内容",
  asks: [
    "想知道日文的标识、告示或广播是什么意思",
    "想确认电车或公交的乘坐方法",
    "想了解餐厅、温泉、神社的基本礼仪",
    "想确认自己安排的行程是否合理",
    "累了，想重新安排明天的行程",
    "想商量一个人吃饭或打发时间的方式",
  ],
  imageNote:
    "可以发送简短标识或告示的照片。不包含长篇文件、专业文书的翻译和电话口译。照片中如有预订号码或个人信息，请先遮盖后再发送。这项处理需要您自己完成。",
  whoTitle: "回复的人",
  who: "一个住在日本的人。不是持证导游，不是旅行社，也不是口译人员。可以告诉您在日本旅行实际是什么样子。",
  langNote:
    "我们还在确认可以用哪些语言回复。在确定之前，本页面不提供付款入口。请先与我们联系，我们会告知能否提供帮助。",
  notIncludedTitle: "不包含的内容",
  notIncluded: [
    "紧急救援，或前往您所在的地点",
    "马上就能得到回复（我们约 24 小时内回复）",
    "代为预订或代办手续",
    "电话口译、长篇文件翻译",
  ],
  stepsTitle: "使用流程",
  steps: [
    ["添加 LINE，发送四项内容", "目的地、日期、是否第一次独自旅行、目前最不确定的一件事。这一步是免费的。"],
    ["我们确认能否提供帮助", "同时确认可以用哪种语言回复。如果无法提供帮助，我们会直接告知。"],
    ["我们告知服务范围", "可以回答的内容、对应期间、回复速度和价格。"],
    ["付款", `每次旅行 ${PRICE_YEN.toLocaleString()} 日元，使用信用卡。一次性付款，不自动续费。付款链接通过 LINE 发送。`],
    ["商定通话时间", "通过 LINE 商定。时间确定后，我们会发送 Google Meet 的链接。"],
    [`抵达前通话 ${MEET_MINUTES} 分钟`, "一起看一遍您的行程，在不确定的地方停下来确认。"],
    ["旅行期间继续用 LINE 咨询", "从抵达前到离开当天，在同一个对话中。"],
  ],
  faqTitle: "常见问题",
  faq: [
    {
      q: "适合什么样的人？",
      a: "第一次来日本，或第一次一个人旅行，并且已经决定要来的人。",
    },
    {
      q: "可以咨询哪些地方？",
      a: "我们不能说对日本全国都了解。请告知城市和想咨询的内容，我们会在付款前告知能否提供帮助。",
    },
    {
      q: "可以咨询多少次？",
      a: `在对应期间内次数不限。回复约需 ${REPLY_HOURS} 小时，因此不适合紧急的事情。`,
    },
    {
      q: "什么时候可以使用？",
      a: `从抵达前 ${WINDOW_BEFORE_DAYS} 天到离开当天，旅行最长 ${MAX_TRIP_DAYS} 天。`,
    },
    {
      q: "紧急情况也能帮忙吗？",
      a: "不能。在日本遇到紧急情况，请拨打 110（警察）或 119（火警・救护车），并联系保险公司和本国使领馆。",
    },
    {
      q: "可以通话吗？",
      a: "不可以。仅限文字消息。不包含通话和视频。",
    },
    {
      q: "会用什么语言回复？",
      a: "我们还在确认。请先与我们联系——这也是本页面目前没有付款入口的原因。",
    },
    {
      q: "必须使用 LINE 吗？",
      a: "目前是的。LINE 是在日本广泛使用的消息应用。如果不方便安装，请发邮件给我们，我们会告知可行的方式。",
    },
  ],
  cta: "先确认能否提供帮助",
  freeCheck: "确认能否提供帮助是免费的",
  paidStart: "咨询在付款后开始",
  lineNeeded: "需要使用 LINE（在日本广泛使用的消息应用）。",
  closing: "请告诉我们您要去哪里，想咨询什么。",
};

export const INBOUND: Record<Lang, InboundCopy> = { en: EN, zh: ZH };

/* ── 公開の前に止めること ───────────────────────── */
{
  for (const c of [EN, ZH]) {
    const all = [
      c.title, c.description, c.audience, c.heroA, c.heroB, c.lead,
      c.priceLine, c.priceWhat, c.unlimited, c.meet, c.window, c.reply, c.who, c.langNote,
      c.imageNote, c.cta, c.freeCheck, c.paidStart, c.lineNeeded, c.closing,
      c.askItemsTitle,
      ...c.asks, ...c.askItems, ...c.notIncluded,
      ...c.steps.flat(), ...c.faq.flatMap((f) => [f.q, f.a]),
    ].join(" ");

    /* ── 日本語が混ざっていないこと ────────────────
       かな が出たら、訳し残し。
       中国語は漢字を使うので、かな だけを見る。 */
    if (/[ぁ-んァ-ヶ]/.test(all.replace("旅のタシカメ", ""))) {
      const hit = all.replace("旅のタシカメ", "").match(/[ぁ-んァ-ヶ]+/);
      throw new Error(`${c.lang} の面に、日本語が残っています（${hit?.[0]}）`);
    }

    /* ── 簡体字に、繁体字を混ぜない ──────────────── */
    if (c.lang === "zh") {
      for (const w of ["關", "說", "請注意", "東京", "預約", "確認能否提供幫助", "問"]) {
        if (all.includes(w)) {
          throw new Error(`簡体字の面に、繁体字「${w}」が混ざっています`);
        }
      }
    }

    /* ── 約束しない言い方 ──────────────────────────
       24/7 も instant も、返信の条件と食い違う。

       ── 否定の文でも止まる ──────────────────────
       「含まないもの」に Instant replies と書いたら、
       ここが拾った。機械は否定か肯定かを見分けられない。

       画面に出る文字列として存在する以上、拾うのが正しい。
       拾われたら、言い方のほうを変える
       （「すぐに返ること」ではなく「約24時間以内に返る」と書く）。 */
    for (const w of ["24/7", "instant", "immediately", "anytime", "always available",
                     "随时", "立即", "24小时随时"]) {
      if (all.toLowerCase().includes(w.toLowerCase())) {
        throw new Error(`${c.lang} の面に「${w}」が入っています。返すのは約${REPLY_HOURS}時間以内です`);
      }
    }

    /* ── 友だち・同行だと読ませない ────────────────
       一人旅のサービスが、必ず流れていく先。 */
    for (const w of ["friend", "meet up", "meet you", "accompany", "together with you",
                     "交朋友", "见面", "陪同", "一起玩"]) {
      if (all.toLowerCase().includes(w.toLowerCase())) {
        throw new Error(`${c.lang} の面に「${w}」が入っています。会う・付き添うサービスではありません`);
      }
    }

    /* ── 語学力を名乗らないこと ────────────────────
       面があることと、その言語で受けられることは別。 */
    for (const w of ["fluent", "native speaker", "bilingual", "流利", "母语", "精通"]) {
      if (all.toLowerCase().includes(w.toLowerCase())) {
        throw new Error(`${c.lang} の面に「${w}」が入っています。対応言語は未確認です`);
      }
    }

    /* ── 作り話の実績を置かないこと ──────────────── */
    for (const w of ["customers", "reviews", "rated", "satisfaction", "trusted by",
                     "好评", "用户数", "满意度"]) {
      if (all.toLowerCase().includes(w.toLowerCase())) {
        throw new Error(`${c.lang} の面に「${w}」が入っています。実績は作りません`);
      }
    }

    /* ── 値段の通貨を、取り違えさせないこと ────────
       中国語で「元」とだけ書くと、人民元に読まれる。 */
    if (!/JPY|日元/.test(c.priceLine)) {
      throw new Error(`${c.lang} の値段に、通貨が書かれていません（${c.priceLine}）`);
    }
    if (c.lang === "zh" && !c.priceLine.includes("日元")) {
      throw new Error("中国語の値段が「日元」になっていません（人民元に読まれます）");
    }
    for (const w of ["USD", "$", "人民币", "￥", "RMB", "EUR"]) {
      if (c.priceLine.includes(w)) {
        throw new Error(`${c.lang} の値段に「${w}」が入っています。換算は固定で出しません`);
      }
    }

    /* ── 「回数無制限」のそばに、期間と返信があること ── */
    if (!c.window || !c.reply) {
      throw new Error(`${c.lang} に、期間か返信の条件がありません`);
    }
    if (!/Japan time|日本时间/.test(c.reply)) {
      throw new Error(`${c.lang} の返信の条件に、日本時間だと書かれていません`);
    }

    /* ── 緊急を含まないことが、FAQにあること ──────── */
    if (!c.faq.some((f) => /emergenc|紧急/i.test(f.q + f.a))) {
      throw new Error(`${c.lang} のFAQに、緊急時のことがありません`);
    }
    /* 緊急の答えに、かけ先が書いてあること。
       「できません」で終わらせない。

       ── はじめに当たったものを見ない ──────────────
       最初は find で1つ目を取っていた。中国語では
       「可以咨询多少次？」の答えにも「紧急」が出るので、
       そちらを拾って落ちた。

       緊急を扱うFAQは複数あってよい。
       見たいのは「どれか1つに、かけ先が書いてあるか」。 */
    const emergencies = c.faq.filter((f) => /emergenc|紧急/i.test(f.q + f.a));
    if (emergencies.length === 0) {
      throw new Error(`${c.lang} のFAQに、緊急時のことがありません`);
    }
    if (!emergencies.some((f) => /110|119/.test(f.a))) {
      throw new Error(`${c.lang} の緊急時の答えに、連絡先（110・119）が書かれていません`);
    }

    /* ── 対応言語が決まるまで、買えないこと ────────
       面があるだけで、その言語で受けられる約束にしない。 */
    if (BUYABLE[c.lang]) {
      throw new Error(
        `${c.lang} が買える形になっています。対応言語が未確認のあいだは、問い合わせまでにしてください`,
      );
    }
    if (!/confirm|确认/i.test(c.langNote)) {
      throw new Error(`${c.lang} に、対応言語を確認中だという断りがありません`);
    }

    /* ══════════════════════════════════════════════
       通話を、放題に見せないこと
       ══════════════════════════════════════════════
       商品に通話が入った。日本語の面と同じ罠がここにもある。

       「オンライン相談つき・相談し放題」と並ぶと、
       旅先から掛け放題だと読まれる。

       通話は抵達前の1回30分。
       回数と分数を、通話の行に必ず書く。 */
    if (!/Google Meet/.test(c.meet)) {
      throw new Error(`${c.lang} の通話の行に、何で話すのかが書かれていません（${c.meet}）`);
    }
    if (!c.meet.includes(String(MEET_MINUTES))) {
      throw new Error(`${c.lang} の通話の行に、分数（${MEET_MINUTES}）が入っていません`);
    }
    if (!/\b1\b|1 次|once|One /i.test(c.meet)) {
      throw new Error(`${c.lang} の通話の行に、回数が入っていません（${c.meet}）`);
    }
    /* 時間を先に決めることを、書いてあること。
       書かないと、思い立ったときに掛けられると思われる。 */
    if (!/agree a time|商定|arrange/i.test(c.meet)) {
      throw new Error(`${c.lang} の通話の行に、日時を先に決めることが書かれていません`);
    }
    /* 値段のすぐ下の1行に、通話と LINE の両方があること。 */
    if (!c.priceWhat.includes(String(MEET_MINUTES)) || !/LINE/.test(c.priceWhat)) {
      throw new Error(`${c.lang} の値段の下の行に、通話とLINEの両方がありません（${c.priceWhat}）`);
    }
    /* 掛け放題に読める言い方を、使わないこと。 */
    for (const w of [
      "unlimited calls", "call anytime", "video call anytime",
      "通话不限", "随时通话", "不限次数通话",
    ]) {
      if (all.toLowerCase().includes(w.toLowerCase())) {
        throw new Error(`${c.lang} に「${w}」が出ています。通話は抵達前の1回だけです`);
      }
    }

    /* ══════════════════════════════════════════════
       LINE を足して終わり、にしないこと
       ══════════════════════════════════════════════
       追加したあと何を書けばいいか分からないと、そこで止まる。
       送ってもらう4つを、面に出しておく。 */
    if (c.askItems.length !== 4) {
      throw new Error(`${c.lang} の「最初に送ってもらうもの」が ${c.askItems.length} 個です（4つ）`);
    }
    if (!/LINE/.test(c.askItemsTitle)) {
      throw new Error(`${c.lang} の4つの見出しに、LINEで送ることが書かれていません`);
    }

    /* ── LINE が要ることを、隠さないこと ──────────── */
    if (!/LINE/.test(c.lineNeeded)) {
      throw new Error(`${c.lang} に、LINEが要ることが書かれていません`);
    }
    if (/no app|without an app|不需要安装|无需下载/i.test(all)) {
      throw new Error(`${c.lang} に「アプリ不要」と書かれています。LINEが要ります`);
    }

    /* ── 画像の匿名化を、約束しないこと ──────────── */
    if (!/cover|遮盖/i.test(c.imageNote)) {
      throw new Error(`${c.lang} の画像の案内に、自分で隠してもらう案内がありません`);
    }
    /* 自動で伏せる機能は無い。
       「自動では伏せません」と書こうとしても、ここが拾う。
       機械は否定か肯定かを見分けられないので、
       そもそもその語を使わず「ご自身で」と書く。 */
    if (/automatically remove|automatically hide|自动去除|自动隐藏|自动处理/i.test(all)) {
      throw new Error(`${c.lang} に「自動で伏せる」が出ています。その機能はないので、語ごと使わないでください`);
    }
  }

  if (EN.htmlLang !== "en") throw new Error("英語の lang 属性が en ではありません");
  if (ZH.htmlLang !== "zh-Hans") throw new Error("中国語の lang 属性が zh-Hans ではありません");
}
