"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Minus, Plane, Plus, Ship, X, Anchor, User, Heart, Users, Baby } from "lucide-react";
import { useStore, peso } from "@/lib/store";
import { planTrip, type Arrival, type Budget, type Group } from "@/lib/planner";
import { INTERESTS } from "@/data/content";
import { PLACES } from "@/data/places";
import { OPERATORS } from "@/data/operators";
import { useWeather } from "@/lib/weather";
import { cn } from "@/lib/cn";
import { festivalsBetween } from "@/data/festivals";
import { TOWN_BY_ID } from "@/data/towns";
import { TOWN_STYLE, ISLAND } from "@/data/palette";
import { Tile } from "@/components/icons";
import { LogoLoader } from "@/components/splash";

const STEPS = ["days", "group", "budget", "interests", "arrival"] as const;
type Step = (typeof STEPS)[number];

const BUDGETS: { id: Budget; label: string; perDay: number; note: string }[] = [
  { id: "budget", label: "Keep it simple", perDay: 2500, note: "Fan rooms, carinderias, habal-habal" },
  { id: "mid", label: "Comfortable", perDay: 4500, note: "Air-con rooms, a van, a few guided tours" },
  { id: "comfort", label: "Treat ourselves", perDay: 8000, note: "Sea-view rooms, private boats, every tour" },
];

const GROUPS: { id: Group; label: string; size: number; icon: typeof User; sub: string }[] = [
  { id: "solo", label: "Just me", size: 1, icon: User, sub: "Habal-habal and homestays" },
  { id: "couple", label: "Two of us", size: 2, icon: Heart, sub: "Sunrise spots and quiet coves" },
  { id: "friends", label: "Barkada", size: 4, icon: Users, sub: "One van, shared rooms" },
  { id: "family", label: "Family", size: 5, icon: Baby, sub: "Easy walks, no 6-hour hikes" },
];

const ARRIVALS: { id: Arrival; label: string; sub: string; icon: typeof Plane }[] = [
  { id: "flight", label: "Fly to Virac", sub: "Cebu Pacific from Manila, about 1 hr 10 min", icon: Plane },
  { id: "ferry-virac", label: "Fast craft to Virac", sub: "From Tabaco, Albay, about 1 hr 30 min", icon: Ship },
  { id: "ferry-san-andres", label: "RoRo to San Andres", sub: "From Tabaco with your car or bus, about 2 hr 30 min", icon: Anchor },
];

