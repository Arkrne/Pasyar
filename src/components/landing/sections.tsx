"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CloudLightning,
  Copy,
  Heart,
  MapPinned,
  QrCode,
  Sparkles,
  Store,
  Wind,
  Waves,
  WifiOff,
} from "lucide-react";
import { TOWNS } from "@/data/towns";
import { POSTS } from "@/data/community";
import { PLACE_BY_ID } from "@/data/places";
import { Avatar, Button, Reveal, Verified } from "@/components/ui";
import { Logo } from "@/components/shell";
import { describe, useWeather } from "@/lib/weather";
import { useStore, peso } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Tile, type IconName } from "@/components/icons";
import { CountUp, Tilt } from "@/components/fx";
import { ISLAND, TOWN_STYLE } from "@/data/palette";

/* ------------------------------------------------------------ */
export function IslandFacts() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [110, -110]);
  const y3 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const facts: { n: number; pre?: string; u: string; l: string; img: string; tint: string }[] = [
    { n: 1492, u: "km²", l: "12th largest island in the Philippines", img: "/photos/binurong-aerial.webp", tint: "#0A5AA8" },
    { n: 11, u: "towns", l: "Ten on the coast, one in the hills", img: "/photos/viga-oco-aerial.webp", tint: "#B53427" },
    { n: 400, pre: "~", u: "km", l: "of jagged coastline and bays", img: "/photos/twin-rock.webp", tint: "#0F7E6C" },
    { n: 1, pre: "#", u: "abacá", l: "The country's abacá capital since 2022", img: "/photos/abaca-bags.webp", tint: "#B26A00" },
  ];
  const stack = [
    { src: "/photos/binurong-sunset.webp", cap: "Binurong Point", rot: -7, y: y1, cls: "left-0 top-6 w-[58%]" },
    { src: "/photos/bato-church.webp", cap: "Bato Church, 1830", rot: 6, y: y2, cls: "right-0 top-0 w-[48%]" },
    { src: "/photos/puraran-beach.webp", cap: "Puraran surf", rot: -2, y: y3, cls: "left-[22%] bottom-0 w-[56%]" },
  ];
  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <Reveal>
            <p className="t-eyebrow mb-4 flex items-center gap-2 text-sunset">
              <span className="h-px w-8 bg-sunset" /> Catanduanes
            </p>
            <h2 className="t-display text-balance">
              The <span className="text-gradient-island">Land of the Howling Winds</span> faces the open Pacific. Most of it never shows up on a travel site.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="t-lead mt-6 max-w-xl text-ink-2/80">
              Surf breaks, stone churches older than the country, and homestays in towns with one road in. The guides and boatmen
              who know them are mostly on Facebook and a phone number. Pasyar puts them in one plan you can book.
            </p>
          </Reveal>
        </div>
        <div className="relative mx-auto h-[380px] w-full max-w-[520px] md:h-[440px]">
          {stack.map((c, k) => (
            <motion.figure
              key={c.src}
              style={{ y: c.y, rotate: c.rot }}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.9, delay: k * 0.12 }}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
              className={`absolute rounded-[22px] bg-white p-2 pb-9 shadow-[0_30px_60px_-24px_rgba(16,40,70,.45)] ${c.cls}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
                <Image src={c.src} alt={c.cap} fill sizes="300px" className="object-cover" />
              </div>
              <figcaption className="absolute bottom-2.5 left-3 text-[13px] font-semibold text-ink-2">{c.cap}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 pb-24 md:grid-cols-4 md:gap-4 md:px-8 md:pb-32">
        {facts.map((f, k) => (
          <Reveal key={f.l} delay={k * 0.07}>
            <Tilt className="h-full rounded-[26px]">
              <div className="group relative h-[220px] overflow-hidden rounded-[26px] text-white shadow-[0_24px_48px_-24px_rgba(16,40,70,.55)] md:h-[260px]">
                <Image src={f.img} alt="" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${f.tint}22 0%, ${f.tint}cc 62%, ${f.tint} 100%)` }} />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <p className="tabular text-[40px] font-bold leading-none tracking-[-0.04em] md:text-[54px]">
                    <CountUp to={f.n} prefix={f.pre ?? ""} />
                    <span className="ml-1 text-[15px] font-semibold tracking-normal text-white/80 md:text-[17px]">{f.u}</span>
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-white/90 md:text-[14px]">{f.l}</p>
                </div>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const steps = [
    {
      icon: Sparkles,
      color: ISLAND.sunset,
      title: "Answer five questions",
      body: "Days, who's coming, budget, what you love and how you're getting here. One question per screen.",
      mock: <QuestionMock />,
    },
    {
      icon: MapPinned,
      color: ISLAND.deepTeal,
      title: "Get a real plan",
      body: "Only places that exist and operators who answer their phone. Drive times, fees and a running total against your budget.",
      mock: <PlanMock />,
    },
    {
      icon: QrCode,
      color: ISLAND.ocean,
      title: "Book it in one go",
      body: "Guides, rooms, vans and boats in one GCash or Maya checkout. QR tickets work offline.",
      mock: <TicketMock />,
    },
  ];

  return (
    <section className="mood-lagoon relative overflow-hidden py-24 md:py-36">
      {/* soft ambient blobs so the section isn't a flat wash */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-10 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(73,194,159,.22),transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 size-[480px] rounded-full bg-[radial-gradient(circle,rgba(234,117,60,.16),transparent_65%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Left: sticky pitch */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="t-eyebrow mb-4 flex items-center gap-2 text-deep-teal">
              <span className="h-px w-8 bg-deep-teal" /> How it works
            </p>
            <h2 className="t-display text-balance">
              From a blank page to a booked trip in <span className="text-gradient-island">about a minute.</span>
            </h2>
            <p className="t-lead mt-6 max-w-md text-ink-2/80">
              Three steps, no spreadsheets, no twenty open Facebook tabs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button href="/plan" size="lg">
                Try it now <ArrowRight className="size-4" />
              </Button>
              <Link href="/explore" className="pressable inline-flex items-center gap-1 text-[15px] font-semibold text-ocean">
                Browse first <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="mt-12 hidden lg:block">
            <figure className="relative w-[82%] -rotate-3 rounded-[22px] bg-white p-2 pb-9 shadow-[0_30px_60px_-24px_rgba(15,126,108,.45)] transition-transform duration-500 hover:rotate-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
                <Image src="/photos/binurong-ridge.webp" alt="Binurong Point ridge above the Pacific" fill sizes="360px" className="object-cover" />
              </div>
              <figcaption className="absolute bottom-2.5 left-3 text-[13px] font-semibold text-ink-2">Where your plan might start</figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Right: route timeline */}
        <ol ref={listRef} className="relative space-y-10 md:space-y-14">
          {/* dashed route + scroll-driven fill */}
          <span aria-hidden className="absolute bottom-8 left-[27px] top-8 w-0 border-l-2 border-dashed border-deep-teal/25" />
          <motion.span
            aria-hidden
            style={{ scaleY: fill }}
            className="absolute bottom-8 left-[26px] top-8 w-1 origin-top rounded-full bg-gradient-to-b from-sunset via-deep-teal to-ocean"
          />
          {steps.map((s, k) => (
            <li key={s.title} className="relative grid grid-cols-[56px_1fr] gap-5">
              <Reveal delay={k * 0.05}>
                <span
                  className="relative z-10 grid size-14 place-items-center rounded-2xl text-white shadow-[0_14px_28px_-12px_var(--c)] ring-4 ring-white"
                  style={{ background: s.color, ["--c" as string]: s.color }}
                >
                  <s.icon className="size-6" />
                </span>
              </Reveal>
              <Reveal delay={k * 0.05 + 0.06}>
                <article className="group rounded-[26px] bg-white/85 p-6 shadow-[0_24px_50px_-30px_rgba(15,80,90,.45)] ring-1 ring-black/[.04] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_60px_-30px_rgba(15,80,90,.55)] md:p-7">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-[44px] font-bold leading-none tabular" style={{ color: s.color }}>
                      0{k + 1}
                    </span>
                    <h3 className="t-headline">{s.title}</h3>
                  </div>
                  <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted">{s.body}</p>
                  <div className="mt-6">{s.mock}</div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function QuestionMock() {
  const opts = ["Just me", "The two of us", "Barkada", "Family"];
  return (
    <div className="rounded-2xl bg-sand/70 p-4 ring-1 ring-black/[.04]">
      <div className="flex items-center justify-between text-[12px] font-semibold text-muted">
        <span>Question 2 of 5</span>
        <span className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={cn("h-1.5 rounded-full", i < 2 ? "w-5 bg-sunset" : "w-1.5 bg-black/10")} />
          ))}
        </span>
      </div>
      <p className="mt-3 font-display text-[19px] font-semibold text-ink">Who&apos;s coming?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {opts.map((o, i) => (
          <span
            key={o}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              i === 1 ? "bg-sunset text-white shadow-[0_8px_18px_-8px_rgba(234,117,60,.8)]" : "bg-white text-ink-2 ring-1 ring-black/[.06]",
            )}
          >
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}

function PlanMock() {
  const rows = [
    { t: "08:30", n: "Binurong Point hike", m: "Guide booked" },
    { t: "12:00", n: "Lunch in Baras", m: "35 min drive" },
    { t: "14:30", n: "Puraran Beach", m: "Surf lesson" },
  ];
  return (
    <div className="rounded-2xl bg-mint-wash/80 p-4 ring-1 ring-black/[.04]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-deep-teal">Sample · Day 1</p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <li key={r.t} className="flex items-center gap-3 text-[14px]">
            <span className="tabular w-12 shrink-0 font-semibold text-muted">{r.t}</span>
            <span className="size-2 shrink-0 rounded-full bg-deep-teal" />
            <span className="flex-1 font-semibold text-ink">{r.n}</span>
            <span className="hidden text-[12px] text-muted sm:block">{r.m}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <div className="flex justify-between text-[12px] font-semibold">
          <span className="text-muted">Running total</span>
          <span className="tabular text-ink">₱6,840 <span className="text-muted">/ ₱9,000</span></span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "76%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-lagoon to-deep-teal"
          />
        </div>
      </div>
    </div>
  );
}

function TicketMock() {
  return (
    <div className="flex overflow-hidden rounded-2xl bg-white ring-1 ring-black/[.06]">
      <div className="relative w-[38%] shrink-0">
        <Image src="/photos/puraran-palms.webp" alt="" fill sizes="200px" className="object-cover" />
      </div>
      <div className="relative flex flex-1 items-center gap-4 border-l-2 border-dashed border-black/10 p-4">
        <span aria-hidden className="absolute -left-[9px] -top-2 size-4 rounded-full bg-sky-wash" />
        <span aria-hidden className="absolute -bottom-2 -left-[9px] size-4 rounded-full bg-sky-wash" />
        <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-ocean/[.07]">
          <QrCode className="size-10 text-ocean" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-[16px] font-semibold text-ink">Boat + guide, Baras</p>
          <p className="mt-0.5 text-[12px] text-muted">Paid with GCash</p>
          <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-leaf/10 px-2 py-0.5 text-[11px] font-semibold text-leaf">
            <WifiOff className="size-3" /> Works offline
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ */
const REGION_LABEL = { south: "South", east: "Pacific side", north: "North" } as Record<string, string>;
const TOWN_CYCLE_MS = 5000;

export function TownsRail() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const autoplay = inView && !touched && !reduce;

  useEffect(() => {
    if (!autoplay) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % TOWNS.length), TOWN_CYCLE_MS);
    return () => clearTimeout(id);
  }, [autoplay, active]);

  const pick = (k: number) => {
    setTouched(true);
    setActive(k);
  };

  const t = TOWNS[active];
  const st = TOWN_STYLE[t.id];

  return (
    <section ref={ref} className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <Reveal>
            <p className="t-eyebrow mb-4 flex items-center gap-2 text-sunset">
              <span className="h-px w-8 bg-sunset" /> Explore
            </p>
            <h2 className="t-display max-w-2xl text-balance">
              Eleven towns. <span className="text-gradient-island">Each one known for something.</span>
            </h2>
          </Reveal>
          <Link href="/explore" className="pressable hidden shrink-0 items-center gap-1 text-[15px] font-semibold text-ocean md:flex">
            Open the map <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-10">
          {/* Town index */}
          <ol
            role="tablist"
            aria-label="Towns of Catanduanes"
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
          >
            {TOWNS.map((town, k) => {
              const on = k === active;
              const c = TOWN_STYLE[town.id].color;
              return (
                <li key={town.id} className="shrink-0">
                  <button
                    role="tab"
                    aria-selected={on}
                    onClick={() => pick(k)}
                    onMouseEnter={() => pick(k)}
                    className={cn(
                      "pressable group relative flex w-full items-center gap-3 rounded-full px-4 py-2 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ocean",
                      "lg:rounded-xl lg:px-3 lg:py-2.5",
                      on ? "bg-white shadow-[0_10px_30px_-14px_rgba(16,40,70,.35)]" : "bg-white/50 hover:bg-white/80 lg:bg-transparent",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId="town-bar"
                        className="absolute inset-y-2 left-0 hidden w-1 rounded-full lg:block"
                        style={{ background: c }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span className="tabular hidden w-6 text-[12px] font-semibold text-faint lg:block">{String(k + 1).padStart(2, "0")}</span>
                    <span className="size-2 rounded-full lg:hidden" style={{ background: c }} />
                    <span
                      className={cn(
                        "whitespace-nowrap font-display text-[15px] font-semibold transition-all duration-300 lg:text-[20px]",
                        on ? "lg:translate-x-1" : "text-ink-2/70 group-hover:text-ink",
                      )}
                      style={on ? { color: c } : undefined}
                    >
                      {town.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Stage */}
          <div className="relative">
            <div className="relative h-[460px] overflow-hidden rounded-[32px] bg-ink shadow-[0_40px_80px_-40px_rgba(16,40,70,.6)] md:h-[580px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute inset-0"
                >
                  <Image src={t.cover} alt={t.name} fill sizes="(max-width:1024px) 100vw, 860px" className="object-cover" priority={active === 0} />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,14,22,.88)_0%,rgba(8,14,22,.35)_45%,transparent_72%)]" />
              <div
                className="absolute inset-0 opacity-40 mix-blend-soft-light transition-[background] duration-700"
                style={{ background: `radial-gradient(120% 80% at 0% 100%, ${st.color}, transparent 60%)` }}
              />

              {/* progress segments */}
              <div className="absolute inset-x-5 top-5 flex gap-1.5 md:inset-x-7 md:top-7">
                {TOWNS.map((town, k) => (
                  <span key={town.id} className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                    {k < active && <span className="absolute inset-0 bg-white/80" />}
                    {k === active && (
                      <motion.span
                        key={`${t.id}-${autoplay}`}
                        className="absolute inset-0 origin-left bg-white"
                        initial={{ scaleX: autoplay ? 0 : 1 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: autoplay ? TOWN_CYCLE_MS / 1000 : 0, ease: "linear" }}
                      />
                    )}
                  </span>
                ))}
              </div>

              {/* copy */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10"
                >
                  <p className="tabular flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70">
                    <span>{String(active + 1).padStart(2, "0")} / {TOWNS.length}</span>
                    <span className="h-px w-6 bg-white/40" />
                    <span>{REGION_LABEL[t.region] ?? t.region}</span>
                  </p>
                  <h3 className="mt-2 font-display text-[56px] font-bold leading-[0.9] tracking-[-0.03em] md:text-[96px]">{t.name}</h3>
                  <p className="mt-3 max-w-[40ch] text-[16px] leading-snug text-white/90 md:text-[19px]">{t.tagline}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <span className="glass-dark inline-flex items-center gap-3 rounded-2xl py-1.5 pl-1.5 pr-4">
                      <Tile name={st.icon} bg={st.color} size={36} accent="#F6CB67" />
                      <span className="text-[13px] leading-tight text-white/90">{st.why}</span>
                    </span>
                    <Link
                      href={`/explore?town=${t.id}`}
                      className="pressable group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-ink transition-transform hover:scale-[1.03]"
                    >
                      Explore {t.name}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* gallery polaroids peeking off the stage */}
            <div className="pointer-events-none absolute -right-4 top-16 hidden xl:block">
              <AnimatePresence mode="popLayout">
                {t.gallery.slice(0, 2).map((src, k) => (
                  <motion.figure
                    key={`${t.id}-${src}`}
                    initial={{ opacity: 0, x: 30, rotate: 0 }}
                    animate={{ opacity: 1, x: 0, rotate: k ? -5 : 6 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.8, delay: 0.15 + k * 0.08 }}
                    className={cn("relative w-[150px] rounded-[14px] bg-white p-1.5 shadow-[0_20px_40px_-18px_rgba(16,40,70,.55)]", k > 0 && "-mt-6 ml-8")}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[10px]">
                      <Image src={src} alt="" fill sizes="150px" className="object-cover" />
                    </div>
                  </motion.figure>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Link href="/explore" className="pressable mt-6 flex items-center gap-1 text-[15px] font-semibold text-ocean md:hidden">
          Open the map <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
export function CommunityTeaser() {
  const posts = POSTS.filter((p) => p.trip).slice(0, 3);
  return (
    <section className="mood-jungle py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="t-eyebrow mb-3 text-muted">Community</p>
          <h2 className="t-display max-w-3xl text-balance">See a trip you like? Copy it, change it, book it.</h2>
          <p className="t-lead mt-5 max-w-2xl text-muted">
            Every post links to the real itinerary behind it. Reviews only carry the verified badge when the writer booked and
            finished the trip through Pasyar.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {posts.map((p, k) => (
            <Reveal key={p.id} delay={k * 0.07}>
              <article className="card overflow-hidden">
                <div className="relative aspect-[4/5]">
                  <Image src={p.photo} alt={PLACE_BY_ID[p.placeId!]?.name ?? ""} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                  <div className="glass absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl px-3 py-2">
                    <span className="text-[13px] font-semibold">{p.trip!.title}</span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ocean">
                      <Copy className="size-3.5" /> Copy
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={p.author.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{p.author.name}</p>
                      <p className="text-[12px] text-muted">{p.author.from}</p>
                    </div>
                    {p.verified && <Verified label="Verified trip" />}
                  </div>
                  <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-ink-2">{p.caption}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-[12px] text-muted">
                    <Heart className="size-3.5" /> {p.likes.toLocaleString()}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex justify-center">
          <Button href="/community" variant="ghost" size="lg">
            Open the community
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
export function StormSection() {
  const w = useWeather();
  const stormSim = useStore((s) => s.stormSim);
  const setStormSim = useStore((s) => s.setStormSim);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.5], [40, 24]);

  return (
    <section ref={ref} className="bg-[#0d1116] py-24 text-white md:py-36">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="t-eyebrow mb-3 text-[#7fc4ff]">Storm mode</p>
          <h2 className="t-display max-w-3xl text-balance">Typhoons are part of life here. Your plan should know that.</h2>
          <p className="t-lead mt-5 max-w-2xl text-white/70">
            Pasyar checks live wind, rain and wave height for the island. When a storm comes in it pulls the boat trips and reef
            swims, moves you to churches, caves and river towns, and tells your operators before you have to.
          </p>
        </Reveal>

        <motion.div style={{ scale, borderRadius: radius }} className="relative mt-12 overflow-hidden">
          <video
            className="aspect-video w-full object-cover opacity-90"
            src="/video/pcg-aerial.webm"
            poster="/photos/virac-port.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Aerial footage of Catanduanes from a Philippine Coast Guard typhoon damage survey"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <p className="absolute bottom-4 left-5 right-5 text-[12px] text-white/70">
            Philippine Coast Guard aerial survey of typhoon damage over Catanduanes. Public domain, via Wikimedia Commons.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className={cn("rounded-[24px] p-6 transition-colors duration-500", w.storm ? "bg-[#3a1c12]" : "bg-white/[0.06]")}>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-white/60">
                Virac right now {w.source === "live" && !w.simulated ? "· live from Open-Meteo" : w.simulated ? "· simulated typhoon" : ""}
              </p>
              {w.storm ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-coral px-2.5 py-1 text-[12px] font-semibold">
                  <CloudLightning className="size-3.5" /> Storm mode on
                </span>
              ) : (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-semibold">Clear to go</span>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-4">
              <div>
                <p className="tabular text-[56px] font-bold leading-none tracking-[-0.04em]">{w.tempC}°</p>
                <p className="mt-1 text-[14px] text-white/70">{describe(w.code)}</p>
              </div>
              <Metric icon={Wind} label="Gusts" value={`${w.gustKph} km/h`} alert={w.gustKph >= 60} />
              <Metric icon={Waves} label="Waves at Puraran" value={w.waveM != null ? `${w.waveM.toFixed(1)} m` : "—"} alert={(w.waveM ?? 0) >= 2.5} />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 rounded-[24px] bg-white/[0.06] p-6">
            <div>
              <p className="t-headline">Try it on a calm day</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/65">
                Flip on a simulated Signal No. 3 and open any plan. Sea trips disappear and the day reshuffles.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={stormSim}
              onClick={() => setStormSim(!stormSim)}
              className="pressable flex items-center justify-between rounded-2xl bg-white/[0.08] px-4 py-3"
            >
              <span className="text-[15px] font-semibold">Simulate typhoon</span>
              <span className={cn("relative h-[31px] w-[51px] rounded-full transition-colors duration-300", stormSim ? "bg-coral" : "bg-white/25")}>
                <motion.span
                  layout
                  transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  className={cn("absolute top-[2px] size-[27px] rounded-full bg-white shadow", stormSim ? "right-[2px]" : "left-[2px]")}
                />
              </span>
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[13px] text-white/55">
          <WifiOff className="size-4" /> Saved trips and tickets open with no signal.
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, alert }: { icon: typeof Wind; label: string; value: string; alert?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[13px] text-white/60">
        <Icon className="size-4" /> {label}
      </p>
      <p className={cn("tabular mt-1 text-[24px] font-semibold tracking-[-0.02em]", alert && "text-coral")}>{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------ */
export function OperatorSection() {
  const bookings = useStore((s) => s.bookings);
  const mine = bookings.flatMap((b) => b.lines.filter((l) => l.operatorId === "alon-surf-camp").map((l) => ({ ...l, guest: b.guest })));
  const sum = mine.reduce((a, l) => a + l.amount, 0);
  return (
    <section className="py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <p className="t-eyebrow mb-3 text-muted">Pasyar Business</p>
          <h2 className="t-display text-balance">A free dashboard for the people who make the island work.</h2>
          <p className="t-lead mt-5 text-muted">
            Guides, homestays, boatmen and van drivers list for free. They see bookings arrive live, accept with one tap, and get
            paid out to GCash. Pasyar keeps 12% only when a booking comes through.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-ink-2">
            {[
              "Big buttons and numbers, built for a ₱5,000 phone",
              "Booking inbox, availability and a simple sales calendar",
              "Reply to reviews and pay to be featured when you're ready",
            ].map((x) => (
              <li key={x} className="flex gap-3">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-ocean" />
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/business" size="lg">
              Open the operator view
            </Button>
            <Button href="/insights" variant="ghost" size="lg">
              Tourism insights
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="card mx-auto max-w-md p-5 shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-3">
              <div className="relative size-11 overflow-hidden rounded-xl">
                <Image src="/photos/puraran-palms.webp" alt="" fill sizes="44px" className="object-cover" />
              </div>
              <div>
                <p className="text-[15px] font-semibold">Alon Surf Camp</p>
                <p className="text-[12px] text-muted">Puraran, Baras</p>
              </div>
              <span className="ml-auto rounded-full bg-leaf-soft px-2.5 py-1 text-[11px] font-semibold text-leaf">Open</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface p-4">
                <p className="text-[12px] text-muted">Booked via Pasyar</p>
                <p className="tabular mt-1 text-[26px] font-bold tracking-[-0.03em]">{peso(sum)}</p>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <p className="text-[12px] text-muted">You keep</p>
                <p className="tabular mt-1 text-[26px] font-bold tracking-[-0.03em] text-leaf">{peso(sum * 0.88)}</p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-[var(--hairline)]">
              {mine.slice(0, 3).map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <Avatar name={l.guest} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{l.guest}</p>
                    <p className="truncate text-[12px] text-muted">{l.title}</p>
                  </div>
                  <span className="tabular text-[14px] font-semibold">{peso(l.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
export function MoneySection() {
  const rows = [
    { label: "Local operator", v: 880, c: "bg-leaf" },
    { label: "Pasyar commission", v: 120, c: "bg-ocean" },
  ];
  return (
    <section className="mood-sunrise py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <p className="t-eyebrow mb-3 text-muted">Where your money goes</p>
            <h2 className="t-display text-balance">Of every ₱1,000 you book, ₱880 stays with the person who hosts you.</h2>
          </Reveal>
          <Reveal delay={0.08} className="self-end">
            <div className="flex h-16 overflow-hidden rounded-2xl">
              {rows.map((r) => (
                <motion.div
                  key={r.label}
                  className={cn("h-full", r.c)}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${r.v / 10}%` }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", bounce: 0, duration: 1.1 }}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between text-[14px]">
              {rows.map((r) => (
                <span key={r.label} className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", r.c)} /> {r.label}
                  <span className="tabular font-semibold">₱{r.v}</span>
                </span>
              ))}
            </div>
            <p className="mt-8 text-[15px] leading-relaxed text-muted">
              Featured listings and an anonymised demand report for the Provincial Tourism Office and LGUs cover the rest. Every
              booking tells the province where visitors go, when, and what they spend.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
export function MarketTeaser() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[#f3efe8]">
          <div className="grid items-center md:grid-cols-2">
            <div className="p-8 md:p-14">
              <p className="t-eyebrow mb-3 text-amber">Pasalubong</p>
              <h2 className="t-display text-balance">Bring home the abacá capital.</h2>
              <p className="t-lead mt-5 text-muted">
                Pinukpok bags from Baras, latik from Virac, tiger-grass brooms from Hitoma. Order ahead and pick it up on your way to
                the airport.
              </p>
              <Button href="/market" variant="dark" size="lg" className="mt-8">
                <Store className="size-4" /> Visit the market
              </Button>
            </div>
            <div className="relative aspect-square md:aspect-auto md:h-full md:min-h-[480px]">
              <Image src="/photos/abaca-bags.webp" alt="Abacá bags woven in Catanduanes" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[80svh] min-h-[520px]">
        <Image src="/photos/viga-sunrise.webp" alt="Sunrise over the Viga coast" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <Reveal>
            <Image src="/brand/logo.png" alt="" width={72} height={88} className="mx-auto h-auto w-[60px] drop-shadow-xl" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="t-display mt-6 max-w-3xl text-balance">Pasyar means a stroll. Come take one.</h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/plan" variant="white" size="lg">
                Plan my trip <ArrowRight className="size-4" />
              </Button>
              <Button href="/explore" size="lg" className="bg-white/15 backdrop-blur hover:bg-white/25">
                Explore the island
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
