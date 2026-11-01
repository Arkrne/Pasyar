import type { Town, TownId } from "./types";

const p = (slug: string) => `/photos/${slug}.webp`;

export const TOWNS: Town[] = [
  {
    id: "virac",
    name: "Virac",
    region: "south",
    tagline: "The capital, the airport and the easy beaches",
    population: "75,135 (2024 census)",
    center: [13.5818, 124.2336],
    cover: p("virac-islets-hut"),
    gallery: [p("twin-rock-white"), p("virac-low-tide"), p("virac-port"), p("talisoy-beach")],
    history:
      "Virac became a parish in 1775 and has been the provincial capital since Catanduanes split from Albay in 1945. Many people believe the name comes from burak, the local word for flower. It is the island's school, trade and transport hub, with the airport, the main seaport and Catanduanes State University.",
    food: [
      { name: "Latik", note: "Sweet sticky-rice snack made by heirloom cooks in Virac." },
      { name: "Tilmok", note: "Shrimp or shellfish steamed with grated coconut. Recipes vary by family." },
      { name: "Kinunot", note: "Flaked fish or shark cooked in coconut milk with malunggay." },
      { name: "Grilled seafood", note: "The bayside grills near the port cook the morning's catch." },
    ],
    festivals: [
      { name: "Catandungan Festival", when: "October 24 to 26", note: "Founding anniversary: street dancing, a surf cup and trade fairs." },
      { name: "Burak Festival", when: "December", note: "Town fiesta for the Immaculate Conception." },
      { name: "Abaca Festival", when: "4th week of May", note: "Pinukpok fashion show and a celebration of the province's fiber." },
    ],
    gettingThere:
      "Cebu Pacific flies Manila to Virac in about 1 hour 10 minutes. Ferries from Tabaco, Albay dock at Virac port in 1.5 hours (fast craft) or about 3.5 hours (regular).",
    tips: [
      "Base yourself here if you only have two or three days.",
      "Withdraw cash in Virac. ATMs are scarce in the north.",
      "Tricycles inside town cost ₱15 to ₱30 a ride.",
    ],
    placeIds: ["twin-rock", "talisoy-beach", "amenia-beach", "virac-cathedral", "museo-catanduanes"],
  },
  {
    id: "bato",
    name: "Bato",
    region: "south",
    tagline: "Stone church, healing spring and the easiest waterfall",
    population: "21,325",
    center: [13.6064, 124.2983],
    cover: p("bato-church"),
    gallery: [p("bato-church-altar"), p("bato-church-road"), p("bato-hills")],
    history:
      "In 1576 a galleon from Acapulco wrecked near Bato. The Augustinian friar Diego de Herrera died at Batalay, and the cross planted over his grave is said to be the first on the island. Bato's stone church took 53 years to build, from 1830 to 1883, and still stands beside the Bato River.",
    food: [
      { name: "River shrimp", note: "Caught in the Bato River and cooked in coconut milk." },
      { name: "Suman", note: "Rice cakes wrapped in leaves, sold near the church on Sundays." },
    ],
    festivals: [
      { name: "Holy Cross of Batalay", when: "Last Friday of April", note: "Pilgrimage and liturgical feast at the shrine." },
      { name: "Town fiesta", when: "June 24", note: "Feast of Saint John the Baptist." },
    ],
    gettingThere: "15 minutes east of Virac by van or tricycle along the coastal road.",
    tips: ["Visit the church before 10 AM for cool, quiet light.", "Maribina is a good stop on the way back from Baras."],
    placeIds: ["bato-church", "batalay-shrine", "maribina-falls", "bote-lighthouse"],
  },
  {
    id: "san-andres",
    name: "San Andres",
    region: "south",
    tagline: "The ferry gateway on the west coast",
    center: [13.5961, 124.0992],
    cover: p("virac-pajo-river"),
    gallery: [p("luyang-cave"), p("luyang-stalactites")],
    history:
      "San Andres became a parish in 1853 and was long called Calolbon. Its port links the island to Tabaco, Albay, and most people who come by bus or car arrive here on the roll-on, roll-off ferry. Luyang Cave in Lictin is remembered as the place where villagers hiding from Moro raiders died.",
    food: [
      { name: "Coconut dishes", note: "The Burunyogan festival is a thank-you to the coconut. Expect a lot of gata." },
      { name: "Pili tarts", note: "Sold at stalls near the port for the trip home." },
    ],
    festivals: [
      { name: "Burunyogan Festival", when: "Town fiesta", note: "Named from burunyog (united) and niyog (coconut)." },
      { name: "Kalbaryo", when: "Holy Wednesday and Good Friday", note: "Reenactment of the Way of the Cross." },
    ],
    gettingThere: "RoRo ferries from Tabaco take about 2.5 hours. Virac is 30 minutes away by van.",
    tips: ["Book the first ferry out of Tabaco to arrive by mid-morning.", "Luyang Cave is on the road to Virac; stop on arrival day."],
    placeIds: ["luyang-cave", "sorrows-shrine"],
  },
  {
    id: "san-miguel",
    name: "San Miguel",
    region: "south",
    tagline: "The only town with no coastline",
    center: [13.6411, 124.3008],
    cover: p("kilikilihan-road"),
    gallery: [p("bato-hills")],
    history:
      "San Miguel split from Bato in 1952 by order of President Elpidio Quirino. It is the island's one landlocked town, set in the hills below Mount Boctot, which at 803 meters is the highest point in the province.",
    food: [
      { name: "Upland vegetables", note: "Fern shoots (pako) and gabi leaves cooked as laing." },
      { name: "Fresh tilapia", note: "Farmed in ponds along the river." },
    ],
    festivals: [{ name: "Town fiesta", when: "September 29", note: "Feast of Saint Michael the Archangel." }],
    gettingThere: "25 minutes north of Virac by van.",
    tips: ["River tubing is the best rainy-season plan B, as long as the water is clear."],
    placeIds: ["san-miguel-river", "solong-falls", "mt-boctot"],
  },
  {
    id: "baras",
    name: "Baras",
    region: "east",
    tagline: "Surf, cliffs and hand-beaten abaca",
    population: "12,992",
    center: [13.6646, 124.3672],
    cover: p("puraran-palms"),
    gallery: [p("binurong-aerial"), p("binurong-crater"), p("binurong-cliff"), p("puraran-beach")],
    history:
      "The name comes from badas, a wild rattan the old villagers turned into spears against raiders. People here are proud of being the first in Catanduanes to resist the Japanese in the Second World War. Baras weavers also make pinukpok, abaca fiber beaten by hand until it is soft enough for fashion.",
    food: [
      { name: "Surf camp breakfasts", note: "Fried fish, garlic rice and eggs at the Puraran cottages." },
      { name: "Fresh lobster and octopus", note: "Bought straight off the boats when the sea allows." },
    ],
    festivals: [
      { name: "Badas Festival", when: "August 10", note: "Celebrates the town's history of standing up to raiders." },
      { name: "Catanduanes Surfing Cup", when: "During Catandungan, October", note: "Held at Puraran when swell allows." },
    ],
    gettingThere: "About 1 hour from Virac by van. The road to Puraran is paved but winding.",
    tips: ["Binurong at sunrise, Puraran in the afternoon.", "Hire the guide at the Guinsaanan registration hut."],
    placeIds: ["binurong-point", "puraran-beach", "baras-church"],
  },
  {
    id: "gigmoto",
    name: "Gigmoto",
    region: "east",
    tagline: "Waterfalls and forest on the quiet side",
    population: "8,348",
    center: [13.7792, 124.3878],
    cover: p("gigmoto-bay"),
    gallery: [p("nahulugan-falls"), p("gigmoto-beach"), p("gigmoto-pier")],
    history:
      "Gigmoto became its own town in 1951, made from barrios of Baras and Viga. Its name comes from himbot, just in time, after a Baras suitor who stopped here overnight on his way to court a woman in Viga. The forest reserve is a known birding area, and researchers have recorded rare frogs and skinks here.",
    food: [{ name: "Ginataang gulay", note: "Vegetables stewed in coconut milk, served at every carinderia." }],
    festivals: [{ name: "Umasilhag Festival", when: "May 14 to 15", note: "Thanksgiving and merrymaking." }],
    gettingThere: "About 1 hour 30 minutes from Virac through Baras.",
    tips: ["Bring snacks and water. Stores are small.", "Signal is weak; download your trip for offline use."],
    placeIds: ["nahulugan-falls", "gigmoto-bay"],
  },
  {
    id: "viga",
    name: "Viga",
    region: "north",
    tagline: "Rice country and the east-coast sunrise",
    population: "21,364",
    center: [13.8698, 124.3075],
    cover: p("viga-oco-aerial"),
    gallery: [p("viga-sunrise"), p("viga-beach"), p("viga-church"), p("viga-oco-chapel")],
    history:
      "The first settlers lived at Caviga-e, then moved inland to Oco to escape the Moro raids. When the raids eased they came back down to fertile land where giant gabi-like plants called marviga grew. Viga sits on the island's largest plain, which is why it grows so much of the province's rice.",
    food: [{ name: "New-harvest rice", note: "Ask for the local variety after the harvest months." }],
    festivals: [{ name: "Himuluan Festival", when: "Town fiesta", note: "Dance that acts out planting, threshing and drying rice." }],
    gettingThere: "About 1 hour 45 minutes from Virac by van via the cross-island road.",
    tips: ["Stay overnight in the north to catch the sunrise without a 4 AM drive."],
    placeIds: ["viga-coast", "oco-chapel"],
  },
  {
    id: "panganiban",
    name: "Panganiban",
    region: "north",
    tagline: "The crab capital",
    population: "8,947",
    center: [13.9046, 124.2961],
    cover: p("panganiban-church"),
    gallery: [p("tubli-heron")],
    history:
      "The town was called Payo, possibly after a tribal headman, and has switched between Payo and Panganiban more than once. It was named after José María Panganiban in 1921. With 218 hectares of fishponds, it supplies mud crabs that locals call the tastiest in Bicol.",
    food: [
      { name: "Mud crab", note: "Steamed, or in coconut milk with chili. Female crabs with roe cost more." },
      { name: "Crab omelet", note: "A carinderia staple when the ponds are harvested." },
    ],
    festivals: [{ name: "Kinis Festival", when: "July 25", note: "Crab costumes, a float parade and eat-all-you-can crab." }],
    gettingThere: "About 2 hours from Virac by van.",
    tips: ["Call ahead for crab; the best ones go to buyers in the morning."],
    placeIds: ["panganiban-mangroves"],
  },
  {
    id: "bagamanoc",
    name: "Bagamanoc",
    region: "north",
    tagline: "Coves, lagoons and an island outpost",
    center: [13.9408, 124.2888],
    cover: p("bagamanoc-church"),
    gallery: [p("gigmoto-pier")],
    history:
      "The town name comes from manok, chicken, after an early settlement that raised fowl on a swampy plateau. Bagamanoc was a thriving town under Spain, was reduced to a barrio under the Americans, and became a municipality again in 1950. On Panay Island offshore stand the buildings of a former US Coast Guard LORAN navigation station.",
    food: [{ name: "Native chicken", note: "Tinola with papaya and chili leaves, fitting for the town of manok." }],
    festivals: [{ name: "Manok-Manok Festival", when: "June 12 to 13", note: "Street dances copying the moves of a rooster courting a hen." }],
    gettingThere: "About 2 hours 15 minutes from Virac. Boats to Panay Island leave from the town pier.",
    tips: ["Arrange the boat a day ahead through the municipal tourism desk."],
    placeIds: ["panay-island", "bagamanoc-church"],
  },
  {
    id: "pandan",
    name: "Pandan",
    region: "north",
    tagline: "Hills, a heart-shaped cove and the warmest welcome",
    population: "20,796",
    center: [14.0468, 124.1686],
    cover: p("hiyop-heart-cove"),
    gallery: [p("cagnipa-cove"), p("tuwad-tuwadan-pool"), p("hiyop-cow"), p("tuwad-tuwadan-view")],
    history:
      "The northernmost town became a parish in 1650. To slow Moro raiders, residents planted pandan shrubs close together around the settlement, and the name stuck. Pandan families are known for giving guests the best bed in the house and sending them home with produce, sometimes a live chicken.",
    food: [
      { name: "Fresh catch", note: "Reef fish grilled over coconut husk." },
      { name: "Kakanin", note: "Rice cakes shared at every fiesta." },
    ],
    festivals: [{ name: "Dinahit Festival", when: "April", note: "Named after the sailing boats of the first settlers. Carabao and boat races." }],
    gettingThere: "About 3 hours from Virac by van. Habal-habal from town to Hiyop and Tuwad-Tuwadan.",
    tips: ["Plan at least one night here. The drive is long.", "Tuwad-Tuwadan only at low tide in calm seas."],
    placeIds: ["hiyop-point", "tuwad-tuwadan", "parway-falls", "pandan-church"],
  },
  {
    id: "caramoran",
    name: "Caramoran",
    region: "north",
    tagline: "The oldest parish and the Palumbanes",
    population: "30,124",
    center: [13.9851, 124.1335],
    cover: p("caramoran-church"),
    gallery: [p("tubli-stilt"), p("tubli-heron")],
    history:
      "Caramoran's parish dates to 1601, the first on the island. Missionaries landed at Napacahan in Tubli, but pirate raids forced the town to its present site behind barrier reefs. Seven barangays in Hitoma grow sugbo, the tiger grass used for brooms sold across Bicol.",
    food: [{ name: "Seaweed salad", note: "Lato and guso dressed with vinegar and tomato." }],
    festivals: [{ name: "Sugbo Festival", when: "May", note: "Celebrates tiger grass and the broom makers of Hitoma." }],
    gettingThere: "About 2 hours 30 minutes from Virac along the west coast.",
    tips: ["Leave for the Palumbanes before 7 AM when the channel is calm."],
    placeIds: ["palumbanes", "caramoran-church", "tubli-bay"],
  },
];

export const TOWN_BY_ID = Object.fromEntries(TOWNS.map((t) => [t.id, t])) as Record<TownId, Town>;

/** Map GeoJSON municipality names onto our ids. */
export const TOWN_ID_BY_NAME: Record<string, TownId> = Object.fromEntries(
  TOWNS.map((t) => [t.name, t.id]),
) as Record<string, TownId>;
