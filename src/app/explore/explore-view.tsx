"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Anchor,
  ArrowRight,
  Bed,
  Bus,
  Car,
  ChevronLeft,
  Gem,
  MapPin,
  Phone,
  Plane,
  Ship,
  ShieldAlert,
  Siren,
  Sparkles,
  TriangleAlert,
  UtensilsCrossed,
} from "lucide-react";
import { Page } from "@/components/shell";
import { Badge, Button, Chip, Photo, Reveal, Stars, Verified } from "@/components/ui";
import { PlaceSheet } from "@/components/place-sheet";
import { PLACES, PLACE_BY_ID } from "@/data/places";
import { TOWNS, TOWN_BY_ID } from "@/data/towns";
import { OPERATORS } from "@/data/operators";
import { ALERTS, EMERGENCY, TRANSPORT } from "@/data/content";
import type { PlaceKind, ServiceKind, TownId } from "@/data/types";
import { useStore, peso } from "@/lib/store";
import Link from "next/link";
import { useForecast } from "@/lib/forecast";
import { TOWN_STYLE } from "@/data/palette";
import { FESTIVALS } from "@/data/festivals";
import { IslandIcon, Tile, MosaicBand } from "@/components/icons";
import { WeatherGlyph } from "@/components/weather-glyph";
import { planTrip } from "@/lib/planner";
import { toast } from "@/components/toast";
import { cn } from "@/lib/cn";

const ExploreMap = dynamic(() => import("@/components/map/explore-map"), { ssr: false, loading: () => <div className="skeleton h-full w-full" /> });

const FILTERS: { id: string; label: string; kinds?: PlaceKind[]; gem?: boolean }[] = [
  { id: "all", label: "Everything" },
  { id: "beach", label: "Beaches", kinds: ["beach", "island"] },
  { id: "surf", label: "Surf", kinds: ["surf"] },
  { id: "falls", label: "Waterfalls", kinds: ["waterfall", "river"] },
  { id: "views", label: "Viewpoints", kinds: ["viewpoint", "nature"] },
  { id: "heritage", label: "Churches & history", kinds: ["heritage", "cave"] },
  { id: "gems", label: "Hidden gems", gem: true },
];

const DIR: { id: ServiceKind; label: string; icon: typeof Bed }[] = [
  { id: "stay", label: "Stays", icon: Bed },
  { id: "tour", label: "Tours & guides", icon: Sparkles },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "transport", label: "Rides", icon: Car },
];

