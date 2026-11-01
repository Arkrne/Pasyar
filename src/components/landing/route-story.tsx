"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useState } from "react";
import { project, smoothPath, TOWN_PATHS, VIEW_H, VIEW_W } from "@/lib/geo";
import { PLACE_BY_ID } from "@/data/places";
import { cn } from "@/lib/cn";

const STOPS = [
  { id: "airport", label: "Land in Virac", lat: 13.5764, lng: 124.2061, day: 1 },
  { id: "twin-rock", day: 1 },
  { id: "bato-church", day: 1 },
  { id: "binurong-point", day: 2 },
  { id: "puraran-beach", day: 2 },
  { id: "nahulugan-falls", day: 3 },
  { id: "viga-coast", day: 3 },
  { id: "hiyop-point", day: 4 },
  { id: "tuwad-tuwadan", day: 4 },
].map((s) => {
  const p = PLACE_BY_ID[s.id];
  const lat = "lat" in s ? s.lat! : p.lat;
  const lng = "lng" in s ? s.lng! : p.lng;
  return { ...s, label: "label" in s ? s.label! : p.name, xy: project(lat, lng) };
});

const PATH = smoothPath(STOPS.map((s) => s.xy));

const DAYS = [
  { n: 1, title: "Land, swim, stone church", body: "Twin Rock at low tide, then the 1830s church in Bato before dinner by the bay." },
  { n: 2, title: "Cliffs at sunrise, surf by noon", body: "A guide meets you at Guinsaanan at 5:30. Puraran is fifteen minutes away." },
  { n: 3, title: "Waterfalls and rice country", body: "Nahulugan's three drops in Gigmoto, then the long plain of Viga." },
  { n: 4, title: "The far north", body: "Hiyop's heart-shaped cove and a tidal pool walled off from the Pacific." },
];

export function RouteStory() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const draw = useTransform(progress, [0.05, 0.9], [0, 1]);
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setStep(Math.min(3, Math.max(0, Math.floor(((v - 0.05) / 0.85) * 4))));
  });

  return (
    <section ref={ref} className="relative h-[320vh] bg-white">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 md:grid-cols-[1fr_1.1fr] md:gap-12 md:px-8">
          <div className="order-2 md:order-1">
            <p className="t-eyebrow mb-3 text-ocean">The reveal</p>
            <h2 className="t-display text-balance">Watch your trip draw itself across the island.</h2>
            <div className="relative mt-8 h-[150px] md:h-[170px]">
              {DAYS.map((d, k) => (
                <motion.div
                  key={d.n}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: step === k ? 1 : 0, y: step === k ? 0 : step > k ? -14 : 14 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.55 }}
                  aria-hidden={step !== k}
                >
                  <p className="tabular text-[13px] font-semibold text-muted">Day {d.n} of 4</p>
                  <h3 className="t-title mt-1">{d.title}</h3>
                  <p className="t-body mt-2 max-w-md text-muted">{d.body}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              {DAYS.map((d, k) => (
                <span key={d.n} className={cn("h-1 rounded-full transition-all duration-500", k <= step ? "w-8 bg-ocean" : "w-4 bg-surface-2")} />
              ))}
            </div>
          </div>

          <div className="order-1 mx-auto w-full max-w-[300px] md:order-2 md:max-w-[440px]">
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full max-h-[52svh] md:max-h-[80svh]" role="img" aria-label="Map of Catanduanes with a four-day route">
              <defs>
                <linearGradient id="route" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#0a6cbf" />
                  <stop offset="60%" stopColor="#0f9aa0" />
                  <stop offset="100%" stopColor="#f2683c" />
                </linearGradient>
                <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0a3a5c" floodOpacity="0.12" />
                </filter>
              </defs>
              <g filter="url(#soft)">
                {TOWN_PATHS.map((t) => (
                  <path key={t.name} d={t.d} fill="#e8edf1" stroke="#ffffff" strokeWidth={1.4} />
                ))}
              </g>
              <motion.path d={PATH} fill="none" stroke="#dfe6ec" strokeWidth={3} strokeDasharray="2 6" strokeLinecap="round" />
              <motion.path d={PATH} fill="none" stroke="url(#route)" strokeWidth={4} strokeLinecap="round" style={{ pathLength: draw }} />
              {STOPS.map((s, k) => (
                <Stop key={s.id} x={s.xy[0]} y={s.xy[1]} at={k / (STOPS.length - 1)} progress={draw} label={s.label} first={k === 0} />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stop({
  x,
  y,
  at,
  progress,
  label,
  first,
}: {
  x: number;
  y: number;
  at: number;
  progress: ReturnType<typeof useTransform<number, number>>;
  label: string;
  first?: boolean;
}) {
  const s = useTransform(progress, [Math.max(0, at - 0.04), at + 0.01], [0, 1]);
  const left = x > VIEW_W * 0.55;
  return (
    <motion.g style={{ scale: s, opacity: s, transformOrigin: `${x}px ${y}px` }}>
      <circle cx={x} cy={y} r={first ? 7 : 6} fill="#fff" />
      <circle cx={x} cy={y} r={first ? 4.5 : 3.6} fill={first ? "#1d1d1f" : "#0a6cbf"} />
      <text
        x={left ? x - 10 : x + 10}
        y={y + 4}
        textAnchor={left ? "end" : "start"}
        fontSize="11"
        fontWeight={600}
        fill="#1d1d1f"
        stroke="#fff"
        strokeWidth={3}
        paintOrder="stroke"
      >
        {label}
      </text>
    </motion.g>
  );
}
