/** Fetches the real road route for the landing-page story and stores it with each stop's position along it. */
import { writeFileSync } from "node:fs";
import { PLACE_BY_ID } from "../src/data/places";

const STOPS: [number, number][] = [
  [13.5766, 124.2044], // Virac Airport
  ...["twin-rock", "bato-church", "binurong-point", "puraran-beach", "nahulugan-falls", "viga-coast", "hiyop-point", "tuwad-tuwadan"].map(
    (id) => [PLACE_BY_ID[id].lat, PLACE_BY_ID[id].lng] as [number, number],
  ),
];
const url = `https://router.project-osrm.org/route/v1/driving/${STOPS.map(([a, b]) => `${b},${a}`).join(";")}?overview=full&geometries=geojson`;
(async () => {
const j = await (await fetch(url)).json();
const r = j.routes[0];
const coords: [number, number][] = r.geometry.coordinates.map(([lng, lat]: [number, number]) => [+lat.toFixed(5), +lng.toFixed(5)]);
// thin to ~700 points
const step = Math.max(1, Math.floor(coords.length / 700));
const thin = coords.filter((_, i) => i % step === 0);
thin.push(coords[coords.length - 1]);
let acc = 0;
const at = [0];
for (const leg of r.legs) {
  acc += leg.distance;
  at.push(+(acc / r.distance).toFixed(4));
}
writeFileSync("src/data/story-route.json", JSON.stringify({ coords: thin, at, km: Math.round(r.distance / 1000), minutes: Math.round(r.duration / 60) }));
console.log(thin.length, "points", Math.round(r.distance / 1000), "km", at);
})();
