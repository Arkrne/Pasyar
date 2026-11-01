import type { TownId } from "./types";
import type { IconName } from "@/components/icons";

/*
  Festivals of Catanduanes. Sources: Wikipedia (Catanduanes, municipal articles),
  the Province of Catanduanes events listing, the Pandan LGU tourism page and
  traveler write-ups. `confirmed: false` means the date moves year to year or we
  could not confirm it; the UI says "confirm locally" for those.
*/

export interface Festival {
  id: string;
  name: string;
  town: TownId | "province";
  month: number; // 0-11, start month
  undated?: boolean; // month not confirmed; listed separately, never placed on the grid
  startDay?: number;
  endDay?: number;
  dateLabel: string;
  confirmed: boolean;
  kind: "festival" | "fiesta" | "religious";
  icon: IconName;
  short: string;
  history: string;
  highlights: string[];
}

export const FESTIVALS: Festival[] = [
  {
    id: "batalay",
    name: "Holy Cross of Batalay",
    town: "bato",
    month: 3,
    dateLabel: "Last Friday of April",
    confirmed: true,
    kind: "religious",
    icon: "cross",
    short: "Pilgrimage to the first cross planted on the island.",
    history:
      "In 1576 a galleon from Acapulco wrecked off Bato. The Augustinian friar Diego de Herrera died at Batalay, and the cross raised over his grave is believed to be the first in Catanduanes. People say a spring that appeared beside it heals the sick. The shrine is a diocesan shrine with the right to its own liturgical feast, and pilgrims walk there from across the island every year.",
    highlights: ["Dawn procession to the shrine", "Mass at the chapel by the sea", "Water from the spring taken home in bottles"],
  },
  {
    id: "dinahit",
    name: "Dinahit Festival",
    town: "pandan",
    month: 3,
    dateLabel: "April",
    confirmed: false,
    kind: "festival",
    icon: "boat",
    short: "Pandan honors the boats that brought its first settlers.",
    history:
      "A dinahit is a native sailing vessel. Austronesian seafarers crossed the open ocean in boats like it to reach Pandan, the northernmost town on the island. The festival remembers that crossing and the fishing life that grew from it.",
    highlights: ["Street dancing", "Carabao race", "Boat race off the town shore", "Trade fair and pageant"],
  },
  {
    id: "umasilhag",
    name: "Umasilhag Festival",
    town: "gigmoto",
    month: 4,
    startDay: 14,
    endDay: 15,
    dateLabel: "May 14 to 15",
    confirmed: true,
    kind: "festival",
    icon: "waterfall",
    short: "Gigmoto's two days of thanksgiving and merrymaking.",
    history:
      "Gigmoto became a separate town in 1951, carved from barrios of Baras and Viga. Its fiesta is a thanksgiving for the harvest from forest and sea in a town that still lives close to both.",
    highlights: ["Thanksgiving mass", "Street parade", "Night dances in the plaza"],
  },
  {
    id: "sugbo",
    name: "Sugbo Festival",
    town: "caramoran",
    month: 4,
    dateLabel: "May, with the Hitoma barangay fiesta",
    confirmed: false,
    kind: "festival",
    icon: "broom",
    short: "Seven barangays celebrate the tiger grass that becomes brooms.",
    history:
      "The seven barangays of Hitoma grow sugbo, or tiger grass, a tall bamboo-like grass whose flowers are bound into the soft walis tambo sold across Bicol. The provincial government and the Caramoran LGU back the festival to grow the tiger-grass industry and create signature products from it.",
    highlights: ["Broom-making demonstrations", "Tiger-grass craft fair", "Street dancing with sugbo props"],
  },
  {
    id: "abaca",
    name: "Abaca Festival",
    town: "province",
    month: 4,
    dateLabel: "4th week of May",
    confirmed: true,
    kind: "festival",
    icon: "abaca",
    short: "The province celebrates the fiber that made it famous.",
    history:
      "Catanduanes grows more abacá than any other province. In 2015 its 12,789 farmers produced about 40 percent of the country's fiber, more than Ecuador, the world's second-largest producer. In 2022 a national law declared it the Abacá Capital of the Philippines. The festival shows how many lives depend on the plant, from farmers to the pinukpok weavers of Baras.",
    highlights: ["Padadyaw kan Abaka street parade", "Pinukpok fashion show", "Kantang Catandungan music contest", "Jobs fair"],
  },
  {
    id: "manok-manok",
    name: "Manok-Manok Festival",
    town: "bagamanoc",
    month: 5,
    startDay: 12,
    endDay: 13,
    dateLabel: "June 12 to 13 (fiesta of St. Anthony of Padua)",
    confirmed: true,
    kind: "festival",
    icon: "rooster",
    short: "Street dances that copy the moves of the rooster.",
    history:
      "Bagamanoc takes its name from manok, chicken, after an early settlement that raised fowl on a swampy plateau hemmed in by sea, hills and a crocodile-filled river mouth. The festival celebrates the town's character and way of life through the chicken it was named for, and falls on the feast of its patron, St. Anthony of Padua.",
    highlights: ["Dancers in rooster and hen costumes", "Town fiesta mass", "Food stalls with native chicken tinola"],
  },
  {
    id: "abacaco",
    name: "Abacaco Festival",
    town: "province",
    month: 5,
    startDay: 10,
    dateLabel: "June 10",
    confirmed: false,
    kind: "festival",
    icon: "palm",
    short: "Abacá, cacao and coconut, the three crops that feed families.",
    history:
      "The name joins abacá, cacao and coconut. Abacá became the main industry, cacao sweetened the family table, and coconut, the tree of life, kept the copra trade going. The festival thanks the land for all three.",
    highlights: ["Farm produce fair", "Cooking with cacao and coconut", "Parade of floats"],
  },
  {
    id: "bato-fiesta",
    name: "Bato Town Fiesta",
    town: "bato",
    month: 5,
    startDay: 24,
    dateLabel: "June 24 (St. John the Baptist)",
    confirmed: true,
    kind: "fiesta",
    icon: "church",
    short: "Feast of the patron of the old stone church.",
    history:
      "Bato's parish of St. John the Baptist dates to 1830. Its stone church took 53 years and six parish priests to finish, built under forced labor, and has outlasted wars and typhoons. The fiesta fills the churchyard beside the Bato River.",
    highlights: ["Procession around the poblacion", "Mass in the 1830s church", "Open houses with family feasts"],
  },
  {
    id: "caramoran-fiesta",
    name: "Caramoran Town Fiesta",
    town: "caramoran",
    month: 5,
    startDay: 24,
    dateLabel: "June 24 (St. John the Baptist)",
    confirmed: true,
    kind: "fiesta",
    icon: "church",
    short: "The feast of the island's oldest parish.",
    history:
      "Missionaries first landed at Napacahan in Tubli and founded the parish in 1601, the first in Catanduanes. Pirate raids forced the town to move to its present site behind barrier reefs that kept ships from anchoring close. St. John the Baptist has been its patron ever since.",
    highlights: ["Fluvial and street procession", "Mass at the parish church", "Visits to Tubli where it all began"],
  },
  {
    id: "kinis",
    name: "Kinis Festival",
    town: "panganiban",
    month: 6,
    startDay: 25,
    dateLabel: "July 25 (fiesta of St. James the Greater)",
    confirmed: true,
    kind: "festival",
    icon: "crab",
    short: "The crab capital throws a crab party.",
    history:
      "Panganiban has 218 hectares of fishponds and wide mangroves, and its mud crabs are said to be the tastiest in Bicol. The town calls itself the Crab Capital of Catanduanes, and the festival on its patron's feast day puts the crab front and center.",
    highlights: ["Float parade with the Crab Princess", "Street dancers in crab costumes", "Eat-all-you-can crab"],
  },
  {
    id: "pandan-fiesta",
    name: "Pandan Town Fiesta",
    town: "pandan",
    month: 6,
    startDay: 30,
    endDay: 31,
    dateLabel: "July 30 to 31 (St. Ignatius of Loyola)",
    confirmed: true,
    kind: "fiesta",
    icon: "heart",
    short: "The northern town opens its doors to everyone.",
    history:
      "Pandan's parish dates to 1650. Its people once planted pandan shrubs in tight rows to slow down Moro raiders, which is how the town got its name. Pandan families are known for treating guests as kin, and fiesta week is when that shows most: whole neighborhoods are invited in to eat.",
    highlights: ["Mass for St. Ignatius", "Open houses across the poblacion", "Sports fest and evening programs"],
  },
  {
    id: "badas",
    name: "Badas Festival",
    town: "baras",
    month: 7,
    startDay: 10,
    dateLabel: "August 10 (fiesta of St. Lawrence)",
    confirmed: true,
    kind: "festival",
    icon: "surf",
    short: "Baras celebrates the rattan spears that defended it.",
    history:
      "Badas is the old word for a wild rattan that grew in the hills. Villagers sharpened it into spears to fight off Moro raiders, and the town's name grew out of it. In the Second World War the people of Baras were the first on the island to resist the Japanese. The festival is about that stubbornness.",
    highlights: ["Street dancing with rattan props", "Reenactments of the raids", "Fiesta mass for St. Lawrence"],
  },
  {
    id: "san-miguel-fiesta",
    name: "San Miguel Town Fiesta",
    town: "san-miguel",
    month: 8,
    startDay: 29,
    dateLabel: "Around September 29 (St. Michael the Archangel)",
    confirmed: false,
    kind: "fiesta",
    icon: "river",
    short: "The inland town's feast, named for its patron.",
    history:
      "San Miguel was part of Bato until President Elpidio Quirino made it a town in 1952. It is the only town on the island without a coast, sitting in the hills below Mount Boctot, the highest peak at 803 meters. Its fiesta follows the feast of the archangel it is named for.",
    highlights: ["Mass and procession", "River picnics at the Kilikilihan park"],
  },
  {
    id: "catandungan",
    name: "Catandungan Festival",
    town: "province",
    month: 9,
    startDay: 24,
    endDay: 26,
    dateLabel: "October 24 to 26",
    confirmed: true,
    kind: "festival",
    icon: "sun",
    short: "The whole island's birthday.",
    history:
      "Catanduanes was a sub-province of Albay until Congressman Francisco Perfecto's bill made it a province of its own. President Sergio Osmeña signed it on October 24, 1945. Every year the island marks the date with three days of dancing, sport and its founding anniversary rites.",
    highlights: ["Padadyao sa Tinampo street dancing (Oct 24)", "Pantomina dance", "Catanduanes Surfing Cup at Puraran", "Agro-trade fair and photo exhibits"],
  },
  {
    id: "san-andres-fiesta",
    name: "Burunyogan Festival",
    town: "san-andres",
    month: 10,
    startDay: 30,
    dateLabel: "Around November 30 (St. Andrew)",
    confirmed: false,
    kind: "festival",
    icon: "coconut",
    short: "Being united, and the coconut that unites them.",
    history:
      "Burunyog is an old Bikol word for being united. Joined with niyog, coconut, it names a celebration of the tree that feeds San Andres. The town was long called Calolbon, became a parish in 1853, and is where most visitors arriving by RoRo ferry first set foot.",
    highlights: ["Coconut cooking contests", "Street dancing", "Fiesta mass"],
  },
  {
    id: "burak",
    name: "Burak Festival",
    town: "virac",
    month: 11,
    startDay: 7,
    endDay: 8,
    dateLabel: "December 7 to 8 (Immaculate Conception)",
    confirmed: true,
    kind: "festival",
    icon: "flower",
    short: "The capital's fiesta, named for a flower.",
    history:
      "Many in Virac believe the town's name comes from burak, the local word for flower. The festival honors the town's patroness, Nuestra Señora de la Inmaculada Concepción, whose cathedral faces the plaza. It ends the year's fiesta season before Christmas.",
    highlights: ["Flower-themed street parade", "Novena and procession", "Night market in the plaza"],
  },
  {
    id: "kagharong",
    name: "Kagharong",
    town: "province",
    month: 11,
    dateLabel: "Christmas season",
    confirmed: true,
    kind: "religious",
    icon: "shell",
    short: "Native nativity scenes across the island.",
    history:
      "Kagharong is the local tradition of building nativity scenes from native materials. Families and barangays compete to make the most beautiful one, often from abacá, bamboo, shells and palm fronds.",
    highlights: ["Barangay nativity contests", "Simbang Gabi dawn masses"],
  },
  {
    id: "kalbaryo",
    name: "Kalbaryo",
    town: "san-andres",
    month: 2,
    dateLabel: "Holy Week (March or April)",
    confirmed: false,
    kind: "religious",
    icon: "cross",
    short: "A reenactment of the Way of the Cross.",
    history:
      "During Holy Week, San Andres stages the Passion of Christ on Holy Wednesday and Good Friday. Pilgrims also walk from Virac to Batalay and to the Our Lady of Sorrows shrine in Batong Paloway, where a river stone is said to bear the Virgin's face.",
    highlights: ["Passion play", "Penitential walk from Virac", "Visita Iglesia across the south"],
  },
  {
    id: "himuluan",
    name: "Himuluan Festival",
    town: "viga",
    month: 9,
    undated: true,
    dateLabel: "Viga town fiesta (date to confirm)",
    confirmed: false,
    kind: "festival",
    icon: "rice",
    short: "The rice farmer's year, danced in the streets.",
    history:
      "Viga sits on the island's largest plain, and much of the province's rice grows there. Himuluan shows the hard work of planting, harvesting, threshing, drying and airing rice, and how Viganons keep going through floods and the northeast monsoon.",
    highlights: ["Dances that act out the rice cycle", "Harvest displays", "Fiesta mass"],
  },
];

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type Season = "best" | "good" | "surf" | "wet" | "typhoon";

