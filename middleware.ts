import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  // Run next-auth middleware first (to get session, etc.)
  const response = auth(request as any);

  // https://www.propelauth.com/post/getting-url-in-next-server-components
  // If auth returns a promise (it does in newer NextAuth versions), handle it asynchronously
  return Promise.resolve(response).then(() => {
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-current-path", request.nextUrl.pathname);
    requestHeaders.set("x-url", request.url);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  });
}

// Apply to all routes (or customize)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
