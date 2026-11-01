"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MOSAIC } from "@/data/palette";
import { Tile, type IconName } from "./icons";

/** Hand-traced outline of the Pasyar mark: swirl, up the left side, over the top, down to the point. */
export const LOGO_PATH =
  "M24 100 C24 104 31 104 30 98 C28 88 14 92 18 102 C22 112 40 108 44 96 C30 82 12 66 12 44 C12 22 29 8 50 8 C71 8 88 22 88 44 C88 64 70 86 52 106";

function LogoTrace({ size = 120, loop = false, delay = 0 }: { size?: number; loop?: boolean; delay?: number }) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} aria-hidden>
      <defs>
        <linearGradient id="trace" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F2683C" />
          <stop offset="35%" stopColor="#0A5AA8" />
          <stop offset="100%" stopColor="#0F9AA0" />
        </linearGradient>
      </defs>
      <motion.path
        d={LOGO_PATH}
        fill="none"
        stroke="url(#trace)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={loop ? { pathLength: [0, 1, 1], opacity: [0.4, 1, 0] } : { pathLength: 1, opacity: 1 }}
        transition={
          loop
            ? { duration: 1.8, repeat: Infinity, ease: [0.65, 0, 0.35, 1], times: [0, 0.7, 1], delay }
            : { duration: 1.1, ease: [0.65, 0, 0.35, 1], delay }
        }
      />
    </svg>
  );
}

/** Small looping logo loader for in-app waits (building a plan, paying, maps). */
export function LogoLoader({ size = 56, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div className="relative" style={{ width: size, height: size * 1.2 }}>
        <div className="absolute inset-0 opacity-15">
          <Image src="/brand/logo.png" alt="" fill sizes={`${size}px`} className="object-contain" />
        </div>
        <div className="absolute inset-0">
          <LogoTrace size={size} loop />
        </div>
      </div>
      {label && <p className="text-[14px] text-muted">{label}</p>}
    </div>
  );
}

/* ---- intro gate: lets the hero wait for the logo intro to finish ---- */
let introDone = false;
const listeners = new Set<() => void>();
function finishIntro() {
  if (introDone) return;
  introDone = true;
  listeners.forEach((l) => l());
}
/** True once the logo intro has finished (or was skipped). */
export function useIntroDone() {
  const [done, setDone] = useState(introDone);
  useEffect(() => {
    if (introDone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with an external one-shot signal
      setDone(true);
      return;
    }
    const l = () => setDone(true);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return done;
}

/** Decided once per page load, so React's double-invoked effects in dev can't skip the intro. */
let seenDecision: boolean | null = null;
function introAlreadySeen() {
  if (seenDecision !== null) return seenDecision;
  try {
    seenDecision = sessionStorage.getItem("pasyar-intro") === "1";
    sessionStorage.setItem("pasyar-intro", "1");
  } catch {
    seenDecision = false;
  }
  return seenDecision;
}

const BURST: IconName[] = ["sun", "fish", "palm", "flower", "wave", "crab", "surf", "heart"];

export function Splash() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState<"trace" | "logo">("trace");

  useEffect(() => {
    const seen = introAlreadySeen();
    if (seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- skip the intro on repeat visits this session
      setShow(false);
      finishIntro();
      return;
    }
    const t1 = setTimeout(() => setPhase("logo"), reduce ? 50 : 1050);
    const t2 = setTimeout(() => {
      setShow(false);
      finishIntro();
    }, reduce ? 500 : 2350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          onClick={() => {
            setShow(false);
            finishIntro();
          }}
          className="fixed inset-0 z-[2000] flex cursor-pointer flex-col items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(120% 80% at 50% 0%, #E3F2FD 0%, #FFF7EC 55%, #FFEFD9 100%)" }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          aria-label="Pasyar is loading. Tap to skip."
        >
          {/* soft color blooms */}
          <motion.div
            className="absolute -left-24 -top-24 size-80 rounded-full blur-3xl"
            style={{ background: "#7FC4FF55" }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-28 -right-20 size-96 rounded-full blur-3xl"
            style={{ background: "#F6A54F44" }}
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative" style={{ width: 120, height: 144 }}>
            <AnimatePresence>
              {phase === "trace" && (
                <motion.div key="trace" className="absolute inset-0" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
                  <LogoTrace size={120} />
                </motion.div>
              )}
            </AnimatePresence>
            {phase === "logo" && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
              >
                <Image src="/brand/logo.png" alt="Pasyar" fill priority sizes="120px" className="object-contain drop-shadow-[0_16px_24px_rgba(10,90,168,0.25)]" />
              </motion.div>
            )}
            {/* tiles burst out when the logo lands */}
            {phase === "logo" &&
              !reduce &&
              BURST.map((n, i) => {
                const a = (i / BURST.length) * Math.PI * 2;
                return (
                  <motion.div
                    key={n}
                    className="absolute left-1/2 top-1/2"
                    initial={{ x: -14, y: -14, scale: 0, opacity: 0 }}
                    animate={{ x: Math.cos(a) * 120 - 14, y: Math.sin(a) * 110 - 14, scale: 1, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1], opacity: { duration: 1.2, times: [0, 0.2, 0.7, 1] } }}
                  >
                    <Tile name={n} bg={MOSAIC[i % MOSAIC.length]} size={28} shape={i % 2 ? "circle" : "square"} />
                  </motion.div>
                );
              })}
          </div>

          <div className="mt-6 flex overflow-hidden">
            {"Pasyar".split("").map((ch, i) => (
              <motion.span
                key={i}
                className="text-[34px] font-bold tracking-[-0.03em] text-ink"
                initial={{ y: 40, opacity: 0 }}
                animate={phase === "logo" ? { y: 0, opacity: 1 } : {}}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6, delay: 0.1 + i * 0.04 }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <motion.p
            className="mt-1 text-[14px] font-medium text-muted"
            initial={{ opacity: 0 }}
            animate={phase === "logo" ? { opacity: 1 } : {}}
            transition={{ delay: 0.45 }}
          >
            Happy trails, Catanduanes
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
