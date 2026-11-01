"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { INTERESTS } from "@/data/content";
import { PLACES } from "@/data/places";
import { OPERATORS } from "@/data/operators";
import { cn } from "@/lib/cn";
import { Tile, type IconName } from "@/components/icons";
import { ISLAND, MOSAIC } from "@/data/palette";
import { useIntroDone } from "@/components/splash";

const SLIDES = [
  { src: "/photos/binurong-sunset.webp", caption: "Binurong Point, Baras" },
  { src: "/photos/hiyop-heart-cove.webp", caption: "Hiyop Point, Pandan" },
  { src: "/photos/puraran-beach.webp", caption: "Puraran Beach, Baras" },
  { src: "/photos/twin-rock.webp", caption: "Twin Rock, Virac" },
  { src: "/photos/viga-sunrise.webp", caption: "Sunrise over Viga" },
];

const WORD = "CATANDUANES";

const RING: { name: IconName; x: string; y: string; s: number; r: number }[] = [
  { name: "sun", x: "7%", y: "17%", s: 58, r: -10 },
  { name: "fish", x: "16%", y: "72%", s: 46, r: 8 },
  { name: "palm", x: "85%", y: "19%", s: 54, r: 12 },
  { name: "surf", x: "89%", y: "66%", s: 48, r: -8 },
  { name: "church", x: "4%", y: "64%", s: 40, r: 6 },
  { name: "crab", x: "73%", y: "79%", s: 42, r: -14 },
  { name: "flower", x: "28%", y: "11%", s: 36, r: 16 },
  { name: "waterfall", x: "65%", y: "9%", s: 38, r: -6 },
  { name: "rooster", x: "38%", y: "83%", s: 34, r: 10 },
  { name: "heart", x: "93%", y: "32%", s: 32, r: -12 },
];

