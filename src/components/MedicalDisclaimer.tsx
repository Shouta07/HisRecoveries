// Shared medical disclaimer. Reused at the bottom of any page that
// touches symptoms / treatments / wellness practices. The /privacy page
// holds the canonical version (§免責事項).

type Props = {
  className?: string;
};

export default function MedicalDisclaimer({ className = "" }: Props) {
  return (
    <p
      className={`text-[12px] text-sub-gray leading-[2] ${className}`}
    >
      ※ 本ページは当事者の観察または一般的な情報の整理であり、医療行為・診断・受診勧奨を
      行うものではありません。個別の症状や治療の判断は、医療機関にご相談ください。
    </p>
  );
}
