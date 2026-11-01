/*
  Road routing over OpenStreetMap data via the public OSRM server.
  Returns the actual road geometry between stops (like Google Maps), plus distance
  and drive time. Results are cached in memory and localStorage so a saved trip
  draws its roads offline. Falls back to null so the caller can draw a curve.
*/

export interface RoadRoute {
  coords: [number, number][]; // [lat, lng]
  km: number;
  minutes: number;
}

const mem = new Map<string, RoadRoute>();
const inflight = new Map<string, Promise<RoadRoute | null>>();
const LS = "pasyar-roads-v1";

function keyOf(pts: [number, number][]) {
  return pts.map(([a, b]) => `${a.toFixed(4)},${b.toFixed(4)}`).join(";");
}

function readLS(): Record<string, RoadRoute> {
  try {
    return JSON.parse(localStorage.getItem(LS) ?? "{}");
  } catch {
    return {};
  }
}

function writeLS(k: string, r: RoadRoute) {
  try {
    const all = readLS();
    all[k] = r;
    const keys = Object.keys(all);
    // keep the cache small
    for (const old of keys.slice(0, Math.max(0, keys.length - 60))) delete all[old];
    localStorage.setItem(LS, JSON.stringify(all));
  } catch {}
}

/** Thin a long polyline so the draw animation stays smooth on cheap phones. */
function thin(coords: [number, number][], max = 700) {
  if (coords.length <= max) return coords;
  const step = coords.length / max;
  const out: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) out.push(coords[Math.floor(i)]);
  out.push(coords[coords.length - 1]);
  return out;
}

export async function roadRoute(pts: [number, number][]): Promise<RoadRoute | null> {
  if (pts.length < 2) return null;
  const k = keyOf(pts);
  if (mem.has(k)) return mem.get(k)!;
  const cached = typeof window !== "undefined" ? readLS()[k] : undefined;
  if (cached) {
    mem.set(k, cached);
    return cached;
  }
  if (inflight.has(k)) return inflight.get(k)!;

  const url = `https://router.project-osrm.org/route/v1/driving/${pts.map(([lat, lng]) => `${lng},${lat}`).join(";")}?overview=full&geometries=geojson`;
  const p = fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      const route = j?.routes?.[0];
      if (!route) return null;
      const out: RoadRoute = {
        coords: thin((route.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number])),
        km: Math.round(route.distance / 100) / 10,
        minutes: Math.round(route.duration / 60),
      };
      mem.set(k, out);
      writeLS(k, out);
      return out;
    })
    .catch(() => null)
    .finally(() => inflight.delete(k));
  inflight.set(k, p);
  return p;
}
