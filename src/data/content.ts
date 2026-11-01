import type { Interest, Product } from "./types";

const p = (slug: string) => `/photos/${slug}.webp`;

export const INTERESTS: { id: Interest; label: string; hint: string; photo: string }[] = [
  { id: "surf", label: "Surf", hint: "Puraran's Majestic", photo: p("puraran-beach") },
  { id: "beaches", label: "Beaches", hint: "Coves and white sand", photo: p("twin-rock-palms") },
  { id: "waterfalls", label: "Waterfalls", hint: "Maribina, Nahulugan", photo: p("nahulugan-falls") },
  { id: "mountains", label: "Hills & peaks", hint: "Binurong, Boctot", photo: p("binurong-ridge") },
  { id: "culture", label: "History & faith", hint: "Stone churches", photo: p("bato-church") },
  { id: "food", label: "Food", hint: "Crab, latik, kinunot", photo: p("virac-port") },
  { id: "adventure", label: "Adventure", hint: "Caves, rivers, treks", photo: p("luyang-cave") },
  { id: "relax", label: "Slow days", hint: "Hammocks and sunsets", photo: p("viga-sunrise") },
];

export const PRODUCTS: Product[] = [
  {
    id: "pinukpok-tote",
    name: "Pinukpok abaca tote",
    maker: "Pinukpok Weavers of Baras",
    town: "baras",
    price: 1450,
    unit: "piece",
    photo: p("abaca-bags"),
    blurb: "Hand-beaten abaca, woven and stitched in Baras. Each one takes about two days.",
    tag: "abaca",
    stock: 14,
  },
  {
    id: "abaca-market-bag",
    name: "Abaca market bag",
    maker: "Catandungan Crafts Co-op",
    town: "virac",
    price: 680,
    unit: "piece",
    photo: p("abaca-bags-2"),
    blurb: "Sturdy everyday bag from the province's top-grade fiber.",
    tag: "abaca",
    stock: 32,
  },
  {
    id: "shell-necklace",
    name: "Seed and shell necklace",
    maker: "Bato Beadworks",
    town: "bato",
    price: 420,
    unit: "piece",
    photo: p("crafts-necklace"),
    blurb: "Native seeds and shells strung by a family workshop in Bato.",
    tag: "craft",
    stock: 21,
  },
  {
    id: "latik-pack",
    name: "Latik, pack of 6",
    maker: "Sogod Heirloom Kakanin",
    town: "virac",
    price: 150,
    unit: "pack",
    photo: "",
    blurb: "Sweet sticky-rice snack, made the morning you pick it up.",
    tag: "food",
    stock: 40,
  },
  {
    id: "pili-nuts",
    name: "Roasted pili nuts, 250 g",
    maker: "San Andres Pili Growers",
    town: "san-andres",
    price: 260,
    unit: "pouch",
    photo: "",
    blurb: "Buttery Bicol pili, roasted with a little salt.",
    tag: "food",
    stock: 55,
  },
  {
    id: "tablea",
    name: "Cacao tablea, 10 pieces",
    maker: "Viga Upland Farmers",
    town: "viga",
    price: 180,
    unit: "pack",
    photo: "",
    blurb: "Pure ground cacao for tsokolate. Melt one disc in hot water or milk.",
    tag: "food",
    stock: 27,
  },
  {
    id: "sugbo-broom",
    name: "Sugbo tiger-grass broom",
    maker: "Hitoma Broom Makers",
    town: "caramoran",
    price: 220,
    unit: "piece",
    photo: "",
    blurb: "The soft-bristle walis tambo from the seven barangays of Hitoma.",
    tag: "craft",
    stock: 60,
  },
  {
    id: "buri-hat",
    name: "Buri palm hat",
    maker: "Gigmoto Weavers",
    town: "gigmoto",
    price: 350,
    unit: "piece",
    photo: "",
    blurb: "Wide brim for Puraran afternoons. Folds flat in a backpack.",
    tag: "craft",
    stock: 18,
  },
];

export type TransportRow = {
  id: string;
  mode: "flight" | "fast-craft" | "roro" | "van";
  from: string;
  to: string;
  depart: string;
  arrive: string;
  operator: string;
  duration: string;
  fare: string;
  status: "On time" | "Boarding" | "Delayed" | "Cancelled";
};

/** Sample board. Times are typical, not live. Confirm with the airline or port. */
export const TRANSPORT: TransportRow[] = [
  { id: "5j821", mode: "flight", from: "Manila", to: "Virac", depart: "08:00", arrive: "09:10", operator: "Cebu Pacific 5J 821", duration: "1h 10m", fare: "from ₱2,900", status: "On time" },
  { id: "5j822", mode: "flight", from: "Virac", to: "Manila", depart: "09:40", arrive: "10:50", operator: "Cebu Pacific 5J 822", duration: "1h 10m", fare: "from ₱2,900", status: "On time" },
  { id: "fc-am", mode: "fast-craft", from: "Tabaco", to: "Virac", depart: "06:30", arrive: "08:00", operator: "Fast craft", duration: "1h 30m", fare: "₱450", status: "Boarding" },
  { id: "roro-am", mode: "roro", from: "Tabaco", to: "San Andres", depart: "07:00", arrive: "09:30", operator: "RoRo ferry", duration: "2h 30m", fare: "₱280", status: "On time" },
  { id: "roro-mid", mode: "roro", from: "Tabaco", to: "Virac", depart: "09:00", arrive: "12:30", operator: "Conventional ferry", duration: "3h 30m", fare: "₱300", status: "On time" },
  { id: "fc-pm", mode: "fast-craft", from: "Virac", to: "Tabaco", depart: "13:00", arrive: "14:30", operator: "Fast craft", duration: "1h 30m", fare: "₱450", status: "On time" },
  { id: "roro-pm", mode: "roro", from: "San Andres", to: "Tabaco", depart: "13:30", arrive: "16:00", operator: "RoRo ferry", duration: "2h 30m", fare: "₱280", status: "On time" },
  { id: "van-north", mode: "van", from: "Virac terminal", to: "Pandan", depart: "Hourly 05:00 to 14:00", arrive: "~3h", operator: "UV Express vans", duration: "3h", fare: "₱200", status: "On time" },
];

export const ALERTS = [
  { id: "a1", level: "info" as const, title: "Road works, Virac to Baras", body: "One lane open near Cabugao. Add 15 minutes to east-coast drives." },
  { id: "a2", level: "warn" as const, title: "Tuwad-Tuwadan: high swell", body: "Swimming is closed until the swell drops. The viewpoint stays open." },
];

export const EMERGENCY = [
  { label: "National emergency hotline", value: "911" },
  { label: "Eastern Bicol Medical Center, Virac", value: "Provincial hospital" },
  { label: "Coast Guard Station Catanduanes", value: "Virac port" },
  { label: "Provincial disaster office (PDRRMO)", value: "Capitol, Virac" },
];
