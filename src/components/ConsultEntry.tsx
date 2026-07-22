"use client";

// 相談の入口。LINE を主導線にする（Oh my teeth 型）。
// - LINE 設定あり → 「LINEで無料相談」を主役に。フォームは「LINEを使わない方」用に格納。
// - LINE 設定なし（env 未設定）→ フォームを表示（壊れない）。
// LINE を有効化するには NEXT_PUBLIC_LINE_ADD_FRIEND_URL を設定するだけ。
import { useState } from "react";
import ApplyForm from "@/components/ApplyForm";
import { site } from "@/lib/site";

export default function ConsultEntry() {
  const lineUrl = site.line.addFriendUrl;
  const [showForm, setShowForm] = useState(false);

  // LINE 未設定：従来どおりフォームが相談の入口。
  if (!lineUrl) return <ApplyForm />;

  return (
    <div>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full rounded-full bg-[#06C755] hover:bg-[#05b34c] text-white text-[15px] font-bold px-6 py-4 transition-colors"
      >
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.5 3 2 6.7 2 11.2c0 4 3.4 7.3 8 7.9v2.4c0 .4.4.6.7.4l3.3-2.2c4.6-.3 8-3.6 8-8.5C22 6.7 17.5 3 12 3z" />
        </svg>
        LINEで友だち追加して始める
      </a>
      <p className="mt-3 text-[12.5px] text-[#4b5b47] leading-[1.9] text-center">
        友だち追加のあと、<strong className="font-bold text-[#1f2a1d]">相互の秘密保持契約（NDA）にご同意いただいてからスタート</strong>。
        <br />
        話した内容も、あなたのことも外に出しません。相談は無料・通知は必要なときだけ。
      </p>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-5 mx-auto block text-[12.5px] font-semibold text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4 hover:decoration-[#3d5638] transition-colors"
        >
          LINE を使わない方は、メールで相談する →
        </button>
      ) : (
        <div className="mt-7 pt-7 border-t border-[#1f2a1d]/10">
          <p className="text-[12.5px] text-[#6b7a66] leading-[1.85] mb-5">
            メールでのご相談も承ります。完全守秘義務のもとで扱います（相互NDA）。
          </p>
          <ApplyForm />
        </div>
      )}
    </div>
  );
}
