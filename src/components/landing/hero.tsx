"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ChevronDown, Minus, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { INTERESTS } from "@/data/content";
import { cn } from "@/lib/cn";
import { FloatingTiles } from "@/components/icons";
import { ISLAND } from "@/data/palette";

const SLIDES = [
  { src: "/photos/binurong-sunset.webp", caption: "Binurong Point, Baras" },
  { src: "/photos/hiyop-heart-cove.webp", caption: "Hiyop Point, Pandan" },
  { src: "/photos/puraran-beach.webp", caption: "Puraran Beach, Baras" },
  { src: "/photos/twin-rock.webp", caption: "Twin Rock, Virac" },
];

export function Hero() {
  const lang = useStore((s) => s.lang);
  const [i, setI] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#0b1a26] text-white">
      <motion.div style={{ y: imgY }} className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.4, ease: [0.23, 1, 0.32, 1] }, scale: { duration: 8, ease: "linear" } }}
          >
            <Image src={SLIDES[i].src} alt={SLIDES[i].caption} fill priority={i === 0} sizes="100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b3d6b]/45 via-black/5 to-[#2a1406]/70" />
      {/* warm sun glow behind the headline */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[22%] size-[46vmax] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(246,203,103,.55) 0%, rgba(234,117,60,.25) 35%, transparent 65%)", mixBlendMode: "screen" }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <FloatingTiles
        className="hidden md:block"
        items={[
          { name: "sun", x: "84%", y: "16%", size: 52, bg: ISLAND.sun, r: 10 },
          { name: "fish", x: "74%", y: "30%", size: 40, bg: ISLAND.sky, r: -8, d: 7 },
          { name: "palm", x: "90%", y: "40%", size: 44, bg: ISLAND.lagoon, r: 6 },
          { name: "flower", x: "68%", y: "14%", size: 34, bg: ISLAND.pink, r: -12, d: 8 },
          { name: "surf", x: "80%", y: "52%", size: 38, bg: ISLAND.sunset, r: 14 },
        ]}
      />

      <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-[176px] md:px-8 md:pb-[170px]">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.1 }}
          className="t-eyebrow mb-4 text-white/80"
        >
          {t("welcome", lang)}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.18 }}
          className="t-hero max-w-4xl text-balance"
        >
          Your Catanduanes trip,{" "}
          <span className="bg-gradient-to-r from-[#FFE7A3] via-[#FFB27A] to-[#9FE7D2] bg-clip-text text-transparent">planned in 60 seconds.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.3 }}
          className="t-lead mt-5 max-w-xl text-white/85"
        >
          {t("heroSub", lang)}
        </motion.p>
      </motion.div>

      <div className="absolute bottom-[132px] right-5 z-10 hidden items-center gap-3 md:right-8 md:flex md:bottom-[150px]">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-[12px] font-medium text-white/75"
          >
            {SLIDES[i].caption}
          </motion.span>
        </AnimatePresence>
        <div className="flex gap-1.5">
          {SLIDES.map((s, k) => (
            <button
              key={s.src}
              aria-label={`Show ${s.caption}`}
              onClick={() => setI(k)}
              className={cn("h-1.5 rounded-full bg-white transition-all duration-500", k === i ? "w-6 opacity-100" : "w-1.5 opacity-50")}
            />
          ))}
        </div>
      </div>

      <QuickStart />

      <motion.div
        style={{ opacity: fade }}
        className="pointer-events-none absolute inset-x-0 bottom-2 z-10 hidden justify-center md:flex"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="size-5 text-white/60" />
      </motion.div>
    </section>
  );
}

function QuickStart() {
  const router = useRouter();
  const draft = useStore((s) => s.draft);
  const setDraft = useStore((s) => s.setDraft);
  const toggle = useStore((s) => s.toggleInterest);
  const lang = useStore((s) => s.lang);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.45 }}
      className="absolute inset-x-0 bottom-[calc(var(--tabbar-h)+var(--safe-b)+12px)] z-20 px-3 md:bottom-8 md:px-8"
    >
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
                className={cn(
                  "pressable h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium",
                  on ? "bg-ink text-white" : "bg-black/[0.05] text-ink-2 hover:bg-black/[0.08]",
                )}
              >
                {x.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-1 justify-end gap-2 md:flex-none">
          <Link
            href="/explore"
            className="pressable hidden h-11 items-center rounded-full bg-black/[0.05] px-4 text-[14px] font-semibold lg:inline-flex"
          >
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
    </motion.div>
  );
}
