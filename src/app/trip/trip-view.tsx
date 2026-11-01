"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Bed,
  Bookmark,
  BookmarkCheck,
  Car,
  CloudLightning,
  Coins,
  Lock,
  LockOpen,
  Mountain,
  Plane,
  RefreshCw,
  Share2,
  Shuffle,
  Trash2,
  Utensils,
  Wallet,
} from "lucide-react";
import { useStore, useHydrated, peso } from "@/lib/store";
import { alternativesFor, planTrip, type DayPlan, type Itinerary, type PlanItem, type TripInput } from "@/lib/planner";
import { PLACE_BY_ID } from "@/data/places";
import { OPERATOR_BY_ID } from "@/data/operators";
import { AREA_OF } from "@/lib/planner";
import { useWeather } from "@/lib/weather";
import { Badge, Button, Photo, Sheet, Verified } from "@/components/ui";
import { PlaceSheet } from "@/components/place-sheet";
import { Checkout } from "@/components/checkout";
import { Concierge } from "@/components/concierge";
import { toast } from "@/components/toast";
import { dayColor } from "@/components/map/colors";
import { cn } from "@/lib/cn";
import { useForecast, scoreDay, verdict, VERDICT } from "@/lib/forecast";
import { WeatherGlyph } from "@/components/weather-glyph";
import { festivalsBetween } from "@/data/festivals";
import { Tile } from "@/components/icons";
import { TOWN_STYLE, ISLAND } from "@/data/palette";