/**
 * Two-act hero.
 * Act 1: the island's name, huge, with its photos moving inside the letters.
 * Scroll: the camera dives through the letters into the full photo.
 * Act 2: the promise and the quick planner.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ready = useIntroDone();
  const ref = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);
  const [act2, setAct2] = useState(false);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const wordScale = useTransform(p, [0, 0.18, 0.5], [1, 2.4, 42]);
  const wordOpacity = useTransform(p, [0.38, 0.5], [1, 0]);
  const act1Fade = useTransform(p, [0, 0.12], [1, 0]);
  const act1Y = useTransform(p, [0, 0.12], [0, -40]);
  const photoScale = useTransform(p, [0, 0.55], [1.18, 1]);
  const shade = useTransform(p, [0.36, 0.58], [0, 1]);
  const act2Opacity = useTransform(p, [0.5, 0.64], [0, 1]);
  const act2Y = useTransform(p, [0.5, 0.66], [60, 0]);
  const exitY = useTransform(p, [0.85, 1], ["0%", "-6%"]);

  useMotionValueEvent(p, "change", (v) => setAct2(v > 0.55));

  useEffect(() => {
    const id = setInterval(() => setSlide((x) => (x + 1) % SLIDES.length), 5200);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className={cn("relative", reduce ? "h-[100svh]" : "h-[300svh]")} aria-label="Catanduanes">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#0b1a26]">
        {/* Photos: seen through the letters first, then full-bleed */}
        <motion.div style={{ scale: reduce ? 1 : photoScale, y: exitY }} className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={slide}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.4, ease: [0.23, 1, 0.32, 1] }, scale: { duration: 7, ease: "linear" } }}
            >
              <Image src={SLIDES[slide].src} alt={SLIDES[slide].caption} fill priority={slide === 0} sizes="100vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Act 2 shading and sun glow */}
        <motion.div style={{ opacity: reduce ? 1 : shade }} className="absolute inset-0 bg-gradient-to-b from-[#0b3d6b]/55 via-black/10 to-[#1d0f05]/75" />
        <motion.div style={{ opacity: reduce ? 1 : shade }} className="pointer-events-none absolute inset-0" aria-hidden>
          <motion.div
            className="absolute left-[2%] top-[18%] size-[50vmax] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(246,203,103,.5) 0%, rgba(234,117,60,.2) 35%, transparent 65%)", mixBlendMode: "screen" }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Act 1: cut-out wordmark. Black letters on a light layer with screen blend = windows into the photos. */}
        {!reduce && (
          <motion.div style={{ opacity: wordOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[14vh] mix-blend-screen" aria-hidden>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 60% at 15% 10%, #E3F2FD 0%, transparent 60%), radial-gradient(60% 55% at 90% 90%, #FFE3C7 0%, transparent 60%), radial-gradient(50% 50% at 85% 15%, #E6F7F0 0%, transparent 60%), #FFF8EE",
              }}
            />
            <motion.div
              style={{ scale: wordScale, transformOrigin: "50.6% 52%" }}
              className="relative flex max-w-[92vw] select-none flex-wrap justify-center text-black sm:max-w-none sm:flex-nowrap"
            >
              {WORD.split("").map((ch, i) => [
                i === 5 ? <span key="br" className="basis-full sm:hidden" /> : null,
                <motion.span
                  key={i}
                  initial={{ y: "60%", opacity: 0 }}
                  animate={ready ? { y: "0%", opacity: 1 } : { y: "60%", opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.25, duration: 1, delay: 0.1 + i * 0.06 }}
                  className="block text-[20.5vw] font-black leading-[0.82] tracking-[-0.06em] sm:text-[12.4vw] 2xl:text-[200px]"
                >
                  {ch}
                </motion.span>,
              ])}
            </motion.div>
          </motion.div>
        )}
        <h1 className="sr-only">Catanduanes, the Happy Island. Plan your trip with Pasyar.</h1>

        {/* Act 1: framing text and floating tiles */}
        {!reduce && (
          <motion.div style={{ opacity: act1Fade, y: act1Y }} className="pointer-events-none absolute inset-0">
            {RING.map((r, i) => (
              <motion.div
                key={r.name}
                className="absolute hidden sm:block"
                style={{ left: r.x, top: r.y }}
                initial={{ opacity: 0, scale: 0.3, rotate: r.r - 30 }}
                animate={ready ? { opacity: 1, scale: 1, rotate: r.r, y: [0, -12, 0] } : { opacity: 0, scale: 0.3, rotate: r.r - 30 }}
                transition={{
                  opacity: { delay: 0.9 + i * 0.06 },
                  scale: { delay: 0.9 + i * 0.06, type: "spring", bounce: 0.5, duration: 0.8 },
                  rotate: { delay: 0.9 + i * 0.06, type: "spring", bounce: 0.3, duration: 0.9 },
                  y: { duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
                }}
              >
                <Tile name={r.name} bg={MOSAIC[i % MOSAIC.length]} size={r.s} shape={(["square", "circle", "leaf", "arch"] as const)[i % 4]} accent="#F6CB67" />
              </motion.div>
            ))}

            <div className="absolute inset-x-0 top-[calc(50%-7vh-16.8vw-76px)] flex justify-center px-6 sm:top-[calc(50%-7vh-5.1vw-84px)] 2xl:top-[calc(50%-7vh-82px-84px)]">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-2 shadow-[var(--shadow-sm)] backdrop-blur md:text-[12px]"
              >
                <span className="size-2 rounded-full bg-sunset" /> The Happy Island · Bicol, Philippines
              </motion.p>
            </div>

            <div className="absolute inset-x-0 top-[calc(50%-7vh+16.8vw+28px)] flex flex-col items-center px-6 text-center sm:top-[calc(50%-7vh+5.1vw+36px)] 2xl:top-[calc(50%-7vh+82px+36px)]">
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                transition={{ delay: 0.95, type: "spring", bounce: 0, duration: 0.9 }}
                className="max-w-2xl text-balance text-[clamp(22px,2.6vw,34px)] font-semibold leading-tight tracking-[-0.02em] text-ink"
              >
                Rediscover the <span className="text-gradient-island">Land of the Howling Winds.</span>
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ delay: 1.15, duration: 0.8 }} className="mt-3 max-w-md text-[15px] text-muted">
                Surf, cliffs, stone churches and 11 towns that still feel undiscovered.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: ready ? 1 : 0 }}
                transition={{ delay: 1.5 }}
                className="mt-6 flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted"
              >
                Scroll to dive in
                <span className="relative block h-9 w-[22px] rounded-full border-2 border-ink/25">
                  <motion.span
                    className="absolute left-1/2 top-1.5 h-2 w-1 -translate-x-1/2 rounded-full bg-ink/50"
                    animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Act 2: the promise */}
        <motion.div style={reduce ? undefined : { opacity: act2Opacity, y: act2Y }} className={cn("absolute inset-0 text-white", !act2 && !reduce && "pointer-events-none")}>
          <Act2 slide={slide} setSlide={setSlide} />
        </motion.div>
      </div>
    </section>
  );
}

