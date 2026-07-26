"use client";

// ① 入口のフォーム — 「サイトを道具にする」中核。
// 都道府県・年齢・やりたいこと（選択＋自由記述）＋（締切）を受け取り、
// 結果は /plan へ遷移して出す（条件は query に載せる）。
// 結果を別ページにしているのは、スクロールの長い結果を LP に埋めると
// 下の節が読まれなくなるため、および URL で見返し・共有ができるため。
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { goals, prefecturesByRegion } from "@/lib/planner";
import { occasionById, type OccasionId } from "@/lib/occasions";
import { planQuery } from "@/lib/planQuery";
import { track } from "@/lib/analytics";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export type DiagArticle = { slug: string; title: string };

export default function PackagePlanner({
  occasionId = null,
  onClearOccasion,
}: {
  /** 上の OccasionGrid で選ばれた人生シーン／トラック */
  occasionId?: OccasionId | null;
  onClearOccasion?: () => void;
}) {
  const router = useRouter();
  const [pref, setPref] = useState("");
  const [age, setAge] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  const regions = useMemo(() => prefecturesByRegion(), []);
  const occasion = occasionById(occasionId);

  // シーンが選ばれたら「やりたいこと」を先に埋めておく（ゼロから選ばせない）。
  // 埋めたあとはユーザーが自由に外せる — 押し付けにはしない。
  useEffect(() => {
    if (!occasion) return;
    setPicked(occasion.goalKeys);
  }, [occasion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // シーンを選んでいれば、それだけで組める（住まいと年齢のみ必須）。
  const ready = pref !== "" && age !== "" && (picked.length > 0 || text.trim().length > 0 || Boolean(occasion));

  // 日付入力の下限＝今日（過去日を選ばせない）。
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function toggle(key: string) {
    setPicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function submit() {
    if (!ready) return;
    track("plan_submit", {
      job: occasion?.id ?? "none",
      pref,
      age: Number(age),
      goals: picked.length,
      has_date: Boolean(date),
      has_text: text.trim().length > 0,
    });
    router.push(
      `/plan?${planQuery({
        pref,
        age,
        goals: picked,
        text,
        date,
        occasion: occasion?.id ?? "",
      })}`,
    );
  }

  return (
    <section id="diagnosis" className="relative z-10 scroll-mt-20 bg-[#f4f6f2]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-4">
        <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-[#16241A] text-[#EDF1E8] px-6 sm:px-9 py-6 sm:py-7">
            <div className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#85AB8B]">30秒・無料・匿名</div>
            <h2 className="mt-2.5 text-[1.35rem] sm:text-[1.7rem] font-[800] leading-[1.4] text-[#EDF1E8]" style={HEAD}>
              何から整える？ <span className="text-[#9ec4a3]">パッケージと、日程で。</span>
            </h2>
            <p className="mt-2 text-[12.5px] sm:text-[13.5px] text-[#C9D2C4] leading-[1.8]">
              お住まい・年齢・やりたいことを書くだけ。あなた用の構成と、その立地に合わせた日程プラン、各ステップの読みものを、すぐにお見せします。
            </p>
          </div>

          {/* ══════════ 入力（結果は /plan へ遷移して出す） ══════════ */}
          <div className="px-6 sm:px-9 py-7 sm:py-8">
            {/* 選ばれた人生シーン — 何のために組んでいるかを、入力中ずっと見せておく */}
            {occasion && (
              <div className="mb-6 rounded-[1.1rem] bg-[#eef3ea] border border-[#85AB8B]/35 px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 font-mono text-[10.5px] tracking-[0.14em] text-[#85AB8B] shrink-0">
                    {occasion.no}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-[#16241A] leading-[1.5]">
                      {occasion.job}
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-[#4b5b47] leading-[1.7]">
                      「{occasion.purpose}」から逆算して組みます。
                    </p>
                  </div>
                  {onClearOccasion && (
                    <button
                      type="button"
                      onClick={onClearOccasion}
                      className="ml-auto shrink-0 text-[11px] font-semibold text-[#6b7a66] underline underline-offset-4 hover:text-[#3d5638] transition-colors"
                    >
                      変える
                    </button>
                  )}
                </div>

                {/* 現在の障害 — Job と診断のあいだ。ここで初めて「悩み」が出てくるが、
                    自分で認めるのではなく、こちらが先に言い当てる形にする。 */}
                <div className="mt-3 pt-3 border-t border-[#85AB8B]/30">
                  <div className="text-[10.5px] font-bold tracking-[0.08em] text-[#3d5638] mb-2">
                    ここで、よく壁になるもの
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {occasion.obstacles.map((o) => (
                      <span key={o} className="rounded-full bg-white/80 border border-[#85AB8B]/30 px-2.5 py-1 text-[11px] text-[#3a423a]">
                        {o}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-[#6b7a66] leading-[1.7]">
                    当てはまるかは、下の入力から判断します。
                    <span className="font-semibold text-[#3d5638]">全部やる必要はありません。</span>
                  </p>
                </div>
              </div>
            )}

            {/* ①都道府県 ②年齢 */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:gap-5">
              <div>
                <label htmlFor="planner-pref" className="block text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-2">
                  ① お住まい（都道府県）
                </label>
                <select
                  id="planner-pref"
                  value={pref}
                  onChange={(e) => setPref(e.target.value)}
                  className="w-full rounded-[0.9rem] border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[14px] text-[#1f2a1d] focus:border-[#3d5638] focus:outline-none"
                >
                  <option value="">選択してください</option>
                  {regions.map((r) => (
                    <optgroup key={r.region} label={r.region}>
                      {r.items.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="planner-age" className="block text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-2">
                  ② 年齢
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="planner-age"
                    type="number"
                    inputMode="numeric"
                    min={15}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="34"
                    className="w-full sm:w-[7.5rem] rounded-[0.9rem] border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[14px] text-[#1f2a1d] focus:border-[#3d5638] focus:outline-none"
                  />
                  <span className="text-[13px] text-[#6b7a66] shrink-0">歳</span>
                </div>
              </div>
            </div>

            {/* ③やりたいこと */}
            <div className="mt-6">
              <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">③ やりたいこと（複数OK）</div>
              <div className="flex flex-wrap gap-2.5">
                {goals.map((g) => {
                  const on = picked.includes(g.key);
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => toggle(g.key)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] sm:text-[13.5px] font-semibold transition-colors ${
                        on
                          ? "bg-[#16241A] border-[#16241A] text-[#EDF1E8]"
                          : "bg-white border-[#1f2a1d]/15 text-[#3a423a] hover:border-[#3d5638]/50"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`grid place-items-center w-4 h-4 rounded-full border ${on ? "border-[#9ec4a3] bg-[#9ec4a3]" : "border-[#1f2a1d]/25"}`}
                      >
                        {on && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16241A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        )}
                      </span>
                      {g.label}
                    </button>
                  );
                })}
              </div>

              {/* ④その日（締切がある シーンだけ）— 逆算の起点 */}
              {occasion?.dated && (
                <div className="mt-5">
                  <label htmlFor="planner-date" className="block text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-2">
                    ④ {occasion.dateLabel ?? "その日は、いつですか"}
                  </label>
                  <input
                    id="planner-date"
                    type="date"
                    min={todayISO}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full sm:w-[16rem] rounded-[0.9rem] border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[14px] text-[#1f2a1d] focus:border-[#3d5638] focus:outline-none"
                  />
                  <p className="mt-2 text-[11px] text-[#9aa79a] leading-[1.7]">
                    日付を入れると、その日から逆算した進め方と、
                    <span className="font-semibold text-[#6b7a66]">間に合わないものは「間に合わない」と</span>
                    お伝えします。
                  </p>
                </div>
              )}

              <label htmlFor="planner-text" className="block mt-5 text-[12px] font-semibold text-[#6b7a66] mb-2">
                言葉で書いてもOK（外せない場面・期限など）
              </label>
              <textarea
                id="planner-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="例：3ヶ月後に結婚式で挨拶する。写真も撮り直したい。髪の生え際も気になってきた。"
                className="w-full rounded-[0.9rem] border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[13.5px] leading-[1.9] text-[#1f2a1d] placeholder:text-[#b3bdb1] focus:border-[#3d5638] focus:outline-none resize-y"
              />
            </div>

            <button
              type="button"
              disabled={!ready}
              onClick={submit}
              className="mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full text-white text-[14.5px] font-bold px-8 py-3.5 transition-colors disabled:cursor-not-allowed"
              style={{ backgroundColor: ready ? "#16241A" : "#9aa79a" }}
            >
              パッケージを組む <span aria-hidden>→</span>
            </button>
            <p className="mt-3 text-[11px] text-[#9aa79a]">※ 登録不要。誰にも知られず、まず知りたいだけでも大丈夫です。</p>
          </div>
        </div>
      </div>
    </section>
  );
}
