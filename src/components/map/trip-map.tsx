"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoJsonObject } from "geojson";
import type { DayPlan } from "@/lib/planner";
import { PLACE_BY_ID } from "@/data/places";
import { TOWN_ID_BY_NAME } from "@/data/towns";
import { TOWN_STYLE } from "@/data/palette";
import { geo } from "@/lib/geo";
import { Basemap } from "./basemap";
import { IslandMask } from "./island-mask";
import { dayColor } from "./colors";
import { roadRoute, type RoadRoute } from "@/lib/routing";

type Pt = { lat: number; lng: number; label: string; n: number; kind: "start" | "place" | "stay" | "arrival" | "departure"; photo?: string; placeId?: string };

/** The day's stops in driving order, starting from last night's hotel. */
function pointsOf(day: DayPlan, prev?: DayPlan): Pt[] {
  const out: Pt[] = [];
  const prevStay = prev?.items.find((i) => i.type === "stay" && i.lat != null);
  if (prevStay) out.push({ lat: prevStay.lat!, lng: prevStay.lng!, label: prevStay.title, n: 0, kind: "start" });
  let n = 0;
  for (const i of day.items) {
    if (i.lat == null || i.lng == null) continue;
    if (i.type === "place" && i.serviceId) continue;
    if (i.type === "place") out.push({ lat: i.lat, lng: i.lng, label: i.title, n: ++n, kind: "place", photo: i.placeId ? PLACE_BY_ID[i.placeId]?.photo : undefined, placeId: i.placeId });
    else if (i.type === "stay") out.push({ lat: i.lat, lng: i.lng, label: i.title, n: 0, kind: "stay" });
    else if (i.type === "arrival" || i.type === "departure") out.push({ lat: i.lat, lng: i.lng, label: i.title, n: 0, kind: i.type });
  }
  return out;
}

function curved(pts: Pt[]): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k];
    const b = pts[k + 1];
    const c: [number, number] = [(a.lat + b.lat) / 2 - (b.lng - a.lng) * 0.18, (a.lng + b.lng) / 2 + (b.lat - a.lat) * 0.18];
    for (let t = 0; t <= 1; t += 1 / 24) {
      const u = 1 - t;
      out.push([u * u * a.lat + 2 * u * t * c[0] + t * t * b.lat, u * u * a.lng + 2 * u * t * c[1] + t * t * b.lng]);
    }
  }
  if (pts.length === 1) out.push([pts[0].lat, pts[0].lng]);
  return out;
}

const BED = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20V8M2 14h20v6M22 14v-2a3 3 0 0 0-3-3h-8v5"/><circle cx="7" cy="11" r="2"/></svg>`;
const PLANE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>`;

function icon(p: Pt, color: string, active: boolean) {
  const fade = active ? "" : "opacity:.5;transform:scale(.8);";
  if (p.kind === "place") {
    const s = active ? 46 : 32;
    const img = p.photo ? `<img src="${p.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:999px"/>` : "";
    return L.divIcon({
      className: "",
      html: `<div style="position:relative;width:${s}px;height:${s}px;${fade}">
        <div class="pin" style="width:100%;height:100%;padding:0;overflow:hidden;background:${color};box-shadow:0 0 0 3px #fff,0 8px 18px rgba(0,0,0,.28)">${img}</div>
        <span style="position:absolute;right:-6px;top:-6px;min-width:20px;height:20px;border-radius:99px;background:${color};color:#fff;font:700 11px/20px var(--font-sans);text-align:center;box-shadow:0 0 0 2px #fff">${p.n}</span></div>`,
      iconSize: [s, s],
      iconAnchor: [s / 2, s / 2],
    });
  }
  if (p.kind === "stay" || p.kind === "start") {
    const label = active ? `<span style="margin-left:6px;font:600 12px/1 var(--font-sans);color:#1d1d1f;white-space:nowrap">${p.kind === "start" ? "Start · " : "Tonight · "}${p.label}</span>` : "";
    return L.divIcon({
      className: "",
      html: `<div style="display:inline-flex;align-items:center;background:#fff;border-radius:99px;padding:3px ${active ? 10 : 3}px 3px 3px;box-shadow:0 8px 20px rgba(0,0,0,.22);${active ? "" : "opacity:.6"}">
        <span style="display:grid;place-items:center;width:26px;height:26px;border-radius:99px;background:#1d1d1f">${BED}</span>${label}</div>`,
      iconSize: [active ? 220 : 32, 32],
      iconAnchor: [16, 16],
    });
  }
  return L.divIcon({ className: "", html: `<div class="pin" style="width:28px;height:28px;background:#0A6CBF;${fade}">${PLANE}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
}

