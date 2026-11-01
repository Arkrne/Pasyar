"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useForecast, rankTowns, headline, seaVerdict, VERDICT } from "@/lib/forecast";
import { PLACE_BY_ID } from "@/data/places";
import { TOWN_STYLE } from "@/data/palette";
import { WeatherGlyph, Meteocon, kindOf } from "./weather-glyph";
import { cn } from "@/lib/cn";

const dow = (iso: string, i: number) =>
  i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(iso + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short" });

/** Card tint per weather type. */
const SKY: Record<string, string> = {
  sun: "linear-gradient(160deg,#FFF3D1 0%,#FFD9A8 100%)",
  partly: "linear-gradient(160deg,#FFF6E3 0%,#D9ECFB 100%)",
  cloud: "linear-gradient(160deg,#F2F5F8 0%,#DCE4EC 100%)",
  rain: "linear-gradient(160deg,#E7F1FB 0%,#C3DCF3 100%)",
  storm: "linear-gradient(160deg,#E3E6F0 0%,#AEB8D0 100%)",
  fog: "linear-gradient(160deg,#F3F4F5 0%,#DFE3E6 100%)",
};

export function ForecastPanel({ compact = false }: { compact?: boolean }) {
  const { forecast: f, loading } = useForecast();
  const [day, setDay] = useState(0);

  if (loading || !f) {
    return (
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="skeleton h-72 rounded-[32px]" />
        <div className="skeleton h-72 rounded-[32px]" />
      </div>
    );
  }

  const virac = f.towns.virac.days;
  const ranked = rankTowns(f, day);
  const h = headline(f, day);
  const best = ranked[0];
  const st = TOWN_STYLE[best.town.id];

  return (
    <div>
      {/* 7-day strip */}
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-3 pt-1 md:mx-0 md:px-0">
        {virac.map((d, i) => {
          const on = day === i;
          return (
            <motion.button
              key={d.date}
              onClick={() => setDay(i)}
              aria-pressed={on}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative flex w-[92px] shrink-0 flex-col items-center rounded-[26px] px-2 pb-3 pt-2.5 transition-shadow",
                on ? "text-white shadow-[0_18px_36px_-14px_rgba(10,108,191,.65)]" : "text-ink shadow-[0_8px_20px_-12px_rgba(16,40,70,.35)] ring-1 ring-white/70",
              )}
              style={{ background: on ? "linear-gradient(165deg,#3AA0F0 0%,#0A6CBF 60%,#08508F 100%)" : SKY[kindOf(d.code)] }}
            >
              {on && <span className="pointer-events-none absolute inset-x-3 top-1 h-6 rounded-full bg-white/25 blur-md" />}
              <span className="relative text-[12px] font-semibold">{dow(d.date, i)}</span>
              <WeatherGlyph code={d.code} size={58} />
              <span className="tabular relative -mt-1 text-[19px] font-bold">{d.max}°</span>
              <span className="relative mt-1.5 h-1 w-12 overflow-hidden rounded-full bg-black/10">
                <span className={cn("block h-full rounded-full", on ? "bg-white" : "bg-sky")} style={{ width: `${d.pop}%` }} />
              </span>
              <span className={cn("tabular relative mt-1 text-[11px] font-medium", on ? "text-white/85" : "text-ink-2/70")}>{d.pop}% rain</span>
            </motion.button>
          );
        })}
      </div>

      <div className={cn("mt-3 grid gap-4", !compact && "lg:grid-cols-[1.1fr_1fr]")}>
        {/* Where to go: photo card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${day}-${best.town.id}`}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="relative min-h-[300px] overflow-hidden rounded-[32px] text-white shadow-[0_30px_60px_-30px_rgba(10,40,70,.6)]"
          >
            <Image src={best.town.cover} alt={best.town.name} fill sizes="(max-width:1024px) 100vw, 600px" className="object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(100deg, rgba(8,24,40,.88) 0%, rgba(8,24,40,.55) 55%, ${st.color}55 100%)` }} />
            <div className="absolute -right-4 -top-4 drop-shadow-[0_12px_24px_rgba(0,0,0,.35)]">
              <WeatherGlyph code={best.day.code} size={150} />
            </div>
            <div className="relative flex h-full flex-col p-6 md:p-7">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] backdrop-blur">
                <span className="size-1.5 rounded-full" style={{ background: st.color }} /> Where to go {dow(virac[day].date, day).toLowerCase()}
              </p>
              <h3 className="mt-3 max-w-md text-[30px] font-bold leading-[1.05] tracking-[-0.01em]">{h.title}</h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/85">{h.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {best.town.placeIds.slice(0, 3).map((id) => (
                  <Link key={id} href={`/explore?town=${best.town.id}`} className="pressable rounded-full bg-white/90 px-3.5 py-1.5 text-[13px] font-semibold text-ink hover:bg-white">
                    {PLACE_BY_ID[id]?.name}
                  </Link>
                ))}
              </div>
              <div className="mt-auto grid grid-cols-3 gap-2 pt-6">
                {[
                  ["raindrops", `${best.day.rain} mm`, "Rain"],
                  ["wind", `${best.day.gust} km/h`, "Gusts"],
                  ["uv-index", `${best.day.uv}`, "UV index"],
                ].map(([icon, v, l]) => (
                  <div key={l} className="flex items-center gap-1.5 rounded-2xl bg-white/12 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur-md">
                    <Meteocon name={icon} size={34} />
                    <span className="leading-tight">
                      <span className="tabular block text-[15px] font-bold">{v}</span>
                      <span className="block text-[11px] text-white/70">{l}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* All towns */}
        <div className="rounded-[32px] bg-white/90 p-3 shadow-[0_24px_50px_-30px_rgba(16,40,70,.45)] ring-1 ring-black/[0.04] backdrop-blur">
          <p className="px-3 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">All 11 towns, best first</p>
          <ul className={cn("grid gap-1", compact ? "sm:grid-cols-2" : "")}>
            {ranked.slice(0, compact ? 6 : 11).map((r, k) => {
              const v = VERDICT[r.verdict];
              return (
                <motion.li
                  key={r.town.id}
                  layout
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4, delay: k * 0.025 }}
                >
                  <Link href={`/explore?town=${r.town.id}`} className="group flex items-center gap-3 rounded-[20px] p-2 transition-colors hover:bg-surface">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-[14px] ring-2 ring-white shadow-[0_6px_14px_-6px_rgba(0,0,0,.4)]">
                      <Image src={r.town.cover} alt="" fill sizes="48px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      {k === 0 && <span className="absolute inset-x-0 bottom-0 bg-[#F6CB67] text-center text-[9px] font-bold text-ink">BEST</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{r.town.name}</span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                          <span className="block h-full rounded-full bg-sky" style={{ width: `${r.day.pop}%` }} />
                        </span>
                        <span className="tabular text-[11px] text-muted">{r.day.pop}%</span>
                      </span>
                    </span>
                    <WeatherGlyph code={r.day.code} size={42} />
                    <span className="tabular w-9 text-right text-[16px] font-bold">{r.day.max}°</span>
                    <span className="hidden w-[108px] shrink-0 items-center justify-center gap-1.5 rounded-full py-1 text-[11px] font-semibold sm:flex" style={{ background: v.soft, color: v.color }}>
                      <span className="size-1.5 rounded-full" style={{ background: v.color }} /> {v.label}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Sea conditions */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {f.sea.map((s, k) => {
          const m = s.days[day] ?? s.now;
          const sv = seaVerdict(m ?? null);
          const surf = s.id === "puraran" && m != null && m >= 1.2 && m < 2.5;
          return (
            <div
              key={s.id}
              className="relative h-[150px] overflow-hidden rounded-[26px] p-4 text-white shadow-[0_20px_40px_-24px_rgba(10,60,110,.7)]"
              style={{ background: ["linear-gradient(160deg,#3AA0F0,#0A5AA8)", "linear-gradient(160deg,#49C29F,#0F7E6C)", "linear-gradient(160deg,#2B8FD6,#0F7E6C)", "linear-gradient(160deg,#5BB8E8,#2B6FB6)"][k % 4] }}
            >
              <svg className="absolute inset-x-0 bottom-0 h-14 w-[200%]" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
                <motion.path
                  d="M0 30 Q25 18 50 30 T100 30 T150 30 T200 30 T250 30 T300 30 T350 30 T400 30 V60 H0Z"
                  fill="rgba(255,255,255,.18)"
                  animate={{ x: [0, -100] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                  d="M0 40 Q25 30 50 40 T100 40 T150 40 T200 40 T250 40 T300 40 T350 40 T400 40 V60 H0Z"
                  fill="rgba(255,255,255,.25)"
                  animate={{ x: [-100, 0] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                />
              </svg>
              <p className="relative text-[12px] font-semibold text-white/80">{s.label}</p>
              <p className="tabular relative mt-1 text-[30px] font-bold leading-none tracking-[-0.02em]">{m != null ? `${m.toFixed(1)} m` : "—"}</p>
              <span className="relative mt-2 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-[12px] font-semibold backdrop-blur">
                {surf ? "Surfable" : sv.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] text-muted">
        {f.source === "live" ? "Live forecast from Open-Meteo, refreshed every 15 minutes." : "Sample forecast shown: live weather couldn't be reached."} Check PAGASA advisories before boat trips.
        Weather icons: Meteocons by Bas Milius.
      </p>
      {compact && (
        <Link href="/weather" className="mt-4 inline-flex items-center gap-1 text-[15px] font-semibold text-ocean">
          Full 7-day forecast and map <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
