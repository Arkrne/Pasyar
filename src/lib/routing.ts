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
  legs: { km: number; minutes: number; mid: [number, number] }[];
}

const mem = new Map<string, RoadRoute>();
const inflight = new Map<string, Promise<RoadRoute | null>>();
const LS = "pasyar-roads-v2";

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
      const coords = thin((route.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number]));
      // place each leg's label on the road point nearest the middle of its two stops
      const legs = (route.legs as { distance: number; duration: number }[]).map((l, i) => {
        const a = pts[i];
        const b = pts[i + 1];
        const m: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        let best = coords[0];
        let bd = Infinity;
        for (const c of coords) {
          const d = (c[0] - m[0]) ** 2 + (c[1] - m[1]) ** 2;
          if (d < bd) {
            bd = d;
            best = c;
          }
        }
        return { km: Math.round(l.distance / 100) / 10, minutes: Math.max(1, Math.round(l.duration / 60)), mid: best };
      });
      const out: RoadRoute = {
        coords,
        km: Math.round(route.distance / 100) / 10,
        minutes: Math.round(route.duration / 60),
        legs,
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
