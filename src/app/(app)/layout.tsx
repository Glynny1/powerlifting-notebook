import Link from "next/link";
import { MobileNav, SideNav } from "@/components/nav";
import { BarbellIcon, GearIcon } from "@/components/icons";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-1 px-3 sm:px-4">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarbellIcon className="text-accent" />
            Powerlifting Notebook
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="ml-auto rounded-md p-2 text-muted transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            <GearIcon />
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-4xl flex-1 md:grid md:grid-cols-[13rem_1fr]">
        <SideNav />
        <main className="w-full min-w-0 px-4 pt-5 pb-16">
          <div className="mx-auto max-w-xl">{children}</div>
        </main>
      </div>
    </>
  );
}
