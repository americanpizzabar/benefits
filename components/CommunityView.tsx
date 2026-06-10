"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createBuddyPost } from "@/lib/actions";

export type CommunityReview = {
  id: string;
  rating: number;
  body: string;
  locale: string;
  translations: Record<string, string>;
  benefitId: string;
  benefitTitle: string;
};

export type BuddyPost = {
  id: string;
  title: string;
  body: string | null;
  when_at: string | null;
  benefitTitle: string | null;
};

function ReviewCard({ review }: { review: CommunityReview }) {
  const t = useTranslations("Community");
  const viewer = useLocale();
  const [orig, setOrig] = useState(false);
  const translated =
    review.locale !== viewer ? review.translations?.[viewer] : undefined;
  const body = translated && !orig ? translated : review.body;

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between">
        <span className="text-amber-500">
          {"★".repeat(review.rating)}
          <span className="text-border">{"★".repeat(5 - review.rating)}</span>
        </span>
        <Link
          href={`/benefit/${review.benefitId}`}
          className="max-w-[55%] truncate text-xs font-medium text-brand"
        >
          {review.benefitTitle}
        </Link>
      </div>
      <p className="mt-1.5 text-sm">{body}</p>
      {translated && (
        <button onClick={() => setOrig((v) => !v)} className="mt-1 text-xs text-brand">
          🌐 {orig ? t("showOriginal") : t("autoTranslated")}
        </button>
      )}
    </div>
  );
}

export function CommunityView({
  reviews,
  buddyPosts,
  benefitOptions,
}: {
  reviews: CommunityReview[];
  buddyPosts: BuddyPost[];
  benefitOptions: { id: string; title: string }[];
}) {
  const t = useTranslations("Community");
  const tc = useTranslations("Common");
  const router = useRouter();
  const [tab, setTab] = useState<"reviews" | "buddy">("reviews");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("");
  const [benefitId, setBenefitId] = useState("");
  const [pending, setPending] = useState(false);

  async function submitBuddy() {
    if (!title.trim()) return;
    setPending(true);
    await createBuddyPost({
      title: title.trim(),
      body,
      benefitId: benefitId || null,
      whenAt: when ? new Date(when).toISOString() : null,
    });
    setTitle("");
    setBody("");
    setWhen("");
    setBenefitId("");
    setShowForm(false);
    setPending(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-1 px-4 pt-3">
        {(["reviews", "buddy"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold ${
              tab === key ? "bg-brand text-white" : "bg-surface text-muted"
            }`}
          >
            {key === "reviews" ? t("reviewsTab") : t("buddyTab")}
          </button>
        ))}
      </div>

      {tab === "reviews" ? (
        <div className="space-y-2 px-4 py-4">
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("noBuddy")}</p>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      ) : (
        <div className="space-y-3 px-4 py-4">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-xl bg-brand py-3 font-semibold text-white"
            >
              ＋ {t("newBuddy")}
            </button>
          )}

          {showForm && (
            <div className="card space-y-2 p-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("buddyTitle")}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("buddyBody")}
                rows={2}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
              <select
                value={benefitId}
                onChange={(e) => setBenefitId(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                <option value="">{t("selectBenefit", { optional: tc("optional") })}</option>
                {benefitOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={submitBuddy}
                  disabled={pending || !title.trim()}
                  className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {t("post")}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                >
                  {tc("cancel")}
                </button>
              </div>
            </div>
          )}

          <h2 className="pt-1 text-sm font-semibold text-muted">
            {t("openPosts")}
          </h2>
          {buddyPosts.length === 0 ? (
            <p className="text-sm text-muted">{t("noBuddy")}</p>
          ) : (
            buddyPosts.map((p) => (
              <div key={p.id} className="card p-3">
                <p className="font-semibold">{p.title}</p>
                {p.body && <p className="mt-1 text-sm text-muted">{p.body}</p>}
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                  {p.when_at && (
                    <span>🗓 {new Date(p.when_at).toLocaleString()}</span>
                  )}
                  {p.benefitTitle && <span>🎁 {p.benefitTitle}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
