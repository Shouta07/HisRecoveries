import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protects /admin/* with HTTP Basic Auth.
 * Username: "admin"
 * Password: env ADMIN_PASSWORD
 */
export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse(
      "ADMIN_PASSWORD is not configured. Set it in the deployment environment.",
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const colon = decoded.indexOf(":");
      const supplied = colon === -1 ? decoded : decoded.slice(colon + 1);
      if (supplied === password) {
        return NextResponse.next();
      }
    } catch {
      /* fall through */
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="His Recoveries Insights"',
    },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
