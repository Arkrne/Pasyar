"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { subscribeLive, useStore } from "@/lib/store";
import { OPERATOR_BY_ID } from "@/data/operators";
import { Toaster, toast } from "./toast";
import { Splash } from "./splash";
import { KinisGuide } from "./kinis";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useStore.persist.rehydrate();
    const off = subscribeLive((m) => {
      if (m.type === "booking" && location.pathname.startsWith("/business")) {
        const me = useStore.getState().activeOperator;
        if (m.operators.includes(me)) {
          toast("New booking", `${m.guest} just booked ${OPERATOR_BY_ID[me]?.name ?? ""}. Code ${m.code}.`, "info");
          navigator.vibrate?.(30);
        }
      }
      if (m.type === "status" && location.pathname.startsWith("/trips")) {
        toast(m.status === "confirmed" ? "Booking confirmed" : "Booking updated", "The operator responded to your request.");
      }
    });
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return off;
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Splash />
      {children}
      <KinisGuide />
      <Toaster />
    </MotionConfig>
  );
}
