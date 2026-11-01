"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ForecastPanel } from "@/components/forecast-panel";
import { Clouds, useNow } from "@/components/fx";
import { Reveal } from "@/components/ui";
import { Tile, FloatingTiles } from "@/components/icons";
import { FESTIVALS, MONTHS, MONTH_NAMES, SEASON_STYLE } from "@/data/festivals";
import { TOWN_BY_ID } from "@/data/towns";
import { TOWN_STYLE, ISLAND } from "@/data/palette";

export function ForecastSection() {
  return (
    <section className="mood-sky relative overflow-hidden py-24 md:py-32">
      <Clouds />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="t-eyebrow mb-3 text-ocean">Live forecast</p>
          <h2 className="t-display max-w-3xl text-balance">Rain in the north? The sun is probably out in Baras.</h2>
          <p className="t-lead mt-5 max-w-2xl text-muted">
            Pasyar checks the weather in all 11 towns and the waves at the surf and boat spots, then tells you where to head today.
          </p>
        </Reveal>
        <div className="mt-10">
          <ForecastPanel compact />
        </div>
      </div>
    </section>
  );
}

export function FestivalStrip() {
  const nowMs = useNow();
  const now = new Date();
  const list = FESTIVALS.filter((f) => !f.undated)
    .map((f) => {
      let d = new Date(now.getFullYear(), f.month, f.startDay ?? 15);
      if (d < now) d = new Date(now.getFullYear() + 1, f.month, f.startDay ?? 15);
      return { f, d };
    })
    .sort((a, b) => +a.d - +b.d)
    .slice(0, 6);

  return (
    <section className="mood-festival relative overflow-hidden py-24 md:py-32">
      <FloatingTiles
        className="hidden lg:block"
        items={[
          { name: "mask", x: "86%", y: "10%", size: 58, bg: ISLAND.festival, r: 12 },
          { name: "flower", x: "92%", y: "38%", size: 40, bg: ISLAND.pink, r: -10 },
          { name: "sun", x: "80%", y: "26%", size: 34, bg: ISLAND.sun, r: 8, d: 7 },
        ]}
      />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="t-eyebrow mb-3 text-sunset">Fiestas</p>
          <h2 className="t-display max-w-3xl text-balance">
            Eleven towns, <span className="text-gradient-island">a fiesta almost every month.</span>
          </h2>
          <p className="t-lead mt-5 max-w-2xl text-muted">Crab parades in Panganiban, rooster dances in Bagamanoc, the whole island dancing on its birthday in October. Each one has a story.</p>
        </Reveal>

        {/* season ribbon */}
        <Reveal className="mt-10">
          <div className="flex gap-1 overflow-hidden rounded-full">
            {MONTHS.map((m, i) => (
              <motion.div
                key={i}
                className="flex h-10 flex-1 items-center justify-center text-[11px] font-semibold text-white"
                style={{ background: SEASON_STYLE[m.season].color }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6, delay: i * 0.04 }}
                title={`${MONTH_NAMES[i]}: ${m.label}`}
              >
                <span className="hidden sm:inline">{MONTH_NAMES[i].slice(0, 3)}</span>
                <span className="sm:hidden">{MONTH_NAMES[i][0]}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
            {Object.values(SEASON_STYLE).map((s) => (
              <span key={s.label} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: s.color }} /> {s.label}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="no-scrollbar snap-row -mx-5 mt-10 flex gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {list.map(({ f, d }, k) => {
            const c = f.town === "province" ? ISLAND.sunset : TOWN_STYLE[f.town].color;
            const soft = f.town === "province" ? "#FDEBDF" : TOWN_STYLE[f.town].soft;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 24, rotate: k % 2 ? 1.5 : -1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.7, delay: k * 0.06 }}
                className="w-[280px] shrink-0 md:w-auto"
              >
                <Link href={`/calendar?town=${f.town === "province" ? "" : f.town}`} className="pressable hover-lift block h-full rounded-[26px] p-5" style={{ background: soft }}>
                  <div className="flex items-start justify-between">
                    <Tile name={f.icon} bg={c} size={56} accent="#F6CB67" shape={k % 2 ? "circle" : "square"} />
                    <div className="text-right">
                      <p className="tabular text-[30px] font-bold leading-none tracking-[-0.03em]" style={{ color: c }}>
                        {f.startDay ?? "·"}
                      </p>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-2">{MONTH_NAMES[f.month].slice(0, 3)}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-[19px] font-semibold tracking-[-0.01em]">{f.name}</p>
                  <p className="text-[13px] font-medium" style={{ color: c }}>
                    {f.town === "province" ? "Whole island" : TOWN_BY_ID[f.town].name}
                    {nowMs ? ` · in ${Math.ceil((+d - nowMs) / 864e5)} days` : ""}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-ink-2">{f.history}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <Reveal className="mt-8">
          <Link href="/calendar" className="pressable inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-white">
            Open the travel calendar <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
