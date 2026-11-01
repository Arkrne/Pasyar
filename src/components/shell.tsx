"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Compass, MapPinned, Users, Ticket, CircleUserRound, Store, Briefcase, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { t, LANGS } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { SiteFooter } from "./site-footer";

const TABS = [
  { href: "/", key: "plan" as const, icon: Compass, match: (p: string) => p === "/" || p.startsWith("/plan") || p.startsWith("/trip") },
  { href: "/explore", key: "explore" as const, icon: MapPinned, match: (p: string) => p.startsWith("/explore") || p.startsWith("/place") || p.startsWith("/weather") || p.startsWith("/calendar") },
  { href: "/community", key: "community" as const, icon: Users, match: (p: string) => p.startsWith("/community") },
  { href: "/trips", key: "trips" as const, icon: Ticket, match: (p: string) => p.startsWith("/trips") },
  { href: "/profile", key: "profile" as const, icon: CircleUserRound, match: (p: string) => p.startsWith("/profile") },
];

export function Logo({ size = 28, word = true, className, sub }: { size?: number; word?: boolean; className?: string; sub?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image src="/brand/logo.png" alt="" width={Math.round(size * 0.82)} height={size} priority className="h-auto drop-shadow-[0_4px_8px_rgba(10,90,168,0.25)]" style={{ width: size * 0.82 }} />
      {word && (
        <span className="flex flex-col leading-none">
          <span className="text-[20px] font-bold tracking-[-0.03em]">Pasyar</span>
          {sub && <span className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted">Catanduanes</span>}
        </span>
      )}
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
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden((h) => (y > 240 && y > prev + 4 ? true : y < prev - 4 ? false : h));
  });
  const links = [
    { href: "/", label: t("plan", lang), m: TABS[0].match },
    { href: "/explore", label: t("explore", lang), m: (p: string) => p.startsWith("/explore") || p.startsWith("/place") },
    { href: "/weather", label: lang === "en" ? "Weather" : "Panahon", m: (p: string) => p.startsWith("/weather") },
    { href: "/calendar", label: lang === "en" ? "Festivals" : "Pista", m: (p: string) => p.startsWith("/calendar") },
    { href: "/community", label: t("community", lang), m: TABS[2].match },
    { href: "/market", label: t("market", lang), m: (p: string) => p.startsWith("/market") },
    { href: "/trips", label: t("trips", lang), m: TABS[3].match },
  ];
  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5"
      animate={{ y: hidden ? -96 : 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.45 }}
    >
      <nav
        className={cn(
          "glass-strong mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-3 rounded-full pl-4 pr-2 outline outline-1 outline-white/60 transition-shadow duration-300",
          scrolled || !overlay ? "shadow-[0_12px_40px_-12px_rgba(16,40,70,0.25)]" : "shadow-[0_8px_30px_-14px_rgba(16,40,70,0.25)]",
        )}
      >
        <Link href="/" className="pressable shrink-0 rounded-full" aria-label="Pasyar home">
          <Logo size={34} sub />
        </Link>
        <ul className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => {
            const active = l.m(path);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn("relative rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors", active ? "text-ink" : "text-ink-2/80 hover:text-ink")}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-b from-white to-[#f3eee6] shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(0,0,0,0.04)]"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:block">
            <LangSwitch />
          </span>
          <Link href="/business" aria-label={t("business", lang)} title={t("business", lang)} className="pressable hidden size-10 place-items-center rounded-full text-ink-2 hover:bg-black/[0.05] xl:grid">
            <Briefcase className="size-[18px]" />
          </Link>
          <Link href="/profile" aria-label="Profile" className="pressable hidden size-10 place-items-center rounded-full text-ink-2 hover:bg-black/[0.05] md:grid">
            <CircleUserRound className="size-[22px]" strokeWidth={1.7} />
          </Link>
          <Link
            href="/plan"
            className="pressable group relative inline-flex h-11 items-center gap-1.5 overflow-hidden rounded-full px-4 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(234,117,60,0.7)] md:px-5"
            style={{ background: "linear-gradient(110deg, #EA753C 0%, #F6A54F 35%, #2B8FD6 100%)" }}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Sparkles className="relative size-4" />
            <span className="relative">{t("planCta", lang)}</span>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}

export function TabBar() {
  const path = usePathname();
  const lang = useStore((s) => s.lang);
  return (
    <nav
      aria-label="Primary"
      className="glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-[var(--hairline)] lg:hidden"
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
      <main className={cn("pb-tabbar mx-auto w-full px-4 pt-[88px] md:px-6 md:pt-[92px]", wide ? "max-w-6xl" : "max-w-5xl", className)}>
        {children}
      </main>
      <SiteFooter />
      <TabBar />
    </>
  );
}
