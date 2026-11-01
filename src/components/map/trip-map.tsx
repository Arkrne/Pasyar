"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, useMap, Tooltip } from "react-leaflet";
import { Basemap } from "./basemap";
import L from "leaflet";
import type { DayPlan } from "@/lib/planner";


import { dayColor } from "./colors";

type Pt = { lat: number; lng: number; label: string; n: number; kind: string };

function pointsOf(day: DayPlan): Pt[] {
  let n = 0;
  return day.items
    .filter((i) => i.lat != null && i.lng != null && !(i.serviceId && i.type === "place"))
    .map((i) => ({ lat: i.lat!, lng: i.lng!, label: i.title, kind: i.type, n: i.type === "place" ? ++n : 0 }));
}

/** Curve each leg slightly so the route reads as a journey, not a spreadsheet. */
function curved(pts: Pt[]): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k];
    const b = pts[k + 1];
    const mx = (a.lat + b.lat) / 2;
    const my = (a.lng + b.lng) / 2;
    const dx = b.lat - a.lat;
    const dy = b.lng - a.lng;
    const c: [number, number] = [mx - dy * 0.18, my + dx * 0.18];
    for (let t = 0; t <= 1; t += 1 / 24) {
      const u = 1 - t;
      out.push([u * u * a.lat + 2 * u * t * c[0] + t * t * b.lat, u * u * a.lng + 2 * u * t * c[1] + t * t * b.lng]);
    }
  }
  if (pts.length === 1) out.push([pts[0].lat, pts[0].lng]);
  return out;
}

function icon(p: Pt, color: string, active: boolean) {
  const html =
    p.kind === "place"
      ? `<div class="pin" style="background:${color};${active ? "" : "opacity:.55;transform:scale(.8)"}">${p.n}</div>`
      : p.kind === "stay"
        ? `<div class="pin" style="background:#1d1d1f;${active ? "" : "opacity:.5;transform:scale(.8)"}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></div>`
        : `<div class="pin-dot" style="background:${color}"></div>`;
  const size = p.kind === "place" || p.kind === "stay" ? 30 : 14;
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function Fit({ pts, all }: { pts: [number, number][]; all: [number, number][] }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    const target = pts.length ? pts : all;
    if (!target.length) return;
    const b = L.latLngBounds(target);
    const pad = window.innerWidth < 768 ? 40 : 70;
    if (first.current) {
      map.fitBounds(L.latLngBounds(all.length ? all : target), { padding: [pad, pad] });
      first.current = false;
      setTimeout(() => map.flyToBounds(b, { padding: [pad, pad], duration: 1.1, maxZoom: 12 }), 500);
    } else {
      map.flyToBounds(b, { padding: [pad, pad], duration: 0.9, maxZoom: 12 });
    }
  }, [pts, all, map]);
  return null;
}

/** Route that draws itself: grows the visible slice of points over ~1.2s. */
function DrawnRoute({ line, color, animate, weight = 4 }: { line: [number, number][]; color: string; animate: boolean; weight?: number }) {
  const [n, setN] = useState(animate ? 1 : line.length);
  useEffect(() => {
    if (!animate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of URL/cache/external state on mount
      setN(line.length);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 600 + line.length * 6;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.max(2, Math.round(e * line.length)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setN(1);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [line, animate]);
  return (
    <>
      <Polyline positions={line.slice(0, n)} pathOptions={{ color: "#ffffff", weight: weight + 4, opacity: 0.9, className: "route-line" }} />
      <Polyline positions={line.slice(0, n)} pathOptions={{ color, weight, opacity: 1, className: "route-line" }} />
      {n >= line.length && <Polyline positions={line} pathOptions={{ color: "#ffffff", weight: 2, opacity: 0.9, className: "route-flow" }} />}
    </>
  );
}

export default function TripMap({ days, active, onPick }: { days: DayPlan[]; active: number; onPick?: (placeId: string) => void }) {
  const per = useMemo(() => days.map((d) => pointsOf(d)), [days]);
  const lines = useMemo(() => per.map((p) => curved(p)), [per]);
  const all = useMemo(() => per.flat().map((p) => [p.lat, p.lng] as [number, number]), [per]);
  const activePts = useMemo(() => (per[active] ?? []).map((p) => [p.lat, p.lng] as [number, number]), [per, active]);

  return (
    <MapContainer
      center={[13.75, 124.25]}
      zoom={10}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl
    >
      <Basemap />
      {lines.map((ln, i) =>
        i === active ? null : (
          <Polyline key={`bg-${i}`} positions={ln} pathOptions={{ color: dayColor(i), weight: 3, opacity: 0.28, dashArray: "2 8", className: "route-line" }} />
        ),
      )}
      {lines[active] && <DrawnRoute key={`r-${active}-${days[active]?.items.length}`} line={lines[active]} color={dayColor(active)} animate />}
      {per.map((pts, i) =>
        pts.map((p, k) => (
          <Marker
            key={`${i}-${k}-${p.label}`}
            position={[p.lat, p.lng]}
            icon={icon(p, dayColor(i), i === active)}
            zIndexOffset={i === active ? 500 : 0}
            eventHandlers={{
              click: () => {
                const it = days[i].items.find((x) => x.title === p.label);
                if (it?.placeId && onPick) onPick(it.placeId);
              },
            }}
          >
            {i === active && p.kind !== "arrival" && (
              <Tooltip direction="top" offset={[0, -14]} opacity={1}>
                <span className="text-[12px] font-semibold">{p.label}</span>
              </Tooltip>
            )}
          </Marker>
        )),
      )}
      <Fit pts={activePts} all={all} />
    </MapContainer>
  );
}