/** What each month is like. Based on PAGASA climate notes and the provincial tourism guidance. */
export const MONTHS: { season: Season; label: string; tip: string; rain: number; surf: boolean }[] = [
  { season: "wet", label: "Cool and rainy", tip: "Northeast monsoon (amihan). Heritage and food trips work; seas on the east coast are rough.", rain: 4, surf: false },
  { season: "good", label: "Drying out", tip: "Showers ease late in the month. Good for Virac, Bato and the waterfalls.", rain: 3, surf: false },
  { season: "best", label: "Dry season starts", tip: "Calm seas return. Island hopping to the Palumbanes opens up.", rain: 2, surf: false },
  { season: "best", label: "Hot and clear", tip: "Holy Week crowds. Book stays early, especially around Batalay.", rain: 1, surf: false },
  { season: "best", label: "Peak summer", tip: "Hottest month. The Abaca Festival fills Virac in the last week.", rain: 1, surf: false },
  { season: "best", label: "Fiestas and sun", tip: "Bato, Caramoran and Bagamanoc fiestas. Still mostly dry.", rain: 2, surf: false },
  { season: "best", label: "Breezy", tip: "Southwest winds pick up. Kinis crab festival in Panganiban.", rain: 2, surf: false },
  { season: "surf", label: "Surf season begins", tip: "Pacific swells reach Puraran. Watch for early typhoons.", rain: 2, surf: true },
  { season: "surf", label: "Big waves", tip: "Best surf of the year at the Majestic. Pack a rain jacket.", rain: 3, surf: true },
  { season: "typhoon", label: "Typhoon season", tip: "Catandungan Festival and the surf cup. Keep a buffer day before flights.", rain: 4, surf: true },
  { season: "typhoon", label: "Wettest month", tip: "Strongest storms often hit now. Plan indoor backups.", rain: 5, surf: false },
  { season: "wet", label: "Cool, festive", tip: "Burak Festival and Christmas. Rain on and off.", rain: 4, surf: false },
];

