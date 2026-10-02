import LiftTabs from "@/components/LiftTabs";

export default function RehabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Rehab</h1>
        <LiftTabs base="/rehab" />
      </div>
      {children}
    </div>
  );
}
