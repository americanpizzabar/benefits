"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignInForm() {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(withEmail: string, withPassword: string) {
    const supabase = createClient();
    setLoading(true);
    setError(null);
    try {
      if (withPassword) {
        const { error } = await supabase.auth.signInWithPassword({
          email: withEmail,
          password: withPassword,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          "/" + locale,
        )}`;
        const { error } = await supabase.auth.signInWithOtp({
          email: withEmail,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setSent(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : tc("error"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-5 text-center">
        <div className="text-4xl">📬</div>
        <h2 className="mt-2 font-semibold">{t("linkSent")}</h2>
        <p className="mt-1 text-sm text-muted">
          {t("linkSentBody", { email })}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signIn(email, password);
      }}
      className="space-y-3"
    >
      <div>
        <label className="text-sm font-medium" htmlFor="email">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="password">
          Password <span className="text-muted">({tc("optional")})</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? t("sending") : password ? t("signInToContinue") : t("sendLink")}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          setEmail("demo@myperks.app");
          setPassword("perksdemo123");
          signIn("demo@myperks.app", "perksdemo123");
        }}
        className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted"
      >
        ✨ Try the demo account
      </button>
    </form>
  );
}
