"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OrgType = "clinic" | "salon" | "gym" | "specialist";
type YesNo = "yes" | "no" | "maybe";

type PrinciplesState = {
  understanding: boolean;
  no_hard_sell: boolean;
  improvement_data: boolean;
  education: boolean;
  long_term: boolean;
};

const STORAGE_KEY = "hr_network_apply_v1";

const PRINCIPLES = [
  {
    key: "understanding" as const,
    n: "01",
    t: "顧客理解",
    d: "カウンセリングの過程を文書化し、相手の状態を本人と一緒に整理する。",
  },
  {
    key: "no_hard_sell" as const,
    n: "02",
    t: "強引営業の禁止",
    d: "初回相談から 24 時間のクーリング期間を必ず設け、当日決断を強いない。",
  },
  {
    key: "improvement_data" as const,
    n: "03",
    t: "改善データの提供",
    d: "施術後 6 ヶ月・1 年の顧客状態を、匿名で His Recoveries に共有する。",
  },
  {
    key: "education" as const,
    n: "04",
    t: "顧客教育",
    d: "院内 / 店内に、決定を急がせない顧客向けの読み物を備える。",
  },
  {
    key: "long_term" as const,
    n: "05",
    t: "長期伴走",
    d: "単発処置で終わらせず、年単位の伴走の選択肢を必ず提示する。",
  },
];

