"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CalendarPlus, ChevronDown, Map, Sparkles, Waves } from "lucide-react";
import { Page } from "@/components/shell";
import { Chip, Button } from "@/components/ui";
import { useNow } from "@/components/fx";
import { Tile, IslandIcon, MosaicBand, FloatingTiles } from "@/components/icons";
import { FESTIVALS, MONTHS, MONTH_NAMES, SEASON_STYLE, icsFor, type Festival } from "@/data/festivals";
import { TOWNS, TOWN_BY_ID } from "@/data/towns";
import { TOWN_STYLE, ISLAND } from "@/data/palette";
import type { TownId } from "@/data/types";
import { useStore } from "@/lib/store";
import { toast } from "@/components/toast";
import { cn } from "@/lib/cn";
import { Fancy } from "@/components/fancy";

function colorOf(f: Festival) {
  return f.town === "province" ? ISLAND.sunset : TOWN_STYLE[f.town].color;
}
function townName(f: Festival) {
  return f.town === "province" ? "Whole island" : TOWN_BY_ID[f.town].name;
}

function nextDate(f: Festival) {
  const now = new Date();
  let d = new Date(now.getFullYear(), f.month, f.startDay ?? 15);
  if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) d = new Date(now.getFullYear() + 1, f.month, f.startDay ?? 15);
  return d;
}

