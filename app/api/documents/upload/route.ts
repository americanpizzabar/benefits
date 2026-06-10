import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

/** POST /api/documents/upload — store a benefits PDF in Vercel Blob (admin only). */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "auth" }, { status: 401 });

  const admin = (await sql`
    select is_admin from users where id = ${session.user.id} limit 1
  `) as { is_admin: boolean }[];
  if (!admin[0]?.is_admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "no_file" }, { status: 400 });

  const blob = await put(`benefit-pdfs/${session.user.id}/${file.name}`, file, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: true,
  });

  const rows = (await sql`
    insert into benefit_documents (storage_path, filename, uploaded_by, status)
    values (${blob.url}, ${file.name}, ${session.user.id}, 'uploaded')
    returning id
  `) as { id: string }[];

  return NextResponse.json({ ok: true, id: rows[0].id });
}
