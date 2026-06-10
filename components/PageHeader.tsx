import { Link } from "@/i18n/navigation";

/** Simple page header with an optional back link. */
export function PageHeader({
  title,
  backHref = "/",
  right,
}: {
  title: string;
  backHref?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
      <Link
        href={backHref}
        className="grid h-8 w-8 place-items-center rounded-full text-lg text-muted"
        aria-label="Back"
      >
        ←
      </Link>
      <h1 className="flex-1 truncate text-lg font-bold">{title}</h1>
      {right}
    </header>
  );
}
