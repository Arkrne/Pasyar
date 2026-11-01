"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Megaphone, MessageSquareReply, Plus, Receipt, Star, Wallet, X } from "lucide-react";
import { Logo } from "@/components/shell";
import { Avatar, Badge, Button, Sheet, Verified } from "@/components/ui";
import { toast } from "@/components/toast";
import { OPERATORS, OPERATOR_BY_ID } from "@/data/operators";
import { REVIEWS } from "@/data/community";
import { TOWN_BY_ID } from "@/data/towns";
import { useHydrated, useStore, peso } from "@/lib/store";
import { COMMISSION_RATE } from "@/lib/planner";
import { cn } from "@/lib/cn";

type Tab = "inbox" | "listings" | "sales" | "reviews";

export default function BusinessPage() {
  const hydrated = useHydrated();
  const opId = useStore((s) => s.activeOperator);
  const setOp = useStore((s) => s.setActiveOperator);
  const bookings = useStore((s) => s.bookings);
  const walkIns = useStore((s) => s.walkIns);
  const [tab, setTab] = useState<Tab>("inbox");
  const [pick, setPick] = useState(false);
  const op = OPERATOR_BY_ID[opId];

  const lines = useMemo(
    () =>
      bookings
        .flatMap((b) => b.lines.filter((l) => l.operatorId === opId).map((l) => ({ ...l, booking: b })))
        .sort((a, b) => +new Date(b.booking.createdAt) - +new Date(a.booking.createdAt)),
    [bookings, opId],
  );
  const pending = lines.filter((l) => l.status === "pending");
  const earned = lines.filter((l) => l.status !== "declined").reduce((a, l) => a + l.amount, 0);
  const pos = walkIns.filter((w) => w.operatorId === opId).reduce((a, w) => a + w.amount, 0);
  const commission = Math.round(earned * COMMISSION_RATE);

  if (!hydrated) return <div className="skeleton h-dvh" />;

  return (
    <div className="min-h-dvh bg-surface">
      <header className="glass sticky top-0 z-40 border-b border-[var(--hairline)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={24} word={false} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">
              Pasyar <span className="text-ocean">Business</span>
            </span>
          </Link>
          <Link href="/insights" className="text-[13px] font-semibold text-ocean">
            Insights
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5">
        <button onClick={() => setPick(true)} className="pressable flex w-full items-center gap-3 rounded-[22px] bg-white p-3 text-left shadow-[var(--shadow-sm)]">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-[14px]">
            <Image src={op.photo} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[18px] font-semibold">
              {op.name} {op.verified && <Verified label="" />}
            </p>
            <p className="text-[13px] text-muted">
              {TOWN_BY_ID[op.town].name} · ★ {op.rating} · Switch business
            </p>
          </div>
          <ChevronDown className="size-5 text-muted" />
        </button>

        {/* Big numbers, readable on a cheap phone in the sun */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="New requests" value={String(pending.length)} tone={pending.length ? "coral" : undefined} />
          <Stat label="Booked via Pasyar" value={peso(earned)} />
          <Stat label="Walk-in sales" value={peso(pos)} />
          <Stat label="You keep" value={peso(earned - commission + pos)} tone="leaf" sub={`after ${Math.round(COMMISSION_RATE * 100)}% fee on app bookings`} />
        </div>

        <nav className="no-scrollbar mt-5 flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-[var(--shadow-sm)]">
          {(
            [
              ["inbox", `Inbox${pending.length ? ` (${pending.length})` : ""}`],
              ["listings", "Listings"],
              ["sales", "Sales & POS"],
              ["reviews", "Reviews"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={cn("pressable relative h-11 flex-1 whitespace-nowrap rounded-full px-4 text-[15px] font-semibold", tab === id ? "text-white" : "text-ink-2")}>
              {tab === id && <motion.span layoutId="biztab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.1, duration: 0.4 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-5">
          {tab === "inbox" && <Inbox lines={lines} />}
          {tab === "listings" && <Listings opId={opId} />}
          {tab === "sales" && <Sales opId={opId} lines={lines} commission={commission} />}
          {tab === "reviews" && <ReviewsTab opId={opId} />}
        </div>
      </main>

      <Sheet open={pick} onClose={() => setPick(false)} title="Demo: switch business">
        <ul className="space-y-1.5 pb-2">
          {OPERATORS.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => {
                  setOp(o.id);
                  setPick(false);
                }}
                className={cn("pressable flex w-full items-center gap-3 rounded-2xl p-2.5 text-left", o.id === opId ? "bg-ocean-soft" : "hover:bg-surface")}
              >
                <div className="relative size-10 shrink-0 overflow-hidden rounded-xl">
                  <Image src={o.photo} alt="" fill sizes="40px" className="object-cover" />
                </div>
                <span className="flex-1 text-[15px] font-medium">{o.name}</span>
                <span className="text-[12px] capitalize text-muted">{o.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}

function Stat({ label, value, tone, sub }: { label: string; value: string; tone?: "coral" | "leaf"; sub?: string }) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <p className={cn("tabular mt-1 text-[30px] font-bold leading-none tracking-[-0.03em]", tone === "coral" && "text-coral", tone === "leaf" && "text-leaf")}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

type Line = ReturnType<typeof useStore.getState>["bookings"][number]["lines"][number] & {
  booking: ReturnType<typeof useStore.getState>["bookings"][number];
};

function Inbox({ lines }: { lines: Line[] }) {
  const setStatus = useStore((s) => s.setLineStatus);
  if (!lines.length)
    return <p className="rounded-[22px] bg-white p-8 text-center text-muted">No bookings yet. They show up here the moment a traveler pays.</p>;
  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {lines.map((l) => (
          <motion.li
            key={l.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.45 }}
            className={cn("rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]", l.status === "pending" && "outline outline-2 outline-coral/40")}
          >
            <div className="flex items-start gap-3">
              <Avatar name={l.booking.guest} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold">{l.booking.guest}</p>
                <p className="text-[14px] text-ink-2">{l.title}</p>
                <p className="text-[13px] text-muted">
                  {new Date(l.date).toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })} · {l.booking.guests} guests · qty {l.qty} · {l.booking.code}
                </p>
              </div>
              <p className="tabular text-[20px] font-bold">{peso(l.amount)}</p>
            </div>
            {l.status === "pending" ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setStatus(l.booking.id, l.id, "declined");
                    toast("Declined", "The traveler is refunded and offered another operator.", "info");
                  }}
                  className="pressable flex h-14 items-center justify-center gap-2 rounded-2xl bg-surface text-[17px] font-semibold"
                >
                  <X className="size-5" /> Decline
                </button>
                <button
                  onClick={() => {
                    setStatus(l.booking.id, l.id, "confirmed");
                    toast("Confirmed", `${l.booking.guest} got a notification.`);
                  }}
                  className="pressable flex h-14 items-center justify-center gap-2 rounded-2xl bg-leaf text-[17px] font-semibold text-white"
                >
                  <Check className="size-5" /> Accept
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <Badge tone={l.status === "confirmed" ? "leaf" : l.status === "completed" ? "ocean" : "coral"}>
                  {l.status === "confirmed" ? "Confirmed" : l.status === "completed" ? "Completed · paid out" : "Declined"}
                </Badge>
              </div>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function Listings({ opId }: { opId: string }) {
  const op = OPERATOR_BY_ID[opId];
  const availability = useStore((s) => s.availability);
  const setAvailability = useStore((s) => s.setAvailability);
  const prices = useStore((s) => s.priceOverrides);
  const setPrice = useStore((s) => s.setPrice);
  const featured = useStore((s) => s.featured);
  const setFeatured = useStore((s) => s.setFeatured);
  const isFeatured = featured[opId] ?? !!op.featured;

  return (
    <div className="space-y-3">
      {op.services.map((s) => {
        const open = availability[s.id] !== false;
        return (
          <div key={s.id} className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[17px] font-semibold">{s.name}</p>
                <p className="text-[13px] text-muted">per {s.unit}{s.capacity ? ` · up to ${s.capacity}` : ""}</p>
              </div>
              <button
                role="switch"
                aria-checked={open}
                aria-label={`Accepting bookings for ${s.name}`}
                onClick={() => setAvailability(s.id, !open)}
                className={cn("relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors", open ? "bg-leaf" : "bg-surface-2")}
              >
                <span className={cn("absolute top-[2px] size-[27px] rounded-full bg-white shadow transition-all duration-300", open ? "left-[22px]" : "left-[2px]")} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[14px] text-muted">Price</span>
              <div className="flex items-center rounded-2xl bg-surface">
                <button onClick={() => setPrice(s.id, Math.max(0, (prices[s.id] ?? s.price) - 50))} className="pressable grid size-12 place-items-center text-[22px] font-semibold" aria-label="Lower price">
                  −
                </button>
                <span className="tabular w-24 text-center text-[20px] font-bold">{peso(prices[s.id] ?? s.price)}</span>
                <button onClick={() => setPrice(s.id, (prices[s.id] ?? s.price) + 50)} className="pressable grid size-12 place-items-center text-[22px] font-semibold" aria-label="Raise price">
                  +
                </button>
              </div>
              <span className={cn("ml-auto text-[13px] font-semibold", open ? "text-leaf" : "text-coral")}>{open ? "Open" : "Fully booked"}</span>
            </div>
          </div>
        );
      })}
      <div className={cn("flex items-center gap-4 rounded-[22px] p-5", isFeatured ? "bg-ocean-soft" : "bg-white shadow-[var(--shadow-sm)]")}>
        <Megaphone className="size-7 shrink-0 text-ocean" />
        <div className="flex-1">
          <p className="text-[17px] font-semibold">Featured listing · ₱499 / month</p>
          <p className="text-[13px] text-muted">Show first in your town and in plans that match. Cancel any time.</p>
        </div>
        <Button
          variant={isFeatured ? "ghost" : "primary"}
          onClick={() => {
            setFeatured(opId, !isFeatured);
            toast(isFeatured ? "Feature turned off" : "You're featured", isFeatured ? undefined : "Simulated charge of ₱499 to GCash.");
          }}
        >
          {isFeatured ? "Stop" : "Feature me"}
        </Button>
      </div>
    </div>
  );
}

function Sales({ opId, lines, commission }: { opId: string; lines: Line[]; commission: number }) {
  const walkIns = useStore((s) => s.walkIns).filter((w) => w.operatorId === opId);
  const addWalkIn = useStore((s) => s.addWalkIn);
  const [amt, setAmt] = useState("");
  const [label, setLabel] = useState("");

  // 14-day sales calendar
  const days = Array.from({ length: 14 }, (_, k) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + k);
    const iso = d.toISOString().slice(0, 10);
    const app = lines.filter((l) => l.date === iso && l.status !== "declined").reduce((a, l) => a + l.amount, 0);
    const walk = walkIns.filter((w) => w.at.slice(0, 10) === iso).reduce((a, w) => a + w.amount, 0);
    return { iso, d, app, walk, today: k === 6 };
  });
  const max = Math.max(1, ...days.map((x) => x.app + x.walk));

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
        <p className="flex items-center gap-2 text-[17px] font-semibold">
          <Receipt className="size-5" /> Quick sale
        </p>
        <p className="text-[13px] text-muted">Log walk-in guests so your totals stay in one place. No fee on these.</p>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(amt);
            if (!n) return;
            addWalkIn({ operatorId: opId, label: label || "Walk-in", amount: n });
            toast("Sale recorded", `${peso(n)} added to today.`);
            setAmt("");
            setLabel("");
          }}
        >
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What was sold" className="h-14 flex-1 rounded-2xl bg-surface px-4 text-[17px] outline-none" />
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="₱ Amount" className="tabular h-14 rounded-2xl bg-surface px-4 text-[20px] font-semibold outline-none sm:w-40" />
          <button className="pressable flex h-14 items-center justify-center gap-2 rounded-2xl bg-ocean px-6 text-[17px] font-semibold text-white">
            <Plus className="size-5" /> Add
          </button>
        </form>
      </div>

      <div className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
        <p className="text-[17px] font-semibold">Sales calendar</p>
        <div className="mt-4 flex h-40 items-end gap-1.5">
          {days.map((x) => (
            <div key={x.iso} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex w-full flex-col justify-end overflow-hidden rounded-md" style={{ height: `${((x.app + x.walk) / max) * 100}%`, minHeight: 3 }}>
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, flex: x.walk }} className="bg-lagoon" />
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ originY: 1, flex: x.app || (x.walk ? 0 : 1) }} className={x.app ? "bg-ocean" : "bg-surface-2"} />
              </div>
              <span className={cn("tabular text-[10px]", x.today ? "font-bold text-ink" : "text-muted")}>{x.d.getDate()}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[12px] text-muted">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-ocean" /> Pasyar bookings</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-lagoon" /> Walk-ins</span>
        </div>
      </div>

      <div className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
        <p className="flex items-center gap-2 text-[17px] font-semibold">
          <Wallet className="size-5" /> Commission ledger
        </p>
        <ul className="mt-2 divide-y divide-[var(--hairline)]">
          {lines.filter((l) => l.status !== "declined").slice(0, 8).map((l) => (
            <li key={l.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-2.5 text-[14px]">
              <span className="truncate">
                {l.booking.code} · {l.title}
              </span>
              <span className="tabular text-muted">−{peso(l.amount * COMMISSION_RATE)}</span>
              <span className="tabular font-semibold">{peso(l.amount * (1 - COMMISSION_RATE))}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[13px] text-muted">
          Total fees this period: <span className="tabular font-semibold text-ink">{peso(commission)}</span>. Payouts go to GCash every Monday.
        </p>
      </div>
    </div>
  );
}

function ReviewsTab({ opId }: { opId: string }) {
  const replies = useStore((s) => s.replies);
  const setReply = useStore((s) => s.setReply);
  const mine = useStore((s) => s.myReviews);
  const list = [...mine, ...REVIEWS].filter((r) => r.targetId === opId);
  const [draft, setDraft] = useState<Record<string, string>>({});
  if (!list.length) return <p className="rounded-[22px] bg-white p-8 text-center text-muted">No reviews yet. Verified guests can review you after their trip.</p>;
  return (
    <ul className="space-y-3">
      {list.map((r) => (
        <li key={r.id} className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[16px] font-semibold">
              {r.author} {r.verified && <Verified label="Verified visit" />}
            </p>
            <span className="flex items-center gap-1 font-semibold">
              <Star className="size-4 fill-[#f5a623] text-[#f5a623]" /> {r.stars}
            </span>
          </div>
          <p className="mt-1.5 text-[15px] text-ink-2">{r.text}</p>
          {replies[r.id] || r.reply ? (
            <p className="mt-3 border-l-2 border-ocean pl-3 text-[14px] text-ink-2">
              <span className="font-semibold">You: </span>
              {replies[r.id] || r.reply}
            </p>
          ) : (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft[r.id]?.trim()) return;
                setReply(r.id, draft[r.id].trim());
                toast("Reply posted");
              }}
            >
              <input
                value={draft[r.id] ?? ""}
                onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })}
                placeholder="Reply as the owner"
                className="h-12 flex-1 rounded-2xl bg-surface px-4 outline-none"
              />
              <button className="pressable grid size-12 place-items-center rounded-2xl bg-ocean text-white" aria-label="Send reply">
                <MessageSquareReply className="size-5" />
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}

