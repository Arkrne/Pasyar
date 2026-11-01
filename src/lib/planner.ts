import { PLACES, PLACE_BY_ID } from "@/data/places";
import { OPERATORS, OPERATOR_BY_ID, SERVICE_BY_ID } from "@/data/operators";
import { TOWN_BY_ID } from "@/data/towns";
import type { Interest, Operator, Place, Service, TownId } from "@/data/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Group = "solo" | "couple" | "friends" | "family";
export type Budget = "budget" | "mid" | "comfort";
export type Arrival = "flight" | "ferry-virac" | "ferry-san-andres";
export type Variant = "default" | "cheaper" | "adventurous";

export interface TripInput {
  days: number;
  startDate: string; // yyyy-mm-dd
  group: Group;
  size: number;
  budget: Budget;
  interests: Interest[];
  arrival: Arrival;
  variant?: Variant;
  storm?: boolean;
  seed?: number;
  locked?: Record<number, string[]>; // day index -> place ids that must stay
  removed?: string[]; // place ids the traveler removed
}

export type ItemType = "arrival" | "place" | "meal" | "transfer" | "stay" | "departure";

export interface PlanItem {
  key: string;
  type: ItemType;
  time: string;
  durationMin: number;
  travelMin: number;
  title: string;
  subtitle?: string;
  placeId?: string;
  serviceId?: string;
  operatorId?: string;
  cost: number; // whole group, PHP
  bookable: boolean;
  qty?: number;
  locked?: boolean;
  note?: string;
  lat?: number;
  lng?: number;
}

export interface DayPlan {
  index: number;
  date: string;
  title: string;
  area: Area;
  baseTown: TownId;
  items: PlanItem[];
  driveMin: number;
  cost: number;
}

