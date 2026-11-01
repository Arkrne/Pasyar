"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Compass, MapPinned, Users, Ticket, CircleUserRound, Store, Briefcase } from "lucide-react";
import { useStore } from "@/lib/store";
import { t, LANGS } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", key: "plan" as const, icon: Compass, match: (p: string) => p === "/" || p.startsWith("/plan") || p.startsWith("/trip") },
  { href: "/explore", key: "explore" as const, icon: MapPinned, match: (p: string) => p.startsWith("/explore") || p.startsWith("/place") },
  { href: "/community", key: "community" as const, icon: Users, match: (p: string) => p.startsWith("/community") },
  { href: "/trips", key: "trips" as const, icon: Ticket, match: (p: string) => p.startsWith("/trips") },
  { href: "/profile", key: "profile" as const, icon: CircleUserRound, match: (p: string) => p.startsWith("/profile") },
];

export function Logo({ size = 28, word = true, className }: { size?: number; word?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image src="/brand/logo.png" alt="" width={Math.round(size * 0.82)} height={size} priority className="h-auto" style={{ width: size * 0.82 }} />
      {word && <span className="text-[19px] font-semibold tracking-[-0.02em]">Pasyar</span>}
    </span>
  );
}

function LangSwitch({ dark }: { dark?: boolean }) {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={cn(
        "flex rounded-full p-0.5 text-[11px] font-semibold",
        dark ? "bg-white/15 text-white" : "bg-black/[0.05] text-ink-2",
      )}
    >
      {LANGS.map((l) => (
        <button
          key={l.id}
          role="radio"
          aria-checked={lang === l.id}
          aria-label={l.label}
          onClick={() => setLang(l.id)}
          className={cn(
            "pressable relative rounded-full px-2.5 py-1",
            lang === l.id && (dark ? "bg-white text-ink" : "bg-white text-ink shadow-[var(--shadow-sm)]"),
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

export function TopNav({ overlay = false }: { overlay?: boolean }) {
  const path = usePathname();
  const lang = useStore((s) => s.lang);
  const links = [
    { href: "/", label: t("plan", lang), m: TABS[0].match },
    { href: "/explore", label: t("explore", lang), m: TABS[1].match },
    { href: "/community", label: t("community", lang), m: TABS[2].match },
    { href: "/market", label: t("market", lang), m: (p: string) => p.startsWith("/market") },
    { href: "/trips", label: t("trips", lang), m: TABS[3].match },
  ];
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        overlay ? "text-white" : "glass border-b border-[var(--hairline)] text-ink",
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:h-[52px] md:px-6">
        <Link href="/" className="pressable rounded-lg" aria-label="Pasyar home">
          <Logo size={26} />
        </Link>
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.m(path);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-opacity",
                    active ? "opacity-100" : "opacity-70 hover:opacity-100",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className={cn("absolute inset-0 rounded-full", overlay ? "bg-white/15" : "bg-black/[0.05]")}
                      transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2">
          <LangSwitch dark={overlay} />
          <Link
            href="/business"
            className={cn(
              "pressable hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium lg:flex",
              overlay ? "bg-white/15" : "bg-black/[0.05]",
            )}
          >
            <Briefcase className="size-3.5" /> {t("business", lang)}
          </Link>
          <Link href="/profile" aria-label="Profile" className="pressable hidden md:block">
            <CircleUserRound className="size-6 opacity-80" strokeWidth={1.6} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function TabBar() {
  const path = usePathname();
  const lang = useStore((s) => s.lang);
  return (
    <nav
      aria-label="Primary"
      className="glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-[var(--hairline)] md:hidden"
      style={{ paddingBottom: "var(--safe-b)" }}
    >
      <ul className="mx-auto grid h-[var(--tabbar-h)] max-w-md grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match(path);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="contents">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pressable flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-ocean" : "text-muted",
                )}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.1 : 1.7} />
                {t(tab.key, lang)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MarketLink() {
  return (
    <Link href="/market" className="pressable inline-flex items-center gap-1.5 text-sm font-medium text-ocean">
      <Store className="size-4" /> Market
    </Link>
  );
}

/** Standard page frame for tab pages. */
export function Page({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <>
      <TopNav />
      <main className={cn("pb-tabbar mx-auto w-full px-4 pt-[72px] md:px-6 md:pt-[76px]", wide ? "max-w-6xl" : "max-w-5xl", className)}>
        {children}
      </main>
      <TabBar />
    </>
  );
}
