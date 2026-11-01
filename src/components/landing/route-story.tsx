"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { project, TOWN_PATHS, VIEW_H, VIEW_W } from "@/lib/geo";
import { PLACE_BY_ID } from "@/data/places";
import { TOWN_BY_ID, TOWN_ID_BY_NAME } from "@/data/towns";
import { TOWN_STYLE, MOSAIC } from "@/data/palette";
import type { TownId } from "@/data/types";
import { Tile } from "@/components/icons";
import route from "@/data/story-route.json";
import { cn } from "@/lib/cn";

type Stop = { id: string; label: string; town: TownId; day: number; photo: string; xy: [number, number]; at: number };

const RAW: { id: string; day: number; label?: string; town?: TownId; photo?: string; lat?: number; lng?: number }[] = [
  { id: "airport", label: "Land in Virac", town: "virac", photo: "/photos/virac-town.webp", lat: 13.5766, lng: 124.2044, day: 1 },
  { id: "twin-rock", day: 1 },
  { id: "bato-church", day: 1 },
  { id: "binurong-point", day: 2 },
  { id: "puraran-beach", day: 2 },
  { id: "nahulugan-falls", day: 3 },
  { id: "viga-coast", day: 3 },
  { id: "hiyop-point", day: 4 },
  { id: "tuwad-tuwadan", day: 4 },
];

const STOPS: Stop[] = RAW.map((s, i) => {
  const p = PLACE_BY_ID[s.id];
  return {
    id: s.id,
    day: s.day,
    label: s.label ?? p.name.split(" & ")[0],
    town: s.town ?? p.town,
    photo: s.photo ?? p.photo,
    xy: project(s.lat ?? p.lat, s.lng ?? p.lng),
    at: route.at[i],
  };
});

const ROAD = (route.coords as [number, number][]).map(([lat, lng]) => project(lat, lng));
const ROAD_D = "M" + ROAD.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L");

const DAYS = [
  { n: 1, title: "Land, swim, stone church", body: "Twin Rock at low tide, then the 1830s church in Bato before dinner by the bay." },
  { n: 2, title: "Cliffs at sunrise, surf by noon", body: "A guide meets you at Guinsaanan at 5:30. Puraran is fifteen minutes away." },
  { n: 3, title: "Waterfalls and rice country", body: "Nahulugan's three drops in Gigmoto, then the long plain of Viga." },
  { n: 4, title: "The far north", body: "Hiyop's heart-shaped cove and a tidal pool walled off from the Pacific." },
];

const START = 0.06;
const END = 0.92;

