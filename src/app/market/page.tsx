"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie, Minus, Nut, Plus, ShoppingBag, Sparkles, Coffee, Sun } from "lucide-react";
import { Page } from "@/components/shell";
import { Button, Chip, Sheet } from "@/components/ui";
import { toast } from "@/components/toast";
import { PRODUCTS } from "@/data/content";
import { TOWN_BY_ID } from "@/data/towns";
import { useHydrated, useStore, peso } from "@/lib/store";
import { cn } from "@/lib/cn";

const TILE: Record<string, { bg: string; icon: typeof Cookie }> = {
  "latik-pack": { bg: "linear-gradient(140deg,#f6e3c4,#e8b97a)", icon: Cookie },
  "pili-nuts": { bg: "linear-gradient(140deg,#efe2cf,#c9a273)", icon: Nut },
  tablea: { bg: "linear-gradient(140deg,#e9d6cb,#8a5a44)", icon: Coffee },
  "sugbo-broom": { bg: "linear-gradient(140deg,#eef0d9,#b9b66f)", icon: Sparkles },
  "buri-hat": { bg: "linear-gradient(140deg,#f7ecd2,#d8b46a)", icon: Sun },
};

function ProductImage({ id, photo, name, sizes, className }: { id: string; photo: string; name: string; sizes: string; className?: string }) {
  if (photo) return <Image src={photo} alt={name} fill sizes={sizes} className={cn("object-cover", className)} />;
  const t = TILE[id] ?? { bg: "linear-gradient(140deg,#eef2f6,#cfd8e3)", icon: Sparkles };
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: t.bg }} aria-label={name} role="img">
      <t.icon className="size-1/3 text-white/90" strokeWidth={1.4} />
    </div>
  );
}

const TAGS = [
  { id: "all", label: "Everything" },
  { id: "abaca", label: "Abacá" },
  { id: "food", label: "Food" },
  { id: "craft", label: "Crafts" },
] as const;

export default function MarketPage() {
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.addToCart);
  const clear = useStore((s) => s.clearCart);
  const [tag, setTag] = useState<(typeof TAGS)[number]["id"]>("all");
  const [open, setOpen] = useState(false);
  const items = PRODUCTS.filter((p) => tag === "all" || p.tag === tag);
  const count = hydrated ? Object.values(cart).reduce((a, n) => a + n, 0) : 0;
  const total = hydrated ? Object.entries(cart).reduce((a, [id, n]) => a + (PRODUCTS.find((p) => p.id === id)?.price ?? 0) * n, 0) : 0;

  return (
    <Page>
      <div className="relative mt-4 overflow-hidden rounded-[32px] md:mt-6">
        <div className="relative aspect-[16/10] md:aspect-[21/8]">
          <Image src="/photos/abaca-bags-2.webp" alt="Abacá bags from Catanduanes" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-10">
            <p className="t-eyebrow text-white/75">Pasalubong market</p>
            <h1 className="t-display mt-1 max-w-xl">Made in the abacá capital.</h1>
            <p className="mt-2 max-w-md text-[15px] text-white/85">
              Catanduanes grows more abacá than any other province. Buy straight from the weavers, farmers and cooks. Pick up in Virac or have it shipped.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {TAGS.map((t) => (
          <Chip key={t.id} active={tag === t.id} onClick={() => setTag(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p, k) => {
          const n = hydrated ? cart[p.id] ?? 0 : 0;
          return (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5, delay: k * 0.04 }}
              className="card hover-zoom flex flex-col overflow-hidden"
            >
              <div className="relative aspect-square">
                <ProductImage id={p.id} photo={p.photo} name={p.name} sizes="(max-width:768px) 50vw, 25vw" />
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <p className="text-[12px] font-medium text-muted">
                  {p.maker} · {TOWN_BY_ID[p.town].name}
                </p>
                <h2 className="mt-0.5 text-[15px] font-semibold leading-snug">{p.name}</h2>
                <p className="mt-1 line-clamp-2 text-[13px] text-muted">{p.blurb}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="tabular text-[16px] font-bold">{peso(p.price)}</span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {n === 0 ? (
                      <motion.button
                        key="add"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => add(p.id)}
                        className="pressable grid size-9 place-items-center rounded-full bg-ocean text-white"
                        aria-label={`Add ${p.name}`}
                      >
                        <Plus className="size-4" />
                      </motion.button>
                    ) : (
                      <motion.div key="qty" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-1 rounded-full bg-surface p-0.5">
                        <button onClick={() => add(p.id, -1)} className="pressable grid size-8 place-items-center rounded-full bg-white" aria-label="Remove one">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="tabular w-5 text-center text-[14px] font-semibold">{n}</span>
                        <button onClick={() => add(p.id)} className="pressable grid size-8 place-items-center rounded-full bg-white" aria-label="Add one">
                          <Plus className="size-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
            className="fixed inset-x-0 bottom-[calc(var(--tabbar-h)+var(--safe-b)+12px)] z-40 px-4 md:bottom-6"
          >
            <button onClick={() => setOpen(true)} className="pressable mx-auto flex h-14 w-full max-w-md items-center justify-between rounded-full bg-ink px-5 text-white shadow-[var(--shadow-lg)]">
              <span className="flex items-center gap-2 font-semibold">
                <ShoppingBag className="size-5" /> {count} {count === 1 ? "item" : "items"}
              </span>
              <span className="tabular font-bold">{peso(total)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={open} onClose={() => setOpen(false)} title="Your pasalubong">
        <ul className="divide-y divide-[var(--hairline)]">
          {Object.entries(cart).map(([id, n]) => {
            const p = PRODUCTS.find((x) => x.id === id)!;
            return (
              <li key={id} className="flex items-center gap-3 py-3">
                <div className="relative size-12 overflow-hidden rounded-xl">
                  <ProductImage id={p.id} photo={p.photo} name="" sizes="48px" />
                </div>
                <span className="flex-1 text-[15px] font-medium">
                  {p.name} <span className="text-muted">× {n}</span>
                </span>
                <span className="tabular font-semibold">{peso(p.price * n)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 rounded-2xl bg-surface p-4 text-[14px] text-muted">Pick up at the Pasyar counter, Virac Airport, or ship to Metro Manila for ₱180.</div>
        <Button
          size="lg"
          className={cn("mt-4 w-full")}
          onClick={() => {
            clear();
            setOpen(false);
            toast("Order placed", `${peso(total)} paid with GCash (simulated). Makers have been notified.`);
          }}
        >
          Pay {peso(total)}
        </Button>
      </Sheet>
    </Page>
  );
}
