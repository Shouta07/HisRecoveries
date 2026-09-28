import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { isReplyToken } from "@/lib/ask/token";
import { category, RELATIONS, SECOND_ASK, type CategoryId } from "@/lib/ask/model";
import RespondForm from "@/components/ask/RespondForm";

// 回答する画面。
//
// ── 1〜2分で終わること ────────────────────────────
// 出すのは、判断に要るものだけ。
// サービスの説明も、他の相談への導線も、ここには置かない。
//
// ── 他の人の回答は見せない ────────────────────────
// 先に出た意見が見えると、そちらに寄る。
// 5人に聞いた意味が無くなるので、出し終わるまで見えない。
//
// ── アプリを入れさせない ──────────────────────────
// リンクを開いたら、そこが回答画面。ログインも登録もない。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "回答する — His Recoveries",
  robots: { index: false, follow: false },
};

type Invite = {
  id: string;
  answered_at: string | null;
  consultations: {
    id: string;
    category: string;
    body: string;
    option_a: string | null;
    option_b: string | null;
    is_ab: boolean;
    asker_age_band: string | null;
    other_age_band: string | null;
    relation: string | null;
    status: string;
  } | null;
};

export default async function RespondPage({ params }: { params: { token: string } }) {
  if (!isReplyToken(params.token)) notFound();

  if (!dbAdminEnabled) {
    return (
      <Shell>
        <h1 className="font-display text-[22px] font-bold text-charcoal">
          いま、この環境では回答できません。
        </h1>
        <p className="mt-4 text-[15px] leading-[2] text-bodytext">
          データベースに接続されていないため、相談を読み出せません。
          接続設定が入ると、この画面に相談が表示されます。
        </p>
      </Shell>
    );
  }

  const rows = await dbSelect<Invite>(
    `response_invites?token=eq.${encodeURIComponent(params.token)}&select=id,answered_at,consultations(id,category,body,option_a,option_b,is_ab,asker_age_band,other_age_band,relation,status)`,
  );
  const invite = rows[0];
  const c = invite?.consultations;
  if (!invite || !c) notFound();

  if (invite.answered_at) {
    return (
      <Shell>
        <h1 className="font-display text-[22px] font-bold text-charcoal">
          この相談には、もう回答いただいています。
        </h1>
        <p className="mt-4 text-[15px] leading-[2] text-bodytext">
          ありがとうございました。新しい相談が来たら、またお知らせします。
        </p>
      </Shell>
    );
  }

  if (c.status === "completed" || c.status === "cancelled") {
    return (
      <Shell>
        <h1 className="font-display text-[22px] font-bold text-charcoal">
          この相談は締め切られました。
        </h1>
        <p className="mt-4 text-[15px] leading-[2] text-bodytext">
          先に必要な人数の回答が集まりました。お手間をかけてすみません。
        </p>
      </Shell>
    );
  }

  const rel = RELATIONS.find((r) => r.id === c.relation)?.label;

  return (
    <Shell>
      <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">
        {category(c.category as never).label}
      </p>

      {/* 判断に要る状況。ここに無いものは、相談者も出していない */}
      <dl className="mt-5 divide-y divide-hairline border-y border-hairline text-[14px]">
        {[
          ["相談した人", c.asker_age_band ? `${c.asker_age_band}歳の男性` : "年代は未回答"],
          ["相手", c.other_age_band ? `${c.other_age_band}歳` : "年代は未回答"],
          ["関係", rel ?? "未回答"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-faint">{k}</dt>
            <dd className="text-charcoal">{v}</dd>
          </div>
        ))}
      </dl>

      {/* 相談そのもの */}
      <div className="mt-7">
        {c.is_ab ? (
          <div className="flex flex-col gap-4">
            {([["A", c.option_a], ["B", c.option_b]] as const).map(([l, v]) => (
              <div key={l} className="border-l border-accent pl-4">
                <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">{l}</p>
                <p className="mt-1.5 whitespace-pre-wrap text-[15.5px] leading-[2] text-charcoal">
                  {v}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-wrap border-l border-accent pl-4 text-[15.5px] leading-[2] text-charcoal">
            {c.body}
          </p>
        )}
      </div>

      <RespondForm
        token={params.token}
        isAb={c.is_ab}
        secondAsk={SECOND_ASK[c.category as CategoryId]}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ground">
      <div className="mx-auto w-full max-w-[520px] px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        {children}
      </div>
    </div>
  );
}
