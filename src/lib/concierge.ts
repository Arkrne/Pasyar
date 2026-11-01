import { PLACES } from "@/data/places";
import { TOWNS } from "@/data/towns";
import { TRANSPORT, EMERGENCY } from "@/data/content";

/** Compact island facts for grounding the model. Keeps it from inventing places or prices. */
export function islandContext() {
  const towns = TOWNS.map(
    (t) =>
      `${t.name} (${t.region}): ${t.tagline}. Food: ${t.food.map((f) => f.name).join(", ")}. Festivals: ${t.festivals
        .map((f) => `${f.name} (${f.when})`)
        .join(", ")}. Getting there: ${t.gettingThere}`,
  ).join("\n");
  const places = PLACES.map(
    (p) =>
      `${p.name} [${p.town}] fee ₱${p.fee}${p.feeNote ? ` (${p.feeNote})` : ""}, ${p.hours}h, ${p.blurb}${p.safety ? ` Safety: ${p.safety}` : ""}${
        p.bestTime ? ` Best: ${p.bestTime}` : ""
      }`,
  ).join("\n");
  const transport = TRANSPORT.map((r) => `${r.operator}: ${r.from} ${r.depart} → ${r.to} ${r.arrive}, ${r.fare}`).join("\n");
  const emergency = EMERGENCY.map((e) => `${e.label}: ${e.value}`).join("; ");
  return `TOWNS\n${towns}\n\nPLACES\n${places}\n\nTRANSPORT (sample schedule, confirm locally)\n${transport}\n\nEMERGENCY\n${emergency}`;
}

/** Offline answers when no API key is configured or there's no signal. */
export function fallbackAnswer(q: string): string {
  const s = q.toLowerCase();
  const hit = PLACES.find((p) => s.includes(p.name.toLowerCase().split(" ")[0].toLowerCase()) && p.name.length > 4);
  if (/typhoon|storm|rain|signal|bagyo/.test(s))
    return "If PAGASA raises a signal, boats and reef swims stop first. Turn on storm mode in your trip and Pasyar moves you to churches, Luyang Cave, the museum and river towns. Ferries from Tabaco are usually suspended at Signal No. 1 or higher, so keep a buffer day before your flight.";
  if (/surf|wave|majestic|puraran/.test(s))
    return "Puraran's Majestic is a right-hand reef break that works best from August to October. Beginners should take a lesson with board (about ₱900) and surf at mid to high tide. The reef is sharp at low tide.";
  if (/eat|food|crab|latik|tilmok|restaurant|kain/.test(s))
    return "Try latik and tilmok in Virac, Bicol set meals with kinunot and laing, and mud crab in Panganiban, the island's crab capital. Bayside grills near Virac port cook the morning's catch.";
  if (/atm|cash|money|gcash|bank/.test(s))
    return "Withdraw cash in Virac. ATMs are scarce in the north and east. Most guides and homestays take GCash, but carry small bills for entrance and environmental fees.";
  if (/get there|flight|ferry|boat|tabaco|airport|how do i/.test(s))
    return "Cebu Pacific flies Manila to Virac in about 1 hour 10 minutes. By sea, fast craft from Tabaco reach Virac in about 1.5 hours, and RoRo ferries reach San Andres in about 2.5 hours.";
  if (/emergency|hospital|police|911/.test(s))
    return "Call 911 for emergencies. Eastern Bicol Medical Center in Virac is the provincial hospital. The Coast Guard station is at Virac port.";
  if (/signal|wifi|internet|offline/.test(s))
    return "Signal drops in Gigmoto, Pandan and on the trails. Save your trip for offline use from the Trips tab; tickets and the map you already opened still work.";
  if (hit) return `${hit.name} (${TOWNS.find((t) => t.id === hit.town)?.name}): ${hit.details}${hit.feeNote ? ` Fees: ${hit.feeNote}` : hit.fee ? ` Fee: ₱${hit.fee} per person.` : ""}`;
  return "I can help with getting around, food, weather, surf, safety and any stop on your plan. Try asking what to bring to Binurong, or where to eat crab.";
}
