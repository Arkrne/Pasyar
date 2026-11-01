import type { Metadata } from "next";
import { ExploreView } from "./explore-view";

export const metadata: Metadata = { title: "Explore Catanduanes" };

export default function ExplorePage() {
  return <ExploreView />;
}
