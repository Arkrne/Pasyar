"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";

/* Kinis, the Pasyar mud-crab mascot. Cutout poses live in /public/mascot. */

export type Pose = "welcome" | "pointing" | "map" | "oops" | "rainy" | "surfing" | "thinking" | "chatting" | "celebrating" | "sleeping";

/**
 * One living Kinis: breathes, bobs, sways, leans toward the cursor and pops between poses.
 * Use anywhere (loading screens, confirmations, empty states).
 */
export function Kinis({ pose, size = 120, className, onClick, hop = 0 }: { pose: Pose; size?: number; className?: string; onClick?: () => void; hop?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lean = useMotionValue(0);
  const leanS = useSpring(lean, { stiffness: 120, damping: 14 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      lean.set(Math.max(-9, Math.min(9, dx / 45)));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [lean, reduce]);

  return (
    <div ref={ref} className={className} style={{ width: size, height: size, position: "relative" }} onClick={onClick}>
      {/* ground shadow breathes opposite to the bob */}
      <motion.div
        className="absolute bottom-[3%] left-1/2 h-[7%] w-[56%] -translate-x-1/2 rounded-[50%] bg-[#0a3a5c]"
        animate={reduce ? undefined : { scaleX: [1, 0.86, 1], opacity: [0.18, 0.1, 0.18] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div style={{ rotate: leanS }} className="absolute inset-0 origin-bottom">
        <motion.div
          key={hop}
          className="absolute inset-0 origin-bottom"
          initial={hop ? { y: 0, scaleY: 1 } : false}
          animate={hop ? { y: [0, -size * 0.38, 0, -size * 0.08, 0], scaleY: [1, 1.08, 0.86, 1.02, 1], scaleX: [1, 0.94, 1.12, 0.98, 1] } : undefined}
          transition={{ duration: 0.8, times: [0, 0.35, 0.62, 0.8, 1], ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 origin-bottom"
            animate={reduce ? undefined : { y: [0, -size * 0.04, 0], scaleY: [1, 1.025, 1], scaleX: [1, 0.99, 1], rotate: [-1.5, 1.5, -1.5] }}
            transition={{ y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" }, scaleY: { duration: 2.6, repeat: Infinity, ease: "easeInOut" }, scaleX: { duration: 2.6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 5.2, repeat: Infinity, ease: "easeInOut" } }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={pose}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.7, rotate: -8, y: size * 0.08 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              >
                <Image src={`/mascot/kinis-${pose}.webp`} alt="Kinis the crab" fill sizes={`${size}px`} className="select-none object-contain drop-shadow-[0_8px_14px_rgba(234,117,60,0.28)]" draggable={false} priority={size > 100} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const ROUTE: { test: (p: string) => boolean; pose: Pose; say: string }[] = [
  { test: (p) => p === "/", pose: "welcome", say: "Maogmang pag-abot! I'm Kinis. Tap me for island tips." },
  { test: (p) => p.startsWith("/explore"), pose: "pointing", say: "Tap a town on the map. Pandan's heart-shaped cove is my favorite!" },
  { test: (p) => p.startsWith("/weather"), pose: "rainy", say: "Rain on one coast usually means sun on the other. Pick your side!" },
  { test: (p) => p.startsWith("/calendar"), pose: "celebrating", say: "Kinis Festival is July 25 in Panganiban. That's my party!" },
  { test: (p) => p.startsWith("/community"), pose: "chatting", say: "Found a trip you love? Hit Copy and make it yours." },
  { test: (p) => p.startsWith("/market"), pose: "welcome", say: "Pili and latik make the best pasalubong. Trust me." },
  { test: (p) => p.startsWith("/trips"), pose: "map", say: "Your QR tickets work offline. Show them at every stop." },
  { test: (p) => p.startsWith("/trip"), pose: "map", say: "Scroll through the days. I'm riding in the jeepney!" },
  { test: (p) => p.startsWith("/about"), pose: "pointing", say: "Every booking keeps ₱880 of each ₱1,000 on the island." },
];

const TIPS: { pose: Pose; say: string }[] = [
  { pose: "surfing", say: "Puraran's Majestic wave peaks August to October." },
  { pose: "thinking", say: "Withdraw cash in Virac. ATMs are rare up north." },
  { pose: "pointing", say: "Binurong at sunrise. You'll thank me later." },
  { pose: "rainy", say: "Typhoon coming? Storm mode re-plans your trip for you." },
  { pose: "map", say: "Signal drops in Gigmoto. Save your trip for offline." },
  { pose: "celebrating", say: "Panganiban mud crab is the tastiest in Bicol. I'm biased." },
  { pose: "sleeping", say: "Book a homestay in Pandan. Best sleep on the island." },
  { pose: "chatting", say: "Say 'Dios mabalos' to your host. It means thank you!" },
];

/** The site-wide guide: Kinis sits in the corner, reacts to the page, and talks. */
export function KinisGuide() {
  const path = usePathname();
  const stormSim = useStore((s) => s.stormSim);
  const route = ROUTE.find((r) => r.test(path)) ?? { pose: "welcome" as Pose, say: "Need a hand? Tap me!" };
  const [tip, setTip] = useState<{ pose: Pose; say: string } | null>(null);
  const [bubble, setBubble] = useState(false);
  const [hop, setHop] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [idle, setIdle] = useState(false);
  const i = useRef(0);

  // greet on each page, then quiet down
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset per page
    setTip(null);
    setIdle(false);
    const a = setTimeout(() => setBubble(true), 1600);
    const b = setTimeout(() => setBubble(false), 8000);
    const c = setTimeout(() => setIdle(true), 45000); // dozes off if left alone
    return () => [a, b, c].forEach(clearTimeout);
  }, [path]);

  if (path.startsWith("/plan") || hidden) return null;

  const show = tip ?? (stormSim ? { pose: "rainy" as Pose, say: "Storm's coming! I'll keep you on dry land." } : route);
  const pose: Pose = idle && !bubble ? "sleeping" : show.pose;

  const poke = () => {
    const next = TIPS[i.current++ % TIPS.length];
    setTip(next);
    setIdle(false);
    setBubble(true);
    setHop((h) => h + 1);
    navigator.vibrate?.(12);
  };

  return (
    <div className="pointer-events-none fixed bottom-[calc(var(--tabbar-h)+var(--safe-b)+8px)] left-2 z-[850] flex items-end gap-1 lg:bottom-5 lg:left-5">
      <motion.button
        aria-label="Kinis, tap for a tip"
        onClick={poke}
        onMouseEnter={() => setBubble(true)}
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.45, duration: 0.9, delay: path === "/" ? 3 : 0.6 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        className="pointer-events-auto relative origin-bottom-left scale-[0.78] cursor-pointer sm:scale-100"
      >
        <Kinis pose={pose} size={104} hop={hop} />
      </motion.button>
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={show.say}
            initial={{ opacity: 0, scale: 0.6, x: -12, y: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
            className="pointer-events-auto relative mb-12 max-w-[220px] origin-bottom-left rounded-[20px] rounded-bl-[6px] bg-white px-3.5 py-2.5 text-[13px] font-medium leading-snug text-ink shadow-[0_14px_32px_-10px_rgba(16,40,70,.35)] ring-1 ring-black/5 sm:max-w-[260px] sm:text-[14px]"
          >
            {show.say}
            <button onClick={() => setHidden(true)} aria-label="Hide Kinis" className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink text-white shadow">
              <X className="size-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
