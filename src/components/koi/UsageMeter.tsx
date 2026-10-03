import { FREE_PEOPLE, FREE_RECORDS, type Usage } from "@/lib/pass/free";

/* いま、無料枠をどのくらい使っているか。
 *
 * ══════════════════════════════════════════════════
 * 控えめに出す
 * ══════════════════════════════════════════════════
 * 大きく出すと、使うたびに「あと何回」を意識させる。
 * それは課金の理由にはならず、使うのをやめる理由になる。
 *
 * 出すのは数と細い帯だけ。色は変えない。
 * 残りが少なくなっても赤くしない。急かさない。
 *
 * ══════════════════════════════════════════════════
 * 有料の人には出さない
 * ══════════════════════════════════════════════════
 * 上限が無いので、出す意味が無い。
 */

function Bar({ now, max }: { now: number; max: number }) {
  const w = Math.min(100, Math.round((now / max) * 100));
  return (
    <span aria-hidden className="mt-1 block h-[3px] w-full overflow-hidden rounded-pill bg-line">
      <span className="block h-full rounded-pill bg-brand" style={{ width: `${w}%` }} />
    </span>
  );
}

export default function UsageMeter({ usage, paid }: { usage: Usage; paid: boolean }) {
  if (paid) return null;

  const people = Math.min(usage.people, FREE_PEOPLE);
  const records = Math.min(usage.records, FREE_RECORDS);

  return (
    <div className="flex items-end gap-4">
      <span className="text-[11px] font-bold text-steel">無料プラン</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11.5px] font-bold tabular-nums text-steel">
          {people} / {FREE_PEOPLE}人
        </span>
        <Bar now={people} max={FREE_PEOPLE} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11.5px] font-bold tabular-nums text-steel">
          {records} / {FREE_RECORDS}記録
        </span>
        <Bar now={records} max={FREE_RECORDS} />
      </span>
    </div>
  );
}
