export type Interest =
  | "surf"
  | "waterfalls"
  | "mountains"
  | "beaches"
  | "food"
  | "culture"
  | "relax"
  | "adventure";

export type Region = "south" | "east" | "north";

export type TownId =
  | "virac"
  | "bato"
  | "san-andres"
  | "san-miguel"
  | "baras"
  | "gigmoto"
  | "viga"
  | "panganiban"
  | "bagamanoc"
  | "pandan"
  | "caramoran";

export type PlaceKind =
  | "beach"
  | "surf"
  | "waterfall"
  | "viewpoint"
  | "heritage"
  | "cave"
  | "river"
  | "island"
  | "nature"
  | "town";

export interface Place {
  id: string;
  name: string;
  town: TownId;
  kind: PlaceKind;
  lat: number;
  lng: number;
  photo: string;
  blurb: string;
  details: string;
  interests: Interest[];
  hours: number; // typical time on site
  fee: number; // per person, PHP, 0 if free
  feeNote?: string;
  bestTime?: string;
  outdoor: boolean; // affected by weather
  seaExposed?: boolean; // closed or risky in rough seas
  effort: 1 | 2 | 3; // 1 easy, 3 strenuous
  accessibility?: string;
  safety?: string;
  rating: number;
  reviews: number;
  gem?: boolean; // hidden gem flag
}

export type ServiceKind = "stay" | "tour" | "food" | "transport";

export interface Operator {
  id: string;
  name: string;
  kind: ServiceKind;
  town: TownId;
  lat: number;
  lng: number;
  photo: string;
  owner: string;
  blurb: string;
  verified: boolean;
  featured?: boolean;
  rating: number;
  reviews: number;
  since: number;
  phone: string;
  services: Service[];
}

export interface Service {
  id: string;
  operatorId: string;
  name: string;
  unit: "night" | "person" | "group" | "day" | "trip" | "meal";
  price: number;
  capacity?: number;
  interests?: Interest[];
  placeId?: string; // tour that runs at a specific place
  tier?: "budget" | "mid" | "comfort";
}

export interface Town {
  id: TownId;
  name: string;
  region: Region;
  tagline: string;
  population?: string;
  center: [number, number];
  cover: string;
  gallery: string[];
  history: string;
  food: { name: string; note: string }[];
  festivals: { name: string; when: string; note: string }[];
  gettingThere: string;
  tips: string[];
  placeIds: string[];
}

export interface Product {
  id: string;
  name: string;
  maker: string;
  town: TownId;
  price: number;
  unit: string;
  photo: string;
  blurb: string;
  tag: "abaca" | "food" | "craft";
  stock: number;
}
