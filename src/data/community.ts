import type { Interest } from "./types";

const p = (slug: string) => `/photos/${slug}.webp`;

export interface Post {
  id: string;
  author: { name: string; handle: string; from: string; avatar: string };
  photo: string;
  caption: string;
  placeId?: string;
  operatorId?: string;
  createdAt: string; // ISO
  likes: number;
  comments: { author: string; text: string }[];
  trip?: { days: number; interests: Interest[]; stops: string[][]; title: string };
  verified?: boolean;
}

export interface Review {
  id: string;
  targetId: string; // place or operator id
  author: string;
  stars: number;
  aspects: { value: number; safety: number; friendliness: number; cleanliness: number };
  text: string;
  date: string;
  verified: boolean;
  reply?: string;
}

const av = (seed: string) => seed; // initials avatar, rendered locally

export const POSTS: Post[] = [
  {
    id: "post-1",
    author: { name: "Bea Santos", handle: "beasurfs", from: "Quezon City", avatar: av("Bea") },
    photo: p("binurong-sunset"),
    caption:
      "Left Puraran at 4:40 AM to beat the sun up to Binurong. Our guide Kuya Jun knew the exact rock to sit on. Three days was too short.",
    placeId: "binurong-point",
    operatorId: "guinsaanan-guides",
    createdAt: "2026-10-28T06:12:00+08:00",
    likes: 1284,
    comments: [
      { author: "migs.travels", text: "Saving this. Did you need a 4x4 to get there?" },
      { author: "beasurfs", text: "No, a regular van is fine. The last part is a walk." },
    ],
    trip: {
      title: "3 days: surf and cliffs",
      days: 3,
      interests: ["surf", "mountains", "beaches"],
      stops: [["twin-rock", "bato-church", "maribina-falls"], ["binurong-point", "puraran-beach"], ["luyang-cave"]],
    },
    verified: true,
  },
  {
    id: "post-2",
    author: { name: "Paolo Reyes", handle: "paoloeats", from: "Naga City", avatar: av("Paolo") },
    photo: p("tubli-heron"),
    caption:
      "Panganiban crab, eaten 20 meters from the pond it came from. Leah walked us through how they raise the crablets first. Worth the long drive north.",
    placeId: "panganiban-mangroves",
    operatorId: "crab-farm-tour",
    createdAt: "2026-10-26T13:40:00+08:00",
    likes: 642,
    comments: [{ author: "kat.bicol", text: "Kinis Festival in July is crab heaven too." }],
    trip: {
      title: "4 days: food trip around the island",
      days: 4,
      interests: ["food", "culture", "relax"],
      stops: [["virac-cathedral", "museo-catanduanes"], ["bato-church", "baras-church"], ["viga-coast", "panganiban-mangroves"], ["twin-rock"]],
    },
    verified: true,
  },
  {
    id: "post-3",
    author: { name: "Hannah Lim", handle: "hannahgoes", from: "Singapore", avatar: av("Hannah") },
    photo: p("hiyop-heart-cove"),
    caption:
      "Hiyop Point in Pandan. We were the only people up there except for six cows. Lola Ising sent us home with a bag of fish and a kilo of rice.",
    placeId: "hiyop-point",
    operatorId: "lola-ising",
    createdAt: "2026-10-22T16:05:00+08:00",
    likes: 2031,
    comments: [
      { author: "pandan.lgu", text: "Salamat for visiting Pandan!" },
      { author: "jessa_r", text: "How rough is the road?" },
    ],
    trip: {
      title: "5 days: the far north",
      days: 5,
      interests: ["mountains", "beaches", "adventure"],
      stops: [["twin-rock", "bato-church"], ["binurong-point", "puraran-beach"], ["viga-coast", "panay-island"], ["hiyop-point", "tuwad-tuwadan"], ["palumbanes"]],
    },
    verified: true,
  },
  {
    id: "post-4",
    author: { name: "Carlo Mendoza", handle: "carlotubes", from: "Legazpi", avatar: av("Carlo") },
    photo: p("nahulugan-falls"),
    caption: "Nahulugan after two dry days. Cold, clear, and empty on a Tuesday.",
    placeId: "nahulugan-falls",
    createdAt: "2026-10-19T11:22:00+08:00",
    likes: 488,
    comments: [],
    verified: false,
  },
  {
    id: "post-5",
    author: { name: "Ate Joy Tabuzo", handle: "alonsurfcamp", from: "Baras", avatar: av("Joy") },
    photo: p("puraran-palms"),
    caption:
      "Swell forecast looks good for the Catandungan surf cup this week. Cottages are full Friday and Saturday, a few left for Sunday.",
    placeId: "puraran-beach",
    operatorId: "alon-surf-camp",
    createdAt: "2026-10-18T08:00:00+08:00",
    likes: 911,
    comments: [{ author: "beasurfs", text: "See you on the reef!" }],
    verified: true,
  },
  {
    id: "post-6",
    author: { name: "Lia Fernandez", handle: "liawanders", from: "Cebu", avatar: av("Lia") },
    photo: p("twin-rock-white"),
    caption: "Low tide at Twin Rock. You can walk almost to the rocks. Easy half day from Virac.",
    placeId: "twin-rock",
    createdAt: "2026-10-12T09:30:00+08:00",
    likes: 377,
    comments: [],
    trip: {
      title: "2 days: easy south loop",
      days: 2,
      interests: ["beaches", "relax", "culture"],
      stops: [["twin-rock", "talisoy-beach", "virac-cathedral"], ["bato-church", "maribina-falls"]],
    },
    verified: true,
  },
];

