import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { lineConfigured, lineAuthorizeUrl, MEMBER_COOKIE, STATE_COOKIE } from "@/lib/line";

// 会員ログイン開始。LINE チャネルが設定済みなら LINE の認可画面へ、
// 未設定（デモ）なら擬似ログインして /member へ戻す。
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (!lineConfigured()) {
    // デモ：LINE 未接続。擬似ログインで会員ページを体験できるようにする。
    const res = NextResponse.redirect(new URL("/member", origin));
    res.cookies.set(MEMBER_COOKIE, JSON.stringify({ name: "ゲスト", demo: true }), {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  const state = randomUUID();
  const redirectUri = `${origin}/api/member/line/callback`;
  const res = NextResponse.redirect(lineAuthorizeUrl(redirectUri, state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 600,
  });
  return res;
}