export function Wizard() {
  const router = useRouter();
  const draft = useStore((s) => s.draft);
  const setDraft = useStore((s) => s.setDraft);
  const toggle = useStore((s) => s.toggleInterest);
  const setCurrent = useStore((s) => s.setCurrent);
  const weather = useWeather();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    const s = new URLSearchParams(location.search).get("step") as Step | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of URL/cache/external state on mount
    if (s && STEPS.includes(s)) setI(STEPS.indexOf(s));
  }, []);

  const step = STEPS[i];
  const canNext = step !== "interests" || draft.interests.length > 0;

  const finish = useCallback(() => {
    setBuilding(true);
    const it = planTrip({ ...draft, storm: weather.storm, seed: Math.floor(Math.random() * 1e6) });
    setCurrent(it);
    setTimeout(() => router.push("/trip"), 2100);
  }, [draft, weather.storm, setCurrent, router]);

  const next = useCallback(() => {
    if (!canNext) return;
    if (i === STEPS.length - 1) return finish();
    setDir(1);
    setI((x) => x + 1);
  }, [canNext, i, finish]);
  const back = () => {
    if (i === 0) return router.push("/");
    setDir(-1);
    setI((x) => x - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !building) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, building]);

  if (building) return <Building storm={weather.storm} />;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {/* progress */}
      <div className="fixed inset-x-0 top-0 z-30 bg-white/90 backdrop-blur">
        <div className="h-[3px] bg-surface">
          <motion.div
            className="h-full bg-ocean"
            animate={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
        </div>
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <button onClick={back} className="pressable grid size-10 place-items-center rounded-full bg-black/[0.05]" aria-label="Back">
            <ArrowLeft className="size-5" />
          </button>
          <span className="tabular text-[13px] font-semibold text-muted">
            {i + 1} of {STEPS.length}
          </span>
          <Link href="/" className="pressable grid size-10 place-items-center rounded-full bg-black/[0.05]" aria-label="Close">
            <X className="size-5" />
          </Link>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-32 pt-24 md:pt-28">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.section
            key={step}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            className="flex flex-1 flex-col"
          >
            {step === "days" && (
              <Scene title="How many days do you have?" sub="Count the day you arrive and the day you leave.">
                <div className="mt-10 flex items-center justify-center gap-6">
                  <RoundBtn label="Fewer days" onClick={() => setDraft({ days: Math.max(1, draft.days - 1) })}>
                    <Minus className="size-6" />
                  </RoundBtn>
                  <div className="w-36 text-center">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p
                        key={draft.days}
                        initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                        className="tabular text-[112px] font-bold leading-none tracking-[-0.05em]"
                      >
                        {draft.days}
                      </motion.p>
                    </AnimatePresence>
                    <p className="mt-1 text-[15px] font-medium text-muted">{draft.days === 1 ? "day" : "days"}</p>
                  </div>
                  <RoundBtn label="More days" onClick={() => setDraft({ days: Math.min(7, draft.days + 1) })}>
                    <Plus className="size-6" />
                  </RoundBtn>
                </div>
                <div className="mx-auto mt-10 flex max-w-sm flex-col gap-2">
                  <label htmlFor="start" className="text-[13px] font-semibold text-muted">
                    Arriving on
                  </label>
                  <input
                    id="start"
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => setDraft({ startDate: e.target.value })}
                    className="h-12 rounded-2xl bg-surface px-4 font-medium outline-none"
                  />
                </div>
                <FiestaHint start={draft.startDate} days={draft.days} />
                <p className="mt-6 text-center text-[14px] text-muted">
                  {draft.days <= 2 ? "Enough for Virac and the Pacific side." : draft.days <= 4 ? "Enough to reach the north." : "Enough for the whole island at a slow pace."}
                </p>
              </Scene>
            )}

            {step === "group" && (
              <Scene title="Who's coming?" sub="We size rooms, vans and boats to fit.">
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {GROUPS.map((g) => (
                    <Choice
                      key={g.id}
                      active={draft.group === g.id}
                      onClick={() => setDraft({ group: g.id, size: g.size })}
                      className="flex-col items-start py-6"
                    >
                      <g.icon className="size-7" strokeWidth={1.6} />
                      <span className="mt-4 text-[17px] font-semibold">{g.label}</span>
                      <span className={cn("mt-0.5 text-left text-[13px]", draft.group === g.id ? "text-white/70" : "text-muted")}>{g.sub}</span>
                    </Choice>
                  ))}
                </div>
                {(draft.group === "friends" || draft.group === "family") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex items-center justify-between rounded-2xl bg-surface px-5 py-3"
                  >
                    <span className="text-[15px] font-medium">How many people?</span>
                    <div className="flex items-center gap-3">
                      <RoundBtn small label="Fewer" onClick={() => setDraft({ size: Math.max(2, draft.size - 1) })}>
                        <Minus className="size-4" />
                      </RoundBtn>
                      <span className="tabular w-6 text-center text-[19px] font-semibold">{draft.size}</span>
                      <RoundBtn small label="More" onClick={() => setDraft({ size: Math.min(12, draft.size + 1) })}>
                        <Plus className="size-4" />
                      </RoundBtn>
                    </div>
                  </motion.div>
                )}
              </Scene>
            )}

            {step === "budget" && (
              <Scene title="What kind of trip?" sub="Per person, per day, everything included.">
                <div className="mt-8 flex flex-col gap-3">
                  {BUDGETS.map((b) => (
                    <Choice key={b.id} active={draft.budget === b.id} onClick={() => setDraft({ budget: b.id })} className="justify-between py-5">
                      <span className="text-left">
                        <span className="block text-[17px] font-semibold">{b.label}</span>
                        <span className="mt-0.5 block text-[14px] text-muted">{b.note}</span>
                      </span>
                      <span className="tabular text-[17px] font-semibold">~{peso(b.perDay)}</span>
                    </Choice>
                  ))}
                </div>
                <p className="mt-6 text-[14px] text-muted">
                  For {draft.size} {draft.size === 1 ? "person" : "people"} over {draft.days} days that&apos;s about{" "}
                  <span className="font-semibold text-ink">
                    {peso((BUDGETS.find((b) => b.id === draft.budget)?.perDay ?? 0) * draft.size * draft.days)}
                  </span>{" "}
                  before flights.
                </p>
              </Scene>
            )}

            {step === "interests" && (
              <Scene title="What do you love?" sub="Pick as many as you like. The first two shape the plan most.">
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {INTERESTS.map((x) => {
                    const on = draft.interests.includes(x.id);
                    const rank = draft.interests.indexOf(x.id);
                    return (
                      <button
                        key={x.id}
                        onClick={() => toggle(x.id)}
                        aria-pressed={on}
                        className={cn(
                          "pressable group relative aspect-[4/5] overflow-hidden rounded-[22px] text-left",
                          on ? "ring-[3px] ring-ocean ring-offset-2" : "",
                        )}
                      >
                        <Image src={x.photo} alt="" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className={cn("absolute inset-0 bg-gradient-to-t transition-colors", on ? "from-black/70 to-black/10" : "from-black/60 to-transparent")} />
                        <span className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                          <span className="block text-[16px] font-semibold">{x.label}</span>
                          <span className="block text-[12px] text-white/75">{x.hint}</span>
                        </span>
                        <AnimatePresence>
                          {on && (
                            <motion.span
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
                              className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-ocean text-[13px] font-bold text-white"
                            >
                              {rank < 2 ? rank + 1 : <Check className="size-4" />}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </div>
              </Scene>
            )}

            {step === "arrival" && (
              <Scene title="How are you getting here?" sub="This sets where day one starts.">
                <div className="mt-8 flex flex-col gap-3">
                  {ARRIVALS.map((a) => (
                    <Choice key={a.id} active={draft.arrival === a.id} onClick={() => setDraft({ arrival: a.id })} className="gap-4 py-5">
                      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", draft.arrival === a.id ? "bg-white/15" : "bg-white")}>
                        <a.icon className="size-6" />
                      </span>
                      <span className="text-left">
                        <span className="block text-[17px] font-semibold">{a.label}</span>
                        <span className={cn("mt-0.5 block text-[14px]", draft.arrival === a.id ? "text-white/70" : "text-muted")}>{a.sub}</span>
                      </span>
                    </Choice>
                  ))}
                </div>
                {weather.storm && (
                  <p className="mt-6 rounded-2xl bg-coral-soft px-4 py-3 text-[14px] text-[#9a3b1c]">
                    Storm warning for Catanduanes. Your plan will skip sea trips and favor indoor stops.
                  </p>
                )}
              </Scene>
            )}
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-white via-white to-white/0 pb-[calc(16px+var(--safe-b))] pt-8">
        <div className="mx-auto max-w-3xl px-5">
          <button
            onClick={next}
            disabled={!canNext}
            className="pressable h-14 w-full rounded-full bg-ocean text-[17px] font-semibold text-white hover:bg-ocean-ink disabled:bg-surface-2 disabled:text-faint"
          >
            {i === STEPS.length - 1 ? "Build my trip" : step === "interests" && !canNext ? "Pick at least one" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Scene({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="t-display text-balance">{title}</h1>
      {sub && <p className="t-lead mt-3 text-muted">{sub}</p>}
      {children}
    </div>
  );
}

function Choice({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "pressable flex items-center rounded-[22px] px-5 transition-colors duration-200",
        active ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

function RoundBtn({ children, onClick, label, small }: { children: React.ReactNode; onClick: () => void; label: string; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn("pressable grid place-items-center rounded-full bg-surface hover:bg-surface-2", small ? "size-9" : "size-16")}
    >
      {children}
    </button>
  );
}

function Building({ storm }: { storm: boolean }) {
  const lines = [
    `Checking ${PLACES.length} places across 11 towns`,
    `Matching ${OPERATORS.length} local operators`,
    storm ? "Storm warning found. Moving you inland." : "Checking wind, rain and waves",
    "Drawing your route",
  ];
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((x) => Math.min(lines.length - 1, x + 1)), 500);
    return () => clearInterval(id);
  }, [lines.length]);
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-white px-6 text-center">
      <LogoLoader size={80} />
      <h1 className="t-title mt-8">Building your trip</h1>
      <div className="relative mt-3 h-6 w-full max-w-sm overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.p
            key={k}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="text-[15px] text-muted"
          >
            {lines[k]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-surface">
        <motion.div className="h-full bg-ocean" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }} />
      </div>
    </div>
  );
}

function FiestaHint({ start, days }: { start: string; days: number }) {
  const list = festivalsBetween(start, days);
  return (
    <AnimatePresence>
      {list.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          className="mx-auto mt-6 max-w-sm rounded-[22px] bg-[#FFF4E3] p-4"
        >
          <p className="text-[13px] font-semibold text-sunset">Fiesta during your trip!</p>
          <ul className="mt-2 space-y-2">
            {list.slice(0, 3).map((f) => (
              <li key={f.id} className="flex items-center gap-3">
                <Tile name={f.icon} bg={f.town === "province" ? ISLAND.sunset : TOWN_STYLE[f.town].color} size={34} accent="#F6CB67" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">{f.name}</span>
                  <span className="block truncate text-[12px] text-muted">
                    {f.town === "province" ? "Whole island" : TOWN_BY_ID[f.town].name} · {f.dateLabel.split(" (")[0]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
