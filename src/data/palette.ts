import type { TownId } from "./types";
import type { IconName } from "@/components/icons";

/** Island palette, sampled from the Happy Island Catanduanes mosaic and the Pasyar logo. */
export const ISLAND = {
  sunset: "#EA753C",
  mango: "#F6A54F",
  sun: "#F6CB67",
  festival: "#BA091F",
  terracotta: "#B53427",
  lagoon: "#49C29F",
  deepTeal: "#0F7E6C",
  seaGreen: "#35A38B",
  sky: "#2B8FD6",
  ocean: "#0A6CBF",
  leaf: "#6DB33F",
  pink: "#E0569B",
} as const;

export const MOSAIC = [ISLAND.sunset, ISLAND.sky, ISLAND.sun, ISLAND.lagoon, ISLAND.festival, ISLAND.leaf, ISLAND.mango, ISLAND.pink, ISLAND.deepTeal];

/** Each town gets its own color and a symbol from its story. */
export const TOWN_STYLE: Record<TownId, { color: string; soft: string; icon: IconName; why: string }> = {
  virac: { color: ISLAND.sunset, soft: "#FDEBDF", icon: "flower", why: "Burak, the flower some say gave Virac its name" },
  bato: { color: ISLAND.terracotta, soft: "#F8E3DF", icon: "church", why: "The 1830s stone church" },
  "san-andres": { color: ISLAND.mango, soft: "#FEF0DC", icon: "coconut", why: "Burunyogan, the coconut thanksgiving" },
  "san-miguel": { color: ISLAND.seaGreen, soft: "#E1F3EE", icon: "river", why: "The island's biggest river" },
  baras: { color: ISLAND.sky, soft: "#E2F0FB", icon: "surf", why: "Puraran's Majestic wave" },
  gigmoto: { color: ISLAND.deepTeal, soft: "#DDF0EC", icon: "waterfall", why: "Nahulugan Falls" },
  viga: { color: ISLAND.leaf, soft: "#EAF5E1", icon: "rice", why: "The island's rice bowl" },
  panganiban: { color: ISLAND.festival, soft: "#F9E0E3", icon: "crab", why: "The crab capital" },
  bagamanoc: { color: "#D9A21B", soft: "#FCF3D9", icon: "rooster", why: "Manok, the chicken in its name" },
  pandan: { color: ISLAND.pink, soft: "#FBE5F0", icon: "heart", why: "Hiyop's heart-shaped cove" },
  caramoran: { color: ISLAND.lagoon, soft: "#E1F6EF", icon: "broom", why: "Sugbo tiger-grass brooms" },
};
