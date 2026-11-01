/** Builds src/data/catanduanes-outline.json: the island's municipalities merged into one shape, with a small coastal buffer. */
import { writeFileSync } from "node:fs";
import * as turf from "@turf/turf";
import geo from "../src/data/catanduanes.geo.json";

const fc = geo as unknown as GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
let merged = turf.union(turf.featureCollection(fc.features as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>[]));
if (!merged) throw new Error("union failed");
merged = turf.buffer(merged, 0.35, { units: "kilometers" }) as typeof merged;
const simple = turf.simplify(merged!, { tolerance: 0.0006, highQuality: true });
const round = (c: unknown): unknown => (Array.isArray(c) && typeof c[0] === "number" ? [+(+c[0]).toFixed(4), +(+c[1]).toFixed(4)] : (c as unknown[]).map(round));
simple.geometry.coordinates = round(simple.geometry.coordinates) as never;
writeFileSync("src/data/catanduanes-outline.json", JSON.stringify(simple));
console.log(simple.geometry.type, JSON.stringify(simple).length, "bytes");
