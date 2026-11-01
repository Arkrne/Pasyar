import type { Metadata } from "next";
import Image from "next/image";
import { CloudLightning, Layers, LineChart, Map, ShieldCheck, Users, WifiOff } from "lucide-react";
import { Page } from "@/components/shell";
import { Button, Reveal } from "@/components/ui";

export const metadata: Metadata = { title: "The pitch" };

const CANVAS = [
  { h: "Customers", b: "Domestic travelers aged 22 to 40 who plan on their phones, balikbayan families, and surfers. On the supply side: homestays, guides, boatmen, van drivers and makers." },
  { h: "Value", b: "Travelers get a bookable plan in a minute. Operators get bookings without a website, a free dashboard, and payouts to GCash." },
  { h: "Channels", b: "Facebook and TikTok trip posts that link to a copyable plan, QR standees at Virac Airport and the ports, and the Provincial Tourism Office." },
  { h: "Revenue", b: "12% commission per booking, ₱499 per month featured listings, and an anonymised demand report sold to LGUs and the DOT." },
  { h: "Key partners", b: "Provincial Tourism Office, municipal tourism desks, barangay guide associations, CatSU, GCash and Maya, Cebu Pacific and ferry operators." },
  { h: "Costs", b: "Hosting, payment fees, onboarding visits to operators, and content: photos and verified details for every place." },
];

const QA = [
  {
    q: "Why would operators join?",
    a: "It costs nothing to list, they only pay when a booking arrives, and most of them have no way to take bookings now besides Messenger. The dashboard is built for a cheap Android phone and one bar of signal.",
  },
  {
    q: "Why not Booking.com, Klook or ChatGPT?",
    a: "The big platforms list a handful of Virac hotels and none of the guides, boatmen or homestays. ChatGPT can write an itinerary but can't book it, doesn't know who's open this week, and will happily invent a beach. Pasyar only plans with places and operators in its database.",
  },
  {
    q: "What about typhoons and bad signal?",
    a: "Storm mode reads live wind and wave data and re-plans before you get stuck. Saved trips and QR tickets work offline, and operators can confirm by SMS when data is down.",
  },
  {
    q: "Can it grow past one island?",
    a: "The engine only needs places, operators and roads. Albay, Sorsogon, Camarines Sur and Masbate share the same mix of small operators and weak online presence. Catanduanes is the pilot because it's the hardest case.",
  },
];

