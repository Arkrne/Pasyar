"use client";

import Link from "next/link";
import { Accessibility, Clock, Plus, ShieldAlert, Sun, Ticket, Star } from "lucide-react";
import { PLACE_BY_ID, REPRESENTATIVE_PHOTO } from "@/data/places";
import { TOWN_BY_ID } from "@/data/towns";
import { OPERATORS } from "@/data/operators";
import { REVIEWS } from "@/data/community";
import { Badge, Button, Photo, Sheet, Stars, Verified } from "./ui";
import { useStore, peso } from "@/lib/store";

export function PlaceSheet({
  placeId,
  onClose,
  onAdd,
  addLabel = "Add to my trip",
}: {
  placeId: string | null;
  onClose: () => void;
  onAdd?: (id: string) => void;
  addLabel?: string;
}) {
  const p = placeId ? PLACE_BY_ID[placeId] : null;
  return (
    <Sheet open={!!p} onClose={onClose} title={p?.name}>
      {p && (
        <div className="pb-2">
          <Photo src={p.photo} alt={p.name} className="aspect-[16/10] rounded-[20px]" rep={REPRESENTATIVE_PHOTO.has(p.id)} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link href={`/explore?town=${p.town}`} className="text-[14px] font-semibold text-ocean">
              {TOWN_BY_ID[p.town].name}
            </Link>
            <span className="text-faint">·</span>
            <span className="inline-flex items-center gap-1 text-[14px]">
              <Stars value={p.rating} size={13} /> <span className="tabular font-semibold">{p.rating.toFixed(1)}</span>
              <span className="text-muted">({p.reviews.toLocaleString()})</span>
            </span>
            {p.gem && <Badge tone="coral">Hidden gem</Badge>}
          </div>
          <p className="t-body mt-3 text-ink-2">{p.details}</p>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Fact icon={Clock} label="Time here" value={p.hours >= 1 ? `${p.hours} hrs` : `${Math.round(p.hours * 60)} min`} />
            <Fact icon={Ticket} label="Fees" value={p.fee ? `${peso(p.fee)} / person` : "Free"} />
            {p.bestTime && <Fact icon={Sun} label="Best time" value={p.bestTime} wide />}
          </div>
          {p.feeNote && <p className="mt-2 text-[13px] text-muted">{p.feeNote}</p>}

          {(p.safety || p.accessibility) && (
            <div className="mt-5 space-y-2.5">
              {p.safety && (
                <div className="flex gap-3 rounded-2xl bg-amber-soft p-3.5 text-[14px] text-[#7a4900]">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {p.safety}
                </div>
              )}
              {p.accessibility && (
                <div className="flex gap-3 rounded-2xl bg-surface p-3.5 text-[14px] text-ink-2">
                  <Accessibility className="mt-0.5 size-4 shrink-0" /> {p.accessibility}
                </div>
              )}
            </div>
          )}

          <Operators placeId={p.id} />
          <Reviews targetId={p.id} />

          {onAdd && (
            <div className="sticky bottom-0 -mx-5 mt-4 bg-gradient-to-t from-white via-white to-white/0 px-5 pb-1 pt-6">
              <Button size="lg" className="w-full" onClick={() => onAdd(p.id)}>
                <Plus className="size-5" /> {addLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}

function Fact({ icon: Icon, label, value, wide }: { icon: typeof Clock; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl bg-surface p-3.5 ${wide ? "col-span-2" : ""}`}>
      <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
        <Icon className="size-3.5" /> {label}
      </p>
      <p className="mt-1 text-[15px] font-semibold">{value}</p>
    </div>
  );
}

function Operators({ placeId }: { placeId: string }) {
  const ops = OPERATORS.filter((o) => o.services.some((s) => s.placeId === placeId));
  if (!ops.length) return null;
  return (
    <div className="mt-6">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Book a local</h3>
      <ul className="mt-2 space-y-2">
        {ops.map((o) => {
          const s = o.services.find((x) => x.placeId === placeId)!;
          return (
            <li key={o.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
              <Photo src={o.photo} alt="" className="size-12 shrink-0 rounded-xl" sizes="48px" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
                  {o.name} {o.verified && <Verified label="Verified" />}
                </p>
                <p className="truncate text-[13px] text-muted">{s.name}</p>
              </div>
              <span className="tabular text-[15px] font-semibold">{peso(s.price)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Reviews({ targetId, limit = 3 }: { targetId: string; limit?: number }) {
  const mine = useStore((s) => s.myReviews);
  const replies = useStore((s) => s.replies);
  const list = [...mine.filter((r) => r.targetId === targetId), ...REVIEWS.filter((r) => r.targetId === targetId)].slice(0, limit);
  if (!list.length) return null;
  return (
    <div className="mt-6">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Reviews</h3>
      <ul className="mt-2 space-y-2.5">
        {list.map((r) => (
          <li key={r.id} className="rounded-2xl bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[14px] font-semibold">
                {r.author}
                {r.verified ? <Verified label="Verified visit" /> : <Badge>Unverified</Badge>}
              </span>
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold">
                <Star className="size-3.5 fill-[#f5a623] text-[#f5a623]" />
                {r.stars}
              </span>
            </div>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{r.text}</p>
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
              {Object.entries(r.aspects).map(([k, v]) => (
                <span key={k} className="capitalize">
                  {k} <span className="tabular font-semibold text-ink-2">{v}/5</span>
                </span>
              ))}
            </div>
            {(replies[r.id] || r.reply) && (
              <p className="mt-3 border-l-2 border-ocean pl-3 text-[13px] text-ink-2">
                <span className="font-semibold">Owner reply: </span>
                {replies[r.id] || r.reply}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