export function RouteStory() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const jeepRef = useRef<SVGGElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
  const draw = useTransform(progress, [START, END], [0, 1], { clamp: true });
  const [reached, setReached] = useState(0);
  const [moving, setMoving] = useState(false);
  const [km, setKm] = useState(0);
  const lastV = useRef(0);

  useMotionValueEvent(draw, "change", (v) => {
    const path = pathRef.current;
    const jeep = jeepRef.current;
    if (path && jeep) {
      const len = path.getTotalLength();
      const at = Math.max(0.5, Math.min(len - 0.5, v * len));
      const p = path.getPointAtLength(at);
      const a = path.getPointAtLength(Math.max(0, at - 3));
      const b = path.getPointAtLength(Math.min(len, at + 3));
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const left = dx < 0;
      let deg = (Math.atan2(dy, Math.abs(dx)) * 180) / Math.PI;
      deg = Math.max(-38, Math.min(38, deg));
      jeep.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${left ? -deg : deg}) scale(${left ? -1 : 1} 1)`);
      jeep.style.opacity = v > 0.001 ? "1" : "0";
    }
    let r = 0;
    STOPS.forEach((s, i) => {
      if (v >= s.at - 0.004) r = i;
    });
    setReached(r);
    setKm(Math.round(v * route.km));
    setMoving(Math.abs(v - lastV.current) > 0.0005 && v > 0 && v < 1);
    lastV.current = v;
  });

  const day = STOPS[reached].day - 1;
  const current = STOPS[reached];
  const visitedTowns = useMemo(() => new Set(STOPS.slice(0, reached + 1).map((s) => s.town)), [reached]);

  return (
    <section ref={ref} className="relative h-[420vh] bg-white">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-4 px-5 md:grid-cols-[1fr_1.15fr] md:gap-10 md:px-8">
          <div className="order-2 md:order-1">
            <p className="t-eyebrow mb-3 text-ocean">The reveal</p>
            <h2 className="t-display text-balance">
              Watch your trip <span className="text-gradient-island">drive itself</span> across the island.
            </h2>
            <div className="relative mt-6 h-[140px] md:mt-8 md:h-[170px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                >
                  <p className="tabular text-[13px] font-semibold" style={{ color: TOWN_STYLE[current.town].color }}>
                    Day {DAYS[day].n} of 4 · {TOWN_BY_ID[current.town].name}
                  </p>
                  <h3 className="t-title mt-1">{DAYS[day].title}</h3>
                  <p className="t-body mt-2 max-w-md text-muted">{DAYS[day].body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-1 flex gap-1.5">
              {DAYS.map((d, k) => (
                <span key={d.n} className={cn("h-1 rounded-full transition-all duration-500", k <= day ? "w-8 bg-ocean" : "w-4 bg-surface-2")} />
              ))}
            </div>
          </div>

          <div className="order-1 mx-auto w-full max-w-[330px] md:order-2 md:max-w-[470px]">
            <div className="relative" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}`, maxHeight: "78svh" }}>
              <div className="glass-strong absolute -left-2 top-2 z-20 rounded-2xl px-3 py-2 shadow-[var(--shadow-md)] md:-left-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">By road</p>
                <p className="tabular text-[20px] font-bold leading-none tracking-[-0.02em]">
                  {km}
                  <span className="text-[12px] font-semibold text-muted"> / {route.km} km</span>
                </p>
              </div>

              <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label="Map of Catanduanes with a four-day road trip">
                <defs>
                  <linearGradient id="route" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#EA753C" />
                    <stop offset="45%" stopColor="#2B8FD6" />
                    <stop offset="100%" stopColor="#49C29F" />
                  </linearGradient>
                  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0a3a5c" floodOpacity="0.14" />
                  </filter>
                </defs>
                <g filter="url(#soft)">
                  {TOWN_PATHS.map((t) => {
                    const id = TOWN_ID_BY_NAME[t.name];
                    const st = TOWN_STYLE[id];
                    const isNow = id === current.town;
                    return (
                      <path
                        key={t.name}
                        d={t.d}
                        fill={isNow ? st.color : visitedTowns.has(id) ? st.soft : "#eef1ef"}
                        fillOpacity={isNow ? 0.42 : 1}
                        stroke="#ffffff"
                        strokeWidth={1.4}
                        style={{ transition: "fill 500ms cubic-bezier(.23,1,.32,1), fill-opacity 500ms" }}
                      />
                    );
                  })}
                </g>
                <path d={ROAD_D} fill="none" stroke="#c9d2d9" strokeWidth={2.2} strokeDasharray="1 4" strokeLinecap="round" />
                <motion.path d={ROAD_D} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
                <motion.path
                  ref={pathRef}
                  d={ROAD_D}
                  fill="none"
                  stroke="url(#route)"
                  strokeWidth={3.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ pathLength: draw }}
                />

                {STOPS.map((s, i) => (
                  <StopPin key={s.id} s={s} on={i <= reached} now={i === reached} />
                ))}

                <g ref={jeepRef} style={{ opacity: 0 }}>
                  <Jeepney moving={moving} />
                </g>
              </svg>

              <div className="pointer-events-none absolute inset-0">
                {STOPS.map((s, i) => (
                  <StopLabel key={s.id} s={s} show={i < reached} />
                ))}
                <AnimatePresence mode="popLayout">
                  <PopCard key={current.id} s={current} />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function pct([x, y]: [number, number]) {
  return { left: `${(x / VIEW_W) * 100}%`, top: `${(y / VIEW_H) * 100}%` };
}

function StopPin({ s, on, now }: { s: Stop; on: boolean; now: boolean }) {
  const c = TOWN_STYLE[s.town].color;
  const [x, y] = s.xy;
  return (
    <g>
      {now && (
        <motion.circle cx={x} cy={y} fill={c} initial={{ r: 4, opacity: 0.6 }} animate={{ r: [4, 18], opacity: [0.55, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />
      )}
      <motion.circle cx={x} cy={y} initial={false} animate={{ r: on ? (now ? 7 : 5) : 3, fill: on ? "#fff" : "#dfe5ea" }} transition={{ type: "spring", bounce: 0.5, duration: 0.5 }} />
      <motion.circle cx={x} cy={y} initial={false} animate={{ r: on ? (now ? 4.4 : 3) : 0, fill: c }} transition={{ type: "spring", bounce: 0.5, duration: 0.5 }} />
    </g>
  );
}

function StopLabel({ s, show }: { s: Stop; show: boolean }) {
  const right = s.xy[0] < VIEW_W * 0.55;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
          className="absolute"
          style={pct(s.xy)}
        >
          <span
            className={cn(
              "absolute top-0 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-white/90 py-0.5 pl-0.5 pr-2 text-[10px] font-semibold text-ink shadow-[var(--shadow-sm)] md:text-[11px]",
              right ? "left-3" : "right-3",
            )}
          >
            <Tile name={TOWN_STYLE[s.town].icon} bg={TOWN_STYLE[s.town].color} size={16} shape="circle" />
            {s.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PopCard({ s }: { s: Stop }) {
  const st = TOWN_STYLE[s.town];
  const right = s.xy[0] < VIEW_W * 0.55;
  const seed = Math.round(s.at * 10);
  return (
    <motion.div className="absolute" style={pct(s.xy)} initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            className="absolute"
            initial={{ x: -7, y: -7, scale: 0, opacity: 1 }}
            animate={{ x: Math.cos(a) * 46 - 7, y: Math.sin(a) * 46 - 7, scale: [0, 1, 0.6], opacity: [1, 1, 0] }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="block size-3.5 rounded-[4px]" style={{ background: MOSAIC[(i + seed) % MOSAIC.length], transform: `rotate(${i * 25}deg)` }} />
          </motion.div>
        );
      })}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.45, duration: 0.6 }}
        className={cn(
          "absolute top-0 flex w-[170px] -translate-y-1/2 items-center gap-2 rounded-[18px] bg-white p-1.5 pr-3 shadow-[0_14px_34px_-10px_rgba(10,40,70,.35)] md:w-[210px] md:gap-2.5 md:p-2",
          right ? "left-5 origin-left" : "right-5 origin-right",
        )}
        style={{ outline: `2px solid ${st.color}`, outlineOffset: -2 }}
      >
        <div className="relative size-11 shrink-0 overflow-hidden rounded-[13px] md:size-14">
          <Image src={s.photo} alt="" fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: st.color }}>
            <Tile name={st.icon} bg={st.color} size={14} shape="circle" /> {TOWN_BY_ID[s.town].name}
          </p>
          <p className="truncate text-[13px] font-semibold leading-tight md:text-[15px]">{s.label}</p>
          <p className="truncate text-[10.5px] text-muted md:text-[11.5px]">Day {s.day}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Cartoon Filipino jeepney drawn for Pasyar. Origin sits between the wheels on the road; faces right. */
