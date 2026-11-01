"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Interest } from "@/data/types";
import type { Itinerary, TripInput } from "./planner";
import { commissionFor } from "./planner";
import type { Post, Review } from "@/data/community";

export type Lang = "en" | "fil" | "bcl";

export type BookingStatus = "pending" | "confirmed" | "declined" | "completed";

export interface BookingLine {
  id: string;
  serviceId: string;
  operatorId: string;
  title: string;
  date: string;
  qty: number;
  amount: number;
  status: BookingStatus;
}

export interface Booking {
  id: string;
  code: string;
  tripId: string;
  tripTitle: string;
  guest: string;
  guests: number;
  createdAt: string;
  method: "gcash" | "maya" | "card";
  lines: BookingLine[];
  total: number;
  commission: number;
}

export interface WalkIn {
  id: string;
  operatorId: string;
  label: string;
  amount: number;
  at: string;
}

interface State {
  // traveler
  user: { name: string; handle: string; from: string };
  lang: Lang;
  draft: TripInput;
  current: Itinerary | null;
  saved: Itinerary[];
  bookings: Booking[];
  myPosts: Post[];
  myReviews: Review[];
  liked: string[];
  savedPosts: string[];
  following: string[];
  cart: Record<string, number>;
  stormSim: boolean;
  hasPlanned: boolean;

  // operator side
  activeOperator: string;
  availability: Record<string, boolean>; // serviceId -> open
  priceOverrides: Record<string, number>;
  featured: Record<string, boolean>;
  replies: Record<string, string>; // reviewId -> reply
  walkIns: WalkIn[];

  // actions
  setLang: (l: Lang) => void;
  setUser: (u: Partial<State["user"]>) => void;
  setDraft: (d: Partial<TripInput>) => void;
  toggleInterest: (i: Interest) => void;
  setCurrent: (it: Itinerary | null) => void;
  saveTrip: (it: Itinerary) => void;
  removeTrip: (id: string) => void;
  book: (b: Omit<Booking, "id" | "code" | "createdAt" | "commission">) => Booking;
  setLineStatus: (bookingId: string, lineId: string, s: BookingStatus) => void;
  completeTrip: (bookingId: string) => void;
  addPost: (p: Post) => void;
  addReview: (r: Review) => void;
  toggleLike: (id: string) => void;
  toggleSavePost: (id: string) => void;
  toggleFollow: (h: string) => void;
  addToCart: (id: string, n?: number) => void;
  clearCart: () => void;
  setStormSim: (v: boolean) => void;
  setActiveOperator: (id: string) => void;
  setAvailability: (serviceId: string, open: boolean) => void;
  setPrice: (serviceId: string, price: number) => void;
  setFeatured: (opId: string, v: boolean) => void;
  setReply: (reviewId: string, text: string) => void;
  addWalkIn: (w: Omit<WalkIn, "id" | "at">) => void;
  resetDemo: () => void;
}

const today = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
};

const DEFAULT_DRAFT: TripInput = {
  days: 3,
  startDate: today(),
  group: "couple",
  size: 2,
  budget: "mid",
  interests: [],
  arrival: "flight",
};

const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const code = () => "PSY-" + Math.random().toString(36).slice(2, 6).toUpperCase();

/** A few bookings so the operator dashboard and insights have history on first load. */
function seedBookings(): Booking[] {
  const mk = (
    daysAgo: number,
    guest: string,
    guests: number,
    lines: [string, string, string, number, number, BookingStatus][],
  ): Booking => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const ls: BookingLine[] = lines.map(([serviceId, operatorId, title, qty, amount, status]) => ({
      id: rid("ln"),
      serviceId,
      operatorId,
      title,
      qty,
      amount,
      status,
      date: new Date(d.getTime() + 7 * 864e5).toISOString().slice(0, 10),
    }));
    const total = ls.reduce((a, l) => a + l.amount, 0);
    return {
      id: rid("bk"),
      code: code(),
      tripId: rid("trip"),
      tripTitle: "Surf & cliffs",
      guest,
      guests,
      createdAt: d.toISOString(),
      method: (["gcash", "maya", "card"] as const)[daysAgo % 3],
      lines: ls,
      total,
      commission: commissionFor(total),
    };
  };
  return [
    mk(1, "Bea Santos", 2, [
      ["alon-cottage", "alon-surf-camp", "Fan cottage for 2", 2, 3000, "confirmed"],
      ["alon-lesson", "alon-surf-camp", "Surf lesson with board", 2, 1800, "confirmed"],
      ["binurong-guide", "guinsaanan-guides", "Binurong guided trek", 1, 250, "confirmed"],
    ]),
    mk(3, "Hannah Lim", 3, [
      ["alon-aircon", "alon-surf-camp", "Air-con room for 3", 2, 5200, "completed"],
      ["van-day", "isla-vans", "Van with driver, full day", 3, 10500, "completed"],
    ]),
    mk(6, "Paolo Reyes", 4, [
      ["crab-tour", "crab-farm-tour", "Crab farm visit with lunch", 4, 2600, "completed"],
      ["kinis-room", "kinis-bnb", "Double room with breakfast", 2, 3200, "completed"],
    ]),
    mk(9, "Lia Fernandez", 2, [
      ["burak-standard", "casa-burak", "Standard double", 2, 3600, "completed"],
      ["kusina-meal", "kusina-catandungan", "Bicol set meal", 2, 560, "completed"],
    ]),
    mk(12, "Marco Villanueva", 5, [
      ["alon-aircon", "alon-surf-camp", "Air-con room for 3", 4, 10400, "completed"],
      ["alon-lesson", "alon-surf-camp", "Surf lesson with board", 5, 4500, "completed"],
    ]),
  ];
}

