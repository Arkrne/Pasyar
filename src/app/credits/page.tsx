import type { Metadata } from "next";
import Image from "next/image";
import { Page } from "@/components/shell";
import credits from "@/data/credits.json";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  return (
    <Page>
      <div className="pt-6">
        <p className="t-eyebrow text-muted">Credits</p>
        <h1 className="t-display mt-1">Photos and data</h1>
        <p className="t-body mt-3 max-w-2xl text-muted">
          Every photo on Pasyar comes from Wikimedia Commons and is used under the license its author chose. Thank you to the
          photographers below. Map data © OpenStreetMap contributors, basemap by OpenFreeMap. Municipal boundaries from the
          faeldon/philippines-json-maps project (PSA and NAMRIA data). Weather and sea state from Open-Meteo. Typhoon footage
          by the Philippine Coast Guard, public domain.
        </p>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {credits.map((c) => (
          <li key={c.slug} className="flex gap-3 rounded-[18px] bg-surface p-2.5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
              <Image src={`/photos/${c.slug}.webp`} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 text-[13px]">
              <a href={c.source} target="_blank" rel="noreferrer" className="line-clamp-1 font-semibold text-ink hover:text-ocean">
                {c.file}
              </a>
              <p className="line-clamp-1 text-muted">{c.author || "Unknown author"}</p>
              <p className="text-muted">{c.license}</p>
            </div>
          </li>
        ))}
      </ul>
    </Page>
  );
}