function Jeepney({ moving }: { moving: boolean }) {
  return (
    <g transform="scale(0.9) translate(-30 -33)">
      <ellipse cx="30" cy="34" rx="26" ry="3.2" fill="#0a3a5c" opacity="0.18" />
      {moving &&
        [0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={2}
            cy={27}
            fill="#ffffff"
            stroke="#d5dde3"
            strokeWidth={0.6}
            initial={{ r: 1.5, opacity: 0.9, x: 0, y: 0 }}
            animate={{ r: [1.5, 4.5], opacity: [0.9, 0], x: [-2, -12], y: [0, -6] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
          />
        ))}
      <motion.g animate={moving ? { y: [0, -1.2, 0] } : { y: 0 }} transition={{ duration: 0.32, repeat: moving ? Infinity : 0, ease: "easeInOut" }}>
        <path d="M9 3V-6" stroke="#5b4636" strokeWidth="1" />
        <motion.path d="M9 -6 L17 -4 L9 -1 Z" fill="#BA091F" animate={{ skewY: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
        <rect x="6" y="1.5" width="38" height="2" rx="1" fill="#5b4636" />
        <rect x="10" y="-1.5" width="9" height="3.5" rx="1" fill="#2B8FD6" />
        <rect x="22" y="-0.5" width="7" height="2.6" rx="1" fill="#49C29F" />
        <rect x="5" y="3.5" width="42" height="6.5" rx="3" fill="#F6CB67" />
        <path d="M8 6.8h36" stroke="#EA753C" strokeWidth="1.4" strokeDasharray="3 2" />
        <path d="M4 10h44l8 6v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V11z" fill="#EA753C" />
        <path d="M47 13h6l4 4v7h-10z" fill="#F6A54F" />
        <path d="M57 18l3 -1.2v3.6z" fill="#cfd8df" />
        {[7, 16, 25, 34].map((x) => (
          <rect key={x} x={x} y="12" width="7" height="6" rx="1.5" fill="#CFE9FF" stroke="#fff" strokeWidth="0.8" />
        ))}
        <path d="M43 12h4l3 5h-7z" fill="#CFE9FF" stroke="#fff" strokeWidth="0.8" />
        <rect x="4" y="20" width="46" height="2" fill="#2B8FD6" />
        <rect x="4" y="22.4" width="46" height="1.2" fill="#F6CB67" />
        <circle cx="56.5" cy="21.5" r="1.8" fill="#FFF4B0" stroke="#F6A54F" strokeWidth="0.6" />
        <rect x="3" y="18" width="2" height="3.5" rx="0.8" fill="#BA091F" />
        <rect x="9" y="26.5" width="38" height="1.4" rx="0.7" fill="#5b4636" />
      </motion.g>
      {[15, 46].map((cx) => (
        <g key={cx} transform={`translate(${cx} 29)`}>
          <circle r="5.2" fill="#1d1d1f" />
          <circle r="2.4" fill="#d9dee3" />
          <motion.g animate={moving ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.45, repeat: moving ? Infinity : 0, ease: "linear" }}>
            <rect x="-0.5" y="-4.6" width="1" height="9.2" fill="#6e6e73" />
            <rect x="-4.6" y="-0.5" width="9.2" height="1" fill="#6e6e73" />
          </motion.g>
        </g>
      ))}
    </g>
  );
}
