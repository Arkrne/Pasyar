"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, CheckCircle2, Clock3, MapPinned, Trash2, WifiOff, XCircle } from "lucide-react";
import { Page } from "@/components/shell";
import { Badge, Button, Sheet } from "@/components/ui";
import { useHydrated, useStore, peso, type Booking, type BookingStatus } from "@/lib/store";
import { OPERATOR_BY_ID } from "@/data/operators";
import { PLACE_BY_ID } from "@/data/places";
import { toast } from "@/components/toast";
import { cn } from "@/lib/cn";

const STATUS: Record<BookingStatus, { label: string; tone: "amber" | "leaf" | "coral" | "ocean"; icon: typeof Clock3 }> = {
  pending: { label: "Waiting for operator", tone: "amber", icon: Clock3 },
  confirmed: { label: "Confirmed", tone: "leaf", icon: CheckCircle2 },
  declined: { label: "Declined, refunded", tone: "coral", icon: XCircle },
  completed: { label: "Completed", tone: "ocean", icon: CheckCircle2 },
};

export default function TripsPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const bookings = useStore((s) => s.bookings);
  const saved = useStore((s) => s.saved);
  const current = useStore((s) => s.current);
  const setCurrent = useStore((s) => s.setCurrent);
  const removeTrip = useStore((s) => s.removeTrip);
  const completeTrip = useStore((s) => s.completeTrip);
  const [ticket, setTicket] = useState<Booking | null>(null);

  const mine = hydrated ? bookings.filter((b) => b.guest === user.name) : [];

  return (
    <Page>
      <div className="pt-4 md:pt-6">
        <p className="t-eyebrow text-muted">Trips</p>
        <h1 className="t-display mt-1">Your tickets and plans.</h1>
        <p className="mt-2 flex items-center gap-2 text-[15px] text-muted">
          <WifiOff className="size-4" /> Everything on this page works without signal once you&apos;ve opened it.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="t-headline">Bookings</h2>
        {mine.length === 0 ? (
          <div className="mt-3 rounded-[24px] bg-surface p-8 text-center">
            <p className="text-muted">No bookings yet. Build a plan and book it in one checkout.</p>
            <Button href="/plan" className="mt-4">
              Plan a trip
            </Button>
          </div>
        ) : (
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {mine.map((b, k) => {
              const allDone = b.lines.every((l) => l.status === "completed" || l.status === "declined");
              return (
                <motion.article
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5, delay: k * 0.05 }}
                  className="card overflow-hidden"
                >
                  <button onClick={() => setTicket(b)} className="flex w-full items-center gap-4 p-5 text-left">
                    <div className="rounded-xl bg-white p-1.5 outline outline-1 outline-[var(--hairline)]">
                      <QRCodeSVG value={`PASYAR:${b.code}`} size={64} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="tabular text-[13px] font-semibold tracking-[0.04em] text-muted">{b.code}</p>
                      <p className="truncate text-[17px] font-semibold">{b.tripTitle}</p>
                      <p className="text-[13px] text-muted">
                        {b.lines.length} items · {peso(b.total)} · {b.method.toUpperCase()}
                      </p>
                    </div>
                  </button>
                  <ul className="divide-y divide-[var(--hairline)] border-t border-[var(--hairline)] px-5">
                    {b.lines.map((l) => {
                      const s = STATUS[l.status];
                      return (
                        <li key={l.id} className="flex items-center gap-3 py-2.5">
                          <s.icon className={cn("size-4 shrink-0", l.status === "confirmed" ? "text-leaf" : l.status === "declined" ? "text-coral" : l.status === "completed" ? "text-ocean" : "text-amber")} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-medium">{l.title}</p>
                            <p className="truncate text-[12px] text-muted">
                              {OPERATOR_BY_ID[l.operatorId]?.name} · {new Date(l.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <Badge tone={s.tone}>{s.label}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                  {!allDone && (
                    <div className="border-t border-[var(--hairline)] p-3">
                      <button
                        onClick={() => {
                          completeTrip(b.id);
                          toast("Trip marked complete", "You can now leave verified reviews for these operators.");
                        }}
                        className="pressable w-full rounded-full bg-surface py-2.5 text-[13px] font-semibold text-ink-2"
                      >
                        Demo: finish this trip
                      </button>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="t-headline">Saved plans</h2>
        {hydrated && current && !saved.some((s) => s.id === current.id) && (
          <button onClick={() => router.push("/trip")} className="pressable mt-3 flex w-full items-center gap-4 rounded-[22px] bg-ocean-soft p-4 text-left">
            <MapPinned className="size-6 text-ocean" />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-ocean-ink">Continue your latest plan</p>
              <p className="text-[13px] text-ocean-ink/70">{current.title}</p>
            </div>
          </button>
        )}
        {hydrated && saved.length === 0 && <p className="mt-3 text-muted">Tap Save on any plan to keep it here for offline use.</p>}
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hydrated &&
            saved.map((t) => {
              const first = t.days.flatMap((d) => d.items).find((i) => i.placeId && !i.serviceId);
              const photo = first?.placeId ? PLACE_BY_ID[first.placeId].photo : "/photos/binurong-sunset.webp";
              return (
                <article key={t.id} className="card hover-zoom overflow-hidden">
                  <button
                    onClick={() => {
                      setCurrent(t);
                      router.push("/trip");
                    }}
                    className="block w-full text-left"
                  >
                    <div className="relative aspect-[16/10]">
                      <Image src={photo} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                      <span className="glass absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                        <WifiOff className="size-3" /> Offline ready
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[16px] font-semibold">{t.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                        <CalendarDays className="size-3.5" /> {t.days[0].date} · {peso(t.totals.group)}
                      </p>
                    </div>
                  </button>
                  <div className="flex justify-end border-t border-[var(--hairline)] px-2 py-1">
                    <button onClick={() => removeTrip(t.id)} aria-label="Delete saved plan" className="pressable grid size-9 place-items-center rounded-full text-muted hover:bg-surface">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              );
            })}
        </div>
      </section>

      <Sheet open={!!ticket} onClose={() => setTicket(null)} title="E-ticket">
        {ticket && (
          <div className="flex flex-col items-center pb-2 text-center">
            <div className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-md)] outline outline-1 outline-[var(--hairline)]">
              <QRCodeSVG value={`PASYAR:${ticket.code}:${ticket.guest}`} size={220} />
            </div>
            <p className="tabular mt-4 text-[26px] font-bold tracking-[0.06em]">{ticket.code}</p>
            <p className="text-[14px] text-muted">
              {ticket.guest} · {ticket.guests} {ticket.guests === 1 ? "guest" : "guests"}
            </p>
            <p className="mt-4 max-w-xs text-[13px] text-muted">Show this at every stop. The operator scans it to check you in, even offline.</p>
          </div>
        )}
      </Sheet>
    </Page>
  );
}
