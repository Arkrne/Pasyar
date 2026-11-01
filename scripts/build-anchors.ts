/** Badge anchor per town: the visual center of its largest land polygon. */
import { writeFileSync } from "node:fs";
import * as turf from "@turf/turf";
import geo from "../src/data/catanduanes.geo.json";
import { TOWN_ID_BY_NAME } from "../src/data/towns";

const out: Record<string, [number, number]> = {};
for (const f of (geo as unknown as GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>).features) {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const biggest = polys.map((c) => turf.polygon(c)).sort((a, b) => turf.area(b) - turf.area(a))[0];
  // center of mass, nudged inside the shape if it falls outside (concave towns)
  let pt = turf.centerOfMass(biggest);
  if (!turf.booleanPointInPolygon(pt, biggest)) pt = turf.pointOnFeature(biggest);
  const [lng, lat] = pt.geometry.coordinates;
  out[TOWN_ID_BY_NAME[(f.properties as { name: string }).name]] = [+lat.toFixed(4), +lng.toFixed(4)];
}
writeFileSync("src/data/town-anchors.json", JSON.stringify(out, null, 1));
console.log(out);
