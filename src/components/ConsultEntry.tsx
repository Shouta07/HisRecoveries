// 相談の入口フォールバック（メール相談）。
// LINE は公開サイトに貼らない方針のため、ここはフォームのみ。
// LINE 追加は体験フェーズ（相談→NDAの後）の会員に、非公開で案内する。
import ApplyForm from "@/components/ApplyForm";

export default function ConsultEntry() {
  return <ApplyForm />;
}
