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
    en: "Tell us how long you have and what you love. Pasyar builds a day-by-day trip with real local guides, stays and rides you can book in one go.",
    fil: "Sabihin kung ilang araw ka at ano ang gusto mo. Gagawa ang Pasyar ng plano kada araw kasama ang mga lokal na guide, matutuluyan at sasakyan na puwede mong i-book nang sabay-sabay.",
    bcl: "Sabihon kun pira an aldaw mo asin ano an gusto mo. Gigibuhon kan Pasyar an plano kada aldaw kaiba an mga lokal na guide, darayuhan asin sasakyan na puwede mong i-book sa sarong beses.",
  },
} as const;

export type Key = keyof typeof DICT;
export function t(key: Key, lang: Lang) {
  return DICT[key][lang] ?? DICT[key].en;
}
export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "fil", label: "Filipino", short: "FIL" },
  { id: "bcl", label: "Bikol", short: "BCL" },
];
