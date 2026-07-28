// 相談の入口フォールバック（メール相談）。
// LINE は公開サイトに貼らない方針のため、ここはフォームのみ。
// LINE のご案内は、お支払い後（伴走の開始時）に個別で行う。
import ApplyForm from "@/components/ApplyForm";

export default function ConsultEntry() {
  return <ApplyForm />;
}
