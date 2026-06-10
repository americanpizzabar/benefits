"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { postReview } from "@/lib/actions";

export type ReviewItem = {
  id: string;
  rating: number;
  body: string;
  locale: string;
  translations: Record<string, string>;
};

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-500">
      {"★".repeat(value)}
      <span className="text-border">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function ReviewRow({ review }: { review: ReviewItem }) {
  const t = useTranslations("Community");
  const viewer = useLocale();
  const [showOriginal, setShowOriginal] = useState(false);

  const translated =
    review.locale !== viewer ? review.translations?.[viewer] : undefined;
  const body = translated && !showOriginal ? translated : review.body;

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between">
        <Stars value={review.rating} />
        <span className="text-xs text-muted">{t("anonymous")}</span>
      </div>
      <p className="mt-1.5 text-sm">{body}</p>
      {translated && (
        <button
          onClick={() => setShowOriginal((v) => !v)}
          className="mt-1 text-xs text-brand"
        >
          {showOriginal ? "↩︎" : "🌐"}{" "}
          {showOriginal ? t("showOriginal") : t("autoTranslated")}
        </button>
      )}
    </div>
  );
}

export function ReviewsSection({
  benefitId,
  reviews,
}: {
  benefitId: string;
  reviews: ReviewItem[];
}) {
  const t = useTranslations("Community");
  const tb = useTranslations("Benefit");
  const locale = useLocale();
  const router = useRouter();

  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!body.trim()) return;
    setPending(true);
    await postReview({ benefitId, rating, body: body.trim(), locale });
    setBody("");
    setRating(5);
    setPending(false);
    router.refresh();
  }

  return (
    <section className="space-y-3">
      <h2 className="font-semibold">{tb("reviews")}</h2>

      <div className="card space-y-2 p-3">
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={n <= rating ? "text-amber-500" : "text-border"}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("reviewBody")}
          rows={2}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
        <button
          onClick={submit}
          disabled={pending || !body.trim()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("post")}
        </button>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">{tb("noReviews")}</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}