export default function AboutPage() {
  return (
    <Page>
      <section className="pt-6">
        <p className="t-eyebrow text-ocean">DOST IGNITE Catanduanes 2026</p>
        <h1 className="t-hero mt-2 max-w-4xl text-balance">Tourism money that stays on the island.</h1>
        <p className="t-lead mt-5 max-w-2xl text-muted">
          Catanduanes has world-class surf, cliffs and heritage, and most of the people who could show them to you have no way to
          take a booking. Pasyar plans the trip, books the locals and gives the province data it has never had.
        </p>
      </section>

      <Reveal className="mt-12">
        <div className="relative aspect-[21/9] overflow-hidden rounded-[32px]">
          <Image src="/photos/binurong-aerial.webp" alt="Binurong Point from the air" fill sizes="100vw" className="object-cover" />
        </div>
      </Reveal>

      <section className="mt-16 grid gap-10 md:grid-cols-2">
        <Reveal>
          <p className="t-eyebrow text-muted">The problem</p>
          <h2 className="t-title mt-2">Planning a Catanduanes trip takes days of messaging strangers.</h2>
          <p className="t-body mt-3 text-muted">
            Information is scattered across old blogs and Facebook pages. Visitors cluster at the same three spots near Virac.
            Guides and homestays in Pandan or Gigmoto lose out, and when a typhoon comes, nobody tells the traveler what to do
            instead. The province has visitor counts but no picture of where people go or what they spend.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="t-eyebrow text-muted">The solution</p>
          <h2 className="t-title mt-2">One planner, one checkout, one dashboard.</h2>
          <ul className="mt-4 space-y-3">
            {[
              [Map, "AI trip planner grounded on real places and operators, with an animated route"],
              [ShieldCheck, "Verified operators and verified-visit reviews that fake accounts can't post"],
              [Users, "Community trips anyone can copy and book in one tap"],
              [CloudLightning, "Storm mode with live wind and wave data"],
              [WifiOff, "Offline trips and QR tickets"],
              [LineChart, "Free operator dashboard and a demand report for the LGU"],
            ].map(([Icon, t]) => {
              const I = Icon as typeof Map;
              return (
                <li key={t as string} className="flex gap-3 text-[15px] text-ink-2">
                  <I className="mt-0.5 size-5 shrink-0 text-ocean" /> {t as string}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="t-eyebrow text-muted">Business model canvas</p>
          <h2 className="t-title mt-2">How it pays for itself</h2>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS.map((c, k) => (
            <Reveal key={c.h} delay={k * 0.04}>
              <div className="h-full rounded-[22px] bg-surface p-5">
                <p className="text-[15px] font-semibold">{c.h}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{c.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-4 rounded-[22px] bg-ink p-6 text-white">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/60">Unit economics, per booking (pilot assumptions)</p>
            <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                ["₱14,000", "average trip basket for 2 to 4 people"],
                ["₱1,680", "Pasyar revenue at 12%"],
                ["₱350", "payment and SMS costs"],
                ["₱1,330", "contribution before salaries"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="tabular text-[30px] font-bold tracking-[-0.03em]">{n}</p>
                  <p className="text-[13px] text-white/65">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[12px] text-white/50">Assumptions to validate with letters of intent and a pilot. Not reported results.</p>
          </div>
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="t-eyebrow text-muted">Questions we expect</p>
        </Reveal>
        <div className="mt-4 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {QA.map((x) => (
            <details key={x.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[19px] font-semibold tracking-[-0.01em]">
                {x.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-[18px] transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="t-body mt-3 max-w-3xl text-muted">{x.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="t-eyebrow text-muted">Roadmap</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              ["Nov 2026", "Prototype, IGNITE demo, first 10 letters of intent"],
              ["Q1 2027", "Pilot with 40 operators in Virac, Baras and Bato"],
              ["Q2 2027", "All 11 towns, SMS confirmations, Android app"],
              ["2028", "Albay and Sorsogon on the same engine"],
            ].map(([w, t]) => (
              <div key={w} className="rounded-[22px] bg-surface p-5">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-ocean">
                  <Layers className="size-4" /> {w}
                </p>
                <p className="mt-2 text-[15px] font-medium">{t}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="t-eyebrow text-muted">Who made this</p>
          <div className="mt-4 flex flex-col gap-5 rounded-[28px] bg-gradient-to-br from-[#FFF4E3] via-[#FDEBDF] to-[#E3F2FD] p-6 md:flex-row md:items-center md:p-8">
            <div className="grid size-20 shrink-0 place-items-center rounded-[24px] bg-white text-[28px] font-bold text-ocean shadow-[var(--shadow-md)]">FS</div>
            <div className="flex-1">
              <h2 className="text-[26px] font-bold tracking-[-0.02em]">Francis T. Saldua</h2>
              <p className="text-[15px] font-medium text-ink-2">Creator and developer of Pasyar</p>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
                Designed the product, wrote the planner and built the web app from Catanduanes for DOST IGNITE 2026.
              </p>
            </div>
            <a
              href="https://francissaldua.me"
              target="_blank"
              rel="noreferrer"
              className="pressable inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-[15px] font-semibold text-white"
            >
              francissaldua.me
            </a>
          </div>
        </Reveal>
      </section>

      <section className="mt-20 flex flex-col items-center text-center">
        <Image src="/brand/logo.png" alt="" width={56} height={68} className="h-auto w-12" />
        <h2 className="t-display mt-5 max-w-2xl text-balance">See it work in under a minute.</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/plan" size="lg">
            Plan a trip
          </Button>
          <Button href="/business" variant="ghost" size="lg">
            Operator view
          </Button>
        </div>
      </section>
    </Page>
  );
}
