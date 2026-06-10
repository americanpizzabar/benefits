"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { authenticate, type AuthState } from "@/lib/auth-actions";

export function SignInForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    authenticate,
    undefined,
  );

  const isRegister = mode === "register";

  return (
    <div className="space-y-3">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="mode" value={mode} />

        {isRegister && (
          <div>
            <label className="text-sm font-medium" htmlFor="name">
              {t("nameLabel")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand"
              placeholder="Taro Yamada"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium" htmlFor="email">
            {t("emailLabel")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="password">
            {t("passwordLabel")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand"
            placeholder="••••••••"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{t(state.error)}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-60"
        >
          {isRegister
            ? pending
              ? t("creating")
              : t("createAccount")
            : pending
              ? t("signingIn")
              : t("signIn")}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(isRegister ? "signin" : "register")}
        className="w-full py-1 text-center text-sm font-medium text-muted"
      >
        {isRegister ? t("haveAccount") : t("noAccount")}
      </button>

      {/* Demo account — a sibling form posting fixed credentials. */}
      <form action={formAction}>
        <input type="hidden" name="mode" value="signin" />
        <input type="hidden" name="email" value="demo@myperks.app" />
        <input type="hidden" name="password" value="perksdemo123" />
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted disabled:opacity-60"
        >
          ✨ {t("demo")}
        </button>
      </form>
    </div>
  );
}
