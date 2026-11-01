"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Sheet } from "./ui";
import { fallbackAnswer } from "@/lib/concierge";
import type { Itinerary } from "@/lib/planner";
import { cn } from "@/lib/cn";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGEST = ["What should I bring to Binurong?", "Where can I eat crab?", "What if a typhoon comes?", "Do I need cash?"];

function tripText(t?: Itinerary | null) {
  if (!t) return undefined;
  return t.days
    .map((d) => `Day ${d.index + 1} (${d.date}): ${d.items.filter((i) => i.type === "place" && !i.serviceId).map((i) => i.title).join(", ")}`)
    .join("\n");
}

export function Concierge({ trip, className }: { trip?: Itinerary | null; className?: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I know the island and your plan. Ask me anything about getting around, food, weather or safety." },
  ]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  const ask = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next);
    setQ("");
    setBusy(true);
    try {
      const r = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1).slice(-10), trip: tripText(trip) }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { role: "assistant", content: j.answer ?? fallbackAnswer(t) }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: fallbackAnswer(t) }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "pressable glass-strong flex items-center gap-2 rounded-full py-2.5 pl-3 pr-4 text-[14px] font-semibold shadow-[var(--shadow-lg)] outline outline-1 outline-[var(--hairline)]",
          className,
        )}
      >
        <span className="brand-gradient grid size-7 place-items-center rounded-full text-white">
          <Sparkles className="size-4" />
        </span>
        Ask Pasyar
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Ask Pasyar">
        <div className="flex min-h-[50dvh] flex-col">
          <div className="flex-1 space-y-2.5 pb-3">
            <AnimatePresence initial={false}>
              {msgs.map((m, k) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                  className={cn(
                    "max-w-[85%] rounded-[20px] px-4 py-2.5 text-[15px] leading-relaxed",
                    m.role === "user" ? "ml-auto rounded-br-md bg-ocean text-white" : "rounded-bl-md bg-surface text-ink",
                  )}
                >
                  {m.content}
                </motion.div>
              ))}
              {busy && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-16 gap-1 rounded-[20px] bg-surface px-4 py-3.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-muted"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={end} />
          </div>
          {msgs.length < 3 && (
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-3">
              {SUGGEST.map((s) => (
                <button key={s} onClick={() => ask(s)} className="pressable shrink-0 rounded-full bg-ocean-soft px-3.5 py-2 text-[13px] font-medium text-ocean-ink">
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(q);
            }}
            className="sticky bottom-0 flex items-center gap-2 rounded-full bg-surface p-1.5 pl-4"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask in English, Filipino or Bikol"
              className="h-10 flex-1 bg-transparent outline-none"
              aria-label="Your question"
            />
            <button type="submit" disabled={!q.trim() || busy} aria-label="Send" className="pressable grid size-10 place-items-center rounded-full bg-ocean text-white disabled:opacity-30">
              <ArrowUp className="size-5" />
            </button>
          </form>
        </div>
      </Sheet>
    </>
  );
}
