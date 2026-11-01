"use client";

/*
  Pasyar island icon set. Original flat geometric glyphs drawn for this project,
  in the spirit of Filipino festival mosaics. Each icon is a 24x24 SVG that uses
  `currentColor` for the main shape and an optional accent color.
*/

import { motion } from "motion/react";
import { MOSAIC } from "@/data/palette";
import { cn } from "@/lib/cn";

export type IconName =
  | "sun"
  | "wave"
  | "palm"
  | "fish"
  | "church"
  | "flower"
  | "crab"
  | "rooster"
  | "rice"
  | "waterfall"
  | "coconut"
  | "broom"
  | "heart"
  | "mountain"
  | "boat"
  | "surf"
  | "mask"
  | "abaca"
  | "cave"
  | "cross"
  | "river"
  | "lighthouse"
  | "island"
  | "shell";

type P = { a: string };

const G: Record<IconName, (p: P) => React.ReactNode> = {
  sun: ({ a }) => (
    <>
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="11" y="1.5" width="2" height="4" rx="1" fill={a} transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </>
  ),
  wave: ({ a }) => (
    <>
      <path d="M2 10c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3v3H2z" fill="currentColor" />
      <path d="M2 16c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3v5H2z" fill={a} />
    </>
  ),
  palm: ({ a }) => (
    <>
      <path d="M11 9h2l1.5 13h-5z" fill={a} />
      <path d="M12 9C9 5 5 5 2 7c3 0 6 .5 10 2zM12 9c3-4 7-4 10-2-3 0-6 .5-10 2zM12 9c-1-4 1-7 4-7-1.5 2-2.5 4-4 7zM12 9c-3-1-6 1-7 4 2-1.5 4-2.5 7-4z" fill="currentColor" />
      <circle cx="11" cy="10" r="1.3" fill={a} />
      <circle cx="13.2" cy="10.4" r="1.3" fill={a} />
    </>
  ),
  fish: ({ a }) => (
    <>
      <path d="M3 12c3-5 10-6 15 0-5 6-12 5-15 0z" fill="currentColor" />
      <path d="M17 12l5-4v8z" fill={a} />
      <circle cx="7.5" cy="11" r="1.3" fill="#fff" />
      <path d="M10 8.5q2 3.5 0 7" stroke={a} strokeWidth="1.4" fill="none" />
    </>
  ),
  church: ({ a }) => (
    <>
      <path d="M4 22V11l8-5 8 5v11z" fill="currentColor" />
      <rect x="10" y="15" width="4" height="7" rx="2" fill={a} />
      <rect x="11.2" y="1" width="1.6" height="6" fill={a} />
      <rect x="9.5" y="2.6" width="5" height="1.6" fill={a} />
      <circle cx="12" cy="11.5" r="1.6" fill={a} />
    </>
  ),
  flower: ({ a }) => (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx="12" cy="6.5" rx="3.2" ry="5" fill="currentColor" transform={`rotate(${i * 72} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3" fill={a} />
    </>
  ),
  crab: ({ a }) => (
    <>
      <ellipse cx="12" cy="14" rx="7" ry="5" fill="currentColor" />
      <path d="M4 10l-2-4 3 1 1-3 1 4zM20 10l2-4-3 1-1-3-1 4z" fill="currentColor" />
      <path d="M5 16l-3 2M5 18l-2 3M19 16l3 2M19 18l2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="12" r="1.2" fill={a} />
      <circle cx="14" cy="12" r="1.2" fill={a} />
    </>
  ),
  rooster: ({ a }) => (
    <>
      <path d="M6 12c0-4 3-6 6-6l1 4c3 0 6 2 7-3 1 6-1 11-7 12-5 0-7-3-7-7z" fill="currentColor" />
      <path d="M10 4l1.5-2 1 2 1.5-1.5L14 6h-4z" fill={a} />
      <path d="M6 10l-3 1 3 1.5z" fill={a} />
      <circle cx="9" cy="9" r="1" fill="#fff" />
      <path d="M10 19v3M13 19v3" stroke={a} strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  rice: ({ a }) => (
    <>
      <path d="M12 22V6" stroke={a} strokeWidth="1.6" strokeLinecap="round" />
      {[5, 8.5, 12, 15.5].map((y, i) => (
        <g key={i}>
          <ellipse cx="9" cy={y} rx="2.6" ry="1.5" fill="currentColor" transform={`rotate(-35 9 ${y})`} />
          <ellipse cx="15" cy={y + 1.2} rx="2.6" ry="1.5" fill="currentColor" transform={`rotate(35 15 ${y + 1.2})`} />
        </g>
      ))}
      <ellipse cx="12" cy="3" rx="1.5" ry="2.4" fill="currentColor" />
    </>
  ),
  waterfall: ({ a }) => (
    <>
      <path d="M2 4h7v13H2zM15 4h7v13h-7z" fill="currentColor" />
      <path d="M9 4h6v14H9z" fill={a} />
      <path d="M10.5 6v9M13.5 7v8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
      <ellipse cx="12" cy="19.5" rx="9" ry="2.5" fill={a} />
    </>
  ),
  coconut: ({ a }) => (
    <>
      <circle cx="12" cy="13" r="8" fill="currentColor" />
      <circle cx="9.5" cy="11" r="1.4" fill={a} />
      <circle cx="14.5" cy="11" r="1.4" fill={a} />
      <circle cx="12" cy="15" r="1.4" fill={a} />
      <path d="M12 5c1-3 4-3 6-2-2 0-4 1-6 2z" fill={a} />
    </>
  ),
  broom: ({ a }) => (
    <>
      <rect x="11" y="1.5" width="2" height="10" rx="1" fill={a} />
      <path d="M8 11h8l4 11H4z" fill="currentColor" />
      <path d="M9 14l-1.5 8M12 14v8M15 14l1.5 8" stroke={a} strokeWidth="1" opacity=".7" />
      <rect x="7.5" y="10.5" width="9" height="2" rx="1" fill={a} />
    </>
  ),
  heart: ({ a }) => (
    <>
      <path d="M12 21C5 16 2 12.5 2 8.5 2 5.5 4.3 3.5 7 3.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 2.7 0 5 2 5 5 0 4-3 7.5-10 12.5z" fill="currentColor" />
      <path d="M5 9c2-1 4 1 7 0s5-1 7 0" stroke={a} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  ),
  mountain: ({ a }) => (
    <>
      <path d="M1 21l8-13 4 6 3-4 7 11z" fill="currentColor" />
      <path d="M9 8l2.4 4-2.4-1-2 1.6z" fill="#fff" opacity=".85" />
      <circle cx="18" cy="5" r="2.5" fill={a} />
    </>
  ),
  boat: ({ a }) => (
    <>
      <path d="M3 15h18l-3 4H6z" fill="currentColor" />
      <path d="M12 3v11H5z" fill={a} />
      <path d="M13 6v8h5z" fill={a} opacity=".7" />
      <path d="M1 17h3M20 17h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 21q2.5-1.5 5 0t5 0 5 0 5 0" stroke={a} strokeWidth="1.4" fill="none" />
    </>
  ),
  surf: ({ a }) => (
    <>
      <path d="M2 18C4 8 12 3 22 4c-6 2-8 6-8 10-3-2-7 0-8 4z" fill={a} />
      <ellipse cx="13" cy="17" rx="9" ry="2.2" fill="currentColor" transform="rotate(-20 13 17)" />
      <path d="M7 19.5l11-6" stroke="#fff" strokeWidth="1" opacity=".8" />
    </>
  ),
  mask: ({ a }) => (
    <>
      <path d="M3 5c3 2 15 2 18 0 0 9-3 16-9 16S3 14 3 5z" fill="currentColor" />
      <path d="M6 10c1.5-1 3-1 4 .5M14 10.5c1-1.5 2.5-1.5 4-.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M8 15q4 3 8 0" stroke={a} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M3 5l-1-3 4 2M21 5l1-3-4 2" fill={a} />
    </>
  ),
  abaca: ({ a }) => (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" />
      {[7, 12, 17].map((x) => (
        <path key={x} d={`M${x} 3v18`} stroke={a} strokeWidth="2" opacity=".75" />
      ))}
      {[7, 12, 17].map((y) => (
        <path key={y} d={`M3 ${y}h18`} stroke="#fff" strokeWidth="1.4" opacity=".55" />
      ))}
    </>
  ),
  cave: ({ a }) => (
    <>
      <path d="M1 22c0-11 5-18 11-18s11 7 11 18z" fill="currentColor" />
      <path d="M6 22c0-6 2.5-10 6-10s6 4 6 10z" fill={a} />
      <path d="M9 12l1 2 1-2M13 11.5l1 2.5 1-2.5" fill="currentColor" />
    </>
  ),
  cross: ({ a }) => (
    <>
      <rect x="10.5" y="2" width="3" height="20" rx="1" fill="currentColor" />
      <rect x="5" y="6.5" width="14" height="3" rx="1" fill="currentColor" />
      <circle cx="12" cy="8" r="2.2" fill={a} />
    </>
  ),
  river: ({ a }) => (
    <>
      <path d="M1 8l6-6 5 5 4-3 7 7v2H1z" fill="currentColor" />
      <path d="M8 13c4 0 2 4 6 4s3 5 6 5H5c3 0 1-5 4-5s-4-4-1-4z" fill={a} />
    </>
  ),
  lighthouse: ({ a }) => (
    <>
      <path d="M9 8h6l1.5 14h-9z" fill="currentColor" />
      <path d="M8.6 12h6.8M8.2 16h7.6" stroke="#fff" strokeWidth="1.6" />
      <rect x="9" y="4" width="6" height="4" rx="1" fill={a} />
      <path d="M12 1l4 3H8z" fill="currentColor" />
      <path d="M15 5l7-2v4zM9 5L2 3v4z" fill={a} opacity=".5" />
    </>
  ),
  island: ({ a }) => (
    <>
      <path d="M3 17c2-5 6-7 9-7s7 2 9 7z" fill="currentColor" />
      <path d="M12 10V4" stroke={a} strokeWidth="1.5" />
      <path d="M12 5c-2-2-5-2-6 0 2-.5 4 0 6 0zm0 0c2-2 5-2 6 0-2-.5-4 0-6 0z" fill={a} />
      <path d="M1 20q2.75-2 5.5 0t5.5 0 5.5 0 5.5 0" stroke={a} strokeWidth="1.6" fill="none" />
    </>
  ),
  shell: ({ a }) => (
    <>
      <path d="M12 3L2 18q10 5 20 0z" fill="currentColor" />
      <path d="M12 3l-6 16M12 3v17M12 3l6 16" stroke={a} strokeWidth="1.3" />
    </>
  ),
};

export const ICON_NAMES = Object.keys(G) as IconName[];

export function IslandIcon({
  name,
  size = 24,
  color = "currentColor",
  accent = "#F6CB67",
  className,
  title,
}: {
  name: IconName;
  size?: number;
  color?: string;
  accent?: string;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ color }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {G[name]({ a: accent })}
    </svg>
  );
}

/** A mosaic tile: colored rounded square with a glyph. Optional corner cut like the festival tiles. */
export function Tile({
  name,
  bg,
  size = 44,
  fg = "#fff",
  accent,
  className,
  shape = "square",
}: {
  name: IconName;
  bg: string;
  size?: number;
  fg?: string;
  accent?: string;
  className?: string;
  shape?: "square" | "circle" | "leaf" | "arch";
}) {
  const radius =
    shape === "circle" ? "999px" : shape === "leaf" ? `${size * 0.6}px 6px ${size * 0.6}px 6px` : shape === "arch" ? `${size / 2}px ${size / 2}px 8px 8px` : `${size * 0.28}px`;
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size, background: bg, borderRadius: radius, boxShadow: "inset 0 -2px 0 rgba(0,0,0,.08), 0 6px 14px -6px " + bg }}
    >
      <IslandIcon name={name} size={size * 0.6} color={fg} accent={accent ?? "rgba(255,255,255,.55)"} />
    </span>
  );
}

const BAND: IconName[] = ["sun", "fish", "palm", "wave", "church", "flower", "crab", "surf", "rice", "heart", "boat", "mask", "abaca", "coconut", "waterfall", "rooster"];

/** A thin animated row of mosaic tiles used between sections. */
export function MosaicBand({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <div className={cn("relative overflow-hidden py-3", className)} aria-hidden>
      <motion.div
        className="flex w-max gap-2"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {[...BAND, ...BAND, ...BAND, ...BAND].map((n, i) => (
          <Tile
            key={i}
            name={n}
            size={size}
            bg={MOSAIC[i % MOSAIC.length]}
            shape={(["square", "circle", "leaf", "arch"] as const)[i % 4]}
          />
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent" />
    </div>
  );
}

/** Tiles that drift slowly in place. Decorative only. */
export function FloatingTiles({ items, className }: { items: { name: IconName; x: string; y: string; size: number; bg: string; r?: number; d?: number }[]; className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {items.map((t, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: t.x, top: t.y }}
          initial={{ opacity: 0, scale: 0.4, rotate: (t.r ?? 0) - 20 }}
          animate={{ opacity: 1, scale: 1, rotate: t.r ?? 0, y: [0, -10, 0] }}
          transition={{
            opacity: { delay: 0.6 + i * 0.08, duration: 0.6 },
            scale: { delay: 0.6 + i * 0.08, type: "spring", bounce: 0.45, duration: 0.8 },
            rotate: { delay: 0.6 + i * 0.08, type: "spring", bounce: 0.3, duration: 0.9 },
            y: { duration: t.d ?? 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
          }}
        >
          <Tile name={t.name} bg={t.bg} size={t.size} shape={(["square", "circle", "leaf", "arch"] as const)[i % 4]} />
        </motion.div>
      ))}
    </div>
  );
}
