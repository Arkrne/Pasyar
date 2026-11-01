"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Download, Info } from "lucide-react";
import { Logo } from "@/components/shell";
import { Badge } from "@/components/ui";
import { useHydrated, useStore, peso } from "@/lib/store";
import { OPERATOR_BY_ID } from "@/data/operators";
import { PLACES } from "@/data/places";
import { TOWNS, TOWN_BY_ID } from "@/data/towns";
import { COMMISSION_RATE } from "@/lib/planner";
import { toast } from "@/components/toast";
import { cn } from "@/lib/cn";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/* Pilot projection: dry-season peak Mar to Aug (provincial tourism guidance), Holy Week spike, surf season Aug to Oct. */
const DEMAND = [38, 44, 70, 92, 81, 74, 66, 78, 69, 73, 41, 52];

export default function InsightsPage() {
  const hydrated = useHydrated();
  const bookings = useStore((s) => s.bookings);

  const stats = useMemo(() => {
    const lines = bookings.flatMap((b) => b.lines.filter((l) => l.status !== "declined"));
    const gmv = lines.reduce((a, l) => a + l.amount, 0);
    const byKind: Record<string, number> = {};
    const byTown: Record<string, number> = {};
    for (const l of lines) {
      const op = OPERATOR_BY_ID[l.operatorId];
      if (!op) continue;
      byKind[op.kind] = (byKind[op.kind] ?? 0) + l.amount;
      byTown[op.town] = (byTown[op.town] ?? 0) + l.amount;
    }
    return {
      gmv,
      commission: Math.round(gmv * COMMISSION_RATE),
      bookings: bookings.length,
      guests: bookings.reduce((a, b) => a + b.guests, 0),
      basket: bookings.length ? gmv / bookings.length : 0,
      byKind,
      byTown,
    };
  }, [bookings]);

  const top = [...PLACES].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
  const maxTop = top[0].reviews;
  const kinds = [
    { id: "stay", label: "Stays", c: "bg-ocean" },
    { id: "tour", label: "Tours & guides", c: "bg-lagoon" },
    { id: "transport", label: "Rides", c: "bg-coral" },
    { id: "food", label: "Food", c: "bg-amber" },
  ];
  const kindTotal = Math.max(1, kinds.reduce((a, k) => a + (stats.byKind[k.id] ?? 0), 0));

  if (!hydrated) return <div className="skeleton h-dvh" />;

  return (
    <div className="min-h-dvh bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-[var(--hairline)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={24} word={false} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">
              Pasyar <span className="text-lagoon">Insights</span>
            </span>
          </Link>
          <Link href="/business" className="text-[13px] font-semibold text-ocean">
            Operator view
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="t-eyebrow text-muted">For the Provincial Tourism Office and LGUs</p>
            <h1 className="t-display mt-1">Where visitors go, and what they spend.</h1>
          </div>
          <button
            onClick={() => toast("Report queued", "A PDF summary would be emailed to the tourism office.", "info")}
            className="pressable flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-white"
          >
            <Download className="size-4" /> Monthly report
          </button>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[13px] text-muted">
          <Info className="size-4" /> Prototype data: live demo bookings plus a projected demand curve. Real numbers replace these once operators are onboarded.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Gross bookings (GMV)" value={peso(stats.gmv)} />
          <Kpi label="Pasyar commission" value={peso(stats.commission)} tone="ocean" />
          <Kpi label="Bookings" value={String(stats.bookings)} sub={`${stats.guests} guests`} />
          <Kpi label="Average basket" value={peso(stats.basket)} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card title="Projected demand by month" sub="Relative booking volume, pilot year">
            <div className="mt-4 flex h-52 items-end gap-2">
              {DEMAND.map((v, k) => (
                <div key={k} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="tabular text-[10px] text-muted">{v}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${v}%` }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", bounce: 0, duration: 0.9, delay: k * 0.03 }}
                    className={cn("w-full rounded-t-[6px]", k >= 2 && k <= 7 ? "bg-ocean" : k >= 8 && k <= 9 ? "bg-lagoon" : "bg-surface-2")}
                  />
                  <span className="text-[11px] font-medium text-muted">{MONTHS[k]}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-muted">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-ocean" /> Dry season</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-lagoon" /> Surf season</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-surface-2" /> Typhoon months</span>
            </div>
          </Card>

          <Card title="Spend by category">
            <div className="mt-4 flex h-4 overflow-hidden rounded-full">
              {kinds.map((k) => (
                <motion.div key={k.id} className={k.c} initial={{ width: 0 }} animate={{ width: `${((stats.byKind[k.id] ?? 0) / kindTotal) * 100}%` }} transition={{ type: "spring", bounce: 0, duration: 0.9 }} />
              ))}
            </div>
            <ul className="mt-4 space-y-2.5">
              {kinds.map((k) => (
                <li key={k.id} className="flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", k.c)} /> {k.label}
                  </span>
                  <span className="tabular font-semibold">{peso(stats.byKind[k.id] ?? 0)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Most visited places" sub="By verified visits and reviews">
            <ul className="mt-3 space-y-3">
              {top.map((p) => (
                <li key={p.id}>
                  <div className="flex justify-between text-[14px]">
                    <span className="font-medium">
                      {p.name} <span className="text-muted">· {TOWN_BY_ID[p.town].name}</span>
                    </span>
                    <span className="tabular text-muted">{p.reviews.toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
                    <motion.div className="h-full rounded-full bg-ocean" initial={{ width: 0 }} whileInView={{ width: `${(p.reviews / maxTop) * 100}%` }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0, duration: 0.9 }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Money reaching each town" sub="From Pasyar bookings">
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {TOWNS.map((t) => {
                const v = stats.byTown[t.id] ?? 0;
                return (
                  <li key={t.id} className={cn("rounded-2xl p-3", v ? "bg-ocean-soft" : "bg-surface")}>
                    <p className="text-[13px] font-medium">{t.name}</p>
                    <p className={cn("tabular text-[17px] font-bold", !v && "text-faint")}>{peso(v)}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[13px] text-muted">
              Towns at zero are where the province can point new visitors. <Badge tone="coral">Gap</Badge>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "ocean" }) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
      <p className="text-[13px] text-muted">{label}</p>
      <p className={cn("tabular mt-1 text-[26px] font-bold tracking-[-0.03em]", tone === "ocean" && "text-ocean")}>{value}</p>
      {sub && <p className="text-[12px] text-muted">{sub}</p>}
    </div>
  );
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-sm)]">
      <h2 className="text-[17px] font-semibold">{title}</h2>
      {sub && <p className="text-[13px] text-muted">{sub}</p>}
      {children}
    </section>
  );
}
