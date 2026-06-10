/**
 * Lightweight currency display. Amounts are stored in JPY; for users who prefer
 * another currency we annotate an *approximate* converted value as a guide.
 * (Static rates — this is a display aid, not a financial calculation.)
 */
const APPROX_RATE_FROM_JPY: Record<string, number> = {
  JPY: 1,
  USD: 1 / 155,
  EUR: 1 / 165,
  GBP: 1 / 195,
};

export const SUPPORTED_CURRENCIES = ["JPY", "USD", "EUR", "GBP"];

export function formatJPY(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a JPY amount, optionally appending an approximate value in the user's
 * preferred currency, e.g. "¥1,000 (≈ $6)".
 */
export function formatAmount(amountJpy: number, preferred = "JPY"): string {
  const base = formatJPY(amountJpy);
  if (preferred === "JPY" || !APPROX_RATE_FROM_JPY[preferred]) return base;
  const converted = amountJpy * APPROX_RATE_FROM_JPY[preferred];
  const approx = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: preferred,
    maximumFractionDigits: 0,
  }).format(converted);
  return `${base} (≈ ${approx})`;
}
