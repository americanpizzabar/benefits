import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

// Next.js 16 renamed the `middleware` convention to `proxy` (nodejs runtime).
// Auth is handled per-page/route via Auth.js `auth()`, so the proxy only needs
// next-intl's locale detection / prefix redirects.
const handleIntl = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return handleIntl(request);
}

export const config = {
  // Run on app pages; skip API/auth route handlers, Next internals, and files.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
