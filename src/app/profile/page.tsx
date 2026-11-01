"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, Bookmark, Briefcase, ChevronRight, CloudLightning, Globe, LineChart, RotateCcw, Store } from "lucide-react";
import { Page } from "@/components/shell";
import { Avatar, Badge } from "@/components/ui";
import { useHydrated, useStore } from "@/lib/store";
import { LANGS } from "@/lib/i18n";
import { POSTS } from "@/data/community";
import { toast } from "@/components/toast";
import { cn } from "@/lib/cn";

export default function ProfilePage() {
  const hydrated = useHydrated();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const stormSim = useStore((s) => s.stormSim);
  const setStormSim = useStore((s) => s.setStormSim);
  const bookings = useStore((s) => s.bookings);
  const savedPosts = useStore((s) => s.savedPosts);
  const myPosts = useStore((s) => s.myPosts);
  const myReviews = useStore((s) => s.myReviews);
  const resetDemo = useStore((s) => s.resetDemo);

  const mine = hydrated ? bookings.filter((b) => b.guest === user.name) : [];
  const done = mine.some((b) => b.lines.some((l) => l.status === "completed"));
  const badges = [
    { id: "first", label: "First plan", on: hydrated && useStore.getState().hasPlanned },
    { id: "booked", label: "Booked local", on: mine.length > 0 },
    { id: "verified", label: "Verified traveler", on: done },
    { id: "storyteller", label: "Storyteller", on: myPosts.length > 0 },
    { id: "critic", label: "Honest critic", on: myReviews.length > 0 },
  ];
  const saved = [...myPosts, ...POSTS].filter((p) => savedPosts.includes(p.id));

  return (
    <Page>
      <div className="flex items-center gap-4 pt-6">
        <Avatar name={user.name} size={72} />
        <div className="min-w-0 flex-1">
          <input
            value={user.name}
            onChange={(e) => setUser({ name: e.target.value })}
            aria-label="Your name"
            className="w-full bg-transparent text-[28px] font-bold tracking-[-0.02em] outline-none"
          />
          <p className="text-[14px] text-muted">
            @{user.handle} · {user.from}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
          <Award className="size-4" /> Badges
        </h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {badges.map((b) => (
            <div key={b.id} className={cn("flex w-28 shrink-0 flex-col items-center rounded-[20px] p-4 text-center", b.on ? "bg-ocean-soft" : "bg-surface opacity-60")}>
              <div className={cn("grid size-12 place-items-center rounded-full", b.on ? "brand-gradient" : "bg-surface-2")}>
                <Image src="/brand/logo.png" alt="" width={22} height={27} className={cn("h-auto w-[20px]", b.on ? "brightness-0 invert" : "opacity-40 grayscale")} />
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-tight">{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[24px] bg-white outline outline-1 outline-[var(--hairline)]">
        <Row icon={CloudLightning} label="Simulate typhoon (demo)">
          <button role="switch" aria-checked={stormSim} onClick={() => setStormSim(!stormSim)} className={cn("relative h-[31px] w-[51px] rounded-full transition-colors", stormSim ? "bg-coral" : "bg-surface-2")}>
            <span className={cn("absolute top-[2px] size-[27px] rounded-full bg-white shadow transition-all duration-300", stormSim ? "left-[22px]" : "left-[2px]")} />
          </button>
        </Row>
        <LinkRow icon={Store} label="Pasalubong market" href="/market" />
        <LinkRow icon={Briefcase} label="Pasyar Business (operators)" href="/business" />
        <LinkRow icon={LineChart} label="Tourism insights (LGU / DOT)" href="/insights" />
        <a href="https://francissaldua.me" target="_blank" rel="noreferrer" className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3.5 hover:bg-surface">
          <Award className="size-5 text-muted" />
          <span className="flex-1 text-[15px] font-medium">Made by Francis T. Saldua</span>
          <span className="text-[13px] font-semibold text-ocean">francissaldua.me</span>
        </a>
        <Row icon={RotateCcw} label="Reset demo data">
          <button
            onClick={() => {
              resetDemo();
              toast("Demo reset", "Bookings, posts and settings are back to the start.");
            }}
            className="pressable rounded-full bg-surface px-3.5 py-1.5 text-[13px] font-semibold"
          >
            Reset
          </button>
        </Row>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
          <Bookmark className="size-4" /> Saved posts
        </h2>
        {saved.length === 0 ? (
          <p className="text-muted">
            Tap the bookmark on any <Link href="/community" className="font-semibold text-ocean">community post</Link> to keep it here.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {saved.map((p) => (
              <Link key={p.id} href="/community" className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={p.photo} alt="" fill sizes="33vw" className="object-cover" unoptimized={p.photo.startsWith("blob:")} />
                {p.trip && (
                  <span className="absolute bottom-1.5 left-1.5">
                    <Badge tone="ocean">Trip</Badge>
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}

function Row({ icon: Icon, label, children }: { icon: typeof Globe; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3 last:border-0">
      <Icon className="size-5 text-muted" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {children}
    </div>
  );
}
function LinkRow({ icon: Icon, label, href }: { icon: typeof Globe; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3.5 hover:bg-surface">
      <Icon className="size-5 text-muted" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="size-4 text-faint" />
    </Link>
  );
}
