import { NextRequest, NextResponse } from "next/server";
import { MEMBER_COOKIE } from "@/lib/line";

// 会員ログアウト。セッション cookie を破棄して /member へ戻す。
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/member", req.nextUrl.origin));
  res.cookies.set(MEMBER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
