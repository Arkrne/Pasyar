"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "motion/react";
import { Page } from "@/components/shell";
import { ForecastPanel } from "@/components/forecast-panel";
import { Clouds } from "@/components/fx";
import { WeatherGlyph } from "@/components/weather-glyph";
import { useForecast, rankTowns, VERDICT } from "@/lib/forecast";
import { cn } from "@/lib/cn";

const ExploreMap = dynamic(() => import("@/components/map/explore-map"), { ssr: false, loading: () => <div className="skeleton h-full w-full" /> });

export default function WeatherPage() {
  const { forecast } = useForecast();
  const [day, setDay] = useState(0);
  const days = forecast?.towns.virac.days ?? [];

  return (
    <Page wide>
      <section className="mood-sky relative -mx-4 overflow-hidden px-4 pb-10 pt-6 md:-mx-6 md:rounded-b-[40px] md:px-6">
        <Clouds />
        <div className="relative flex items-end gap-4">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}>
            <WeatherGlyph code={forecast?.towns.virac.now.code ?? 1} size={84} />
          </motion.div>
          <div>
            <p className="t-eyebrow text-ocean">Island weather</p>
            <h1 className="t-display mt-1">Where&apos;s the sun this week?</h1>
          </div>
        </div>
        <p className="t-lead relative mt-3 max-w-2xl text-muted">
          A forecast for all 11 towns, ranked for travel. Rain on one coast often means sun on the other, so use this to pick your direction each morning.
        </p>
        <div className="relative mt-8">
          <ForecastPanel />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="t-title">Weather map</h2>
            <p className="mt-1 text-[15px] text-muted">Each town colored by how good the day looks.</p>
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {days.map((d, i) => (
              <button
                key={d.date}
                onClick={() => setDay(i)}
                className={cn("pressable shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold", day === i ? "bg-ink text-white" : "bg-white text-ink-2 outline outline-1 outline-[var(--hairline)]")}
              >
                {i === 0 ? "Today" : new Date(d.date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", day: "numeric" })}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-4 h-[64svh] overflow-hidden rounded-[28px] outline outline-1 outline-[var(--hairline)]">
          <ExploreMap selected={null} onSelect={() => {}} places={[]} onPlace={() => {}} weather={forecast} weatherDay={day} showPlaces={false} />
          <div className="glass-strong absolute bottom-3 left-3 z-[500] flex flex-wrap gap-x-3 gap-y-1 rounded-2xl px-3.5 py-2.5 text-[12px] shadow-[var(--shadow-md)]">
            {Object.values(VERDICT).map((v) => (
              <span key={v.label} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: v.color }} /> {v.label}
              </span>
            ))}
          </div>
        </div>
        {forecast && (
          <p className="mt-3 text-[13px] text-muted">
            Best {day === 0 ? "today" : "that day"}: <span className="font-semibold text-ink">{rankTowns(forecast, day)[0]?.town.name}</span>.
          </p>
        )}
      </section>
    </Page>
  );
}
