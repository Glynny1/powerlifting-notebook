"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BandageIcon,
  ChevronRightIcon,
  CloseIcon,
  FlameIcon,
  HomeIcon,
  MenuIcon,
  PulseIcon,
  QuoteIcon,
  ScaleIcon,
} from "./icons";

const lifts = [
  { slug: "squat", label: "Squat" },
  { slug: "bench", label: "Bench" },
  { slug: "deadlift", label: "Deadlift" },
] as const;

const sections = [
  { label: "Warm-ups", base: "/warmups", icon: PulseIcon },
  { label: "Cues", base: "/cues", icon: QuoteIcon },
  { label: "Rehab", base: "/rehab", icon: BandageIcon },
] as const;

const trackers = [
  { label: "Weight", href: "/weight", icon: ScaleIcon },
  { label: "Calories", href: "/calories", icon: FlameIcon },
] as const;

const itemClass =
  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent";

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // Accordion: at most one group open — the one for the current page,
  // or the one just tapped. Leaving a section collapses its group.
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const active = sections.find((s) => pathname.startsWith(s.base));
    setOpenGroup(active ? active.base : null);
  }, [pathname]);

  const leaf = (href: string, label: string, indent?: boolean) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`${itemClass} ${indent ? "pl-10" : ""} ${
          active
            ? "bg-background text-accent"
            : "text-secondary hover:text-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      <Link
        href="/"
        onClick={onNavigate}
        aria-current={pathname === "/" ? "page" : undefined}
        className={`${itemClass} ${
          pathname === "/"
            ? "bg-background text-accent"
            : "text-secondary hover:text-foreground"
        }`}
      >
        <HomeIcon width={18} height={18} />
        Home
      </Link>

      {sections.map(({ label, base, icon: Icon }) => {
        const expanded = openGroup === base;
        const activeSection = pathname.startsWith(base);
        return (
          <div key={base}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() =>
                setOpenGroup((prev) => (prev === base ? null : base))
              }
              className={`${itemClass} ${
                activeSection ? "text-foreground" : "text-secondary"
              } hover:text-foreground`}
            >
              <Icon width={18} height={18} />
              {label}
              <ChevronRightIcon
                className={`ml-auto transition-transform duration-200 ease-out motion-reduce:transition-none ${
                  expanded ? "rotate-90" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
                expanded
                  ? "[grid-template-rows:1fr]"
                  : "[grid-template-rows:0fr]"
              }`}
            >
              <div
                className="min-h-0 overflow-hidden"
                inert={!expanded}
                aria-hidden={!expanded}
              >
                <div className="flex flex-col gap-0.5 pt-0.5">
                  {lifts.map((l) => leaf(`${base}/${l.slug}`, l.label, true))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {trackers.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`${itemClass} ${
              active
                ? "bg-background text-accent"
                : "text-secondary hover:text-foreground"
            }`}
          >
            <Icon width={18} height={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Permanent sidebar, md and up
export function SideNav() {
  return (
    <aside className="hidden border-r border-hairline py-5 pr-3 pl-1 md:block">
      <div className="sticky top-5">
        <NavItems />
      </div>
    </aside>
  );
}

// Hamburger + slide-in drawer, below md
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-secondary transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
      >
        <MenuIcon />
      </button>

      <div
        className={`fixed inset-0 z-20 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Menu"
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-hairline bg-surface p-4 pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out outline-none motion-reduce:transition-none ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="px-2.5 text-xs font-medium tracking-wide text-muted uppercase">
              Menu
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="rounded-md p-2 text-secondary transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
            >
              <CloseIcon />
            </button>
          </div>
          <NavItems onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
