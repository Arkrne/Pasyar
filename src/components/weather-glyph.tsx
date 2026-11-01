"use client";


type Kind = "sun" | "partly" | "cloud" | "rain" | "storm" | "fog";

export function kindOf(code: number): Kind {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "partly";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 95) return "storm";
  return "rain";
}


const FILE: Record<Kind, string> = {
  sun: "clear-day",
  partly: "partly-cloudy-day",
  cloud: "overcast",
  rain: "rain",
  storm: "thunderstorms-rain",
  fog: "fog",
};

/**
 * Animated weather icon from Meteocons by Bas Milius (MIT license, bundled in /public/meteocons).
 * `still` is kept for API compatibility; the icons animate gently on their own.
 */
export function WeatherGlyph({ code, size = 48, still: _still }: { code: number; size?: number; still?: boolean }) {
  const k = kindOf(code);
  const name = code >= 51 && code <= 57 ? "drizzle" : FILE[k];
  // eslint-disable-next-line @next/next/no-img-element -- animated SVG must stay an <img> to keep its SMIL animation
  return <img src={`/meteocons/${name}.svg`} width={size} height={size} alt="" aria-hidden draggable={false} style={{ width: size, height: size, filter: "drop-shadow(0 3px 5px rgba(16,40,70,.28))" }} />;
}

/** Meteocons glyph by file name, for metric labels. */
export function Meteocon({ name, size = 28 }: { name: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- animated SVG
  return <img src={`/meteocons/${name}.svg`} width={size} height={size} alt="" aria-hidden draggable={false} style={{ width: size, height: size, filter: "drop-shadow(0 3px 5px rgba(16,40,70,.28))" }} />;
}
