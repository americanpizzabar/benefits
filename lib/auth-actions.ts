"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { sql } from "@/lib/db";

export type AuthState = { error?: string } | undefined;

/**
 * Single entry point for the sign-in form. `mode` selects between signing in
 * and creating an account; both end by establishing a credentials session and
 * redirecting to the locale home. Returns a message-key string on failure.
 */
export async function authenticate(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const mode = String(formData.get("mode") ?? "signin");
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (mode === "register") {
    if (!email || password.length < 6) return { error: "errorWeak" };
    const name =
      String(formData.get("name") ?? "").trim() || email.split("@")[0];

    const existing = (await sql`
      select 1 from users where email = ${email} limit 1
    `) as unknown[];
    if (existing.length > 0) return { error: "errorExists" };

    const passwordHash = await hash(password, 10);
    await sql`
      insert into users (email, password_hash, display_name)
      values (${email}, ${passwordHash}, ${name})
    `;
  }

  try {
    await signIn("credentials", { email, password, redirectTo: `/${locale}` });
  } catch (error) {
    if (error instanceof AuthError) return { error: "errorInvalid" };
    throw error; // redirect signal — must propagate
  }
}