function legIcon(min: number, km: number, color: string) {
  const t = min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:5px;white-space:nowrap;background:${color};color:#fff;border-radius:99px;padding:4px 9px;font:700 11.5px/1 var(--font-sans);box-shadow:0 0 0 2px #fff,0 6px 14px rgba(0,0,0,.25)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4"><path d="M5 17h14M6 17l1.5-6h9L18 17M8 17v2M16 17v2"/></svg>${t}<span style="opacity:.8;font-weight:600">· ${km} km</span></div>`,
    iconSize: [0, 0],
  });
}

const JEEP = `<svg width="44" height="30" viewBox="0 -8 62 44"><ellipse cx="30" cy="34" rx="26" ry="3" fill="#0a3a5c" opacity=".2"/><rect x="5" y="3.5" width="42" height="6.5" rx="3" fill="#F6CB67"/><rect x="10" y="-1.5" width="9" height="3.5" rx="1" fill="#2B8FD6"/><path d="M4 10h44l8 6v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V11z" fill="#EA753C"/><path d="M47 13h6l4 4v7h-10z" fill="#F6A54F"/><rect x="7" y="12" width="7" height="6" rx="1.5" fill="#CFE9FF"/><rect x="16" y="12" width="7" height="6" rx="1.5" fill="#CFE9FF"/><rect x="25" y="12" width="7" height="6" rx="1.5" fill="#CFE9FF"/><rect x="34" y="12" width="7" height="6" rx="1.5" fill="#CFE9FF"/><rect x="4" y="20" width="46" height="2" fill="#2B8FD6"/><circle cx="56.5" cy="21.5" r="1.8" fill="#FFF4B0"/><circle cx="15" cy="29" r="5" fill="#1d1d1f"/><circle cx="46" cy="29" r="5" fill="#1d1d1f"/><circle cx="15" cy="29" r="2" fill="#ddd"/><circle cx="46" cy="29" r="2" fill="#ddd"/></svg>`;

