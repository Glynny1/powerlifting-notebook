"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const lifts = [
  { slug: "squat", label: "Squat" },
  { slug: "bench", label: "Bench" },
  { slug: "deadlift", label: "Deadlift" },
] as const;

export default function LiftTabs({
  base,
}: {
  base: "/warmups" | "/cues" | "/rehab" | "/settings/warmups" | "/settings/rehab";
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Lift" className="flex gap-2">
      {lifts.map(({ slug, label }) => {
        const href = `${base}/${slug}` as const;
        const active = pathname === href;
        return (
          <Link
            key={slug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              active
                ? "bg-foreground text-background"
                : "border border-hairline text-secondary hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
