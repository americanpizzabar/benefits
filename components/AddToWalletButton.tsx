"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { addToWallet, inWallet, type WalletItem } from "@/lib/wallet";

export function AddToWalletButton({ item }: { item: WalletItem }) {
  const t = useTranslations("Benefit");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // localStorage is client-only; read after mount to stay hydration-safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdded(inWallet(item.id));
  }, [item.id]);

  return (
    <button
      onClick={() => {
        addToWallet(item);
        setAdded(true);
      }}
      className={`w-full rounded-xl border py-3 font-semibold ${
        added
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border bg-surface"
      }`}
    >
      {added ? "✓ " : "👛 "}
      {t("addToWallet")}
    </button>
  );
}
