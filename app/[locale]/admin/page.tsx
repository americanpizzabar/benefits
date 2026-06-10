import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser, getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/PageHeader";
import { AdminUpload, type AdminDoc } from "@/components/AdminUpload";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect({ href: "/sign-in", locale });

  const profile = await getProfile();
  const t = await getTranslations("Admin");

  if (!profile?.is_admin) {
    return (
      <main>
        <PageHeader title={t("title")} backHref="/profile" />
        <p className="px-4 py-10 text-center text-sm text-muted">
          {t("notAdmin")}
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: docRows } = await supabase
    .from("benefit_documents")
    .select("id, filename, status, error")
    .order("created_at", { ascending: false });

  // Count parsed benefits per document.
  const { data: benefitRows } = await supabase
    .from("benefits")
    .select("document_id");
  const counts = new Map<string, number>();
  for (const b of benefitRows ?? []) {
    if (b.document_id)
      counts.set(b.document_id, (counts.get(b.document_id) ?? 0) + 1);
  }

  const docs: AdminDoc[] = (docRows ?? []).map((d) => ({
    id: d.id,
    filename: d.filename,
    status: d.status,
    error: d.error,
    count: counts.get(d.id) ?? 0,
  }));

  return (
    <main>
      <PageHeader title={t("title")} backHref="/profile" />
      <AdminUpload userId={user!.id} docs={docs} />
    </main>
  );
}
