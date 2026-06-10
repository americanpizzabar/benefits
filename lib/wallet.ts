"use client";

/** Client-side wallet storage (no backend needed for the digital card list). */
export type WalletItem = {
  id: string;
  title: string;
  vendor: string | null;
};

const KEY = "myperks.wallet";

export function getWallet(): WalletItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function inWallet(id: string): boolean {
  return getWallet().some((w) => w.id === id);
}

export function addToWallet(item: WalletItem): WalletItem[] {
  const items = getWallet();
  if (!items.some((w) => w.id === item.id)) items.push(item);
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}

export function removeFromWallet(id: string): WalletItem[] {
  const items = getWallet().filter((w) => w.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}

const MEMBER_KEY = "myperks.member";

/** Stable per-device member number shown on wallet cards. */
export function getMemberNo(): string {
  if (typeof window === "undefined") return "0000000000";
  let no = localStorage.getItem(MEMBER_KEY);
  if (!no) {
    no = String(Math.floor(1e9 + Math.random() * 9e9));
    localStorage.setItem(MEMBER_KEY, no);
  }
  return no;
}
