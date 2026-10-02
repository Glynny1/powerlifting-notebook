import Link from "next/link";
import LiftTabs from "@/components/LiftTabs";

export default function WarmupEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-xl font-semibold">Edit warm-ups</h1>
          <Link
            href="/warmups"
            className="text-sm font-medium text-secondary underline underline-offset-2 transition-colors duration-150 ease-out hover:text-foreground"
          >
            Done
          </Link>
        </div>
        <p className="-mt-2 text-sm text-secondary">
          Changes save straight away. The warm-up pages show the clean,
          tickable version.
        </p>
        <LiftTabs base="/settings/warmups" />
      </div>
      {children}
    </div>
  );
}