/** A jeepney that drives the active route on a loop. */
function MovingJeep({ line }: { line: [number, number][] }) {
  const ref = useRef<L.Marker>(null);
  useEffect(() => {
    if (line.length < 2) return;
    let raf = 0;
    const start = performance.now();
    const dur = Math.min(14000, 3500 + line.length * 12);
    const tick = (t: number) => {
      const f = ((Math.max(0, t - start) % dur) / dur) * (line.length - 1);
      const i = Math.floor(f);
      const a = line[i];
      const b = line[Math.min(line.length - 1, i + 1)];
      const k = f - i;
      const m = ref.current;
      if (m) {
        m.setLatLng([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
        const el = m.getElement()?.firstElementChild as HTMLElement | null;
        if (el) el.style.transform = `scaleX(${b[1] < a[1] ? -1 : 1})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [line]);
  return (
    <Marker
      ref={ref}
      position={line[0]}
      interactive={false}
      zIndexOffset={2000}
      icon={L.divIcon({ className: "", html: `<div style="transition:transform .2s">${JEEP}</div>`, iconSize: [44, 30], iconAnchor: [22, 26] })}
    />
  );
}

function Fit({ pts, all }: { pts: [number, number][]; all: [number, number][] }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    const target = pts.length ? pts : all;
    if (!target.length) return;
    const pad = window.innerWidth < 768 ? 40 : 80;
    map.invalidateSize();
    // short pan/zoom instead of a long fly, so nothing lags behind the routes
    map.fitBounds(L.latLngBounds(target), { padding: [pad, pad], maxZoom: 12, animate: !first.current, duration: 0.6 });
    first.current = false;
  }, [pts, all, map]);
  return null;
}

function DrawnRoute({ line, color }: { line: [number, number][]; color: string }) {
  const [n, setN] = useState(1);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = Math.min(1800, 600 + line.length * 2);
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.max(2, Math.round((1 - Math.pow(1 - p, 3)) * line.length)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [line]);
  const seg = line.slice(0, n);
  return (
    <>
      <Polyline positions={seg} pathOptions={{ color: "#ffffff", weight: 13, opacity: 1, className: "route-line" }} />
      <Polyline positions={seg} pathOptions={{ color: "#0b2e4f", weight: 9, opacity: 0.3, className: "route-line" }} />
      <Polyline positions={seg} pathOptions={{ color, weight: 7, opacity: 1, className: "route-line" }} />
      {n >= line.length && <Polyline positions={line} pathOptions={{ color: "#ffffff", weight: 2.5, opacity: 0.95, className: "route-flow" }} />}
    </>
  );
}

export default function TripMap({ days, active, onPick }: { days: DayPlan[]; active: number; onPick?: (placeId: string) => void }) {
  const per = useMemo(() => days.map((d, i) => pointsOf(d, days[i - 1])), [days]);
  const [roads, setRoads] = useState<(RoadRoute | null)[]>([]);
  useEffect(() => {
    let alive = true;
    const order = [active, ...per.map((_, i) => i).filter((i) => i !== active)];
    order.forEach((i, k) => {
      setTimeout(() => {
        roadRoute(per[i].map((p) => [p.lat, p.lng] as [number, number])).then((r) => {
          if (!alive || !r) return;
          setRoads((prev) => {
            const next = [...prev];
            next[i] = r;
            return next;
          });
        });
      }, k * 250);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when the plan changes
  }, [per]);
  const lines = useMemo(() => per.map((p, i) => roads[i]?.coords ?? curved(p)), [per, roads]);
  const all = useMemo(() => per.flat().map((p) => [p.lat, p.lng] as [number, number]), [per]);
  const activePts = useMemo(() => (per[active] ?? []).map((p) => [p.lat, p.lng] as [number, number]), [per, active]);
  const road = roads[active];
  const color = dayColor(active);

  return (
    <MapContainer center={[13.75, 124.25]} zoom={10} zoomControl={false} scrollWheelZoom={false} className="h-full w-full" attributionControl>
      <Basemap />
      <GeoJSON
        data={geo as GeoJsonObject}
        interactive={false}
        style={(f) => {
          const id = TOWN_ID_BY_NAME[(f?.properties as { name: string }).name];
          return { color: "#ffffff", weight: 1, fillColor: TOWN_STYLE[id].color, fillOpacity: 0.1 };
        }}
      />
      <IslandMask />
      {lines.map((ln, i) =>
        i === active ? null : (
          <Polyline key={`bg-${i}-${ln.length}`} positions={ln} pathOptions={{ color: dayColor(i), weight: 3, opacity: 0.4, dashArray: "2 8", className: "route-line" }} />
        ),
      )}
      {lines[active] && <DrawnRoute key={`r-${active}-${lines[active].length}`} line={lines[active]} color={color} />}
      {road?.legs.map((l, k) => (
        <Marker key={`leg-${active}-${k}`} position={l.mid} icon={legIcon(l.minutes, l.km, color)} interactive={false} zIndexOffset={1500} />
      ))}
      {lines[active] && lines[active].length > 2 && <MovingJeep key={`jeep-${active}-${lines[active].length}`} line={lines[active]} />}
      {per.map((pts, i) =>
        pts.map((p, k) =>
          i !== active && p.kind === "start" ? null : (
            <Marker
              key={`${i}-${k}-${p.label}-${i === active}`}
              position={[p.lat, p.lng]}
              icon={icon(p, dayColor(i), i === active)}
              zIndexOffset={i === active ? (p.kind === "stay" || p.kind === "start" ? 1800 : 1600) : 0}
              eventHandlers={{ click: () => p.placeId && onPick?.(p.placeId) }}
            />
          ),
        ),
      )}
      {road && <RoadBadge road={road} color={color} day={active + 1} />}
      <Fit pts={activePts} all={all} />
    </MapContainer>
  );
}

function RoadBadge({ road, color, day }: { road: RoadRoute; color: string; day: number }) {
  const h = Math.floor(road.minutes / 60);
  const m = road.minutes % 60;
  return (
    <div className="leaflet-bottom leaflet-left" style={{ pointerEvents: "none" }}>
      <div
        className="leaflet-control glass-strong"
        style={{ pointerEvents: "auto", margin: "0 0 12px 12px", borderRadius: 18, padding: "10px 14px", boxShadow: "0 10px 28px rgba(0,0,0,.16)", display: "flex", alignItems: "center", gap: 12 }}
      >
        <span style={{ width: 34, height: 34, borderRadius: 12, background: color, display: "grid", placeItems: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4">
            <path d="M5 17h14M6 17l1.5-6h9L18 17M8 17v2M16 17v2" />
          </svg>
        </span>
        <span style={{ fontSize: 13, lineHeight: 1.25 }}>
          <b style={{ fontSize: 16 }}>{h ? `${h} h ${m} min` : `${m} min`} on the road</b>
          <br />
          <span style={{ color: "#6e6e73" }}>
            Day {day} · {road.km} km · {road.legs.length} drives
          </span>
        </span>
      </div>
    </div>
  );
}
