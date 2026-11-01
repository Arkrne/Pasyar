"use client";

import { useEffect, useMemo, useRef } from "react";
import { GeoJSON, MapContainer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import { geo } from "@/lib/geo";
import { TOWN_ID_BY_NAME, TOWN_BY_ID } from "@/data/towns";
import type { Place, TownId } from "@/data/types";
import { Basemap } from "./basemap";

const KIND_COLOR: Record<string, string> = {
  beach: "#0f9aa0",
  surf: "#0a6cbf",
  waterfall: "#3b82c4",
  viewpoint: "#1f8a4c",
  heritage: "#b26a00",
  cave: "#6b5b95",
  river: "#3b82c4",
  island: "#0f9aa0",
  nature: "#1f8a4c",
  town: "#1d1d1f",
};

function placeIcon(p: Place, dim: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="pin-dot" style="background:${KIND_COLOR[p.kind]};width:14px;height:14px;${dim ? "opacity:.35" : ""}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function Controller({ selected }: { selected: TownId | null }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    const pad = window.innerWidth < 768 ? 20 : 40;
    if (!selected) {
      const all = L.geoJSON(geo as GeoJsonObject).getBounds();
      if (first.current) {
        map.invalidateSize();
        map.fitBounds(all, { padding: [pad, pad] });
        setTimeout(() => {
          map.invalidateSize();
          map.fitBounds(all, { padding: [pad, pad] });
        }, 120);
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
      const bottomPad = window.innerWidth < 768 ? Math.round(window.innerHeight * 0.25) : pad;
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
}: {
  selected: TownId | null;
  onSelect: (t: TownId | null) => void;
  places: Place[];
  onPlace: (id: string) => void;
}) {
  const key = useMemo(() => `geo-${selected ?? "none"}`, [selected]);

  return (
    <MapContainer center={[13.8, 124.25]} zoom={10} zoomControl={false} scrollWheelZoom className="h-full w-full" attributionControl>
      <Basemap />
      <GeoJSON
        key={key}
        data={geo as GeoJsonObject}
        style={(f) => {
          const id = TOWN_ID_BY_NAME[(f?.properties as { name: string }).name];
          const on = id === selected;
          return {
            color: on ? "#0a6cbf" : "#ffffff",
            weight: on ? 2.5 : 1.5,
            fillColor: on ? "#0a6cbf" : "#0f9aa0",
            fillOpacity: on ? 0.14 : selected ? 0.03 : 0.08,
          };
        }}
        onEachFeature={(f, layer) => {
          const name = (f.properties as { name: string }).name;
          const id = TOWN_ID_BY_NAME[name];
          layer.on({
            click: () => onSelect(id),
            mouseover: (e) => {
              if (id !== selected) (e.target as L.Path).setStyle({ fillOpacity: 0.2 });
            },
            mouseout: (e) => {
              if (id !== selected) (e.target as L.Path).setStyle({ fillOpacity: selected ? 0.03 : 0.08 });
            },
          });
          layer.bindTooltip(name, { sticky: true, direction: "top", offset: [0, -6] });
        }}
      />
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={placeIcon(p, !!selected && p.town !== selected)}
          eventHandlers={{ click: () => onPlace(p.id) }}
          zIndexOffset={selected && p.town === selected ? 400 : 0}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <span className="text-[12px] font-semibold">{p.name}</span>
            <span className="block text-[11px] text-[#6e6e73]">{TOWN_BY_ID[p.town].name}</span>
          </Tooltip>
        </Marker>
      ))}
      <Controller selected={selected} />
    </MapContainer>
  );
}

export { KIND_COLOR };