export default function ApplyClient() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<OrgType>("clinic");
  const [repName, setRepName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [location, setLocation] = useState("");
  const [services, setServices] = useState("");
  const [philosophy, setPhilosophy] = useState("");
  const [principles, setPrinciples] = useState<PrinciplesState>({
    understanding: false,
    no_hard_sell: false,
    improvement_data: false,
    education: false,
    long_term: false,
  });
  const [hasNps, setHasNps] = useState<YesNo>("no");
  const [hasEducation, setHasEducation] = useState<YesNo>("no");
  const [hasLongterm, setHasLongterm] = useState<YesNo>("no");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.orgName) setOrgName(d.orgName);
      if (d.orgType) setOrgType(d.orgType);
      if (d.repName) setRepName(d.repName);
      if (d.email) setEmail(d.email);
      if (d.phone) setPhone(d.phone);
      if (d.websiteUrl) setWebsiteUrl(d.websiteUrl);
      if (d.location) setLocation(d.location);
      if (d.services) setServices(d.services);
      if (d.philosophy) setPhilosophy(d.philosophy);
      if (d.principles) setPrinciples(d.principles);
      if (d.hasNps) setHasNps(d.hasNps);
      if (d.hasEducation) setHasEducation(d.hasEducation);
      if (d.hasLongterm) setHasLongterm(d.hasLongterm);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          orgName,
          orgType,
          repName,
          email,
          phone,
          websiteUrl,
          location,
          services,
          philosophy,
          principles,
          hasNps,
          hasEducation,
          hasLongterm,
        })
      );
    } catch {
      /* ignore */
    }
  }, [
    orgName,
    orgType,
    repName,
    email,
    phone,
    websiteUrl,
    location,
    services,
    philosophy,
    principles,
    hasNps,
    hasEducation,
    hasLongterm,
  ]);

  function togglePrinciple(k: keyof PrinciplesState) {
    setPrinciples((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  async function submit() {
    setError("");
    if (!orgName.trim()) return setError("組織名をご入力ください。");
    if (!repName.trim()) return setError("ご担当者名をご入力ください。");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("メールアドレスをご入力ください。");
    if (!services.trim())
      return setError("提供サービスの概要をご記入ください。");
    if (!philosophy.trim())
      return setError(
        "顧客理解についての立場を、一行でもお書きください。"
      );
    const allPrinciples = Object.values(principles).every(Boolean);
    if (!allPrinciples)
      return setError(
        "5 つの原則すべてに「満たす / 半年以内に満たせる」のチェックが必要です。"
      );

    setSubmitting(true);
    try {
      const res = await fetch("/api/network-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          orgType,
          repName,
          email,
          phone,
          websiteUrl,
          location,
          services,
          philosophy,
          principles,
          hasNps,
          hasEducation,
          hasLongterm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "送信に失敗しました");
      localStorage.removeItem(STORAGE_KEY);
      router.push("/network/complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信に失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[760px] px-6 sm:px-10 pt-12 sm:pt-20 pb-24">
      <header className="mb-10">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Certified · Apply
        </p>
        <h1 className="mt-5 font-mincho text-2xl sm:text-3xl text-ink leading-[1.45]">
          認証を申請する。
        </h1>
        <p className="mt-5 font-mincho text-[14px] text-sub-gray leading-[2.05]">
          書類審査 →
          覆面顧客審査 →
          認証委員会、の 3 段階で判定します。
          結果のご連絡まで平均 4〜8 週間いただきます。
          β 期間中、申請料・年会費は無料です。
        </p>
      </header>

      <h2 className="font-mincho text-lg text-ink mb-4">基本情報</h2>

      <Field label="組織名" required>
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="〇〇クリニック / 〇〇サロン 等"
          className={input}
        />
      </Field>

      <Field label="組織のタイプ" required>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { v: "clinic", l: "クリニック" },
              { v: "salon", l: "サロン" },
              { v: "gym", l: "ジム" },
              { v: "specialist", l: "専門家" },
            ] as const
          ).map((o) => {
            const selected = orgType === o.v;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => setOrgType(o.v)}
                className={`px-3 py-3 border font-mincho text-[14px] transition-colors ${
                  selected
                    ? "border-gold bg-paper text-ink"
                    : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
                }`}
                aria-pressed={selected}
              >
                {o.l}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="ご担当者名" required>
        <input
          type="text"
          value={repName}
          onChange={(e) => setRepName(e.target.value)}
          className={input}
        />
      </Field>

      <Field label="メールアドレス" required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={input}
        />
      </Field>

      <Field label="電話番号（任意）">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={input}
        />
      </Field>

      <Field label="所在地（都道府県＋市区）">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="例：東京都港区 / 京都市左京区"
          className={input}
        />
      </Field>

      <Field label="Web サイト URL（任意）">
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://"
          className={input}
        />
      </Field>

      <h2 className="font-mincho text-lg text-ink mt-12 mb-4">サービス</h2>

      <Field
        label="提供サービスの概要"
        hint="施術内容・料金プラン・対象年齢層など、簡単に"
        required
      >
        <textarea
          value={services}
          onChange={(e) => setServices(e.target.value.slice(0, 1500))}
          className={`${input} min-h-[140px] resize-y`}
        />
        <p className="mt-1 text-[11px] text-sub-gray text-right">
          {services.length} / 1500
        </p>
      </Field>

      <Field
        label="「顧客理解」について、貴院 / 貴社の立場"
        hint="His Recoveries の原則 01 にあたる部分です。商業文ではなく、本音の言葉でお書きください"
        required
      >
        <textarea
          value={philosophy}
          onChange={(e) => setPhilosophy(e.target.value.slice(0, 1500))}
          className={`${input} min-h-[140px] resize-y`}
        />
        <p className="mt-1 text-[11px] text-sub-gray text-right">
          {philosophy.length} / 1500
        </p>
      </Field>

      <h2 className="font-mincho text-lg text-ink mt-12 mb-4">5 つの原則の確認</h2>
      <p className="text-[13px] text-sub-gray leading-[2] mb-5">
        現在満たしている、または 半年以内に満たせる原則について、すべてチェックを入れてください。
        どれか一つでも欠けている場合、認証は保留 / 不認証となります。
      </p>

      <ul className="space-y-3 mb-10">
        {PRINCIPLES.map((p) => {
          const checked = principles[p.key];
          return (
            <li key={p.key}>
              <button
                type="button"
                onClick={() => togglePrinciple(p.key)}
                className={`w-full text-left px-5 py-4 border transition-colors ${
                  checked
                    ? "border-gold bg-paper"
                    : "border-hair-line bg-paper/40 hover:border-gold/60"
                }`}
                aria-pressed={checked}
              >
                <div className="flex items-baseline gap-3">
                  <span className="logo-type italic text-[11px] tracking-[0.2em] text-gold">
                    {p.n}
                  </span>
                  <div className="flex-1">
                    <p className="font-mincho text-[15px] text-ink">{p.t}</p>
                    <p className="mt-1.5 font-mincho text-[13px] text-ink/80 leading-[1.95]">
                      {p.d}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 w-5 h-5 border flex items-center justify-center ${
                      checked
                        ? "border-gold bg-gold text-cream"
                        : "border-hair-line"
                    }`}
                    aria-hidden
                  >
                    {checked ? "✓" : ""}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className="font-mincho text-lg text-ink mt-12 mb-4">補助情報</h2>

      <Field
        label="顧客満足度（NPS など）データの提出"
        hint="原則 03 の確認"
      >
        <YesNoMaybe value={hasNps} onChange={setHasNps} />
      </Field>

      <Field label="顧客教育コンテンツ（読み物 / 案内）の有無" hint="原則 04 の確認">
        <YesNoMaybe value={hasEducation} onChange={setHasEducation} />
      </Field>

      <Field label="長期伴走プランの提示" hint="原則 05 の確認">
        <YesNoMaybe value={hasLongterm} onChange={setHasLongterm} />
      </Field>

      <p className="mt-8 mb-8 text-[12px] text-sub-gray leading-[2]">
        申請内容は編集部のみが取り扱い、紹介手数料・広告契約の目的では使われません。
      </p>

      {error && <p className="mb-5 text-[12px] text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
        <Link
          href="/network"
          className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
        >
          戻る
        </Link>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="btn-gold justify-center disabled:opacity-50"
        >
          {submitting ? "送信中…" : "申請を送る"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

const input =
  "mt-2 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[15px] leading-[1.65] focus:outline-none focus:border-gold";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-7">
      <span className="text-[11px] tracking-[0.1em] uppercase text-sub-gray">
        {label}
        {required && (
          <span className="ml-2 text-[10px] text-gold">必須</span>
        )}
      </span>
      <div className="mt-1">{children}</div>
      {hint && (
        <span className="block mt-1.5 text-[11px] text-sub-gray">{hint}</span>
      )}
    </label>
  );
}

function YesNoMaybe({
  value,
  onChange,
}: {
  value: "yes" | "no" | "maybe";
  onChange: (v: "yes" | "no" | "maybe") => void;
}) {
  const opts = [
    { v: "yes" as const, l: "はい" },
    { v: "maybe" as const, l: "半年以内に整える" },
    { v: "no" as const, l: "いいえ" },
  ];
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-2">
      {opts.map((o) => {
        const selected = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={`flex-1 px-4 py-3 border font-mincho text-[14px] transition-colors text-left ${
              selected
                ? "border-gold bg-paper text-ink"
                : "border-hair-line bg-paper/40 text-ink/85 hover:border-gold/60"
            }`}
            aria-pressed={selected}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
