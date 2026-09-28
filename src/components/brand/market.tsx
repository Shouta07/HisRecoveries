import Link from "next/link";
import type { ReactNode } from "react";
import { category, attrLabel, type CategoryId } from "@/lib/ask/model";

// マーケットプレイスの部品。
//
// ── 回答者を主役にする ────────────────────────────
// このサービスで流通しているのは、答えではなく「人の視点」。
// だから回答結果だけでなく、答える人そのものをカードにする。
//
// ── 商品にしない ──────────────────────────────────
// 「視点の提供者」として見せる。値札は人には付けない。
// 価格が付くのは相談のほう（何人に聞くか）で、人ではない。
//
// ── 無い実績を作らない ────────────────────────────
// 回答数も helpful率も、実際に貯まるまでは出さない。
// 「128 ANSWERS / HELPFUL 94%」を実績のように置くと、
// 二面市場の信用そのものを偽ることになる。
// 0件のときは 0件と出すか、その欄ごと出さない。

/* ── 回答者カード ──────────────────────────── */

export type Human = {
  id?: string;
  age: string;
  gender?: string;
  area?: string | null;
  attrs?: string[];
  specialties?: string[];
  /** 回答した数。0 のときは「まだ回答なし」と出す */
  answered?: number;
  /** 役に立ったと言われた割合。評価が付くまでは undefined */
  helpfulRate?: number;
  /** 依頼から回答までの中央値（分） */
  replyMinutes?: number | null;
  verifiedAge?: boolean;
  verifiedProfile?: boolean;
  /** 直近の一言。無いこともある */
  latest?: string;
};