export interface Itinerary {
  id: string;
  input: TripInput;
  title: string;
  summary: string;
  days: DayPlan[];
  totals: {
    group: number;
    perPerson: number;
    bookable: number;
    payOnSite: number;
    stops: number;
    driveHours: number;
  };
  warnings: string[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Geography                                                           */
/* ------------------------------------------------------------------ */

type Area = "south" | "east" | "north" | "farnorth";

const AREA_TOWNS: Record<Area, TownId[]> = {
  south: ["virac", "bato", "san-andres", "san-miguel"],
  east: ["baras", "gigmoto"],
  north: ["viga", "panganiban", "bagamanoc"],
  farnorth: ["pandan", "caramoran"],
};

const AREA_LABEL: Record<Area, string> = {
  south: "Virac and the south coast",
  east: "Baras and the Pacific side",
  north: "Viga and the northeast",
  farnorth: "Pandan and the far north",
};

const AREA_OF = Object.fromEntries(
  (Object.keys(AREA_TOWNS) as Area[]).flatMap((a) => AREA_TOWNS[a].map((t) => [t, a])),
) as Record<TownId, Area>;

const SEQUENCES: Record<number, Area[]> = {
  1: ["south"],
  2: ["south", "east"],
  3: ["south", "east", "south"],
  // Longer trips loop the island: up the west coast, down the Pacific side, back to Virac.
  4: ["south", "north", "east", "south"],
  5: ["south", "farnorth", "north", "east", "south"],
  6: ["south", "farnorth", "farnorth", "north", "east", "south"],
  7: ["south", "farnorth", "farnorth", "north", "east", "east", "south"],
};

/** Where you sleep after a day in each area. */
const BASE_STAYS: Record<Area, Record<Budget, string>> = {
  south: { budget: "burak-standard", mid: "burak-family", comfort: "lagoon-deluxe" },
  east: { budget: "alon-cottage", mid: "alon-aircon", comfort: "alon-aircon" },
  north: { budget: "kinis-room", mid: "viga-cottage", comfort: "viga-cottage" },
  farnorth: { budget: "ising-room", mid: "ising-room", comfort: "ising-room" },
};

const VIRAC: [number, number] = [13.5815, 124.2336];
const AIRPORT: [number, number] = [13.5766, 124.2044];
const SAN_ANDRES_PORT: [number, number] = [13.5989, 124.0975];

export function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Island roads wind; 1.45x straight-line distance at ~38 km/h is close to real van times. */
export function driveMinutes(a: [number, number], b: [number, number]) {
  const km = haversineKm(a, b) * 1.45;
  return Math.max(5, Math.round((km / 38) * 60 / 5) * 5);
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (min: number) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;
const roundTo5 = (n: number) => Math.round(n / 5) * 5;

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function serviceQty(s: Service, size: number) {
  switch (s.unit) {
    case "person":
      return size;
    case "meal":
      return s.name.includes("for 2") ? Math.ceil(size / 2) : size;
    case "night":
    case "group":
    case "day":
    case "trip":
      return Math.max(1, Math.ceil(size / (s.capacity ?? 1)));
  }
}

export function serviceCost(s: Service, size: number) {
  return s.price * serviceQty(s, size);
}

function tourForPlace(placeId: string): { op: Operator; svc: Service } | null {
  for (const op of OPERATORS) {
    if (op.kind !== "tour" && op.kind !== "stay") continue;
    const svc = op.services.find((s) => s.placeId === placeId);
    if (svc) return { op, svc };
  }
  return null;
}

function nearestFood(at: [number, number]) {
  const food = OPERATORS.filter((o) => o.kind === "food");
  let best: Operator | null = null;
  let bestD = Infinity;
  for (const f of food) {
    const d = haversineKm(at, [f.lat, f.lng]);
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return bestD < 6 ? best : null;
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

function score(place: Place, input: TripInput, rand: () => number) {
  const wants = new Set(input.interests);
  let s = 0;
  for (const i of place.interests) if (wants.has(i)) s += 3.2;
  s += (place.rating - 4) * 2.4;
  s += Math.log10(place.reviews + 10) * 0.6;
  if (input.variant === "adventurous") {
    if (place.gem) s += 2.2;
    if (place.effort >= 2) s += 1.5;
    if (place.interests.includes("adventure")) s += 1.5;
  }
  if (input.variant === "cheaper") s -= place.fee / 60;
  if (input.group === "family" && place.effort === 3) s -= 4;
  if (input.storm) {
    if (place.seaExposed) s -= 100;
    else if (place.outdoor && place.effort >= 2) s -= 6;
    if (!place.outdoor) s += 3;
  }
  if (input.removed?.includes(place.id)) s -= 1000;
  return s + rand() * 0.9;
}

/* ------------------------------------------------------------------ */
/* Planner                                                             */
/* ------------------------------------------------------------------ */

export function planTrip(raw: TripInput): Itinerary {
  const input: TripInput = {
    ...raw,
    days: Math.min(7, Math.max(1, raw.days)),
    size: Math.max(1, raw.size),
    interests: raw.interests.length ? raw.interests : ["beaches", "culture"],
    seed: raw.seed ?? 7,
    variant: raw.variant ?? "default",
  };
  const rand = rng(input.seed!);
  const budget: Budget = input.variant === "cheaper" ? "budget" : input.budget;
  const seq = SEQUENCES[input.days];
  const used = new Set<string>();
  const warnings: string[] = [];

  if (input.storm) {
    warnings.push(
      "Storm mode is on. Beaches, island boats and reef swims are off the plan until PAGASA lifts the warning. Indoor stops and river towns come first.",
    );
  }

  // Locked stops are claimed before anything else.
  for (const ids of Object.values(input.locked ?? {})) ids.forEach((id) => used.add(id));

  const days: DayPlan[] = [];
  let prevBase: [number, number] =
    input.arrival === "ferry-san-andres" ? SAN_ANDRES_PORT : input.arrival === "flight" ? AIRPORT : VIRAC;

  for (let d = 0; d < seq.length; d++) {
    const area = seq[d];
    const isFirst = d === 0;
    const isLast = d === seq.length - 1 && seq.length > 1;
    const items: PlanItem[] = [];
    let clock = 8 * 60; // 8:00 AM
    let hoursLeft = 7;
    let here: [number, number] = prevBase;

    if (isFirst) {
      if (input.arrival === "flight") {
        items.push({
          key: `d${d}-arr`,
          type: "arrival",
          time: "09:10",
          durationMin: 0,
          travelMin: 0,
          title: "Land at Virac Airport",
          subtitle: "Cebu Pacific 5J 821 from Manila",
          cost: 0,
          bookable: false,
          lat: AIRPORT[0],
          lng: AIRPORT[1],
        });
        clock = 9 * 60 + 40;
      } else if (input.arrival === "ferry-san-andres") {
        items.push({
          key: `d${d}-arr`,
          type: "arrival",
          time: "09:30",
          durationMin: 0,
          travelMin: 0,
          title: "Ferry arrives at San Andres",
          subtitle: "RoRo from Tabaco, Albay, 2.5 hours",
          cost: 0,
          bookable: false,
          lat: SAN_ANDRES_PORT[0],
          lng: SAN_ANDRES_PORT[1],
        });
        clock = 10 * 60;
      } else {
        items.push({
          key: `d${d}-arr`,
          type: "arrival",
          time: "08:00",
          durationMin: 0,
          travelMin: 0,
          title: "Fast craft arrives at Virac port",
          subtitle: "From Tabaco, Albay, 1.5 hours",
          cost: 0,
          bookable: false,
          lat: VIRAC[0],
          lng: VIRAC[1],
        });
        clock = 8 * 60 + 30;
      }
      const transfer = SERVICE_BY_ID["airport-transfer"];
      items.push({
        key: `d${d}-xfer`,
        type: "transfer",
        time: fmt(clock - 20),
        durationMin: 20,
        travelMin: 0,
        title: "Pickup and bags to your stay",
        subtitle: OPERATOR_BY_ID[transfer.operatorId].name,
        serviceId: transfer.id,
        operatorId: transfer.operatorId,
        cost: serviceCost(transfer, input.size),
        qty: serviceQty(transfer, input.size),
        bookable: true,
      });
      hoursLeft = 5.5;
    }
    if (isLast) hoursLeft = input.arrival === "flight" ? 0 : 3;
    const maxStopHours = isFirst ? 3 : isLast ? 2 : 8;

    // Candidate places in this area
    const pool = PLACES.filter((p) => AREA_TOWNS[area].includes(p.town))
      .map((p) => ({ p, s: score(p, input, rand) }))
      .filter((x) => x.s > -50)
      .sort((a, b) => b.s - a.s);

    const lockedHere = (input.locked?.[d] ?? []).map((id) => PLACE_BY_ID[id]).filter(Boolean);
    const chosen: Place[] = [...lockedHere];
    let budgetHours = hoursLeft - lockedHere.reduce((a, p) => a + p.hours, 0);
    for (const { p } of pool) {
      if (used.has(p.id)) continue;
      if (p.hours > budgetHours + 0.5 || p.hours > maxStopHours) continue;
      if (chosen.length >= (isLast ? 2 : 4)) break;
      chosen.push(p);
      used.add(p.id);
      budgetHours -= p.hours + 0.4;
      if (budgetHours < 0.75) break;
    }
    if (chosen.length === 0 && pool.length && hoursLeft > 0) {
      const fallback = pool.find((x) => !used.has(x.p.id));
      if (fallback) {
        chosen.push(fallback.p);
        used.add(fallback.p.id);
      }
    }

    // Order by nearest neighbour, with sunrise spots first and sunset-friendly last
    const ordered: Place[] = [];
    const left = [...chosen];
    let cursor = here;
    const sunrise = left.findIndex((p) => p.id === "binurong-point" || p.id === "viga-coast");
    if (sunrise >= 0 && !isFirst) {
      ordered.push(left.splice(sunrise, 1)[0]);
      cursor = [ordered[0].lat, ordered[0].lng];
    }
    while (left.length) {
      let bi = 0;
      let bd = Infinity;
      left.forEach((p, i) => {
        const dd = haversineKm(cursor, [p.lat, p.lng]);
        if (dd < bd) {
          bd = dd;
          bi = i;
        }
      });
      const next = left.splice(bi, 1)[0];
      ordered.push(next);
      cursor = [next.lat, next.lng];
    }

    if (ordered[0]?.id === "binurong-point" || ordered[0]?.id === "viga-coast") clock = Math.min(clock, 5 * 60 + 15);

    let driveMin = 0;
    let lunchDone = false;
    for (const pl of ordered) {
      const t = driveMinutes(here, [pl.lat, pl.lng]);
      driveMin += t;
      clock += t;

      if (!lunchDone && clock >= 11 * 60 + 30) {
        items.push(lunchItem(d, clock, here, input.size, input.variant));
        clock += 60;
        lunchDone = true;
      }

      if (!lunchDone && clock < 11 * 60 + 30 && clock + pl.hours * 60 > 13 * 60 + 30) {
        items.push({
          key: `d${d}-lunch`,
          type: "meal",
          time: "12:00",
          durationMin: 30,
          travelMin: 0,
          title: "Packed lunch on the trail",
          subtitle: "Your guide or stay can prepare baon",
          cost: 150 * input.size,
          bookable: false,
          note: "Pay on site",
        });
        lunchDone = true;
      }

      const tour = tourForPlace(pl.id);
      const isLocked = (input.locked?.[d] ?? []).includes(pl.id);
      const town = TOWN_BY_ID[pl.town];
      items.push({
        key: `d${d}-${pl.id}`,
        type: "place",
        time: fmt(clock),
        durationMin: Math.round(pl.hours * 60),
        travelMin: t,
        title: pl.name,
        subtitle: town.name,
        placeId: pl.id,
        cost: pl.fee * input.size,
        bookable: false,
        locked: isLocked,
        note: pl.feeNote,
        lat: pl.lat,
        lng: pl.lng,
      });
      if (tour && !(input.variant === "cheaper" && tour.svc.price * serviceQty(tour.svc, input.size) > 1500)) {
        items.push({
          key: `d${d}-${tour.svc.id}`,
          type: "place",
          time: fmt(clock),
          durationMin: 0,
          travelMin: 0,
          title: tour.svc.name,
          subtitle: tour.op.name,
          serviceId: tour.svc.id,
          operatorId: tour.op.id,
          placeId: pl.id,
          cost: serviceCost(tour.svc, input.size),
          qty: serviceQty(tour.svc, input.size),
          bookable: true,
        });
      }
      clock += roundTo5(pl.hours * 60);
      here = [pl.lat, pl.lng];
    }
    if (!lunchDone && !(isLast && input.arrival === "flight")) {
      items.push(lunchItem(d, Math.max(clock, 12 * 60), here, input.size, input.variant));
      clock = Math.max(clock, 12 * 60) + 60;
    }

    // Transport for the day
    const vehicle = isLast && input.arrival === "flight"
      ? SERVICE_BY_ID["airport-transfer"]
      : input.size <= 2 && (input.variant === "cheaper" || input.budget === "budget")
        ? SERVICE_BY_ID["habal-day"]
        : SERVICE_BY_ID["van-day"];
    items.splice(isFirst ? 2 : 0, 0, {
      key: `d${d}-ride`,
      type: "transfer",
      time: isFirst ? items[1]?.time ?? "08:00" : fmt(Math.min(...items.map((i) => toMin(i.time)).filter((n) => !Number.isNaN(n)), 8 * 60) - 15),
      durationMin: 0,
      travelMin: 0,
      title: vehicle.id === "van-day" ? "Van and driver for the day" : vehicle.id === "airport-transfer" ? "Ride to the airport" : "Habal-habal for the day",
      subtitle: OPERATOR_BY_ID[vehicle.operatorId].name,
      serviceId: vehicle.id,
      operatorId: vehicle.operatorId,
      cost: serviceCost(vehicle, input.size),
      qty: serviceQty(vehicle, input.size),
      bookable: true,
    });

    // Where you sleep
    const baseArea: Area = isLast ? "south" : area;
    if (!isLast || seq.length === 1) {
      const stay = SERVICE_BY_ID[BASE_STAYS[baseArea][budget]];
      const op = OPERATOR_BY_ID[stay.operatorId];
      const back = driveMinutes(here, [op.lat, op.lng]);
      driveMin += back;
      clock = Math.max(clock + back, 17 * 60);
      items.push({
        key: `d${d}-dinner`,
        type: "meal",
        time: fmt(clock + 60),
        durationMin: 60,
        travelMin: 0,
        title: "Dinner",
        subtitle: dinnerNote(baseArea),
        cost: (input.variant === "cheaper" ? 180 : 280) * input.size,
        bookable: false,
        note: "Pay on site",
      });
      items.push({
        key: `d${d}-stay`,
        type: "stay",
        time: fmt(clock),
        durationMin: 0,
        travelMin: back,
        title: op.name,
        subtitle: `${stay.name} · ${TOWN_BY_ID[op.town].name}`,
        serviceId: stay.id,
        operatorId: op.id,
        cost: serviceCost(stay, input.size),
        qty: serviceQty(stay, input.size),
        bookable: true,
        lat: op.lat,
        lng: op.lng,
      });
      prevBase = [op.lat, op.lng];
    } else {
      const out =
        input.arrival === "flight"
          ? { title: "Fly home from Virac", subtitle: "Cebu Pacific 5J 822 departs 9:40 AM. Be at the airport by 8:40.", at: AIRPORT }
          : input.arrival === "ferry-san-andres"
            ? { title: "Ferry back to Tabaco", subtitle: "RoRo from San Andres, 1:30 PM", at: SAN_ANDRES_PORT }
            : { title: "Fast craft back to Tabaco", subtitle: "From Virac port, 1:00 PM", at: VIRAC };
      const t = driveMinutes(here, out.at);
      driveMin += t;
      items.push({
        key: `d${d}-dep`,
        type: "departure",
        time: input.arrival === "flight" ? "08:40" : fmt(Math.max(clock + t, 12 * 60 + 30)),
        durationMin: 0,
        travelMin: t,
        title: out.title,
        subtitle: out.subtitle,
        cost: 0,
        bookable: false,
        lat: out.at[0],
        lng: out.at[1],
      });
    }

    items.sort((a, b) => toMin(a.time) - toMin(b.time) || order(a) - order(b));
    const towns = [...new Set(ordered.map((p) => TOWN_BY_ID[p.town].name))];
    days.push({
      index: d,
      date: addDays(input.startDate, d),
      title: dayTitle(d, seq.length, ordered, towns, area),
      area,
      baseTown: (isLast ? "virac" : (OPERATOR_BY_ID[SERVICE_BY_ID[BASE_STAYS[baseArea][budget]].operatorId].town)) as TownId,
      items,
      driveMin,
      cost: items.reduce((a, i) => a + i.cost, 0),
    });
  }

  const group = days.reduce((a, d) => a + d.cost, 0);
  const bookable = days.flatMap((d) => d.items).filter((i) => i.bookable).reduce((a, i) => a + i.cost, 0);
  const stops = days.flatMap((d) => d.items).filter((i) => i.type === "place" && !i.serviceId).length;
  const driveHours = Math.round((days.reduce((a, d) => a + d.driveMin, 0) / 60) * 10) / 10;

  const areas = [...new Set(seq)].map((a) => AREA_LABEL[a].split(" and ")[0]);
  return {
    id: `trip-${input.seed}-${Date.now().toString(36)}`,
    input,
    title: tripTitle(input),
    summary: `${input.days} ${input.days === 1 ? "day" : "days"} covering ${listJoin(areas)}. ${stops} stops, about ${driveHours} hours on the road.`,
    days,
    totals: {
      group,
      perPerson: Math.round(group / input.size),
      bookable,
      payOnSite: group - bookable,
      stops,
      driveHours,
    },
    warnings,
    createdAt: new Date().toISOString(),
  };
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function order(i: PlanItem) {
  return { arrival: 0, transfer: 1, place: 2, meal: 3, stay: 4, departure: 5 }[i.type];
}

function lunchItem(d: number, clock: number, at: [number, number], size: number, variant?: Variant): PlanItem {
  const food = variant === "cheaper" ? null : nearestFood(at);
  const svc = food?.services[0];
  if (food && svc) {
    return {
      key: `d${d}-lunch`,
      type: "meal",
      time: fmt(clock),
      durationMin: 60,
      travelMin: 0,
      title: `Lunch at ${food.name}`,
      subtitle: svc.name,
      serviceId: svc.id,
      operatorId: food.id,
      cost: serviceCost(svc, size),
      qty: serviceQty(svc, size),
      bookable: true,
      lat: food.lat,
      lng: food.lng,
    };
  }
  return {
    key: `d${d}-lunch`,
    type: "meal",
    time: fmt(clock),
    durationMin: 60,
    travelMin: 0,
    title: "Lunch at a local carinderia",
    subtitle: "Rice, fish and a vegetable dish",
    cost: (variant === "cheaper" ? 150 : 220) * size,
    bookable: false,
    note: "Pay on site",
  };
}

function dinnerNote(area: Area) {
  return {
    south: "Bayside grills near Virac port",
    east: "Fresh catch at your surf camp",
    north: "Crab in coconut milk, Panganiban style",
    farnorth: "Home-cooked at your homestay",
  }[area];
}

function dayTitle(d: number, total: number, places: Place[], towns: string[], area: Area) {
  if (d === 0) return places[0] ? `Arrive and ease into ${towns[0] ?? "Virac"}` : "Arrive in Virac";
  if (d === total - 1 && total > 1) return places.length ? `Last morning in ${towns[0]}` : "Breakfast, then fly home";
  const star = [...places].sort((a, b) => b.rating - a.rating)[0];
  return star ? `${star.name} and ${AREA_LABEL[area].split(" and ")[1] ?? towns.join(", ")}` : AREA_LABEL[area];
}

function tripTitle(input: TripInput) {
  const map: Partial<Record<Interest, string>> = {
    surf: "Surf",
    beaches: "Beaches",
    waterfalls: "Waterfalls",
    mountains: "Cliffs and hills",
    culture: "Stone churches",
    food: "Crab and kakanin",
    adventure: "Caves and rivers",
    relax: "Slow days",
  };
  const words = input.interests.slice(0, 2).map((i) => map[i]).filter(Boolean);
  return `${words.join(" & ") || "Island"} in ${input.days} ${input.days === 1 ? "day" : "days"}`;
}

function listJoin(xs: string[]) {
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

/** Quick swap: ask the planner for a different place in the same area for one slot. */
export function alternativesFor(placeId: string, input: TripInput, exclude: string[]) {
  const place = PLACE_BY_ID[placeId];
  if (!place) return [];
  const area = AREA_OF[place.town];
  const rand = rng((input.seed ?? 1) + 99);
  return PLACES.filter((p) => AREA_TOWNS[area].includes(p.town) && p.id !== placeId && !exclude.includes(p.id))
    .map((p) => ({ p, s: score(p, input, rand) }))
    .filter((x) => x.s > -50)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.p);
}

export function bookableItems(it: Itinerary) {
  return it.days.flatMap((d) =>
    d.items.filter((i) => i.bookable && i.serviceId).map((i) => ({ ...i, date: d.date, day: d.index })),
  );
}

export const COMMISSION_RATE = 0.12;
export function commissionFor(amount: number) {
  return Math.round(amount * COMMISSION_RATE);
}

export { AREA_LABEL, AREA_OF };
export type { Area };
