"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import {
  getWallet,
  getMemberNo,
  removeFromWallet,
  type WalletItem,
} from "@/lib/wallet";

export function WalletView() {
  const t = useTranslations("Wallet");
  const [items, setItems] = useState<WalletItem[]>([]);
  const [member, setMember] = useState("");

  useEffect(() => {
    // localStorage is client-only; read after mount to stay hydration-safe.
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(getWallet());
    setMember(getMemberNo());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (items.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted">{t("empty")}</p>;
  }

  return (
    <div className="space-y-4 px-4 py-4">
      {items.map((item) => (
        <div key={item.id} className="card overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-brand to-rose-400 px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate font-semibold">{item.title}</p>
              {item.vendor && (
                <p className="truncate text-xs text-white/85">{item.vendor}</p>
              )}
            </div>
            <button
              onClick={() => setItems(removeFromWallet(item.id))}
              className="text-white/80"
              aria-label="Remove"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 p-4">
            <QRCodeSVG
              value={`MYPERKS|${member}|${item.id}`}
              size={132}
              fgColor="#241f1a"
            />
            <Barcode
              value={member}
              height={36}
              width={1.4}
              displayValue={false}
              background="#ffffff"
            />
            <p className="text-xs text-muted">
              {t("memberNo")} {member}
            </p>
            <p className="text-xs font-medium">{t("showAtRegister")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
