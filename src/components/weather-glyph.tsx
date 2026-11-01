"use client";

import { motion } from "motion/react";

type Kind = "sun" | "partly" | "cloud" | "rain" | "storm" | "fog";

export function kindOf(code: number): Kind {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "partly";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 95) return "storm";
  return "rain";
}

const Cloud = ({ x = 0, y = 0, fill = "#fff", stroke = "#a9b8c7", s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M14 34h24a8 8 0 0 0 0-16 11 11 0 0 0-21-3 8 8 0 0 0-3 19z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </g>
);

/** Animated weather icon. Motion stays gentle and stops for reduced-motion users (MotionConfig). */
export function WeatherGlyph({ code, size = 48, still }: { code: number; size?: number; still?: boolean }) {
  const k = kindOf(code);
  const loop = still ? undefined : Infinity;
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden>
      {(k === "sun" || k === "partly") && (
        <motion.g
          style={{ originX: "28px", originY: k === "sun" ? "28px" : "22px" }}
          animate={still ? undefined : { rotate: 360 }}
          transition={{ duration: 18, repeat: loop, ease: "linear" }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={i}
              x={k === "sun" ? 26.5 : 20.5}
              y={k === "sun" ? 4 : -1}
              width="3"
              height="7"
              rx="1.5"
              fill="#F6A54F"
              transform={`rotate(${i * 45} ${k === "sun" ? 28 : 22} ${k === "sun" ? 28 : 22})`}
            />
          ))}
          <circle cx={k === "sun" ? 28 : 22} cy={k === "sun" ? 28 : 22} r={k === "sun" ? 11 : 9} fill="#F6CB67" />
        </motion.g>
      )}
      {(k === "partly" || k === "cloud" || k === "rain" || k === "storm" || k === "fog") && (
        <motion.g animate={still ? undefined : { x: [0, 2.5, 0] }} transition={{ duration: 4, repeat: loop, ease: "easeInOut" }}>
          {k === "cloud" && <Cloud x={-4} y={-6} fill="#eef3f7" s={0.8} />}
          <Cloud x={2} y={4} fill={k === "storm" ? "#c9d2dc" : "#fff"} />
        </motion.g>
      )}
      {k === "rain" &&
        [16, 24, 32].map((x, i) => (
          <motion.line
            key={x}
            x1={x}
            x2={x - 2}
            y1={42}
            y2={48}
            stroke="#2B8FD6"
            strokeWidth="2.4"
            strokeLinecap="round"
            initial={{ opacity: 0, y: -4 }}
            animate={still ? { opacity: 1, y: 0 } : { opacity: [0, 1, 0], y: [-4, 4, 8] }}
            transition={{ duration: 1, repeat: loop, delay: i * 0.25, ease: "easeIn" }}
          />
        ))}
      {k === "storm" && (
        <motion.path
          d="M26 38l-5 9h6l-3 8 9-12h-6l3-5z"
          fill="#F6CB67"
          stroke="#E9A21B"
          strokeWidth="1"
          animate={still ? undefined : { opacity: [1, 0.2, 1, 1, 0.3, 1] }}
          transition={{ duration: 2.4, repeat: loop, times: [0, 0.1, 0.2, 0.6, 0.7, 0.8] }}
        />
      )}
      {k === "fog" &&
        [42, 48].map((y, i) => (
          <motion.line
            key={y}
            x1={12}
            x2={44}
            y1={y}
            y2={y}
            stroke="#b8c4cf"
            strokeWidth="2.4"
            strokeLinecap="round"
            animate={still ? undefined : { x: [0, i ? -3 : 3, 0] }}
            transition={{ duration: 3, repeat: loop }}
          />
        ))}
    </svg>
  );
}