function Act2({ slide, setSlide }: { slide: number; setSlide: (n: number) => void }) {
  const lang = useStore((s) => s.lang);
  return (
    <>
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-[176px] md:px-8 md:pb-[170px]">
        <p className="t-eyebrow mb-4 flex items-center gap-2 text-white/85">
          <Tile name="sun" bg={ISLAND.sun} size={22} /> {t("welcome", lang)}
        </p>
        <h2 className="t-hero max-w-5xl text-balance">
          Maogmang pag-abot!{" "}
          <span className="bg-gradient-to-r from-[#FFE7A3] via-[#FFB27A] to-[#9FE7D2] bg-clip-text text-transparent">Welcome home to the Happy Island.</span>
        </h2>
        <p className="t-lead mt-5 max-w-xl text-white/85">{t("heroSub", lang)}</p>
        <div className="mt-6 hidden flex-wrap gap-2 md:flex">
          {[
            ["11", "towns"],
            [String(PLACES.length), "real places"],
            [String(OPERATORS.length), "local operators"],
            ["1", "checkout"],
          ].map(([n, l]) => (
            <span key={l} className="glass-dark rounded-full px-3.5 py-1.5 text-[13px] text-white/90">
              <b className="tabular text-white">{n}</b> {l}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[132px] right-5 z-10 hidden items-center gap-3 md:bottom-[150px] md:right-8 md:flex">
        <AnimatePresence mode="wait">
          <motion.span
            key={slide}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-[12px] font-medium text-white/80"
          >
            {SLIDES[slide].caption}
          </motion.span>
        </AnimatePresence>
        <div className="flex gap-1.5">
          {SLIDES.map((s, k) => (
            <button
              key={s.src}
              aria-label={`Show ${s.caption}`}
              onClick={() => setSlide(k)}
              className={cn("h-1.5 rounded-full bg-white transition-all duration-500", k === slide ? "w-6 opacity-100" : "w-1.5 opacity-50")}
            />
          ))}
        </div>
      </div>

      <QuickStart />
    </>
  );
}

function QuickStart() {
  const router = useRouter();
  const draft = useStore((s) => s.draft);
  const setDraft = useStore((s) => s.setDraft);
  const toggle = useStore((s) => s.toggleInterest);
  const lang = useStore((s) => s.lang);

  return (
    <div className="absolute inset-x-0 bottom-[calc(var(--tabbar-h)+var(--safe-b)+12px)] z-20 px-3 md:px-8 lg:bottom-8">
      <div className="glass-strong mx-auto flex max-w-6xl items-center gap-3 rounded-[26px] p-2 pl-4 text-ink shadow-[var(--shadow-lg)] md:gap-4 md:p-3 md:pl-5">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-[13px] font-semibold text-muted">Days</span>
          <div className="flex items-center gap-1 rounded-full bg-black/[0.05] p-1">
            <button
              aria-label="Fewer days"
              onClick={() => setDraft({ days: Math.max(1, draft.days - 1) })}
              className="pressable grid size-8 place-items-center rounded-full bg-white shadow-[var(--shadow-sm)]"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="tabular w-8 text-center text-[17px] font-semibold">{draft.days}</span>
            <button
              aria-label="More days"
              onClick={() => setDraft({ days: Math.min(7, draft.days + 1) })}
              className="pressable grid size-8 place-items-center rounded-full bg-white shadow-[var(--shadow-sm)]"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="hidden h-8 w-px bg-[var(--hairline-strong)] md:block" />
        <div className="no-scrollbar -mx-1 hidden flex-1 gap-1.5 overflow-x-auto px-1 md:flex">
          {INTERESTS.map((x) => {
            const on = draft.interests.includes(x.id);
            return (
              <button
                key={x.id}
                onClick={() => toggle(x.id)}
                aria-pressed={on}
                className={cn("pressable h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium", on ? "bg-ink text-white" : "bg-black/[0.05] text-ink-2 hover:bg-black/[0.08]")}
              >
                {x.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-1 justify-end gap-2 md:flex-none">
          <Link href="/explore" className="pressable hidden h-11 items-center rounded-full bg-black/[0.05] px-4 text-[14px] font-semibold lg:inline-flex">
            Explore the map
          </Link>
          <button
            onClick={() => router.push(draft.interests.length ? "/plan?step=group" : "/plan")}
            className="pressable inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ocean px-5 text-[15px] font-semibold text-white hover:bg-ocean-ink md:flex-none"
          >
            {t("planCta", lang)} <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