const TripMap = dynamic(() => import("@/components/map/trip-map"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

const BUDGET_PER_DAY = { budget: 2500, mid: 4500, comfort: 8000 } as const;

function encode(input: TripInput) {
  const { days, startDate, group, size, budget, interests, arrival, variant, seed } = input;
  return btoa(JSON.stringify({ days, startDate, group, size, budget, interests, arrival, variant, seed }));
}

export function TripView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const current = useStore((s) => s.current);
  const setCurrent = useStore((s) => s.setCurrent);
  const saved = useStore((s) => s.saved);
  const saveTrip = useStore((s) => s.saveTrip);
  const weather = useWeather();
  const [active, setActive] = useState(0);
  const [sheet, setSheet] = useState<string | null>(null);
  const [swap, setSwap] = useState<{ day: number; placeId: string } | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [busy, setBusy] = useState(false);
  const dayRefs = useRef<(HTMLElement | null)[]>([]);

  // Shared links: /trip?i=<base64 input>
  useEffect(() => {
    if (!hydrated) return;
    const i = new URLSearchParams(location.search).get("i");
    if (i) {
      try {
        const input = JSON.parse(atob(i)) as TripInput;
        setCurrent(planTrip(input));
        history.replaceState(null, "", "/trip");
        return;
      } catch {}
    }
    if (!useStore.getState().current) router.replace("/plan");
  }, [hydrated, setCurrent, router]);

  // Scroll-linked active day
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(Number((vis[0].target as HTMLElement).dataset.day));
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    dayRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [current?.id, current?.days.length]);

  const replan = useCallback(
    (patch: Partial<TripInput>, msg?: string) => {
      if (!current) return;
      setBusy(true);
      setTimeout(() => {
        const it = planTrip({ ...current.input, ...patch });
        setCurrent(it);
        setBusy(false);
        if (msg) toast(msg);
      }, 350);
    },
    [current, setCurrent],
  );

  const toggleLock = (day: number, placeId: string) => {
    if (!current) return;
    const locked = { ...(current.input.locked ?? {}) };
    const set = new Set(locked[day] ?? []);
    if (set.has(placeId)) set.delete(placeId);
    else set.add(placeId);
    locked[day] = [...set];
    setCurrent({ ...current, input: { ...current.input, locked } });
    toast(set.has(placeId) ? "Locked" : "Unlocked", set.has(placeId) ? "This stop stays when you regenerate." : undefined, "info");
  };

  const remove = (day: number, placeId: string) => {
    if (!current) return;
    const locked = { ...(current.input.locked ?? {}) };
    locked[day] = (locked[day] ?? []).filter((x) => x !== placeId);
    replan({ removed: [...(current.input.removed ?? []), placeId], locked }, `${PLACE_BY_ID[placeId].name} removed`);
  };

  const doSwap = (day: number, from: string, to: string) => {
    if (!current) return;
    const keep = current.days[day].items.filter((i) => i.type === "place" && i.placeId && !i.serviceId && i.placeId !== from).map((i) => i.placeId!);
    const locked = { ...(current.input.locked ?? {}), [day]: [...keep, to] };
    replan({ locked, removed: [...(current.input.removed ?? []), from] }, `Swapped in ${PLACE_BY_ID[to].name}`);
    setSwap(null);
  };

  const addPlace = (placeId: string) => {
    if (!current) return;
    const area = AREA_OF[PLACE_BY_ID[placeId].town];
    const d = current.days.findIndex((x) => x.area === area && x.index > 0) ;
    const day = d >= 0 ? d : Math.min(1, current.days.length - 1);
    const existing = current.days[day].items.filter((i) => i.type === "place" && i.placeId && !i.serviceId).map((i) => i.placeId!);
    const locked = { ...(current.input.locked ?? {}), [day]: [...new Set([placeId, ...existing.slice(0, 2)])] };
    replan({ locked, removed: (current.input.removed ?? []).filter((x) => x !== placeId) }, `Added to day ${day + 1}`);
    setSheet(null);
  };

  const share = async () => {
    if (!current) return;
    const url = `${location.origin}/trip?i=${encodeURIComponent(encode(current.input))}`;
    try {
      if (navigator.share) await navigator.share({ title: current.title, text: "My Catanduanes trip on Pasyar", url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied", "Anyone with the link sees this plan and can book it.");
      }
    } catch {}
  };

  if (!hydrated || !current) return <div className="skeleton h-dvh w-full" />;

  const it = current;
  const isSaved = saved.some((s) => s.id === it.id);
  const budget = BUDGET_PER_DAY[it.input.budget] * it.input.size * it.input.days;
  const over = it.totals.group > budget;
  const stormMismatch = weather.storm && !it.input.storm;

  return (
    <div className="min-h-dvh bg-white">
      {/* Mobile map on top, desktop map on the right */}
      <div className="md:grid md:grid-cols-[minmax(420px,520px)_1fr]">
        <div className="sticky top-0 z-10 h-[38svh] md:order-2 md:h-dvh">
          <TripMap days={it.days} active={active} onPick={setSheet} />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4">
            <button
              onClick={() => router.push("/")}
              className="glass-strong pressable pointer-events-auto grid size-10 place-items-center rounded-full shadow-[var(--shadow-md)] md:hidden"
              aria-label="Home"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="glass-strong pointer-events-auto ml-auto flex gap-1 rounded-full p-1 shadow-[var(--shadow-md)]">
              {it.days.map((d) => (
                <button
                  key={d.index}
                  onClick={() => dayRefs.current[d.index]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className={cn(
                    "pressable tabular relative h-8 min-w-8 rounded-full px-2.5 text-[13px] font-semibold",
                    active === d.index ? "text-white" : "text-ink-2",
                  )}
                  aria-label={`Day ${d.index + 1}`}
                >
                  {active === d.index && (
                    <motion.span layoutId="daypill" className="absolute inset-0 rounded-full" style={{ background: dayColor(d.index) }} transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />
                  )}
                  <span className="relative">{d.index + 1}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 right-4 z-[500] hidden md:block">
            <Concierge trip={it} />
          </div>
        </div>

        <div className="relative md:order-1 md:h-dvh md:overflow-y-auto md:border-r md:border-[var(--hairline)]">
          <header className="px-5 pb-4 pt-6 md:pt-8">
            <Link href="/" className="pressable mb-6 hidden items-center gap-1 text-[14px] font-medium text-muted md:inline-flex">
              <ArrowLeft className="size-4" /> Pasyar
            </Link>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.6 }}>
              <p className="t-eyebrow text-ocean">Your plan</p>
              <h1 className="t-title mt-1.5 text-balance">{it.title}</h1>
              <p className="mt-2 text-[15px] text-muted">{it.summary}</p>
            </motion.div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge>{new Date(it.days[0].date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – {new Date(it.days[it.days.length - 1].date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</Badge>
              <Badge>{it.input.size} {it.input.size === 1 ? "person" : "people"}</Badge>
              <Badge>{it.input.budget === "budget" ? "Simple" : it.input.budget === "mid" ? "Comfortable" : "Treat ourselves"}</Badge>
              {it.input.variant !== "default" && <Badge tone="ocean">{it.input.variant === "cheaper" ? "Cheaper version" : "More adventurous"}</Badge>}
              {it.input.storm && <Badge tone="coral">Storm mode</Badge>}
            </div>

            {/* Budget meter */}
            <div className="mt-5 rounded-[20px] bg-surface p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[12px] font-medium text-muted">Estimated total</p>
                  <p className="tabular text-[26px] font-bold tracking-[-0.03em]">{peso(it.totals.group)}</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-[15px] font-semibold">{peso(it.totals.perPerson)} / person</p>
                  <p className={cn("text-[12px] font-medium", over ? "text-coral" : "text-leaf")}>
                    {over ? `${peso(it.totals.group - budget)} over your budget` : `${peso(budget - it.totals.group)} under budget`}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <motion.div
                  className={cn("h-full rounded-full", over ? "bg-coral" : "bg-leaf")}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (it.totals.group / budget) * 100)}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.9 }}
                />
              </div>
              <p className="mt-2 text-[12px] text-muted">
                {peso(it.totals.bookable)} bookable now · {peso(it.totals.payOnSite)} paid on site (fees, some meals)
              </p>
            </div>

            {(stormMismatch || it.warnings.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-[20px] bg-coral-soft p-4 text-[#8a3416]">
                <p className="flex items-center gap-2 text-[15px] font-semibold">
                  <CloudLightning className="size-5" /> {stormMismatch ? "Storm coming in" : "Storm mode is on"}
                </p>
                <p className="mt-1 text-[14px]">
                  {stormMismatch
                    ? `Gusts of ${weather.gustKph} km/h${weather.waveM ? ` and ${weather.waveM.toFixed(1)} m waves` : ""} near the island${weather.simulated ? " (simulated)" : ""}. Re-plan around boats and beaches?`
                    : it.warnings[0]}
                </p>
                {stormMismatch && (
                  <Button size="sm" variant="dark" className="mt-3" onClick={() => replan({ storm: true }, "Re-planned for the storm")}>
                    Re-plan for the storm
                  </Button>
                )}
              </motion.div>
            )}

            <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
              <Button size="sm" variant="ghost" onClick={() => replan({ variant: "cheaper", seed: (it.input.seed ?? 1) + 1 }, "Here's a cheaper version")}>
                <Coins className="size-4" /> Cheaper
              </Button>
              <Button size="sm" variant="ghost" onClick={() => replan({ variant: "adventurous", seed: (it.input.seed ?? 1) + 1 }, "More hidden gems, more effort")}>
                <Mountain className="size-4" /> More adventurous
              </Button>
              <Button size="sm" variant="ghost" onClick={() => replan({ seed: (it.input.seed ?? 1) + 7 }, "New plan, locked stops kept")}>
                <RefreshCw className={cn("size-4", busy && "animate-spin")} /> Regenerate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  saveTrip(it);
                  toast("Saved for offline", "Find it in Trips. It opens with no signal.");
                }}
              >
                {isSaved ? <BookmarkCheck className="size-4 text-ocean" /> : <Bookmark className="size-4" />} {isSaved ? "Saved" : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={share}>
                <Share2 className="size-4" /> Share
              </Button>
            </div>
          </header>

          <div className={cn("px-5 pb-40 transition-opacity duration-300", busy && "opacity-40")}>
            {it.days.map((d, k) => (
              <DaySection
                key={`${it.id}-${d.index}`}
                d={d}
                k={k}
                ref={(el) => {
                  dayRefs.current[d.index] = el;
                }}
                locked={it.input.locked?.[d.index] ?? []}
                onOpen={setSheet}
                onLock={(pid) => toggleLock(d.index, pid)}
                onRemove={(pid) => remove(d.index, pid)}
                onSwap={(pid) => setSwap({ day: d.index, placeId: pid })}
              />
            ))}
            <p className="mt-6 text-center text-[12px] text-faint">
              Drive times are estimates for a van on island roads. Fees as last reported; confirm on site.
            </p>
          </div>

          {/* Book bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 md:sticky md:bottom-0">
            <div className="glass-strong border-t border-[var(--hairline)] px-4 pb-[calc(12px+var(--safe-b))] pt-3">
              <div className="mx-auto flex max-w-[520px] items-center gap-3">
                <div className="md:hidden">
                  <Concierge trip={it} className="!py-2 !pl-2 !pr-3 text-[13px]" />
                </div>
                <div className="hidden flex-1 md:block">
                  <p className="text-[12px] text-muted">Bookable now</p>
                  <p className="tabular text-[19px] font-bold">{peso(it.totals.bookable)}</p>
                </div>
                <Button size="lg" className="flex-1 md:flex-none" onClick={() => setCheckout(true)}>
                  <Wallet className="size-5" /> Book · {peso(it.totals.bookable)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PlaceSheet placeId={sheet} onClose={() => setSheet(null)} onAdd={addPlace} />
      <SwapSheet swap={swap} trip={it} onClose={() => setSwap(null)} onPick={doSwap} />
      <Checkout trip={it} open={checkout} onClose={() => setCheckout(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

const ICONS: Record<PlanItem["type"], typeof Plane> = {
  arrival: Plane,
  departure: Plane,
  transfer: Car,
  meal: Utensils,
  stay: Bed,
  place: Mountain,
};


const DaySection = forwardRef<
  HTMLElement,
  {
    d: DayPlan;
    k: number;
    locked: string[];
    onOpen: (id: string) => void;
    onLock: (id: string) => void;
    onRemove: (id: string) => void;
    onSwap: (id: string) => void;
  }
>(function DaySection({ d, k, locked, onOpen, onLock, onRemove, onSwap }, ref) {
  const color = dayColor(d.index);
  return (
    <motion.section
      ref={ref}
      data-day={d.index}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.6, delay: 0.15 + k * 0.12 }}
      className="scroll-mt-[40svh] pt-6 md:scroll-mt-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="flex items-center gap-2.5">
          <span className="tabular grid size-7 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: color }}>
            {d.index + 1}
          </span>
          <span className="text-[19px] font-semibold tracking-[-0.015em]">{d.title}</span>
        </h2>
      </div>
      <DayExtras d={d} />
      <StayBanner d={d} />
      <p className="ml-[38px] mt-0.5 text-[13px] text-muted">
        {new Date(d.date).toLocaleDateString("en-PH", { weekday: "long", month: "short", day: "numeric" })} · {Math.round(d.driveMin / 6) / 10} h driving · {peso(d.cost)}
      </p>

      <ol className="relative ml-[13px] mt-4 border-l-2 border-dashed border-[var(--hairline-strong)] pl-6">
        <AnimatePresence initial={false}>
          {d.items.map((i) => (
            <motion.li
              key={i.key}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative pb-4"
            >
              {i.travelMin > 0 && i.type !== "stay" && (
                <p className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                  <Car className="size-3.5" /> {i.travelMin} min drive
                </p>
              )}
              <span
                className="absolute -left-[33px] top-[calc(var(--off,0px)+14px)] grid size-4 place-items-center rounded-full bg-white"
                style={{ ["--off" as string]: i.travelMin > 0 && i.type !== "stay" ? "26px" : "0px" }}
              >
                <span className="size-2 rounded-full" style={{ background: i.type === "place" && !i.serviceId ? color : "#c7c7cc" }} />
              </span>
              {i.type === "place" && !i.serviceId && i.placeId ? (
                <PlaceCard i={i} locked={locked.includes(i.placeId)} onOpen={onOpen} onLock={onLock} onRemove={onRemove} onSwap={onSwap} />
              ) : (
                <ItemRow i={i} />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </motion.section>
  );
});

function PlaceCard({
  i,
  locked,
  onOpen,
  onLock,
  onRemove,
  onSwap,
}: {
  i: PlanItem;
  locked: boolean;
  onOpen: (id: string) => void;
  onLock: (id: string) => void;
  onRemove: (id: string) => void;
  onSwap: (id: string) => void;
}) {
  const p = PLACE_BY_ID[i.placeId!];
  return (
    <div className="card overflow-hidden">
      <button onClick={() => onOpen(p.id)} className="flex w-full gap-3 p-2.5 text-left">
        <Photo src={p.photo} alt={p.name} className="size-[84px] shrink-0 rounded-[14px]" sizes="84px" />
        <div className="min-w-0 flex-1 py-0.5">
          <p className="tabular text-[12px] font-semibold text-muted">
            {i.time} · {i.durationMin >= 60 ? `${Math.round(i.durationMin / 30) / 2} h` : `${i.durationMin} min`}
          </p>
          <p className="truncate text-[16px] font-semibold leading-snug">{p.name}</p>
          <p className="line-clamp-2 text-[13px] leading-snug text-muted">{p.blurb}</p>
        </div>
      </button>
      <div className="flex items-center justify-between border-t border-[var(--hairline)] px-2.5 py-1.5">
        <span className="pl-1 text-[12px] font-medium text-muted">{p.fee ? `${peso(i.cost)} fees` : "Free entry"}</span>
        <div className="flex gap-0.5">
          <IconBtn label={locked ? "Unlock" : "Lock"} onClick={() => onLock(p.id)} active={locked}>
            {locked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
          </IconBtn>
          <IconBtn label="Swap" onClick={() => onSwap(p.id)}>
            <Shuffle className="size-4" />
          </IconBtn>
          <IconBtn label="Remove" onClick={() => onRemove(p.id)}>
            <Trash2 className="size-4" />
          </IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("pressable grid size-9 place-items-center rounded-full", active ? "bg-ocean-soft text-ocean" : "text-muted hover:bg-surface")}
    >
      {children}
    </button>
  );
}

function ItemRow({ i }: { i: PlanItem }) {
  const Icon = ICONS[i.type];
  const op = i.operatorId ? OPERATOR_BY_ID[i.operatorId] : null;
  return (
    <div className={cn("flex items-center gap-3 rounded-[18px] px-3 py-2.5", i.bookable ? "bg-ocean-soft/60" : "bg-surface")}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white">
        <Icon className="size-4 text-ink-2" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold">
          <span className="tabular mr-1.5 text-muted">{i.time}</span>
          {i.title}
        </p>
        <p className="flex items-center gap-1.5 truncate text-[12px] text-muted">
          {i.subtitle}
          {op?.verified && <Verified label="" />}
        </p>
      </div>
      <div className="text-right">
        {i.cost > 0 && <p className="tabular text-[14px] font-semibold">{peso(i.cost)}</p>}
        <p className={cn("text-[11px] font-medium", i.bookable ? "text-ocean" : "text-muted")}>{i.bookable ? "In checkout" : i.cost ? "Pay on site" : ""}</p>
      </div>
    </div>
  );
}

function SwapSheet({
  swap,
  trip,
  onClose,
  onPick,
}: {
  swap: { day: number; placeId: string } | null;
  trip: Itinerary;
  onClose: () => void;
  onPick: (day: number, from: string, to: string) => void;
}) {
  const alts = useMemo(() => {
    if (!swap) return [];
    const used = trip.days.flatMap((d) => d.items.map((i) => i.placeId).filter(Boolean) as string[]);
    return alternativesFor(swap.placeId, trip.input, used);
  }, [swap, trip]);
  return (
    <Sheet open={!!swap} onClose={onClose} title={swap ? `Instead of ${PLACE_BY_ID[swap.placeId].name}` : ""}>
      <ul className="space-y-2 pb-2">
        {alts.length === 0 && <p className="py-6 text-center text-muted">No other stops nearby. Try regenerating the day.</p>}
        {alts.map((p) => (
          <li key={p.id}>
            <button onClick={() => swap && onPick(swap.day, swap.placeId, p.id)} className="pressable flex w-full items-center gap-3 rounded-[18px] bg-surface p-2.5 text-left hover:bg-surface-2">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-[12px]">
                <Image src={p.photo} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
                  {p.name} {p.gem && <Badge tone="coral">Gem</Badge>}
                </p>
                <p className="line-clamp-2 text-[13px] text-muted">{p.blurb}</p>
              </div>
              <span className="pr-1 text-[13px] font-semibold text-ocean">Swap</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

/** Forecast and any fiesta for this day, right under the day title. */
function DayExtras({ d }: { d: DayPlan }) {
  const { forecast } = useForecast();
  const wx = forecast?.towns[d.baseTown]?.days.find((x) => x.date === d.date);
  const fiestas = festivalsBetween(d.date, 1);
  const hasSea = d.items.some((i) => i.placeId && PLACE_BY_ID[i.placeId]?.seaExposed);
  if (!wx && !fiestas.length) return null;
  const v = wx ? verdict(scoreDay(wx), wx) : null;
  return (
    <div className="ml-[38px] mt-2 flex flex-wrap gap-1.5">
      {wx && v && (
        <span className="inline-flex items-center gap-1 rounded-full py-0.5 pl-1 pr-2.5 text-[12px] font-semibold" style={{ background: VERDICT[v].soft, color: VERDICT[v].color }}>
          <WeatherGlyph code={wx.code} size={22} still /> {wx.max}° · {wx.pop}% rain
          {hasSea && (v === "inland" || v === "stay") ? " · consider swapping this day" : ""}
        </span>
      )}
      {fiestas.slice(0, 2).map((f) => (
        <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4E3] py-0.5 pl-0.5 pr-2.5 text-[12px] font-semibold text-sunset">
          <Tile name={f.icon} bg={f.town === "province" ? ISLAND.sunset : TOWN_STYLE[f.town].color} size={20} /> {f.name}
        </span>
      ))}
    </div>
  );
}

/** The hotel you sleep at tonight, shown up front so the booking is obvious. */
function StayBanner({ d }: { d: DayPlan }) {
  const stay = d.items.find((i) => i.type === "stay");
  if (!stay) return null;
  const op = stay.operatorId ? OPERATOR_BY_ID[stay.operatorId] : null;
  return (
    <div className="ml-[38px] mt-3 flex items-center gap-3 overflow-hidden rounded-[18px] bg-gradient-to-r from-[#1d2b3a] to-[#24405a] p-2 pr-4 text-white shadow-[var(--shadow-md)]">
      {op && <Photo src={op.photo} alt={op.name} className="size-14 shrink-0 rounded-[13px]" sizes="56px" />}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Tonight you sleep at</p>
        <p className="truncate text-[15px] font-semibold">{stay.title}</p>
        <p className="truncate text-[12px] text-white/70">{stay.subtitle}</p>
      </div>
      <div className="text-right">
        <p className="tabular text-[15px] font-bold">{peso(stay.cost)}</p>
        <p className="text-[11px] font-semibold text-[#9FE7D2]">Booked in checkout</p>
      </div>
    </div>
  );
}
