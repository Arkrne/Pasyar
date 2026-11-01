import geo from "@/data/catanduanes.geo.json";

type Ring = number[][];
type Feature = { properties: { name: string }; geometry: { type: string; coordinates: unknown } };

const features = (geo as unknown as { features: Feature[] }).features;

function polygonsOf(f: Feature): Ring[][] {
  return f.geometry.type === "Polygon"
    ? [f.geometry.coordinates as Ring[]]
    : (f.geometry.coordinates as Ring[][]);
}

let minX = Infinity,
  minY = Infinity,
  maxX = -Infinity,
  maxY = -Infinity;
for (const f of features)
  for (const poly of polygonsOf(f))
    for (const [lng, lat] of poly[0]) {
      minX = Math.min(minX, lng);
      maxX = Math.max(maxX, lng);
      minY = Math.min(minY, lat);
      maxY = Math.max(maxY, lat);
    }

const K = Math.cos((((minY + maxY) / 2) * Math.PI) / 180);
export const VIEW_W = 400;
const PAD = 14;
const scale = (VIEW_W - PAD * 2) / ((maxX - minX) * K);
export const VIEW_H = Math.round((maxY - minY) * scale + PAD * 2);

export function project(lat: number, lng: number): [number, number] {
  return [PAD + (lng - minX) * K * scale, PAD + (maxY - lat) * scale];
}

export const TOWN_PATHS = features.map((f) => ({
  name: f.properties.name,
  d: polygonsOf(f)
    .map((poly) =>
      poly
        .map((ring) => "M" + ring.map(([lng, lat]) => project(lat, lng).map((n) => n.toFixed(1)).join(",")).join("L") + "Z")
        .join(""),
    )
    .join(""),
}));

/** Smooth path (Catmull-Rom to Bezier) through projected points. */
export function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export { geo };
