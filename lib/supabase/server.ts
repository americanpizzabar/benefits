import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 * Reads the session from cookies. Cookie writes are best-effort: they succeed
 * in Server Actions / Route Handlers and are safely ignored in Server
 * Components (where the proxy refreshes the session instead).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignore; the proxy handles refresh.
          }
        },
      },
    },
  );
}
