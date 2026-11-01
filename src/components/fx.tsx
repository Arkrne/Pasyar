"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { MOSAIC } from "@/data/palette";
import { ICON_NAMES, Tile } from "./icons";

/** Mosaic-tile confetti. Fires once when mounted. */
export function Confetti({ count = 28 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 520,
      y: -(140 + Math.random() * 260),
      r: (Math.random() - 0.5) * 540,
      s: 14 + Math.random() * 14,
      icon: ICON_NAMES[i % ICON_NAMES.length],
      bg: MOSAIC[i % MOSAIC.length],
      d: Math.random() * 0.15,
    })),
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10" aria-hidden>
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 420], scale: [0, 1, 1], rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: 2.2, delay: p.d, ease: [0.2, 0.7, 0.4, 1], times: [0, 0.35, 1] }}
        >
          <Tile name={p.icon} bg={p.bg} size={p.s} shape={i % 3 === 0 ? "circle" : i % 3 === 1 ? "leaf" : "square"} />
        </motion.div>
      ))}
    </div>
  );
}

/** Number that counts up when it scrolls into view. */
export function CountUp({ to, prefix = "", suffix = "", decimals = 0, className }: { to: number; prefix?: string; suffix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const fmt = (v: number) => prefix + v.toLocaleString("en-PH", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (reduce) {
      el.textContent = fmt(to);
      return;
    }
    const c = animate(0, to, { duration: 1.6, ease: [0.23, 1, 0.32, 1], onUpdate: (v) => (el.textContent = fmt(v)) });
    return () => c.stop();
  }, [inView, to, prefix, suffix, decimals, reduce]);
  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

/** Wrap a card to make it tilt slightly toward the pointer on desktop. */
export function Tilt({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--ry", `${x * max}deg`);
    ref.current.style.setProperty("--rx", `${-y * max}deg`);
  };
  const reset = () => {
    ref.current?.style.setProperty("--ry", "0deg");
    ref.current?.style.setProperty("--rx", "0deg");
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`tilt ${className ?? ""}`}>
      {children}
    </div>
  );
}

/** Slow drifting clouds for sky sections. */
export function Clouds({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const clouds = [
    { top: "8%", w: 220, dur: 70, delay: 0, o: 0.85 },
    { top: "22%", w: 150, dur: 90, delay: -30, o: 0.6 },
    { top: "4%", w: 120, dur: 110, delay: -60, o: 0.5 },
  ];
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden>
      {clouds.map((c, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 120 50"
          width={c.w}
          className="absolute"
          style={{ top: c.top, opacity: c.o }}
          initial={{ x: "-30vw" }}
          animate={reduce ? { x: `${20 + i * 30}vw` } : { x: ["-30vw", "110vw"] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "linear", delay: c.delay }}
        >
          <path d="M20 40h76a14 14 0 0 0 0-28 22 22 0 0 0-41-6 16 16 0 0 0-35 9 13 13 0 0 0 0 25z" fill="white" />
        </motion.svg>
      ))}
    </div>
  );
}

/** Current time, read once after mount so server and client render the same markup. */
export function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the clock once on mount
    setNow(Date.now());
  }, []);
  return now;
}
