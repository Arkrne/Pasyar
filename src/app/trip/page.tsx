import type { Metadata } from "next";
import { TripView } from "./trip-view";

export const metadata: Metadata = { title: "Your trip" };

export default function TripPage() {
  return <TripView />;
}
