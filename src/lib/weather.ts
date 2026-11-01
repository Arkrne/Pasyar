"use client";

import { useEffect, useState } from "react";
import { useStore } from "./store";

export interface Weather {
  tempC: number;
  windKph: number;
  gustKph: number;
  code: number;
  rainMm: number;
  waveM: number | null;
  daily: { date: string; code: number; max: number; gust: number; rain: number }[];
  storm: boolean;
  simulated: boolean;
  source: "live" | "fallback";
}

const FALLBACK: Weather = {
  tempC: 28,
  windKph: 14,
  gustKph: 26,
  code: 2,
  rainMm: 0,
  waveM: 1.2,
  daily: [],
  storm: false,
  simulated: false,
  source: "fallback",
};

export function describe(code: number) {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 82) return "Rain showers";
  if (code <= 99) return "Thunderstorm";
  return "—";
}

/** Typhoon-ish conditions: strong gusts, thunderstorms or big seas. */
export function isStormy(w: Pick<Weather, "gustKph" | "code" | "waveM">) {
  return w.gustKph >= 60 || w.code >= 95 || (w.waveM ?? 0) >= 2.5;
}

let cache: { at: number; w: Weather } | null = null;

export function useWeather(): Weather & { loading: boolean } {
  const stormSim = useStore((s) => s.stormSim);
  const [w, setW] = useState<Weather | null>(cache?.w ?? null);

  useEffect(() => {
    if (cache && Date.now() - cache.at < 10 * 60_000) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of URL/cache/external state on mount
      setW(cache.w);
      return;
    }
    const ctl = new AbortController();
    const wx = fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=13.58&longitude=124.23&current=temperature_2m,wind_speed_10m,wind_gusts_10m,weather_code,precipitation&daily=weather_code,temperature_2m_max,wind_gusts_10m_max,precipitation_sum&timezone=Asia%2FManila&forecast_days=5",
      { signal: ctl.signal },
    ).then((r) => r.json());
    const sea = fetch(
      "https://marine-api.open-meteo.com/v1/marine?latitude=13.70&longitude=124.42&current=wave_height",
      { signal: ctl.signal },
    )
      .then((r) => r.json())
      .catch(() => null);

    Promise.all([wx, sea])
      .then(([a, b]) => {
        const c = a.current;
        const out: Weather = {
          tempC: Math.round(c.temperature_2m),
          windKph: Math.round(c.wind_speed_10m),
          gustKph: Math.round(c.wind_gusts_10m),
          code: c.weather_code,
          rainMm: c.precipitation,
          waveM: b?.current?.wave_height ?? null,
          daily: (a.daily.time as string[]).map((date, i) => ({
            date,
            code: a.daily.weather_code[i],
            max: Math.round(a.daily.temperature_2m_max[i]),
            gust: Math.round(a.daily.wind_gusts_10m_max[i]),
            rain: a.daily.precipitation_sum[i],
          })),
          storm: false,
          simulated: false,
          source: "live",
        };
        out.storm = isStormy(out);
        cache = { at: Date.now(), w: out };
        setW(out);
      })
      .catch(() => setW(FALLBACK));
    return () => ctl.abort();
  }, []);

  const base = w ?? FALLBACK;
  if (stormSim) {
    return {
      ...base,
      gustKph: 118,
      windKph: 85,
      code: 95,
      rainMm: 14,
      waveM: 5.4,
      storm: true,
      simulated: true,
      loading: false,
    };
  }
  return { ...base, loading: !w };
}
