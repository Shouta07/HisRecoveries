// LINE ファースト入口。NEXT_PUBLIC_LINE_ADD_FRIEND_URL が設定された瞬間に
// 相談導線（モーダル・/apply）へ自動で出る。未設定の間は何も描画しない。
// 位置づけ：無料相談の主線＝LINE、フォームは「LINEを使わない方」の代替。
import { site } from "@/lib/site";

export default function LineEntry() {
  if (!site.line.addFriendUrl) return null;

  return (
    <div className="mb-7 rounded-[1.2rem] border border-[#06C755]/30 bg-[#f3faf3] p-5">
      <a
        href={site.line.addFriendUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white text-[15px] font-bold px-6 py-3.5 transition-colors"
      >
        {/* LINE吹き出しアイコン（簡略） */}
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.5 3 2 6.7 2 11.2c0 4 3.4 7.3 8 7.9v2.4c0 .4.4.6.7.4l3.3-2.2c4.6-.3 8-3.6 8-8.5C22 6.7 17.5 3 12 3z" />
        </svg>
        LINEで無料相談を始める
      </a>
      <p className="mt-3 text-[12px] text-[#4b5b47] leading-[1.85] text-center">
        いちばん早く始められます。匿名のままでOK・通知は必要なときだけ。
        <br className="hidden sm:block" />
        LINEを使わない方は、下のフォームからどうぞ。
      </p>
    </div>
  );
}
