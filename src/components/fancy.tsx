"use client";

import { motion } from "motion/react";
import { IslandIcon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

/** Salakot, the woven Filipino straw hat. Drawn for Pasyar. */
export function Salakot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 34" className={className} aria-hidden>
      <path d="M2 27 Q32 -6 62 27 Q32 33 2 27Z" fill="#E9B96E" />
      <path d="M2 27 Q32 33 62 27 Q32 36 2 27Z" fill="#C98B3A" />
      {[10, 18, 26, 32, 38, 46, 54].map((x) => (
        <path key={x} d={`M32 3 L${x} 28`} stroke="#C98B3A" strokeWidth="1.1" opacity=".7" />
      ))}
      <path d="M9 21 Q32 12 55 21" stroke="#BA091F" strokeWidth="3" fill="none" />
      <path d="M12 23.5 Q32 15 52 23.5" stroke="#F6CB67" strokeWidth="1.2" fill="none" />
      <circle cx="32" cy="4" r="3" fill="#BA091F" />
      <path d="M30 4 l-2 -4 M34 4 l2 -4" stroke="#49C29F" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Island-mosaic lettering for the key words in a headline.
 * `hat` drops a salakot on the first letter; `icon` adds a small island glyph after the word.
 */
export function Fancy({ children, hat, icon, className }: { children: string; hat?: boolean; icon?: IconName; className?: string }) {
  const first = children[0];
  const rest = children.slice(1);
  return (
    <span className={cn("island-word whitespace-nowrap", className)}>
      {hat ? (
        <span className="relative inline-block">
          <span className="island-word">{first}</span>
          <motion.span
            className="pointer-events-none absolute left-1/2 top-0 block w-[1.25em]"
            initial={{ opacity: 0, y: "-0.9em", x: "-50%", rotate: -38 }}
            whileInView={{ opacity: 1, y: "-0.42em", x: "-50%", rotate: -13 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.55, duration: 0.9, delay: 0.25 }}
            whileHover={{ rotate: -4, y: "-0.44em" }}
          >
            <Salakot className="block h-auto w-full drop-shadow-[0_3px_3px_rgba(90,50,10,0.25)]" />
          </motion.span>
        </span>
      ) : (
        first
      )}
      {rest}
      {icon && (
        <motion.span
          className="relative -top-[0.55em] ml-[0.06em] inline-block w-[0.42em] align-baseline"
          initial={{ scale: 0, rotate: -60 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: 0.4 }}
          aria-hidden
        >
          <IslandIcon name={icon} size={64} className="h-auto w-full" color="#F6A54F" accent="#EA753C" />
        </motion.span>
      )}
    </span>
  );
}
