"use client";

import { useEffect, useMemo, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";
import { GeoJSON, MapContainer, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import anchors from "@/data/town-anchors.json";
import { ISLAND_BOUNDS } from "./island-mask";
import L from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import { geo } from "@/lib/geo";
import { TOWN_ID_BY_NAME, TOWN_BY_ID, TOWNS } from "@/data/towns";
import { TOWN_STYLE } from "@/data/palette";
import type { Place, TownId } from "@/data/types";
import type { Forecast } from "@/lib/forecast";
import { rankTowns, VERDICT } from "@/lib/forecast";
import { IslandIcon } from "@/components/icons";
import { WeatherGlyph } from "@/components/weather-glyph";
import { Basemap } from "./basemap";
import { IslandMask } from "./island-mask";

const KIND_ICON: Record<string, Parameters<typeof IslandIcon>[0]["name"]> = {
  beach: "palm",
  surf: "surf",
  waterfall: "waterfall",
  viewpoint: "mountain",
  heritage: "church",
  cave: "cave",
  river: "river",
  island: "island",
  nature: "palm",
  town: "flower",
};

function placeIcon(p: Place, dim: boolean, hot: boolean) {
  const st = TOWN_STYLE[p.town];
  const svg = renderToStaticMarkup(<IslandIcon name={KIND_ICON[p.kind]} size={16} color="#fff" accent="rgba(255,255,255,.6)" />);
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:28px;height:28px;${dim ? "opacity:.35;" : ""}">
      ${hot ? `<span class="pulse-ring" style="background:${st.color}"></span>` : ""}
      <div class="pin" style="position:relative;width:28px;height:28px;background:${st.color}">${svg}</div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function townBadge(id: TownId, selected: boolean, wxCode?: number, verdictColor?: string, showLabel = true) {
  const st = TOWN_STYLE[id];
  const inner = wxCode != null
    ? renderToStaticMarkup(<WeatherGlyph code={wxCode} size={30} still />)
    : renderToStaticMarkup(<IslandIcon name={st.icon} size={22} color="#fff" accent="#F6CB67" />);
  const bg = wxCode != null ? "#fff" : st.color;
  const size = selected ? 46 : showLabel ? 38 : 32;
  const ring = verdictColor ?? "#fff";
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px)">
      <div style="width:${size}px;height:${size}px;border-radius:14px;background:${bg};display:grid;place-items:center;box-shadow:0 0 0 3px ${ring},0 10px 22px -8px rgba(0,0,0,.35);animation:pin-in 500ms cubic-bezier(.23,1,.32,1) both">${inner}</div>
      ${showLabel || selected ? `<span style="margin-top:4px;font:600 11px/1 var(--font-sans);color:#1d1d1f;background:rgba(255,255,255,.9);padding:3px 7px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.08);white-space:nowrap">${TOWN_BY_ID[id].name}</span>` : ""}
    </div>`,
    iconSize: [80, 70],
    iconAnchor: [40, 30],
  });
}

function Controller({ selected }: { selected: TownId | null }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    const pad = window.innerWidth < 768 ? 20 : 40;
    if (!selected) {
      const all = ISLAND_BOUNDS;
      if (first.current) {
        const fit = () => {
          map.invalidateSize();
          map.fitBounds(all, { padding: [pad, pad] });
        };
        fit();
        // the container can still be settling (fonts, sticky layout); refit until the user interacts
        let touched = false;
        const stop = () => (touched = true);
        map.once("dragstart zoomstart", stop);
        const ro = new ResizeObserver(() => !touched && fit());
        ro.observe(map.getContainer());
        setTimeout(() => ro.disconnect(), 3000);
      } else map.flyToBounds(all, { padding: [pad, pad], duration: 0.8 });
      first.current = false;
      return;
    }
    const f = (geo as unknown as { features: Feature[] }).features.find(
      (x) => TOWN_ID_BY_NAME[(x.properties as { name: string }).name] === selected,
    );
    if (f) {
      map.invalidateSize();
      const b = L.geoJSON(f as GeoJsonObject).getBounds();
      const bottomPad = window.innerWidth < 768 ? Math.round(window.innerHeight * 0.1) : pad;
      map.flyToBounds(b, { paddingTopLeft: [pad, pad], paddingBottomRight: [pad, bottomPad], duration: 0.9, maxZoom: 12 });
    }
    first.current = false;
  }, [selected, map]);
  return null;
}

export default function ExploreMap({
  selected,
  onSelect,
  places,
  onPlace,
  weather,
  weatherDay = 0,
  showPlaces = true,
}: {
  selected: TownId | null;
  onSelect: (t: TownId | null) => void;
  places: Place[];
  onPlace: (id: string) => void;
  weather?: Forecast | null;
  weatherDay?: number;
  showPlaces?: boolean;
}) {
  const verdicts = useMemo(() => {
    if (!weather) return null;
    return Object.fromEntries(rankTowns(weather, weatherDay).map((r) => [r.town.id, r])) as Record<TownId, ReturnType<typeof rankTowns>[number]>;
  }, [weather, weatherDay]);
  const key = `geo-${selected ?? "none"}-${weather ? weatherDay : "x"}`;
  const [zoom, setZoom] = useState(10);

  return (
    <MapContainer center={[13.8, 124.25]} zoom={10} zoomControl={false} scrollWheelZoom className="h-full w-full" attributionControl>
      <Basemap />
      <IslandMask />
      <GeoJSON
        key={key}
        data={geo as GeoJsonObject}
        style={(f) => {
          const id = TOWN_ID_BY_NAME[(f?.properties as { name: string }).name];
          const on = id === selected;
          const color = verdicts ? VERDICT[verdicts[id].verdict].color : TOWN_STYLE[id].color;
          return {
            className: "town-shape",
            color: on ? color : "#ffffff",
            weight: on ? 3 : 1.5,
            fillColor: color,
            fillOpacity: on ? 0.38 : selected ? 0.1 : verdicts ? 0.32 : 0.22,
          };
        }}
        onEachFeature={(f, layer) => {
          const name = (f.properties as { name: string }).name;
          const id = TOWN_ID_BY_NAME[name];
          layer.on({
            click: () => onSelect(id),
            mouseover: (e) => {
              if (id !== selected) (e.target as L.Path).setStyle({ fillOpacity: 0.45, weight: 2.5, color: TOWN_STYLE[id].color });
            },
            mouseout: (e) => {
              if (id !== selected)
                (e.target as L.Path).setStyle({ fillOpacity: selected ? 0.1 : verdicts ? 0.32 : 0.22, weight: 1.5, color: "#ffffff" });
            },
          });
        }}
      />
      <ZoomWatch onZoom={setZoom} />
      {TOWNS.map((t) => (
        <Marker
          key={`t-${t.id}-${selected === t.id}-${weather ? weatherDay : "x"}-${zoom >= 10.5}`}
          position={(anchors as unknown as Record<string, [number, number]>)[t.id] ?? t.center}
          icon={townBadge(t.id, selected === t.id, verdicts?.[t.id]?.day.code, verdicts ? VERDICT[verdicts[t.id].verdict].color : undefined, zoom >= 10.5)}
          zIndexOffset={selected === t.id ? 900 : 600}
          eventHandlers={{ click: () => onSelect(t.id) }}
        >
          {verdicts && (
            <Tooltip direction="top" offset={[0, -36]}>
              <span className="text-[12px] font-semibold">
                {t.name}: {VERDICT[verdicts[t.id].verdict].label}, {verdicts[t.id].day.max}°, {verdicts[t.id].day.pop}% rain
              </span>
            </Tooltip>
          )}
        </Marker>
      ))}
      {showPlaces &&
        places.map((p) => (
          <Marker
            key={`${p.id}-${selected ?? ""}`}
            position={[p.lat, p.lng]}
            icon={placeIcon(p, !!selected && p.town !== selected, !!selected && p.town === selected)}
            eventHandlers={{ click: () => onPlace(p.id) }}
            zIndexOffset={selected && p.town === selected ? 1000 : 0}
          >
            <Tooltip direction="top" offset={[0, -12]}>
              <span className="text-[12px] font-semibold">{p.name}</span>
              <span className="block text-[11px] text-[#6e6e73]">{TOWN_BY_ID[p.town].name}</span>
            </Tooltip>
          </Marker>
        ))}
      <Controller selected={selected} />
    </MapContainer>
  );
}

function ZoomWatch({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({ zoomend: () => onZoom(map.getZoom()) });
  return null;
}
