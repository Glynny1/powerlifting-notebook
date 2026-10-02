import LiftTabs from "@/components/LiftTabs";

export default function WarmupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-semibold">Warm-ups</h1>
          <p className="mt-1 text-sm text-secondary">
            Dr John Rusin&apos;s six-phase warm-up — run it top to bottom,
            6–10 minutes.
          </p>
        </div>
        <LiftTabs base="/warmups" />
      </div>
      {children}
    </div>
  );
}