export const REVIEWS: Review[] = [
  {
    id: "r1",
    targetId: "binurong-point",
    author: "Bea S.",
    stars: 5,
    aspects: { value: 5, safety: 4, friendliness: 5, cleanliness: 5 },
    text: "Guide was patient with our slow group and showed us where the cliff edge is undercut. Go at sunrise.",
    date: "2026-10-28",
    verified: true,
  },
  {
    id: "r2",
    targetId: "binurong-point",
    author: "Miguel A.",
    stars: 5,
    aspects: { value: 5, safety: 4, friendliness: 5, cleanliness: 4 },
    text: "Short walk, huge payoff. Bring water; there's nothing to buy at the top.",
    date: "2026-10-15",
    verified: true,
  },
  {
    id: "r3",
    targetId: "alon-surf-camp",
    author: "Hannah L.",
    stars: 5,
    aspects: { value: 5, safety: 5, friendliness: 5, cleanliness: 4 },
    text: "Cottage is basic but spotless. Ate Joy fixed our boards and told us when the tide was right.",
    date: "2026-10-20",
    verified: true,
    reply: "Salamat Hannah! Come back for the next swell season.",
  },
  {
    id: "r4",
    targetId: "alon-surf-camp",
    author: "Ken T.",
    stars: 4,
    aspects: { value: 4, safety: 5, friendliness: 5, cleanliness: 4 },
    text: "Fan room gets warm at noon. Lessons were excellent for beginners.",
    date: "2026-09-30",
    verified: true,
  },
  {
    id: "r5",
    targetId: "twin-rock",
    author: "Lia F.",
    stars: 4,
    aspects: { value: 4, safety: 4, friendliness: 5, cleanliness: 4 },
    text: "Crowded on Sundays. Weekday mornings are calm.",
    date: "2026-10-12",
    verified: false,
  },
  {
    id: "r6",
    targetId: "puraran-beach",
    author: "Paolo R.",
    stars: 5,
    aspects: { value: 5, safety: 4, friendliness: 5, cleanliness: 5 },
    text: "Even without surf it's the most peaceful beach I've been to in Bicol.",
    date: "2026-10-01",
    verified: true,
  },
];
