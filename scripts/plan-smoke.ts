import { planTrip, bookableItems, commissionFor } from "../src/lib/planner";
for (const days of [1, 3, 5, 7]) {
  const it = planTrip({ days, startDate: "2026-11-24", group: "friends", size: 4, budget: "mid", interests: ["surf", "mountains", "food"], arrival: "flight" });
  console.log(`\n== ${it.title} | ${it.summary} | ₱${it.totals.group} (₱${it.totals.perPerson}/pax) bookable ₱${it.totals.bookable} commission ₱${commissionFor(it.totals.bookable)}`);
  for (const d of it.days) {
    console.log(` Day ${d.index + 1} ${d.date} [${d.area}] ${d.title} drive ${d.driveMin}m`);
    if (days <= 3) for (const i of d.items) console.log(`   ${i.time} ${i.type.padEnd(9)} ${i.title}${i.subtitle ? " · " + i.subtitle : ""} ₱${i.cost}${i.travelMin ? ` (+${i.travelMin}m)` : ""}`);
  }
  if (days === 3) console.log(" bookable items:", bookableItems(it).length);
}
const s = planTrip({ days: 3, startDate: "2026-11-24", group: "couple", size: 2, budget: "budget", interests: ["beaches", "surf"], arrival: "ferry-san-andres", storm: true, variant: "cheaper" });
console.log("\nSTORM:", s.days.map(d => d.items.filter(i => i.type === "place").map(i => i.title).join(", ")).join(" | "), s.totals);
