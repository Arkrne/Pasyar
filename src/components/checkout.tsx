"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Check, CreditCard, Loader2, Lock, Smartphone, Wallet } from "lucide-react";
import { Button, Sheet, Verified } from "./ui";
import { bookableItems, commissionFor, type Itinerary } from "@/lib/planner";
import { useStore, peso, type Booking } from "@/lib/store";
import { OPERATOR_BY_ID, SERVICE_BY_ID } from "@/data/operators";
import { cn } from "@/lib/cn";

const METHODS = [
  { id: "gcash" as const, label: "GCash", icon: Smartphone, tint: "#0a6cbf" },
  { id: "maya" as const, label: "Maya", icon: Wallet, tint: "#1f8a4c" },
  { id: "card" as const, label: "Card", icon: CreditCard, tint: "#1d1d1f" },
];

export function Checkout({ trip, open, onClose }: { trip: Itinerary; open: boolean; onClose: () => void }) {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const book = useStore((s) => s.book);
  const availability = useStore((s) => s.availability);
  const prices = useStore((s) => s.priceOverrides);
  const [off, setOff] = useState<string[]>([]);
  const [method, setMethod] = useState<"gcash" | "maya" | "card">("gcash");
  const [stage, setStage] = useState<"review" | "paying" | "done">("review");
  const [done, setDone] = useState<Booking | null>(null);

  const lines = useMemo(
    () =>
      bookableItems(trip).map((i) => {
        const svc = SERVICE_BY_ID[i.serviceId!];
        const price = prices[svc.id] ?? svc.price;
        const closed = availability[svc.id] === false;
        return { ...i, amount: price * (i.qty ?? 1), closed, op: OPERATOR_BY_ID[svc.operatorId] };
      }),
    [trip, prices, availability],
  );
  const chosen = lines.filter((l) => !l.closed && !off.includes(l.key));
  const total = chosen.reduce((a, l) => a + l.amount, 0);

  const pay = () => {
    setStage("paying");
    setTimeout(() => {
      const b = book({
        tripId: trip.id,
        tripTitle: trip.title,
        guest: user.name,
        guests: trip.input.size,
        method,
        total,
        lines: chosen.map((l) => ({
          id: `ln-${l.key}`,
          serviceId: l.serviceId!,
          operatorId: l.operatorId!,
          title: SERVICE_BY_ID[l.serviceId!].name,
          date: l.date,
          qty: l.qty ?? 1,
          amount: l.amount,
          status: "pending",
        })),
      });
      setDone(b);
      setStage("done");
      navigator.vibrate?.(20);
    }, 1600);
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setStage("review");
      setDone(null);
    }, 400);
  };

  return (
    <Sheet open={open} onClose={close} title={stage === "done" ? "You're booked" : "Book your trip"} wide>
      <AnimatePresence mode="wait" initial={false}>
        {stage !== "done" ? (
          <motion.div key="review" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <p className="text-[14px] text-muted">
              One payment, split automatically to each operator. They confirm within the hour. Entrance fees and meals marked
              &quot;pay on site&quot; are not included.
            </p>
            <ul className="mt-4 divide-y divide-[var(--hairline)] rounded-2xl bg-surface px-4">
              {lines.map((l) => {
                const on = !l.closed && !off.includes(l.key);
                return (
                  <li key={l.key} className="flex items-center gap-3 py-3">
                    <button
                      role="checkbox"
                      aria-checked={on}
                      disabled={l.closed}
                      aria-label={`Include ${l.title}`}
                      onClick={() => setOff((o) => (o.includes(l.key) ? o.filter((x) => x !== l.key) : [...o, l.key]))}
                      className={cn(
                        "pressable grid size-6 shrink-0 place-items-center rounded-full border-2",
                        on ? "border-ocean bg-ocean text-white" : "border-[var(--hairline-strong)] bg-white",
                      )}
                    >
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-[15px] font-medium", !on && "text-muted")}>{SERVICE_BY_ID[l.serviceId!].name}</p>
                      <p className="flex items-center gap-1.5 truncate text-[12px] text-muted">
                        Day {l.day + 1} · {l.op.name} {l.op.verified && <Verified label="" />}
                        {l.closed && <span className="font-semibold text-coral">Fully booked</span>}
                      </p>
                    </div>
                    <span className={cn("tabular text-[15px] font-semibold", !on && "text-faint line-through")}>{peso(l.amount)}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-semibold text-muted">Name on the booking</span>
                <input
                  value={user.name === "Guest traveler" ? "" : user.name}
                  placeholder="Juan dela Cruz"
                  onChange={(e) => setUser({ name: e.target.value || "Guest traveler" })}
                  className="mt-1.5 h-12 w-full rounded-2xl bg-surface px-4 outline-none"
                />
              </label>
              <div>
                <span className="text-[13px] font-semibold text-muted">Pay with</span>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      aria-pressed={method === m.id}
                      className={cn(
                        "pressable flex h-12 items-center justify-center gap-1.5 rounded-2xl text-[14px] font-semibold",
                        method === m.id ? "bg-ink text-white" : "bg-surface",
                      )}
                    >
                      <m.icon className="size-4" /> {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-[13px] text-muted">Total today</p>
                <p className="tabular text-[30px] font-bold tracking-[-0.03em]">{peso(total)}</p>
              </div>
              <p className="max-w-[55%] text-right text-[12px] text-muted">
                {peso(total - commissionFor(total))} goes to local operators. Free cancellation up to 48 hours before.
              </p>
            </div>
            <Button size="lg" className="mt-4 w-full" onClick={pay} disabled={!chosen.length || stage === "paying"}>
              {stage === "paying" ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Confirming with {METHODS.find((m) => m.id === method)!.label}…
                </>
              ) : (
                <>
                  <Lock className="size-4" /> Pay {peso(total)}
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-[12px] text-faint">Prototype: no money moves. Payment is simulated.</p>
          </motion.div>
        ) : (
          done && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="flex flex-col items-center pb-2 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.45, duration: 0.6, delay: 0.1 }}
                className="grid size-16 place-items-center rounded-full bg-leaf text-white"
              >
                <Check className="size-8" strokeWidth={3} />
              </motion.div>
              <p className="mt-4 text-[15px] text-muted">Booking code</p>
              <p className="tabular text-[28px] font-bold tracking-[0.04em]">{done.code}</p>
              <div className="mt-5 rounded-[22px] bg-white p-4 shadow-[var(--shadow-md)] outline outline-1 outline-[var(--hairline)]">
                <QRCodeSVG value={`PASYAR:${done.code}:${done.guest}`} size={168} fgColor="#1d1d1f" />
              </div>
              <p className="mt-4 max-w-sm text-[14px] text-muted">
                {done.lines.length} bookings sent to {new Set(done.lines.map((l) => l.operatorId)).size} operators. Show this QR at
                each stop. It works offline.
              </p>
              <div className="mt-6 flex w-full gap-2">
                <Button href="/trips" size="lg" className="flex-1">
                  See my tickets
                </Button>
                <Button href="/business" variant="ghost" size="lg" className="flex-1">
                  Operator view
                </Button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </Sheet>
  );
}
