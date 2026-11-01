"use client";

import { useEffect, useMemo } from "react";
import { Pane, Polygon, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import outline from "@/data/catanduanes-outline.json";

type Ring = [number, number][];

const polys = (outline as unknown as { geometry: { type: string; coordinates: number[][][][] | number[][][] } }).geometry;
const outerRings: Ring[] = (polys.type === "Polygon" ? [polys.coordinates as number[][][]] : (polys.coordinates as number[][][][])).map(
  (p) => p[0].map(([lng, lat]) => [lat, lng] as [number, number]),
);

/** Everything around the island, as one big frame with island-shaped holes. */
const WORLD: Ring = [
  [-60, 60],
  [-60, 200],
  [70, 200],
  [70, 60],
];

export const ISLAND_BOUNDS = L.latLngBounds(outerRings.flat());
export const SEA = "#e6f1f8";

/**
 * Hides every part of the basemap that isn't Catanduanes, draws a soft coastline,
 * and keeps the camera on the island.
 */
export function IslandMask({ lock = true }: { lock?: boolean }) {
  const map = useMap();
  const positions = useMemo(() => [WORLD, ...outerRings], []);

  useEffect(() => {
    if (!lock) return;
    map.setMaxBounds(ISLAND_BOUNDS.pad(0.35));
    L.Util.setOptions(map, { maxBoundsViscosity: 0.85 });
    map.setMinZoom(9);
    map.getContainer().style.background = SEA;
  }, [map, lock]);

  return (
    <Pane name="island-mask" style={{ zIndex: 350, pointerEvents: "none" }}>
      <Polygon
        positions={positions}
        pathOptions={{ stroke: false, fillColor: SEA, fillOpacity: 1, fillRule: "evenodd", interactive: false }}
      />
      {outerRings.map((r, i) => (
        <Polyline key={i} positions={[...r, r[0]]} pathOptions={{ color: "#0a6cbf", opacity: 0.18, weight: 6, interactive: false }} />
      ))}
      {outerRings.map((r, i) => (
        <Polyline key={`w${i}`} positions={[...r, r[0]]} pathOptions={{ color: "#ffffff", opacity: 0.9, weight: 1.5, interactive: false }} />
      ))}
    </Pane>
  );
}