export function ExploreView() {
  const router = useRouter();
  const [town, setTown] = useState<TownId | null>(null);
  const [filter, setFilter] = useState("all");
  const [place, setPlace] = useState<string | null>(null);
  const [dir, setDir] = useState<ServiceKind>("stay");
  const current = useStore((s) => s.current);
  const setCurrent = useStore((s) => s.setCurrent);
  const draft = useStore((s) => s.draft);
  const { forecast } = useForecast();
  const [mode, setMode] = useState<"places" | "weather">("places");

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("town") as TownId | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of URL/cache/external state on mount
    if (t && TOWN_BY_ID[t]) setTown(t);
  }, []);
  useEffect(() => {
    const url = town ? `/explore?town=${town}` : "/explore";
    history.replaceState(null, "", url + location.hash);
  }, [town]);

  const f = FILTERS.find((x) => x.id === filter)!;
  const places = useMemo(
    () => PLACES.filter((p) => (f.kinds ? f.kinds.includes(p.kind) : true) && (f.gem ? p.gem : true)),
    [f],
  );
  const listed = town ? places.filter((p) => p.town === town) : places;
  const t = town ? TOWN_BY_ID[town] : null;

  const addToTrip = (placeId: string) => {
    const p = PLACE_BY_ID[placeId];
    if (current) {
      const day = Math.min(1, current.days.length - 1);
      const locked = { ...(current.input.locked ?? {}), [day]: [...new Set([placeId, ...(current.input.locked?.[day] ?? [])])] };
      setCurrent(planTrip({ ...current.input, locked }));
      toast(`${p.name} added`, "Your plan was rebuilt around it.");
      router.push("/trip");
    } else {
      setCurrent(planTrip({ ...draft, interests: draft.interests.length ? draft.interests : p.interests, locked: { 1: [placeId] }, days: Math.max(2, draft.days) }));
      toast("Trip started", `Built a ${Math.max(2, draft.days)}-day plan around ${p.name}.`);
      router.push("/trip");
    }
  };

  return (
    <Page wide className="!max-w-7xl">
      <div className="pt-4 md:pt-6">
        <p className="t-eyebrow text-muted">Explore</p>
        <h1 className="t-display mt-1">
          The island, <span className="text-gradient-island">town by town.</span>
        </h1>
        <p className="t-lead mt-2 max-w-2xl text-muted">Tap a town on the map to see its history, food, festivals and the people who can take you around.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/weather" className="pressable inline-flex items-center gap-2 rounded-full bg-sky-wash px-4 py-2 text-[14px] font-semibold text-ocean-ink">
            <WeatherGlyph code={2} size={22} /> 7-day forecast
          </Link>
          <Link href="/calendar" className="pressable inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-[14px] font-semibold text-[#8a4a12]">
            <IslandIcon name="mask" size={18} color="#EA753C" /> Fiesta calendar
          </Link>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {FILTERS.map((x) => (
          <Chip key={x.id} active={filter === x.id} onClick={() => setFilter(x.id)}>
            {x.gem && <Gem className="size-3.5" />}
            {x.label}
          </Chip>
        ))}
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative h-[58svh] overflow-hidden rounded-[28px] bg-surface outline outline-1 outline-[var(--hairline)] lg:sticky lg:top-[76px] lg:h-[calc(100dvh-110px)]">
          <ExploreMap
            selected={town}
            onSelect={setTown}
            places={places}
            onPlace={setPlace}
            weather={mode === "weather" ? forecast : null}
            showPlaces={mode === "places" && (!!town || filter !== "all")}
          />
          <div className="glass-strong absolute right-3 top-3 z-[500] flex rounded-full p-1 shadow-[var(--shadow-md)]">
            {(["places", "weather"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn("pressable relative rounded-full px-3.5 py-1.5 text-[13px] font-semibold", mode === m ? "text-white" : "text-ink-2")}
              >
                {mode === m && <motion.span layoutId="mapmode" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
                <span className="relative">{m === "weather" ? "Weather today" : "Places"}</span>
              </button>
            ))}
          </div>
          <AnimatePresence>
            {town && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setTown(null)}
                className="glass-strong pressable absolute left-3 top-3 z-[500] flex items-center gap-1 rounded-full py-2 pl-2 pr-3.5 text-[13px] font-semibold shadow-[var(--shadow-md)]"
              >
                <ChevronLeft className="size-4" /> Whole island
              </motion.button>
            )}
          </AnimatePresence>
          {!town && (
            <div className="glass-strong pointer-events-none absolute bottom-3 left-3 z-[500] rounded-full px-3.5 py-2 text-[13px] font-medium shadow-[var(--shadow-md)]">
              Tap a town to open it
            </div>
          )}
        </div>

        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {t ? (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", bounce: 0, duration: 0.45 }}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[28px]">
                  <Image src={t.cover} alt={t.name} fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <motion.div
                    className="absolute right-4 top-4"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.7, delay: 0.15 }}
                  >
                    <Tile name={TOWN_STYLE[t.id].icon} bg={TOWN_STYLE[t.id].color} size={52} accent="#F6CB67" />
                  </motion.div>
                  <div className="absolute bottom-0 p-5 text-white">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/75">
                      {t.region === "south" ? "South" : t.region === "east" ? "Pacific side" : "North"}
                      {t.population ? ` · Pop. ${t.population}` : ""}
                    </p>
                    <h2 className="mt-1 text-[34px] font-bold leading-none tracking-[-0.03em]">{t.name}</h2>
                    <p className="mt-1.5 text-[15px] text-white/85">{t.tagline}</p>
                  </div>
                </div>

                <Block title="History">
                  <p className="t-body text-ink-2">{t.history}</p>
                </Block>

                <Block title="Best places to go">
                  <ul className="space-y-2">
                    {listed.length === 0 && <p className="text-[14px] text-muted">Nothing here for this filter. Try Everything.</p>}
                    {listed.map((p) => (
                      <li key={p.id}>
                        <button onClick={() => setPlace(p.id)} className="pressable flex w-full items-center gap-3 rounded-[18px] bg-surface p-2.5 text-left hover:bg-surface-2">
                          <Photo src={p.photo} alt={p.name} className="size-16 shrink-0 rounded-[12px]" sizes="64px" />
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
                              {p.name} {p.gem && <Badge tone="coral">Gem</Badge>}
                            </p>
                            <p className="truncate text-[13px] text-muted">{p.blurb}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                              <Stars value={p.rating} size={11} /> {p.rating.toFixed(1)}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Block>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Block title="Local food">
                    <ul className="space-y-2.5">
                      {t.food.map((x) => (
                        <li key={x.name}>
                          <p className="text-[15px] font-semibold">{x.name}</p>
                          <p className="text-[13px] leading-snug text-muted">{x.note}</p>
                        </li>
                      ))}
                    </ul>
                  </Block>
                  <TownWeather town={t.id} />
                </div>

                <FestivalStories town={t.id} />

                <Block title="Getting there">
                  <p className="text-[15px] leading-relaxed text-ink-2">{t.gettingThere}</p>
                  <ul className="mt-3 space-y-1.5">
                    {t.tips.map((x) => (
                      <li key={x} className="flex gap-2 text-[14px] text-muted">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-ocean" /> {x}
                      </li>
                    ))}
                  </ul>
                </Block>

                <OperatorsBlock town={t.id} />

                <div className="mt-5 flex gap-2">
                  <Button size="lg" className="flex-1" onClick={() => listed[0] && addToTrip(listed[0].id)} disabled={!listed[0]}>
                    Add {t.name} to my trip
                  </Button>
                </div>
              </motion.article>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 gap-3">
                  {TOWNS.map((x) => (
                    <button key={x.id} onClick={() => setTown(x.id)} className="pressable hover-zoom group relative aspect-[4/3] overflow-hidden rounded-[20px] text-left">
                      <Image src={x.cover} alt={x.name} fill sizes="(max-width:1024px) 50vw, 20vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                      <span className="absolute bottom-0 p-3 text-white">
                        <span className="block text-[17px] font-bold tracking-[-0.01em]">{x.name}</span>
                        <span className="line-clamp-1 text-[12px] text-white/80">{x.tagline}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <MosaicBand className="mt-14" />
      <Directory dir={dir} setDir={setDir} town={town} />
      <Logistics />

      <PlaceSheet placeId={place} onClose={() => setPlace(null)} onAdd={addToTrip} />
    </Page>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-[24px] bg-white p-5 outline outline-1 outline-[var(--hairline)]">
      <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">{title}</h3>
      {children}
    </section>
  );
}

function OperatorsBlock({ town }: { town: TownId }) {
  const ops = OPERATORS.filter((o) => o.town === town);
  if (!ops.length) return null;
  return (
    <Block title="Book a local">
      <ul className="divide-y divide-[var(--hairline)]">
        {ops.map((o) => (
          <li key={o.id} className="flex items-center gap-3 py-2.5">
            <Photo src={o.photo} alt="" className="size-11 shrink-0 rounded-[12px]" sizes="44px" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
                {o.name} {o.verified && <Verified label="" />}
              </p>
              <p className="truncate text-[12px] text-muted">
                {o.kind === "stay" ? "Stay" : o.kind === "tour" ? "Tour" : o.kind === "food" ? "Food" : "Ride"} · ★ {o.rating} · from {peso(Math.min(...o.services.map((s) => s.price)))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Block>
  );
}

function Directory({ dir, setDir, town }: { dir: ServiceKind; setDir: (d: ServiceKind) => void; town: TownId | null }) {
  const featured = useStore((s) => s.featured);
  const ops = OPERATORS.filter((o) => o.kind === dir && (!town || o.town === town)).sort(
    (a, b) => Number(!!(featured[b.id] ?? b.featured)) - Number(!!(featured[a.id] ?? a.featured)) || b.rating - a.rating,
  );
  return (
    <section className="mt-16">
      <Reveal>
        <h2 className="t-title">Directory{town ? ` · ${TOWN_BY_ID[town].name}` : ""}</h2>
        <p className="mt-1 text-[15px] text-muted">Every listing is a local business. Verified means we met them and checked permits.</p>
      </Reveal>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {DIR.map((d) => (
          <Chip key={d.id} active={dir === d.id} onClick={() => setDir(d.id)}>
            <d.icon className="size-4" /> {d.label}
          </Chip>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ops.length === 0 && <p className="text-muted">No {DIR.find((d) => d.id === dir)?.label.toLowerCase()} listed in this town yet.</p>}
        {ops.map((o) => (
          <article key={o.id} className="card hover-zoom overflow-hidden">
            <div className="relative aspect-[16/9]">
              <Image src={o.photo} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
              {(featured[o.id] ?? o.featured) && <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold">Featured</span>}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-[16px] font-semibold">{o.name}</h3>
                {o.verified && <Verified label="" />}
              </div>
              <p className="text-[12px] text-muted">
                {TOWN_BY_ID[o.town].name} · ★ {o.rating} ({o.reviews}) · since {o.since}
              </p>
              <p className="mt-2 line-clamp-2 text-[14px] text-ink-2">{o.blurb}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="tabular text-[15px] font-semibold">
                  from {peso(Math.min(...o.services.map((s) => s.price)))}
                  <span className="text-[12px] font-normal text-muted"> / {o.services[0].unit}</span>
                </span>
                <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="pressable grid size-9 place-items-center rounded-full bg-surface" aria-label={`Call ${o.name}`}>
                  <Phone className="size-4" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const MODE_ICON = { flight: Plane, "fast-craft": Ship, roro: Anchor, van: Bus };

function Logistics() {
  return (
    <section id="logistics" className="mt-16 scroll-mt-24">
      <Reveal>
        <h2 className="t-title">Getting here and around</h2>
        <p className="mt-1 text-[15px] text-muted">Sample schedule. Boats stop at Signal No. 1 and above, so confirm with the airline or port before you go.</p>
      </Reveal>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-[24px] bg-[#111316] text-white">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50 md:grid-cols-[1.6fr_1fr_auto_auto]">
            <span>Route</span>
            <span className="hidden md:block">Operator</span>
            <span>Departs</span>
            <span>Status</span>
          </div>
          <ul>
            {TRANSPORT.map((r, k) => {
              const I = MODE_ICON[r.mode];
              return (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: k * 0.04 }}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-white/[0.06] px-5 py-3 md:grid-cols-[1.6fr_1fr_auto_auto]"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <I className="size-4 shrink-0 text-white/60" />
                    <span className="truncate text-[14px] font-medium">
                      {r.from} → {r.to}
                    </span>
                  </span>
                  <span className="hidden truncate text-[13px] text-white/60 md:block">{r.operator}</span>
                  <span className="tabular font-mono text-[15px] text-[#ffd479]">{r.depart.length > 5 ? r.depart.split(" ")[0] : r.depart}</span>
                  <span className={cn("text-[12px] font-semibold", r.status === "On time" ? "text-[#5ed38a]" : r.status === "Boarding" ? "text-[#7fc4ff]" : "text-coral")}>{r.status}</span>
                </motion.li>
              );
            })}
          </ul>
        </div>
        <div id="safety" className="scroll-mt-24 space-y-3">
          {ALERTS.map((a) => (
            <div key={a.id} className={cn("flex gap-3 rounded-[20px] p-4", a.level === "warn" ? "bg-coral-soft text-[#8a3416]" : "bg-amber-soft text-[#7a4900]")}>
              <TriangleAlert className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-[15px] font-semibold">{a.title}</p>
                <p className="text-[13px] leading-snug">{a.body}</p>
              </div>
            </div>
          ))}
          <div className="rounded-[20px] bg-surface p-4">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <Siren className="size-5 text-coral" /> Emergency
            </p>
            <ul className="mt-2 space-y-1.5">
              {EMERGENCY.map((e) => (
                <li key={e.label} className="flex justify-between gap-3 text-[14px]">
                  <span className="text-muted">{e.label}</span>
                  <span className="shrink-0 font-semibold">{e.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3 rounded-[20px] bg-surface p-4 text-[13px] text-muted">
            <ShieldAlert className="size-5 shrink-0 text-ocean" />
            Guides marked Verified carry a barangay or LGU accreditation we have seen in person.
          </div>
          <Button href="/plan" variant="secondary" className="w-full">
            Plan around these <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}


function TownWeather({ town }: { town: TownId }) {
  const { forecast } = useForecast();
  const days = forecast?.towns[town]?.days ?? [];
  return (
    <Block title="Weather this week">
      {!days.length ? (
        <div className="skeleton h-24 rounded-2xl" />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <div key={d.date} className={cn("flex flex-col items-center rounded-2xl py-1.5", i === 0 && "bg-sky-wash")}>
              <span className="text-[10px] font-semibold text-muted">
                {i === 0 ? "Today" : new Date(d.date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "narrow" })}
              </span>
              <WeatherGlyph code={d.code} size={30} still={i !== 0} />
              <span className="tabular text-[12px] font-bold">{d.max}°</span>
              <span className="tabular text-[10px] text-muted">{d.pop}%</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/weather" className="mt-3 inline-block text-[13px] font-semibold text-ocean">
        Compare all towns
      </Link>
    </Block>
  );
}

function FestivalStories({ town }: { town: TownId }) {
  const list = FESTIVALS.filter((f) => f.town === town);
  const color = TOWN_STYLE[town].color;
  if (!list.length) return null;
  return (
    <section className="mt-4 overflow-hidden rounded-[24px] outline outline-1 outline-[var(--hairline)]" style={{ background: TOWN_STYLE[town].soft }}>
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em]" style={{ color }}>
          Fiestas and the stories behind them
        </h3>
        <Link href={`/calendar?town=${town}`} className="text-[13px] font-semibold text-ocean">
          Calendar
        </Link>
      </div>
      <ul className="space-y-3 p-5">
        {list.map((f, k) => (
          <motion.li
            key={f.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0, duration: 0.5, delay: k * 0.06 }}
            className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-start gap-3">
              <Tile name={f.icon} bg={color} size={42} accent="#F6CB67" shape={k % 2 ? "circle" : "square"} />
              <div className="min-w-0">
                <p className="text-[16px] font-semibold leading-tight">{f.name}</p>
                <p className="mt-0.5 text-[12px] font-semibold" style={{ color }}>
                  {f.dateLabel}
                  {!f.confirmed && " · confirm locally"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{f.history}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {f.highlights.map((h) => (
                <li key={h} className="rounded-full bg-surface px-2.5 py-1 text-[12px] text-ink-2">
                  {h}
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
