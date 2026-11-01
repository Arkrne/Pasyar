"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, TriangleAlert } from "lucide-react";

type Toast = { id: number; title: string; body?: string; tone: "ok" | "info" | "warn" };

const useToasts = create<{ items: Toast[]; push: (t: Omit<Toast, "id">) => void; drop: (id: number) => void }>(
  (set, get) => ({
    items: [],
    push: (t) => {
      const id = Date.now() + Math.random();
      set({ items: [...get().items.slice(-2), { ...t, id }] });
      setTimeout(() => get().drop(id), 4200);
    },
    drop: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
  }),
);

export const toast = (title: string, body?: string, tone: Toast["tone"] = "ok") =>
  useToasts.getState().push({ title, body, tone });

export function Toaster() {
  const items = useToasts((s) => s.items);
  const drop = useToasts((s) => s.drop);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[1000] flex flex-col items-center gap-2 px-4 md:top-20"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.button
            key={t.id}
            layout
            onClick={() => drop(t.id)}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.16 } }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
            className="glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-left shadow-[var(--shadow-lg)] outline outline-1 outline-[var(--hairline)]"
          >
            <span className="mt-0.5">
              {t.tone === "ok" ? (
                <CheckCircle2 className="size-5 text-leaf" />
              ) : t.tone === "warn" ? (
                <TriangleAlert className="size-5 text-coral" />
              ) : (
                <Info className="size-5 text-ocean" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold leading-snug">{t.title}</span>
              {t.body && <span className="mt-0.5 block text-sm leading-snug text-muted">{t.body}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
