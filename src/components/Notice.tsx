import Link from "next/link";

export default function Notice({
  title,
  children,
  href,
  linkLabel,
}: {
  title: string;
  children: React.ReactNode;
  href?: "/settings";
  linkLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-5">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-secondary">{children}</p>
      {href && linkLabel && (
        <Link
          href={href}
          className="mt-3 inline-block rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity duration-150 ease-out hover:opacity-85"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