export const SEASON_STYLE: Record<Season, { label: string; color: string; soft: string }> = {
  best: { label: "Best time", color: "#E9A21B", soft: "#FEF3D6" },
  good: { label: "Good", color: "#6DB33F", soft: "#EAF5E1" },
  surf: { label: "Surf season", color: "#2B8FD6", soft: "#E2F0FB" },
  wet: { label: "Rainy", color: "#49A3A0", soft: "#E1F3F2" },
  typhoon: { label: "Typhoon risk", color: "#B53427", soft: "#F8E3DF" },
};

/** Fiestas that overlap a trip window (inclusive). Year-agnostic. */
export function festivalsBetween(startIso: string, days: number) {
  const start = new Date(startIso + "T00:00:00");
  const hits = new Set<Festival>();
  for (let d = 0; d < days; d++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + d);
    const m = cur.getMonth();
    const day = cur.getDate();
    for (const f of FESTIVALS) {
      if (f.undated || f.month !== m) continue;
      if (f.startDay == null) {
        hits.add(f);
        continue;
      }
      const end = f.endDay ?? f.startDay;
      if (day >= f.startDay - 1 && day <= end + 1) hits.add(f);
    }
  }
  return [...hits];
}

/** Build an .ics file for a festival in the given (or next upcoming) year. */
export function icsFor(f: Festival, year?: number) {
  const now = new Date();
  let y = year ?? now.getFullYear();
  const sd = f.startDay ?? 1;
  if (!year && new Date(y, f.month, f.endDay ?? sd) < now) y += 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${y}${pad(f.month + 1)}${pad(sd)}`;
  const endDate = new Date(y, f.month, (f.endDay ?? (f.startDay ? sd : 28)) + 1);
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}`;
  const town = f.town === "province" ? "Catanduanes" : f.town;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pasyar//Catanduanes//EN",
    "BEGIN:VEVENT",
    `UID:${f.id}-${y}@pasyar`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${f.name} (${town})`,
    `DESCRIPTION:${f.short}${f.confirmed ? "" : " Date varies, confirm locally."}`,
    `LOCATION:${town}, Catanduanes, Philippines`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
