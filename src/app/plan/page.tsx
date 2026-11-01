import type { Metadata } from "next";
import { Wizard } from "./wizard";

export const metadata: Metadata = { title: "Plan a trip" };

export default function PlanPage() {
  return <Wizard />;
}
