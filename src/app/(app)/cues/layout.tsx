import LiftTabs from "@/components/LiftTabs";

export default function CuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">Cues</h1>
        <LiftTabs base="/cues" />
      </div>
      {children}
    </div>
  );
}
