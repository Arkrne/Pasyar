"use client";

import { useEffect, useState } from "react";
import { TOWNS } from "@/data/towns";
import { PLACE_BY_ID } from "@/data/places";
import type { TownId } from "@/data/types";
import { useStore } from "./store";

export interface DayWx {
  date: string;
  code: number;
  max: number;
  min: number;
  rain: number; // mm
  pop: number; // % chance
  gust: number; // km/h
  uv: number;
}

export interface TownWx {
  town: TownId;
  now: { temp: number; code: number; gust: number };
  days: DayWx[];
}

export interface SeaWx {
  id: string;
  label: string;
  placeId: string;
  now: number | null;
  days: number[];
}

export interface Forecast {
  towns: Record<TownId, TownWx>;
  sea: SeaWx[];
  source: "live" | "sample";
  fetchedAt: string;
}

const SEA_SPOTS = [
  { id: "puraran", label: "Puraran (surf)", placeId: "puraran-beach", lat: 13.69, lng: 124.42 },
  { id: "palumbanes", label: "Palumbanes channel", placeId: "palumbanes", lat: 14.03, lng: 124.02 },
  { id: "panay", label: "Panay Island crossing", placeId: "panay-island", lat: 13.97, lng: 124.35 },
  { id: "tuwad", label: "Tuwad-Tuwadan", placeId: "tuwad-tuwadan", lat: 14.1, lng: 124.2 },
];

let cache: { at: number; f: Forecast } | null = null;
let inflight: Promise<Forecast> | null = null;

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Plausible offline forecast, used only when the API can't be reached. Labelled "sample" in the UI. */
function sample(): Forecast {
  const towns = {} as Record<TownId, TownWx>;
  const base = new Date();
  TOWNS.forEach((t, k) => {
    const days: DayWx[] = Array.from({ length: 7 }, (_, d) => {
      const wet = ((k * 3 + d * 5) % 7) / 6;
      const dt = new Date(base);
      dt.setDate(base.getDate() + d);
      return {
        date: iso(dt),
        code: wet > 0.75 ? 63 : wet > 0.5 ? 80 : wet > 0.3 ? 2 : 1,
        max: 30 + ((k + d) % 3),
        min: 24,
        rain: Math.round(wet * 12),
        pop: Math.round(wet * 90),
        gust: 20 + Math.round(wet * 25),
        uv: 9,
      };
    });
    towns[t.id] = { town: t.id, now: { temp: days[0].max - 1, code: days[0].code, gust: days[0].gust }, days };
  });
  return {
    towns,
    sea: SEA_SPOTS.map((s, k) => ({ id: s.id, label: s.label, placeId: s.placeId, now: 0.8 + k * 0.4, days: Array.from({ length: 7 }, (_, d) => 0.8 + ((k + d) % 4) * 0.5) })),
    source: "sample",
    fetchedAt: new Date().toISOString(),
  };
}

