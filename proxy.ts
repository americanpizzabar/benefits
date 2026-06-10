import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed the `middleware` convention to `proxy` (nodejs runtime).
const handleIntl = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1) next-intl handles locale detection / prefix redirects & rewrites.
  const response = handleIntl(request);
  // 2) Refresh the Supabase session, attaching cookies to that response.
  return updateSession(request, response);
}

export const config = {
  // Run on app pages; skip API/auth route handlers, Next internals, and files.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
