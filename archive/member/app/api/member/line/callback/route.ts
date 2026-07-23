import { NextRequest, NextResponse } from "next/server";
import { lineLogin, lineConfigured, MEMBER_COOKIE, STATE_COOKIE } from "@/lib/line";

// LINE 認可後のコールバック。code をトークンに交換し、プロフィール（表示名）を
// 取得して会員セッションの cookie を発行する。
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;

  // CSRF 対策：state を照合。未設定・不一致・code欠落は失敗として戻す。
  if (!lineConfigured() || !code || !state || state !== stateCookie) {
    return NextResponse.redirect(new URL("/member?error=auth", origin));
  }

  const redirectUri = `${origin}/api/member/line/callback`;
  try {
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: lineLogin.channelId,
        client_secret: lineLogin.channelSecret,
      }),
    });
    if (!tokenRes.ok) return NextResponse.redirect(new URL("/member?error=token", origin));
    const token = await tokenRes.json();

    const profRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const prof = profRes.ok ? await profRes.json() : {};

    const res = NextResponse.redirect(new URL("/member", origin));
    res.cookies.set(
      MEMBER_COOKIE,
      JSON.stringify({ name: prof.displayName ?? "会員", uid: prof.userId ?? "" }),
      { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 },
    );
    res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.redirect(new URL("/member?error=network", origin));
  }
}
