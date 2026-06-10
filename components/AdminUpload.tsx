"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export type AdminDoc = {
  id: string;
  filename: string | null;
  status: string;
  error: string | null;
  count: number;
};

const STATUS_KEY: Record<string, string> = {
  uploaded: "statusUploaded",
  parsing: "statusParsing",
  parsed: "statusParsed",
  failed: "statusFailed",
};

export function AdminUpload({
  userId,
  docs,
}: {
  userId: string;
  docs: AdminDoc[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [needKey, setNeedKey] = useState(false);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy("upload");
    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("benefit-pdfs")
      .upload(path, file, { contentType: "application/pdf" });
    if (!upErr) {
      await supabase.from("benefit_documents").insert({
        storage_path: path,
        filename: file.name,
        uploaded_by: userId,
        status: "uploaded",
      });
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    }
    setBusy(null);
  }

  async function parse(id: string) {
    setBusy(id);
    setNeedKey(false);
    const res = await fetch(`/api/documents/${id}/parse`, { method: "POST" });
    if (res.status === 400) {
      const body = await res.json().catch(() => ({}));
      if (body.error === "no_api_key") setNeedKey(true);
    }
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-5 px-4 py-4">
      <div className="card p-4">
        <h2 className="font-semibold">{t("uploadTitle")}</h2>
        <p className="mt-1 text-xs text-muted">{t("uploadHint")}</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="mt-3 block w-full text-sm"
        />
        <button
          onClick={upload}
          disabled={busy === "upload"}
          className="mt-3 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy === "upload" ? t("uploading") : t("upload")}
        </button>
      </div>

      {needKey && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          {t("needKey")}
        </p>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">
          {t("documents")}
        </h2>
        {docs.length === 0 ? (
          <p className="text-sm text-muted">{t("noDocs")}</p>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id} className="card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">
                    {doc.filename ?? doc.id}
                  </p>
                  <span className="rounded-full bg-border/60 px-2 py-0.5 text-[11px] font-medium">
                    {t(STATUS_KEY[doc.status] ?? "statusUploaded")}
                  </span>
                </div>
                {doc.status === "parsed" && (
                  <p className="mt-1 text-xs text-muted">
                    {t("extracted")}: {doc.count}
                  </p>
                )}
                {doc.error && (
                  <p className="mt-1 text-xs text-red-600">{doc.error}</p>
                )}
                {(doc.status === "uploaded" || doc.status === "failed") && (
                  <button
                    onClick={() => parse(doc.id)}
                    disabled={busy === doc.id}
                    className="mt-2 w-full rounded-lg bg-brand py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {busy === doc.id ? t("parsing") : `✨ ${t("parse")}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
