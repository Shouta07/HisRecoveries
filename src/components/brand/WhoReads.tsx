import { ATTRS_OPEN, PANEL_AGES, CATEGORIES, JOB_BANDS, TONES } from "@/lib/ask/model";
import { TIERS } from "@/lib/economics";

// 誰が読むのか、の中身。
//
// ══════════════════════════════════════════════════
// 顔は置かない
// ══════════════════════════════════════════════════
// 見本では、答えている女性の顔写真が5つ並んでいた。
// 登録が0人の状態で顔を並べると、いる人の数を偽ることになる。
//
// ただし、年齢の丸バッジだけでは薄すぎる。
// 「実在の女性」と言っておいて、画面に出ているのが数字だけだと、
// 本当にいるのかどうかが伝わらない。
//
// だから、顔の代わりに「どういう人が読むのか」を出す。
// 選べる条件、確認していること、単価の段。
// これは全部こちらが実際に持っているもので、作り話ではない。
//
// ══════════════════════════════════════════════════
// トップでは短く
// ══════════════════════════════════════════════════
// 全部出すと、スマホで1.5画面ぶんになる。
// トップは「選べる」ことが伝わればよいので、
// 単価の段と得意な相談は /answerers のほうに置く。
//
// ══════════════════════════════════════════════════
// 「選べること」と「分かること」を混ぜない
// ══════════════════════════════════════════════════
// 年代と立場は、相談する側が指定できる。
// 職業のカテゴリと書き方は、指定はできないが、回答と一緒に分かる。
// これを同じ枠に並べると、選べないものを選べるように見せることになる。
// だから節を分けて、見出しの言葉も変えている。
//
// ══════════════════════════════════════════════════
// これは見本
// ══════════════════════════════════════════════════
// 特定の誰かの紹介ではない。選べる条件の一覧。
// 実際に登録がある人は /answerers に出る（いまは0人）。

export default function WhoReads({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-card border border-line bg-paper p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-bold text-brand">読む人を選べます</p>
        <span className="rounded-pill bg-mist px-2.5 py-1 text-[10.5px] text-steel">
          選べる条件
        </span>
      </div>

      <dl className="mt-5 flex flex-col gap-5">
        <div>
          <dt className="text-[11.5px] font-bold text-steel">年代</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {PANEL_AGES.filter((a) => a.id !== "any").map((a) => (
              <span
                key={a.id}
                className="rounded-pill bg-mist px-3 py-1.5 text-[12.5px] text-steel"
              >
                {a.label}
              </span>
            ))}
          </dd>
        </div>

        <div>
          <dt className="text-[11.5px] font-bold text-steel">いまの立場</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {ATTRS_OPEN.map((a) => (
              <span
                key={a.id}
                className="rounded-pill bg-mist px-3 py-1.5 text-[12.5px] text-steel"
              >
                {a.label}
              </span>
            ))}
          </dd>
        </div>

        {!compact && (
        <div>
          <dt className="text-[11.5px] font-bold text-steel">得意な相談</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {CATEGORIES.slice(0, 5).map((c) => (
              <span
                key={c.id}
                className="rounded-pill bg-mist px-3 py-1.5 text-[12.5px] text-steel"
              >
                {c.label}
              </span>
            ))}
          </dd>
        </div>
        )}
      </dl>

      {!compact && (
      <div className="mt-6 border-t border-line pt-5">
        <p className="text-[11.5px] font-bold text-steel">
          回答と一緒に分かること（指定はできません）
        </p>
        <dl className="mt-3 flex flex-col gap-4">
          <div>
            <dt className="text-[11.5px] text-steel">お仕事のカテゴリ</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {JOB_BANDS.slice(0, 6).map((j) => (
                <span
                  key={j.id}
                  className="rounded-pill bg-mist px-2.5 py-1 text-[12px] text-steel"
                >
                  {j.label}
                </span>
              ))}
              <span className="rounded-pill bg-mist px-2.5 py-1 text-[12px] text-steel">ほか</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11.5px] text-steel">書き方の癖</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {TONES.map((t) => (
                <span
                  key={t.id}
                  className="rounded-pill bg-mist px-2.5 py-1 text-[12px] text-steel"
                >
                  {t.label}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-[11.5px] text-steel">これまでに書いた回答の数</dt>
            <dd className="mt-1.5 text-[12.5px] leading-[1.7] text-steel">
              その人の実数だけ。0件の人は0件と出ます。
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-[11.5px] leading-[1.75] text-steel">
          出さないもの：名前、連絡先、勤務先、市区町村。
          会社名も細かい職種も、そもそも聞いていません。
        </p>
      </div>
      )}

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-[11.5px] font-bold text-steel">こちらで確認していること</p>
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {["年齢", "いまの立場", "書いてもらった文が読める内容か"].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[13px] leading-[1.7]">
              <span aria-hidden className="mt-[3px] text-[11px] font-black text-ok-text">
                ✓
              </span>
              <span className="min-w-0 text-steel">{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 報酬の額は、買う人の画面にも出さない。
          答える側にも、登録いただいた方に個別にお伝えしている。
          ここで金額を出すと、そちらと食い違う。 */}
      {!compact && (
      <div className="mt-5 border-t border-line pt-5">
        <p className="text-[11.5px] font-bold text-steel">答える人について</p>
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {[
            "1件ごとにお支払いしています",
            "役に立ったと言われた回答が増えると、単価が上がります",
            "順位は公開しません。良い回答より多い回答をする人が増えるからです",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[13px] leading-[1.7]">
              <span aria-hidden className="mt-[3px] text-[11px] font-black text-brand">
                ・
              </span>
              <span className="min-w-0 text-steel">{t}</span>
            </li>
          ))}
        </ul>
      </div>
      )}
    </div>
  );
}
