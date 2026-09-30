import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { openInvites } from "@/lib/responder/queue";
import InviteQueue from "@/components/ask/InviteQueue";
import { isResponderToken } from "@/lib/ask/token";
import { balanceOf, canPayout, PAYOUT_MIN_YEN } from "@/lib/responder/balance";
import { stateOf, REQUIRED_ANSWERS, INVITER_YEN, INVITEE_YEN } from "@/lib/responder/referral";
import { TIERS } from "@/lib/economics";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import AvailableToggle from "@/components/responder/AvailableToggle";
import CopyText from "@/components/responder/CopyText";

// 回答者の自分の画面。
//
// ── ここに3つだけ置く ────────────────────────────
//   今、答えられます（ON / OFF）
//   いくら稼いだか
//   友達を呼ぶ
//
// 予定表も、成績表も、順位も置かない。
// 順位を出すと、良い回答より多い回答をする人が増える。
//
// ── 鍵はURLだけ ──────────────────────────────────
// 会員登録は無い。p... を持っている人が本人。
// 検索には出さない。

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "あなたの画面 — His Recoveries",
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  token: string;
  display_age_band: string;
  tier: string | null;
  available: boolean;
  available_until: string | null;
  verified_age: boolean;
  active: boolean;
  referral_code: string | null;
  takes_sensitive: boolean | null;
};

const yen = (n: number) => `¥${n.toLocaleString()}`;

