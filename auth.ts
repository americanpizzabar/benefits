import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { sql } from "@/lib/db";

/**
 * Auth.js (v5) — password-only credentials auth backed by the Neon `users`
 * table. Sessions are JWT-based (no DB session table needed). The user's id and
 * admin flag are carried in the token so server code can authorize without an
 * extra query.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/en/sign-in" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const rows = (await sql`
          select id, email, password_hash, display_name, is_admin
          from users where email = ${email} limit 1
        `) as {
          id: string;
          email: string;
          password_hash: string;
          display_name: string | null;
          is_admin: boolean;
        }[];

        const user = rows[0];
        if (!user) return null;

        const ok = await compare(password, user.password_hash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.display_name,
          isAdmin: user.is_admin,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.isAdmin = user.isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.isAdmin = (token.isAdmin as boolean | undefined) ?? false;
      }
      return session;
    },
  },
});
