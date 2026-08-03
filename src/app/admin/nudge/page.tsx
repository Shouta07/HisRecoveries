import { NUDGE_CASES, decideNudge } from "@/lib/nudge";

// 自動伴走が、どの状態でどの文面を出すかの一覧。
//
// 担当者が言葉を選ばない設計なので、選ばれる言葉のほうを
// あらかじめ全部見えるようにしておく。
// ここを見て違和感があれば、lib/nudge.ts を直す。運用では直さない。
//
// /admin 配下は Basic 認証がかかる（middleware.ts）。

export const metadata = { title: "自動伴走の判定" };

const KIND_LABEL: Record<string, string> = {
  start: "開始",
  keep: "継続",
  advance: "次へ",
  slip: "半分",
  reduce: "減らす",
  quiet: "止める",
};

export default function NudgeAdminPage() {
  return (
    <main className="mx-auto max-w-[900px] px-5 py-12 sm:px-8">
      <h1 className="text-[22px] font-bold">自動伴走の判定</h1>
      <p className="mt-3 max-w-[44em] text-[14px] leading-[1.95] text-keshizumi">
        状態が決まれば文面が決まります。人が選ぶ余地はありません。
        同じ入力からは、会員が10人でも1万人でも同じ出力が出ます。
        文面を変えたいときは、運用ではなく <code className="text-[13px]">lib/nudge.ts</code> を直してください。
      </p>

      <div className="mt-8 overflow-x-auto border border-shironezu">
        <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["状態", "判定", "次の頻度", "送る文面"].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap border-b border-shironezu bg-hakuji px-4 py-3 text-left text-[12px] font-bold text-ainezu"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NUDGE_CASES.map((c) => {
              const n = decideNudge(c.trail, c.missed);
              return (
                <tr key={c.name}>
                  <td className="border-b border-shironezu/70 px-4 py-3 align-top font-bold">
                    {c.name}
                  </td>
                  <td className="whitespace-nowrap border-b border-shironezu/70 px-4 py-3 align-top text-asagi">
                    {KIND_LABEL[n.kind] ?? n.kind}
                  </td>
                  <td className="whitespace-nowrap border-b border-shironezu/70 px-4 py-3 align-top tabular-nums text-ainezu">
                    {n.cadence === "weekly" ? "毎週" : n.cadence === "biweekly" ? "隔週" : "止める"}
                  </td>
                  <td className="border-b border-shironezu/70 px-4 py-3 align-top leading-[1.85] text-keshizumi">
                    {n.text.split("\n").map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-[44em] text-[13px] leading-[1.9] text-ainezu">
        3回続けて反応がない相手には送るのを止めます。追いかけると、開封率ではなくブロック率が上がるためです。
        「やめたくなったらやめられる」ことは、この事業では機能のひとつとして扱っています。
      </p>
    </main>
  );
}