export default async function MePage({ params }: { params: { token: string } }) {
  if (!isResponderToken(params.token)) notFound();
  if (!dbAdminEnabled) notFound();

  const rows = await dbSelect<Row>(
    `responders?token=eq.${encodeURIComponent(params.token)}&select=*`,
  );
  const r = rows[0];
  if (!r) notFound();

  const [bal, refs, invites] = await Promise.all([
    balanceOf(r.id),
    dbSelect<{ invited: number; completed: number }>(
      `responder_referrals?inviter_id=eq.${r.id}&select=invited,completed`,
    ),
    // 言いにくい相談は、受けると決めた人にだけ出す。
    // 出さないだけでは足りない（URLは直に叩ける）ので、
    // 取るときにも Postgres 側で止めている。
    openInvites({ takesSensitive: Boolean(r.takes_sensitive) }),
  ]);

  const ref = r.referral_code
    ? stateOf({
        referral_code: r.referral_code,
        invited: refs[0]?.invited ?? 0,
        completed: refs[0]?.completed ?? 0,
      })
    : null;

  const tier = TIERS.find((t) => t.id === (r.tier ?? "bronze")) ?? TIERS[0];
  // 紹介リンクの着地先（/join）を畳んだので、いまは出さない。
  // 出すと、配ったリンクが全部 404 になる。
  // 回答者の募集を公開で再開するときに、ここを戻すこと。
  const inviteUrl: string | null = null;

  return (
    <div data-brand className="min-h-screen bg-mist text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[640px] items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" className="text-[15px] font-black">
            {NAME}
          </Link>
          <p className="text-[12px] text-steel">{r.display_age_band}</p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[640px] px-5 pb-20 pt-8">
        {/* 1. 今、答えられます */}
        <AvailableToggle
          token={params.token}
          initial={r.available}
          until={r.available_until}
          verified={r.verified_age}
        />

        {/* 2. いま取れる相談。
            ここが無いと、依頼は作られるのに誰にも届かない
            （運営が1件ずつURLを送るしかなく、そこで詰まる）。
            割り当てではなく「取る」形にしている（ノルマも指名もない約束） */}
        <section className="mt-4">
          <p className="text-[12px] font-bold text-steel">いま答えられる相談</p>
          <div className="mt-2.5">
            <InviteQueue token={params.token} items={invites} />
          </div>
        </section>

        {/* 3. いくら稼いだか */}
        <section className="mt-4 rounded-card border border-line bg-paper p-6 shadow-card">
          <p className="text-[12px] font-bold text-steel">受け取れる残高</p>
          <p className="mt-1.5 text-[40px] font-black tabular-nums leading-none">
            {yen(bal.available)}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-5">
            <div>
              <p className="text-[11.5px] text-steel">今日</p>
              <p className="mt-1 text-[17px] font-black tabular-nums">{yen(bal.todayYen)}</p>
              <p className="text-[11px] text-steel">{bal.todayCount}件</p>
            </div>
            <div>
              <p className="text-[11.5px] text-steel">振込待ち</p>
              <p className="mt-1 text-[17px] font-black tabular-nums">{yen(bal.pending)}</p>
            </div>
            <div>
              <p className="text-[11.5px] text-steel">これまで</p>
              <p className="mt-1 text-[17px] font-black tabular-nums">{yen(bal.lifetime)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-soft bg-mist p-4">
            {canPayout(bal) ? (
              <p className="text-[13px] leading-[1.8] text-slate">
                出金できます。運営からご連絡します。
              </p>
            ) : (
              <p className="text-[13px] leading-[1.8] text-steel">
                {yen(PAYOUT_MIN_YEN)} から出金できます。あと{" "}
                <span className="font-bold text-slate">
                  {yen(Math.max(0, PAYOUT_MIN_YEN - bal.available))}
                </span>
                。
              </p>
            )}
            <p className="mt-2.5 text-[11.5px] leading-[1.75] text-steel">
              報酬は答えた時点で残高に入ります。銀行へのお振り込みは、
              まとめて行います（1件ずつだと送金の手数料のほうが大きくなるためです）。
            </p>
          </div>

          <p className="mt-4 text-[12px] leading-[1.75] text-steel">
            いまの単価は1件 {yen(tier.quickYen)} です（{tier.label}）。
            役に立ったと言われた回答が増えると、単価が上がります。
          </p>
        </section>

        {/* 3. 友達を呼ぶ */}
        {ref && inviteUrl && (
          <section className="mt-4 rounded-card border border-brand bg-paper p-6 shadow-card">
            <p className="text-[17px] font-black">友達を呼ぶ</p>
            <p className="mt-2.5 text-[13.5px] leading-[1.85] text-steel">
              友達が{REQUIRED_ANSWERS}件答えたら、あなたに {yen(INVITER_YEN)}、
              友達にも {yen(INVITEE_YEN)}。登録しただけでは出ません。
            </p>

            <div className="mt-5">
              <p className="text-[11.5px] font-bold text-steel">あなたのコード</p>
              <p className="mt-1.5 text-[28px] font-black tracking-[0.1em] tabular-nums">
                {ref.code}
              </p>
            </div>

            <CopyText
              value={inviteUrl}
              label="リンクをコピー"
              note="このリンクから登録すると、コードが入った状態で始まります。"
            />

            <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-5">
              <div>
                <p className="text-[11.5px] text-steel">呼んだ</p>
                <p className="mt-1 text-[17px] font-black tabular-nums">{ref.invited}</p>
              </div>
              <div>
                <p className="text-[11.5px] text-steel">成立</p>
                <p className="mt-1 text-[17px] font-black tabular-nums">{ref.completed}</p>
              </div>
              <div>
                <p className="text-[11.5px] text-steel">紹介で</p>
                <p className="mt-1 text-[17px] font-black tabular-nums">{yen(ref.earnedYen)}</p>
              </div>
            </div>

            <p className="mt-4 text-[11.5px] leading-[1.75] text-steel">
              あと{ref.left}人まで呼べます。
              答えられる人が増えるほど、相談が早く届くようになります。
            </p>
          </section>
        )}

        <p className="mt-8 text-[12px] leading-[1.85] text-steel">
          このページのリンクは、あなた専用です。人に渡さないでください。
          わからないことは{" "}
          <Link href="/terms" className="font-bold text-brand underline decoration-line underline-offset-4">
            安心・安全
          </Link>{" "}
          に書いています。
        </p>
      </div>
    </div>
  );
}
