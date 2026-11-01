"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
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
  const steps = [
    {
      icon: Sparkles,
      title: "Answer five questions",
      body: "Days, who's coming, budget, what you love and how you're getting here. One question per screen.",
      img: "/photos/binurong-ridge.webp",
    },
    {
      icon: MapPinned,
      title: "Get a real plan",
      body: "Only places that exist and operators who answer their phone. Drive times, fees and a running total against your budget.",
      img: "/photos/hiyop-hills.webp",
    },
    {
      icon: QrCode,
      title: "Book it in one go",
      body: "Guides, rooms, vans and boats in one GCash or Maya checkout. QR tickets work offline.",
      img: "/photos/puraran-palms.webp",
    },
  ];
  return (
    <section className="mood-lagoon py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <h2 className="t-display max-w-3xl text-balance">From a blank page to a booked trip in about a minute.</h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, k) => (
            <Reveal key={s.title} delay={k * 0.08}>
              <Tilt className="h-full rounded-[22px]">
              <article className="card hover-zoom h-full overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={s.img} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                  <span className="glass absolute left-4 top-4 grid size-10 place-items-center rounded-full">
                    <s.icon className="size-5 text-ink" />
                  </span>
                </div>
                <div className="p-6">
                  <p className="tabular text-[13px] font-semibold text-muted">Step {k + 1}</p>
                  <h3 className="t-headline mt-1">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </article>
              </Tilt>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex justify-center">
          <Button href="/plan" size="lg">
            Try it now <ArrowRight className="size-4" />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
export function TownsRail() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 md:px-8">
        <Reveal>
          <p className="t-eyebrow mb-3 text-muted">Explore</p>
          <h2 className="t-display max-w-2xl text-balance">Eleven towns. Tap one to see what it&apos;s known for.</h2>
        </Reveal>
        <Link href="/explore" className="pressable hidden shrink-0 items-center gap-1 text-[15px] font-semibold text-ocean md:flex">
          Open the map <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="no-scrollbar snap-row mt-10 flex gap-4 overflow-x-auto px-5 pb-4 md:px-[max(2rem,calc((100vw-72rem)/2+2rem))]">
        {TOWNS.map((t, k) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0, duration: 0.7, delay: Math.min(k, 5) * 0.05 }}
          >
            <Link
              href={`/explore?town=${t.id}`}
              className="pressable hover-zoom group relative block h-[380px] w-[260px] shrink-0 overflow-hidden rounded-[24px] md:h-[440px] md:w-[300px]"
            >
              <Image src={t.cover} alt={t.name} fill sizes="300px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              <span className="absolute left-4 top-4 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                <Tile name={TOWN_STYLE[t.id].icon} bg={TOWN_STYLE[t.id].color} size={44} accent="#F6CB67" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/70">{t.region === "south" ? "South" : t.region === "east" ? "Pacific side" : "North"}</p>
                <h3 className="mt-1 text-[26px] font-bold tracking-[-0.02em]">{t.name}</h3>
                <p className="mt-1 text-[14px] leading-snug text-white/85">{t.tagline}</p>
              </div>
            </Link>
          </motion.div>
        ))}
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