const initial = () => ({
  user: { name: "Guest traveler", handle: "you", from: "Manila" },
  lang: "en" as Lang,
  draft: DEFAULT_DRAFT,
  current: null,
  saved: [],
  bookings: seedBookings(),
  myPosts: [],
  myReviews: [],
  liked: [],
  savedPosts: [],
  following: [],
  cart: {},
  stormSim: false,
  hasPlanned: false,
  activeOperator: "alon-surf-camp",
  availability: {},
  priceOverrides: {},
  featured: {},
  replies: {},
  walkIns: [],
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial(),
      setLang: (lang) => set({ lang }),
      setUser: (u) => set({ user: { ...get().user, ...u } }),
      setDraft: (d) => set({ draft: { ...get().draft, ...d } }),
      toggleInterest: (i) => {
        const cur = get().draft.interests;
        set({ draft: { ...get().draft, interests: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] } });
      },
      setCurrent: (current) => set({ current, hasPlanned: get().hasPlanned || !!current }),
      saveTrip: (it) => set({ saved: [it, ...get().saved.filter((s) => s.id !== it.id)] }),
      removeTrip: (id) => set({ saved: get().saved.filter((s) => s.id !== id) }),
      book: (b) => {
        const booking: Booking = {
          ...b,
          id: rid("bk"),
          code: code(),
          createdAt: new Date().toISOString(),
          commission: commissionFor(b.total),
        };
        set({ bookings: [booking, ...get().bookings] });
        broadcast({ type: "booking", code: booking.code, guest: booking.guest, operators: booking.lines.map((l) => l.operatorId) });
        return booking;
      },
      setLineStatus: (bookingId, lineId, s) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id !== bookingId ? b : { ...b, lines: b.lines.map((l) => (l.id === lineId ? { ...l, status: s } : l)) },
          ),
        });
        broadcast({ type: "status", bookingId, lineId, status: s });
      },
      completeTrip: (bookingId) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id !== bookingId
              ? b
              : { ...b, lines: b.lines.map((l) => (l.status === "declined" ? l : { ...l, status: "completed" })) },
          ),
        }),
      addPost: (p) => set({ myPosts: [p, ...get().myPosts] }),
      addReview: (r) => set({ myReviews: [r, ...get().myReviews] }),
      toggleLike: (id) => {
        const l = get().liked;
        set({ liked: l.includes(id) ? l.filter((x) => x !== id) : [...l, id] });
      },
      toggleSavePost: (id) => {
        const l = get().savedPosts;
        set({ savedPosts: l.includes(id) ? l.filter((x) => x !== id) : [...l, id] });
      },
      toggleFollow: (h) => {
        const l = get().following;
        set({ following: l.includes(h) ? l.filter((x) => x !== h) : [...l, h] });
      },
      addToCart: (id, n = 1) => {
        const c = { ...get().cart };
        c[id] = Math.max(0, (c[id] ?? 0) + n);
        if (!c[id]) delete c[id];
        set({ cart: c });
      },
      clearCart: () => set({ cart: {} }),
      setStormSim: (stormSim) => set({ stormSim }),
      setActiveOperator: (activeOperator) => set({ activeOperator }),
      setAvailability: (serviceId, open) => set({ availability: { ...get().availability, [serviceId]: open } }),
      setPrice: (serviceId, price) => set({ priceOverrides: { ...get().priceOverrides, [serviceId]: price } }),
      setFeatured: (opId, v) => set({ featured: { ...get().featured, [opId]: v } }),
      setReply: (reviewId, text) => set({ replies: { ...get().replies, [reviewId]: text } }),
      addWalkIn: (w) => set({ walkIns: [{ ...w, id: rid("pos"), at: new Date().toISOString() }, ...get().walkIns] }),
      resetDemo: () => set({ ...initial() }),
    }),
    {
      name: "pasyar-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      skipHydration: true,
    },
  ),
);

/* ---------- cross-tab live sync (operator dashboard updates as a traveler books) ---------- */

type Msg =
  | { type: "booking"; code: string; guest: string; operators: string[] }
  | { type: "status"; bookingId: string; lineId: string; status: BookingStatus };

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  channel ??= new BroadcastChannel("pasyar-live");
  return channel;
}
function broadcast(m: Msg) {
  // let persist flush first
  setTimeout(() => getChannel()?.postMessage(m), 30);
}

export function subscribeLive(cb: (m: Msg) => void) {
  const ch = getChannel();
  if (!ch) return () => {};
  const h = (e: MessageEvent<Msg>) => {
    useStore.persist.rehydrate();
    cb(e.data);
  };
  ch.addEventListener("message", h);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "pasyar-v1") useStore.persist.rehydrate();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    ch.removeEventListener("message", h);
    window.removeEventListener("storage", onStorage);
  };
}

export const peso = (n: number) => "₱" + Math.round(n).toLocaleString("en-PH");

/** True once the persisted store has loaded on the client. Use it to avoid hydration flashes. */
import { useEffect, useState } from "react";
export function useHydrated() {
  const [h, setH] = useState(() => (typeof window !== "undefined" ? useStore.persist.hasHydrated() : false));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of URL/cache/external state on mount
    if (useStore.persist.hasHydrated()) setH(true);
    return useStore.persist.onFinishHydration(() => setH(true));
  }, []);
  return h;
}
