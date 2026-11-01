"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MosaicBand, Tile } from "./icons";
import { useNow } from "./fx";
import { FESTIVALS, MONTH_NAMES } from "@/data/festivals";
import { TOWN_BY_ID } from "@/data/towns";
import { ISLAND, TOWN_STYLE } from "@/data/palette";
import { Fancy } from "@/components/fancy";

const COLS = [
  { h: "Travel", l: [["Plan a trip", "/plan"], ["Explore the map", "/explore"], ["7-day weather", "/weather"], ["Fiesta calendar", "/calendar"], ["Community", "/community"], ["Pasalubong market", "/market"]] },
  { h: "Operators", l: [["Pasyar Business", "/business"], ["Tourism insights", "/insights"], ["Getting here", "/explore#logistics"]] },
  { h: "About", l: [["The pitch", "/about"], ["Photo credits", "/credits"], ["Safety & emergencies", "/explore#safety"]] },
];

function NextFiesta() {
  const now = useNow();
  if (!now) return <span className="h-[52px]" />;
  const today = new Date(now);
  const next = FESTIVALS.filter((f) => !f.undated)
    .map((f) => {
      let d = new Date(today.getFullYear(), f.month, f.startDay ?? 15);
      if (d < today) d = new Date(today.getFullYear() + 1, f.month, f.startDay ?? 15);
      return { f, d };
    })
    .sort((a, b) => +a.d - +b.d)[0];
  const days = Math.ceil((+next.d - now) / 864e5);
  const c = next.f.town === "province" ? ISLAND.sunset : TOWN_STYLE[next.f.town].color;
  return (
    <Link href="/calendar" className="pressable group inline-flex items-center gap-3 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 text-white backdrop-blur hover:bg-white/15">
      <Tile name={next.f.icon} bg={c} size={40} shape="circle" accent="#F6CB67" />
      <span className="text-left">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">Next fiesta · in {days} days</span>
        <span className="block text-[15px] font-semibold">
          {next.f.name}, {next.f.town === "province" ? "island-wide" : TOWN_BY_ID[next.f.town].name} · {MONTH_NAMES[next.f.month].slice(0, 3)} {next.f.startDay ?? ""}
        </span>
      </span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="pb-tabbar relative mt-24 overflow-hidden bg-gradient-to-b from-[#0B2236] to-[#06121D] text-white">
      {/* closing CTA over a sunset */}
      <div className="relative mx-auto -mb-2 max-w-6xl px-4 pt-14 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", bounce: 0, duration: 0.9 }}
          className="relative overflow-hidden rounded-[32px]"
        >
          <Image src="/photos/hiyop-heart-cove.webp" alt="" fill sizes="(max-width:1200px) 100vw, 1150px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2236]/90 via-[#0B2236]/55 to-transparent" />
          <div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between md:p-12">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#FFD48A]">Maogmang pag-abot</p>
              <h2 className="mt-2 max-w-xl text-balance text-[clamp(32px,4.6vw,58px)] font-bold leading-[1.02] tracking-[-0.035em]">
                The <Fancy hat>island</Fancy> is waiting. <span className="island-word">Come find your corner of it.</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/plan" className="pressable inline-flex h-13 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[16px] font-semibold text-ink shadow-[var(--shadow-lg)]">
                Plan my trip <ArrowRight className="size-4" />
              </Link>
              <Link href="/explore" className="pressable inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3.5 text-[16px] font-semibold backdrop-blur hover:bg-white/25">
                Explore the island
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-14 grid max-w-6xl gap-10 px-5 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt="" width={46} height={56} className="h-auto w-[40px] drop-shadow-[0_6px_14px_rgba(43,143,214,0.45)]" />
            <div>
              <p className="text-[24px] font-bold tracking-[-0.03em]">Pasyar</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Catanduanes trip planner</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-white/60">
            Plan, book and rediscover the Happy Island with the guides, boatmen and homestays who live there. Built in Catanduanes
            for DOST IGNITE 2026.
          </p>
          <div className="mt-6">
            <NextFiesta />
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.h}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45">{c.h}</p>
            <ul className="mt-4 space-y-2.5">
              {c.l.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[15px] text-white/80 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative mt-14 opacity-90">
        <MosaicBand size={30} className="[--bg:#0A1C2C]" />
      </div>

      {/* giant wordmark */}
      <div className="relative mx-auto max-w-[1400px] select-none overflow-hidden px-2" aria-hidden>
        <motion.p
          initial={{ y: "35%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0, duration: 1.2 }}
          className="pb-[0.04em] text-center font-black leading-[1.08] tracking-[-0.06em]"
          style={{
            fontSize: "clamp(96px, 24vw, 380px)",
            background: "linear-gradient(100deg, #EA753C 0%, #F6CB67 28%, #49C29F 58%, #2B8FD6 85%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            maskImage: "linear-gradient(180deg, #000 78%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg, #000 78%, transparent 100%)",
          }}
        >
          Pasyar
        </motion.p>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="text-[14px] text-white/70">
            Designed and developed by{" "}
            <a href="https://francissaldua.me" target="_blank" rel="noreferrer" className="font-semibold text-white hover:text-[#FFD48A]">
              Francis T. Saldua
            </a>
          </p>
          <a
            href="https://francissaldua.me"
            target="_blank"
            rel="noreferrer"
            className="pressable inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-ink"
          >
            francissaldua.me <ArrowUpRight className="size-3.5" />
          </a>
        </div>
        <p className="mx-auto max-w-6xl px-5 pb-8 text-[12px] leading-relaxed text-white/40 md:px-8">
          Prototype: payments are simulated and operator names are placeholders until partners sign on. Photos from Wikimedia
          Commons contributors under CC licenses. Map data © OpenStreetMap contributors, tiles by OpenFreeMap, routes by OSRM.
          Weather by Open-Meteo.
        </p>
      </div>
    </footer>
  );
}
