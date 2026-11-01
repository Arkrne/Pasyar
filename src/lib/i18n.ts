import type { Lang } from "./store";

/*
  UI strings in English, Filipino and Catandunganon Bikol.
  Bikol strings are kept short and common; have a Virac native review them before launch.
*/
const DICT = {
  plan: { en: "Plan", fil: "Plano", bcl: "Plano" },
  explore: { en: "Explore", fil: "Tuklasin", bcl: "Libot" },
  community: { en: "Community", fil: "Komunidad", bcl: "Komunidad" },
  trips: { en: "Trips", fil: "Biyahe", bcl: "Biyahe" },
  profile: { en: "Profile", fil: "Profile", bcl: "Profile" },
  market: { en: "Market", fil: "Pamilihan", bcl: "Tindahan" },
  business: { en: "For operators", fil: "Para sa negosyo", bcl: "Para sa negosyo" },
  welcome: { en: "Welcome to Catanduanes", fil: "Maligayang pagdating sa Catanduanes", bcl: "Maogmang pag-abot sa Catanduanes" },
  planCta: { en: "Plan my trip", fil: "Planuhin ang biyahe ko", bcl: "Planuhon an biyahe ko" },
  thanks: { en: "Thank you", fil: "Salamat", bcl: "Dios mabalos" },
  heroSub: {
    en: "First visit or tenth, Catanduanes treats you like family. Tell us what you love and we'll shape the days around you, with the local guides, homestays and drivers who'll welcome you in.",
    fil: "Una mo man o ikasampung bisita, pamilya ang turing sa iyo ng Catanduanes. Sabihin mo ang gusto mo at bubuuin namin ang bawat araw kasama ang mga lokal na guide, homestay at driver na sasalubong sa iyo.",
    bcl: "Sabihon kun pira an aldaw mo asin ano an gusto mo. Gigibuhon kan Pasyar an plano kada aldaw kaiba an mga lokal na guide, darayuhan asin sasakyan na puwede mong i-book sa sarong beses.",
  },
} as const;

export type Key = keyof typeof DICT;
export function t(key: Key, lang: Lang) {
  void lang; // English only
  return DICT[key].en;
}
export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "fil", label: "Filipino", short: "FIL" },
  { id: "bcl", label: "Bikol", short: "BCL" },
];