export default function CalendarPage() {
  const router = useRouter();
  const setDraft = useStore((s) => s.setDraft);
  const nowMs = useNow();
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [town, setTown] = useState<TownId | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("town") as TownId | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of URL on mount
    if (t && TOWN_BY_ID[t]) setTown(t);
  }, []);

  const dated = FESTIVALS.filter((f) => !f.undated && (town === "all" || f.town === town || f.town === "province"));
  const undated = FESTIVALS.filter((f) => f.undated && (town === "all" || f.town === town));
  const inMonth = dated.filter((f) => f.month === month).sort((a, b) => (a.startDay ?? 99) - (b.startDay ?? 99));
  const upcoming = [...dated].sort((a, b) => +nextDate(a) - +nextDate(b)).slice(0, 3);
  const m = MONTHS[month];
  const ss = SEASON_STYLE[m.season];

  const planAround = (f: Festival) => {
    const d = nextDate(f);
    d.setDate(d.getDate() - 1);
    setDraft({ startDate: d.toISOString().slice(0, 10), days: 3 });
    toast("Dates set", `Your plan starts the day before ${f.name}.`);
    router.push("/plan?step=group");
  };

  const download = (f: Festival) => {
    const blob = new Blob([icsFor(f)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${f.id}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Added", "Open the file to save it to your calendar.");
  };

  return (
    <Page wide>
      <section className="mood-festival relative -mx-4 overflow-hidden px-4 pb-12 pt-8 md:-mx-6 md:rounded-b-[40px] md:px-6">
        <FloatingTiles
          className="hidden md:block"
          items={[
            { name: "mask", x: "78%", y: "12%", size: 54, bg: ISLAND.festival, r: 12 },
            { name: "sun", x: "88%", y: "46%", size: 44, bg: ISLAND.sun, r: -8 },
            { name: "flower", x: "68%", y: "58%", size: 40, bg: ISLAND.pink, r: 6 },
            { name: "crab", x: "92%", y: "8%", size: 36, bg: ISLAND.sunset, r: -14 },
            { name: "rooster", x: "72%", y: "30%", size: 34, bg: ISLAND.mango, r: 10, d: 7 },
          ]}
        />
        <p className="t-eyebrow relative text-sunset">Travel calendar</p>
        <h1 className="t-display relative mt-1 max-w-2xl">
          When to come, and <span className="island-word">which</span> <Fancy hat>fiesta</Fancy> <span className="island-word">to catch.</span>
        </h1>
        <p className="t-lead relative mt-3 max-w-xl text-muted">Every town has a feast, and each one has a story. Pick a month to see the weather and what&apos;s on.</p>

        {/* Up next */}
        <div className="relative mt-8 grid gap-3 md:grid-cols-3">
          {nowMs != null && upcoming.map((f, k) => {
            const d = nextDate(f);
            const days = Math.ceil((+d - nowMs) / 864e5);
            return (
              <motion.button
                key={f.id}
                onClick={() => {
                  setMonth(f.month);
                  setOpen(f.id);
                  document.getElementById("month-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6, delay: 0.1 + k * 0.08 }}
                className="pressable flex items-center gap-3 rounded-[24px] bg-white/90 p-4 text-left shadow-[var(--shadow-md)] backdrop-blur"
              >
                <Tile name={f.icon} bg={colorOf(f)} size={50} accent="#F6CB67" />
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-sunset">{k === 0 ? "Up next" : "Coming up"} · in {days} days</span>
                  <span className="block truncate text-[16px] font-semibold">{f.name}</span>
                  <span className="block truncate text-[13px] text-muted">
                    {townName(f)} · {f.dateLabel.split(" (")[0]}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Year ribbon */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted">
          {Object.values(SEASON_STYLE).map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} /> {s.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-festival" /> Fiesta
          </span>
        </div>
        <div className="no-scrollbar -mx-4 mt-4 grid auto-cols-[minmax(76px,1fr)] grid-flow-col gap-1.5 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {MONTHS.map((mm, i) => {
            const st = SEASON_STYLE[mm.season];
            const fests = dated.filter((f) => f.month === i);
            const on = i === month;
            return (
              <button
                key={i}
                onClick={() => setMonth(i)}
                aria-pressed={on}
                className={cn("pressable relative flex flex-col items-center rounded-[22px] px-1 pb-3 pt-3 transition-shadow", on ? "shadow-[var(--shadow-md)]" : "")}
                style={{ background: on ? st.color : st.soft }}
              >
                <span className={cn("text-[13px] font-bold", on ? "text-white" : "text-ink")}>{MONTH_NAMES[i].slice(0, 3)}</span>
                <div className="mt-2 flex h-12 items-end gap-[3px]" aria-label={`Rain level ${mm.rain} of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <motion.span
                      key={n}
                      className="w-[5px] rounded-full"
                      style={{ background: n <= mm.rain ? (on ? "#fff" : "#2B8FD6") : on ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.08)" }}
                      initial={{ height: 0 }}
                      animate={{ height: 8 + n * 7 }}
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6, delay: i * 0.03 + n * 0.02 }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex h-4 items-center gap-1">
                  {mm.surf && <Waves className={cn("size-3.5", on ? "text-white" : "text-sky")} />}
                  {fests.slice(0, 3).map((f) => (
                    <span key={f.id} className="size-2 rounded-full" style={{ background: on ? "#fff" : colorOf(f) }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Month detail */}
      <section id="month-detail" className="mt-8 scroll-mt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={month}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            className="grid gap-5 lg:grid-cols-[1fr_1.6fr]"
          >
            <div className="h-fit rounded-[28px] p-6" style={{ background: ss.soft }}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em]" style={{ color: ss.color }}>
                {ss.label}
              </p>
              <h2 className="mt-1 text-[34px] font-bold tracking-[-0.03em]">{MONTH_NAMES[month]}</h2>
              <p className="mt-1 text-[17px] font-semibold text-ink-2">{m.label}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{m.tip}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {m.surf && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-sky">
                    <IslandIcon name="surf" size={16} color={ISLAND.sky} /> Surf at Puraran
                  </span>
                )}
                {m.season === "best" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-amber">
                    <IslandIcon name="boat" size={16} color="#B26A00" /> Island hopping
                  </span>
                )}
                {m.season === "typhoon" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-terracotta">
                    Keep a buffer day
                  </span>
                )}
              </div>
              <Button
                variant="dark"
                className="mt-6"
                onClick={() => {
                  const y = new Date().getFullYear();
                  const d = new Date(y + (month < new Date().getMonth() ? 1 : 0), month, 10);
                  setDraft({ startDate: d.toISOString().slice(0, 10) });
                  router.push("/plan");
                }}
              >
                <Map className="size-4" /> Plan a {MONTH_NAMES[month]} trip
              </Button>
            </div>

            <div>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
                <Chip active={town === "all"} onClick={() => setTown("all")}>
                  All towns
                </Chip>
                {TOWNS.map((t) => (
                  <Chip key={t.id} active={town === t.id} onClick={() => setTown(t.id)}>
                    <IslandIcon name={TOWN_STYLE[t.id].icon} size={16} color={town === t.id ? "#fff" : TOWN_STYLE[t.id].color} accent="#F6CB67" />
                    {t.name}
                  </Chip>
                ))}
              </div>
              {inMonth.length === 0 ? (
                <div className="flex flex-col items-center rounded-[28px] bg-white/80 p-10 text-center outline outline-1 outline-[var(--hairline)]">
                  <Tile name="palm" bg={ISLAND.lagoon} size={56} />
                  <p className="mt-4 text-[17px] font-semibold">No fiestas on our list this month</p>
                  <p className="mt-1 text-[14px] text-muted">A quieter month means emptier beaches. Barangay fiestas still pop up; ask your host.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {inMonth.map((f, k) => (
                    <FestivalCard key={f.id} f={f} k={k} open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} onPlan={() => planAround(f)} onIcs={() => download(f)} />
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {undated.length > 0 && (
        <section className="mt-10">
          <h2 className="t-headline">Dates to confirm</h2>
          <p className="mt-1 text-[14px] text-muted">These move every year or we couldn&apos;t confirm the date. Ask the municipal tourism office.</p>
          <ul className="mt-3 space-y-3">
            {undated.map((f, k) => (
              <FestivalCard key={f.id} f={f} k={k} open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} onPlan={() => router.push(`/explore?town=${f.town}`)} />
            ))}
          </ul>
        </section>
      )}

      <MosaicBand className="mt-12" />
    </Page>
  );
}

function FestivalCard({ f, k, open, onToggle, onPlan, onIcs }: { f: Festival; k: number; open: boolean; onToggle: () => void; onPlan: () => void; onIcs?: () => void }) {
  const c = colorOf(f);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.5, delay: k * 0.06 }}
      className="overflow-hidden rounded-[24px] bg-white shadow-[var(--shadow-sm)] outline outline-1 outline-[var(--hairline)]"
    >
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left">
        <motion.span animate={open ? { rotate: [0, -8, 8, 0] } : {}} transition={{ duration: 0.5 }}>
          <Tile name={f.icon} bg={c} size={54} accent="#F6CB67" shape={k % 2 ? "circle" : "square"} />
        </motion.span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold" style={{ color: c }}>
            {f.dateLabel}
            {!f.confirmed && " · confirm locally"}
          </span>
          <span className="block text-[18px] font-semibold leading-tight tracking-[-0.01em]">{f.name}</span>
          <span className="block text-[14px] text-muted">
            {townName(f)} · {f.short}
          </span>
        </span>
        <ChevronDown className={cn("size-5 shrink-0 text-muted transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
          >
            <div className="border-t border-[var(--hairline)] px-4 pb-4 pt-3">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
                <Sparkles className="size-3.5" /> The story
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{f.history}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {f.highlights.map((h) => (
                  <li key={h} className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: `${c}18`, color: c }}>
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={onPlan}>
                  <Map className="size-4" /> Plan a trip around this
                </Button>
                {onIcs && (
                  <Button size="sm" variant="ghost" onClick={onIcs}>
                    <CalendarPlus className="size-4" /> Add to my calendar
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