async function load(): Promise<Forecast> {
  const lat = TOWNS.map((t) => t.center[0]).join(",");
  const lng = TOWNS.map((t) => t.center[1]).join(",");
  const wxUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_gusts_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max,uv_index_max` +
    `&timezone=Asia%2FManila&forecast_days=7`;
  const seaUrl =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${SEA_SPOTS.map((s) => s.lat).join(",")}&longitude=${SEA_SPOTS.map((s) => s.lng).join(",")}` +
    `&current=wave_height&daily=wave_height_max&timezone=Asia%2FManila&forecast_days=7`;

  const [wx, sea] = await Promise.all([
    fetch(wxUrl).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    fetch(seaUrl)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);
  const arr = Array.isArray(wx) ? wx : [wx];
  const towns = {} as Record<TownId, TownWx>;
  TOWNS.forEach((t, k) => {
    const a = arr[k];
    towns[t.id] = {
      town: t.id,
      now: { temp: Math.round(a.current.temperature_2m), code: a.current.weather_code, gust: Math.round(a.current.wind_gusts_10m) },
      days: (a.daily.time as string[]).map((date, i) => ({
        date,
        code: a.daily.weather_code[i],
        max: Math.round(a.daily.temperature_2m_max[i]),
        min: Math.round(a.daily.temperature_2m_min[i]),
        rain: Math.round((a.daily.precipitation_sum[i] ?? 0) * 10) / 10,
        pop: a.daily.precipitation_probability_max[i] ?? 0,
        gust: Math.round(a.daily.wind_gusts_10m_max[i]),
        uv: Math.round(a.daily.uv_index_max[i] ?? 0),
      })),
    };
  });
  const seaArr = sea ? (Array.isArray(sea) ? sea : [sea]) : [];
  return {
    towns,
    sea: SEA_SPOTS.map((s, k) => ({
      id: s.id,
      label: s.label,
      placeId: s.placeId,
      now: seaArr[k]?.current?.wave_height ?? null,
      days: seaArr[k]?.daily?.wave_height_max ?? [],
    })),
    source: "live",
    fetchedAt: new Date().toISOString(),
  };
}

export function useForecast() {
  const stormSim = useStore((s) => s.stormSim);
  const [f, setF] = useState<Forecast | null>(cache?.f ?? null);
  useEffect(() => {
    if (cache && Date.now() - cache.at < 15 * 60_000) return;
    inflight ??= load()
      .catch(() => sample())
      .then((x) => {
        cache = { at: Date.now(), f: x };
        return x;
      })
      .finally(() => {
        inflight = null;
      });
    let alive = true;
    inflight.then((x) => alive && setF(x));
    return () => {
      alive = false;
    };
  }, []);
  if (f && stormSim) return { forecast: simulateStorm(f), loading: false };
  return { forecast: f, loading: !f };
}

function simulateStorm(f: Forecast): Forecast {
  const towns = {} as Record<TownId, TownWx>;
  for (const [id, t] of Object.entries(f.towns) as [TownId, TownWx][]) {
    towns[id] = {
      ...t,
      now: { ...t.now, code: 95, gust: 110 },
      days: t.days.map((d, i) => (i < 2 ? { ...d, code: 95, rain: 60 + i * 10, pop: 100, gust: 110 - i * 20 } : d)),
    };
  }
  return { ...f, towns, sea: f.sea.map((s) => ({ ...s, now: 5.2, days: s.days.map((v, i) => (i < 2 ? 5 : v)) })) };
}

/* ---------------- scoring ---------------- */

export type Verdict = "great" | "good" | "mixed" | "inland" | "stay";

export function scoreDay(d: DayWx) {
  let s = 100;
  s -= d.pop * 0.35;
  s -= Math.min(30, d.rain * 2.2);
  s -= Math.max(0, d.gust - 35) * 0.9;
  if (d.code <= 2) s += 8;
  if (d.code >= 95) s -= 40;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export function verdict(score: number, d: DayWx): Verdict {
  if (d.code >= 95 || d.gust >= 70) return "stay";
  if (score >= 78) return "great";
  if (score >= 60) return "good";
  if (score >= 40) return "mixed";
  return "inland";
}

export const VERDICT: Record<Verdict, { label: string; color: string; soft: string }> = {
  great: { label: "Great day out", color: "#1f8a4c", soft: "#E6F4EC" },
  good: { label: "Good", color: "#6DB33F", soft: "#EEF7E6" },
  mixed: { label: "Some showers", color: "#D9A21B", soft: "#FCF3D9" },
  inland: { label: "Go inland", color: "#EA753C", soft: "#FDEBDF" },
  stay: { label: "Stay in", color: "#BA091F", soft: "#F9E0E3" },
};

export function rankTowns(f: Forecast, day: number) {
  return TOWNS.map((t) => {
    const d = f.towns[t.id]?.days[day];
    if (!d) return null;
    const s = scoreDay(d);
    return { town: t, day: d, score: s, verdict: verdict(s, d) };
  })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score) as { town: (typeof TOWNS)[number]; day: DayWx; score: number; verdict: Verdict }[];
}

/** One plain sentence telling people where to go. */
export function headline(f: Forecast, day: number) {
  const r = rankTowns(f, day);
  if (!r.length) return { title: "Checking the skies", body: "" };
  const best = r[0];
  const worst = r[r.length - 1];
  const picks = best.town.placeIds.slice(0, 2).map((id) => PLACE_BY_ID[id]?.name).filter(Boolean);
  if (best.verdict === "stay")
    return { title: "Storm over the island", body: "Stay in today. Churches, the museum and Luyang Cave are open once the rain eases. Check PAGASA before any boat trip." };
  const region = best.town.region === "east" ? "the Pacific side" : best.town.region === "north" ? "the north" : "the south";
  const body =
    worst.verdict === "inland" || worst.verdict === "mixed"
      ? `${worst.town.name} has the most rain, so save it for another day.`
      : "Clear across most of the island.";
  return { title: `Best on ${region}: ${best.town.name}`, body: `${picks.length ? `Good day for ${picks.join(" and ")}. ` : ""}${body}` };
}

export function seaVerdict(m: number | null) {
  if (m == null) return { label: "No data", tone: "muted" as const };
  if (m >= 2.5) return { label: "Rough, no boats", tone: "bad" as const };
  if (m >= 1.5) return { label: "Choppy", tone: "warn" as const };
  return { label: "Calm", tone: "ok" as const };
}
