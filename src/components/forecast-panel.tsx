"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Droplets, Waves, Wind } from "lucide-react";
import { useForecast, rankTowns, headline, seaVerdict, VERDICT } from "@/lib/forecast";
import { TOWN_STYLE } from "@/data/palette";
import { PLACE_BY_ID } from "@/data/places";
import { WeatherGlyph } from "./weather-glyph";
import { IslandIcon } from "./icons";
import { cn } from "@/lib/cn";

const dow = (iso: string, i: number) =>
  i === 0 ? "Today" : i === 1 ? "Tomorrow" : new Date(iso + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short" });

export function ForecastPanel({ compact = false }: { compact?: boolean }) {
  const { forecast: f, loading } = useForecast();
  const [day, setDay] = useState(0);

  if (loading || !f) {
    return (
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="skeleton h-56 rounded-[28px]" />
        <div className="skeleton h-56 rounded-[28px]" />
      </div>
    );
  }

  const virac = f.towns.virac.days;
  const ranked = rankTowns(f, day);
  const h = headline(f, day);
  const best = ranked[0];
  const style = TOWN_STYLE[best.town.id];

  return (
    <div>
      {/* 7-day strip */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {virac.map((d, i) => (
          <button
            key={d.date}
            onClick={() => setDay(i)}
            aria-pressed={day === i}
            className={cn(
              "pressable relative flex w-[78px] shrink-0 flex-col items-center rounded-[22px] px-2 pb-2.5 pt-2 transition-colors",
              day === i ? "text-white" : "bg-white/80 text-ink outline outline-1 outline-[var(--hairline)] hover:bg-white",
            )}
          >
            {day === i && (
              <motion.span layoutId={compact ? "wxday-c" : "wxday"} className="absolute inset-0 rounded-[22px] bg-gradient-to-b from-sky to-ocean" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />
            )}
            <span className="relative text-[12px] font-semibold">{dow(d.date, i)}</span>
            <span className="relative -my-0.5">
              <WeatherGlyph code={d.code} size={40} still={day !== i} />
            </span>
            <span className="tabular relative text-[15px] font-bold">{d.max}°</span>
            <span className={cn("tabular relative text-[11px]", day === i ? "text-white/80" : "text-muted")}>{d.pop}% rain</span>
          </button>
        ))}
      </div>

      <div className={cn("mt-4 grid gap-4", !compact && "lg:grid-cols-[1.15fr_1fr]")}>
        {/* headline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            className="relative overflow-hidden rounded-[28px] p-6 text-white"
            style={{ background: `linear-gradient(135deg, ${style.color} 0%, #2B8FD6 120%)` }}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 opacity-25">
              <IslandIcon name={style.icon} size={170} color="#fff" accent="rgba(255,255,255,.6)" />
            </div>
            <p className="relative text-[12px] font-semibold uppercase tracking-[0.08em] text-white/80">Where to go {dow(virac[day].date, day).toLowerCase()}</p>
            <h3 className="relative mt-2 max-w-md text-[26px] font-bold leading-tight tracking-[-0.02em]">{h.title}</h3>
            <p className="relative mt-2 max-w-md text-[15px] leading-relaxed text-white/90">{h.body}</p>
            <div className="relative mt-5 flex flex-wrap gap-2">
              {best.town.placeIds.slice(0, 3).map((id) => (
                <Link key={id} href={`/explore?town=${best.town.id}`} className="glass-dark rounded-full px-3 py-1.5 text-[13px] font-semibold text-white">
                  {PLACE_BY_ID[id]?.name}
                </Link>
              ))}
            </div>
            <div className="relative mt-5 flex items-center gap-5 text-[13px] text-white/85">
              <span className="flex items-center gap-1.5">
                <Droplets className="size-4" /> {best.day.rain} mm
              </span>
              <span className="flex items-center gap-1.5">
                <Wind className="size-4" /> {best.day.gust} km/h gusts
              </span>
              <span>UV {best.day.uv}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ranked towns */}
        <div className="rounded-[28px] bg-white/85 p-4 shadow-[var(--shadow-sm)] outline outline-1 outline-[var(--hairline)] backdrop-blur">
          <p className="px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">All 11 towns</p>
          <ul className={cn("mt-2", compact ? "grid grid-cols-1 gap-1 sm:grid-cols-2" : "space-y-1")}>
            {ranked.slice(0, compact ? 6 : 11).map((r, k) => {
              const v = VERDICT[r.verdict];
              const ts = TOWN_STYLE[r.town.id];
              return (
                <motion.li
                  key={r.town.id}
                  layout
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4, delay: k * 0.03 }}
                >
                  <Link href={`/explore?town=${r.town.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-surface">
                    <span className="grid size-8 shrink-0 place-items-center rounded-[10px]" style={{ background: ts.soft }}>
                      <IslandIcon name={ts.icon} size={20} color={ts.color} accent="#F6CB67" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{r.town.name}</span>
                    <WeatherGlyph code={r.day.code} size={30} still />
                    <span className="tabular w-9 text-right text-[14px] font-semibold">{r.day.max}°</span>
                    <span className="hidden w-[104px] shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-semibold sm:block" style={{ background: v.soft, color: v.color }}>
                      {v.label}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* sea */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {f.sea.map((s) => {
          const m = s.days[day] ?? s.now;
          const sv = seaVerdict(m ?? null);
          return (
            <div key={s.id} className="relative overflow-hidden rounded-[22px] bg-white/85 p-4 outline outline-1 outline-[var(--hairline)]">
              <motion.div
                className="absolute inset-x-0 bottom-0 h-8 opacity-30"
                style={{ background: "repeating-linear-gradient(90deg, transparent 0 18px, rgba(43,143,214,.35) 18px 36px)" }}
                animate={{ x: [0, -36] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                aria-hidden
              />
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
                <Waves className="size-3.5" /> {s.label}
              </p>
              <p className="tabular mt-1 text-[24px] font-bold tracking-[-0.02em]">{m != null ? `${m.toFixed(1)} m` : "—"}</p>
              <p
                className={cn(
                  "text-[12px] font-semibold",
                  sv.tone === "ok" && "text-leaf",
                  sv.tone === "warn" && "text-amber",
                  sv.tone === "bad" && "text-festival",
                  sv.tone === "muted" && "text-muted",
                )}
              >
                {s.id === "puraran" && m != null && m >= 1.2 && m < 2.5 ? "Surfable" : sv.label}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] text-muted">
        {f.source === "live" ? "Live forecast from Open-Meteo, refreshed every 15 minutes." : "Sample forecast shown: live weather couldn't be reached."} Check PAGASA advisories before boat trips.
      </p>
      {compact && (
        <Link href="/weather" className="mt-4 inline-flex items-center gap-1 text-[15px] font-semibold text-ocean">
          Full 7-day forecast and map <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
