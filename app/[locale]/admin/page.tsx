import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser, getProfile } from "@/lib/data";
import { sql } from "@/lib/db";
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

  const docRows = (await sql`
    select d.id, d.filename, d.status, d.error,
           count(b.id)::int as count
    from benefit_documents d
    left join benefits b on b.document_id = d.id
    group by d.id
    order by d.created_at desc
  `) as {
    id: string;
    filename: string | null;
    status: string;
    error: string | null;
    count: number;
  }[];

  const docs: AdminDoc[] = docRows.map((d) => ({
    id: d.id,
    filename: d.filename,
    status: d.status,
    error: d.error,
    count: d.count,
  }));

  return (
    <main>
      <PageHeader title={t("title")} backHref="/profile" />
      <AdminUpload docs={docs} />
    </main>
  );
}
