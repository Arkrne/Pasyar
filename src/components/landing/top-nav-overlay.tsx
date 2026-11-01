"use client";

import { useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { TopNav } from "@/components/shell";

/** Transparent white nav over the hero, frosted glass once you scroll past it. */
export function TopNavOverlay() {
  const { scrollY } = useScroll();
  const [overlay, setOverlay] = useState(true);
  useMotionValueEvent(scrollY, "change", (v) => {
    const next = v < (typeof window !== "undefined" ? window.innerHeight - 80 : 600);
    if (next !== overlay) setOverlay(next);
  });
  return <TopNav overlay={overlay} />;
}