export function HumanCard({
  h,
  tone = "light",
  tilt = 0,
  float,
  href,
  className = "",
}: {
  h: Human;
  tone?: "light" | "dark";
  tilt?: number;
  float?: "slow" | "normal";
  href?: string;
  className?: string;
}) {
  const dark = tone === "dark";
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="text-[34px] font-black leading-[0.85] tracking-[-0.04em] tabular-nums">
          {h.age}
          {h.gender && (
            <span className="ml-2 text-[0.38em] font-bold uppercase tracking-[0.14em] align-middle">
              {h.gender}
            </span>
          )}
        </span>
        {(h.verifiedAge || h.verifiedProfile) && (
          <span
            className={`px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] ${
              dark ? "bg-lime text-void" : "bg-void text-bone"
            }`}
          >
            Verified
          </span>
        )}
      </div>

      {(h.area || (h.attrs && h.attrs.length > 0)) && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {[h.area, ...(h.attrs ?? []).map(attrLabel)].filter(Boolean).map((t) => (
            <li
              key={String(t)}
              className={`px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] ${
                dark ? "border border-rule-dark text-ash-soft" : "border border-rule text-ash"
              }`}
            >
              {t}
            </li>
          ))}
        </ul>
      )}

      {h.specialties && h.specialties.length > 0 && (
        <p className={`mt-3 text-[10.5px] font-bold uppercase tracking-[0.12em] ${dark ? "text-lime" : "text-void"}`}>
          {h.specialties
            .map((s) => {
              try {
                return category(s as CategoryId).label;
              } catch {
                return s;
              }
            })
            .slice(0, 3)
            .join(" / ")}
        </p>
      )}

      {/* 実績。貯まっていないものは出さない */}
      <dl
        className={`mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t pt-3.5 ${
          dark ? "border-rule-dark" : "border-rule"
        }`}
      >
        <div>
          <dt className={`text-[9.5px] font-bold uppercase tracking-[0.14em] ${dark ? "text-ash-soft" : "text-ash"}`}>
            Answers
          </dt>
          <dd className="text-[19px] font-black tabular-nums leading-tight">{h.answered ?? 0}</dd>
        </div>
        {typeof h.helpfulRate === "number" && (
          <div>
            <dt className={`text-[9.5px] font-bold uppercase tracking-[0.14em] ${dark ? "text-ash-soft" : "text-ash"}`}>
              Helpful
            </dt>
            <dd className="text-[19px] font-black tabular-nums leading-tight">{h.helpfulRate}%</dd>
          </div>
        )}
        {typeof h.replyMinutes === "number" && (
          <div>
            <dt className={`text-[9.5px] font-bold uppercase tracking-[0.14em] ${dark ? "text-ash-soft" : "text-ash"}`}>
              Reply
            </dt>
            <dd className="text-[19px] font-black tabular-nums leading-tight">{h.replyMinutes}m</dd>
          </div>
        )}
      </dl>

      {h.latest && <p className="mt-3.5 text-[13.5px] font-medium leading-[1.75]">「{h.latest}」</p>}
    </>
  );

  const cls = `block w-full border p-4 transition-colors ${
    dark ? "border-rule-dark bg-void text-bone" : "border-void bg-bone text-void"
  } ${href ? (dark ? "hover:border-lime" : "hover:bg-void hover:text-bone") : ""} ${
    float === "slow" ? "motion-safe:animate-float-slow" : float ? "motion-safe:animate-float" : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} style={{ transform: `rotate(${tilt}deg)` }} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <article style={{ transform: `rotate(${tilt}deg)` }} className={cls}>
      {body}
    </article>
  );
}

/* ── 相談カード ────────────────────────────────
   いま流れている相談。本文は出さない。相談者のものなので。
   出すのは、どんな種類の問いが、誰に向けて、何件集まっているか。 */

export type Question = {
  id: string;
  categoryId: string;
  panel: string;
  attrs?: string[];
  answered: number;
  of: number;
  /** 課金していない間は出さない */
  priceYen?: number;
};

export function QuestionCard({ q, tone = "light" }: { q: Question; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const done = q.answered >= q.of;
  let label = q.categoryId;
  try {
    label = category(q.categoryId as CategoryId).label;
  } catch {
    /* 未知のカテゴリはそのまま出す */
  }

  return (
    <article
      className={`flex items-center justify-between gap-5 border-b py-5 ${
        dark ? "border-rule-dark text-bone" : "border-rule text-void"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-[1.5] sm:text-[18px]">{label}</p>
        <p className={`mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] ${dark ? "text-ash-soft" : "text-ash"}`}>
          {q.panel}
          {q.attrs && q.attrs.length > 0 && ` / ${q.attrs.map(attrLabel).join(" / ")}`}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[22px] font-black tabular-nums leading-none sm:text-[26px]">
          {q.answered}
          <span className={dark ? "text-ash-soft" : "text-ash"}>/{q.of}</span>
        </p>
        <p className={`mt-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] ${done ? (dark ? "text-lime" : "text-void") : dark ? "text-ash-soft" : "text-ash"}`}>
          {done ? "Complete" : "Answering"}
        </p>
        {typeof q.priceYen === "number" && (
          <p className="mt-1 text-[11px] font-bold tabular-nums">¥{q.priceYen.toLocaleString()}</p>
        )}
      </div>
    </article>
  );
}

/* ── 稼働の印 ────────────────────────────────── */

export function LiveBadge({ on, tone = "light" }: { on: boolean; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={`block h-[7px] w-[7px] rounded-full ${
          on ? "bg-lime motion-safe:animate-pulse" : dark ? "bg-rule-dark" : "bg-rule"
        }`}
      />
      <span
        className={`text-[10.5px] font-bold uppercase tracking-[0.2em] ${
          dark ? (on ? "text-lime" : "text-ash-soft") : "text-ash"
        }`}
      >
        {on ? "Live" : "Idle"}
      </span>
    </span>
  );
}

/* ── 流通の図 ──────────────────────────────────
   言葉ではなくUIで、何が誰に流れているかを見せる。 */

export function FlowStep({
  n,
  label,
  value,
  note,
  tone = "light",
}: {
  n: string;
  label: string;
  value: ReactNode;
  note?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={`border-t-2 pt-5 ${dark ? "border-lime" : "border-void"}`}>
      <p className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${dark ? "text-ash-soft" : "text-ash"}`}>
        {n} — {label}
      </p>
      <p className="mt-3 text-[30px] font-black leading-[0.95] tracking-[-0.03em] tabular-nums sm:text-[38px]">
        {value}
      </p>
      {note && (
        <p className={`mt-2.5 text-[12.5px] leading-[1.8] ${dark ? "text-ash-soft" : "text-ash"}`}>
          {note}
        </p>
      )}
    </div>
  );
}
