"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "maplibre-gl/dist/maplibre-gl.css";

/*
  Light vector basemap from OpenFreeMap (no key, OSM data). Rendered with MapLibre
  inside Leaflet so markers and routes stay simple Leaflet layers. Falls back to
  Esri's light gray raster if WebGL is unavailable (old phones).
*/
const STYLE = "https://tiles.openfreemap.org/styles/positron";
const FALLBACK = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Basemap() {
  const map = useMap();
  useEffect(() => {
    let layer: L.Layer | null = null;
    let cancelled = false;
    map.attributionControl.setPrefix(false);
    map.attributionControl.addAttribution('<a href="https://openfreemap.org">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>');
    if (hasWebGL()) {
      (async () => {
        (window as unknown as { L: typeof L }).L = L;
        const ml = await import("maplibre-gl");
        ml.setWorkerUrl("/vendor/maplibre-gl-worker.mjs");
        await import("@maplibre/maplibre-gl-leaflet");
        if (cancelled) return;
        const mk = (L as unknown as { maplibreGL: (o: object) => L.Layer }).maplibreGL;
        layer = mk({ style: STYLE, interactive: false });
        layer.addTo(map);
      })().catch(() => {
        layer = L.tileLayer(FALLBACK, { maxZoom: 16 }).addTo(map);
      });
    } else {
      layer = L.tileLayer(FALLBACK, { maxZoom: 16 }).addTo(map);
    }
    return () => {
      cancelled = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map]);
  return null;
}
