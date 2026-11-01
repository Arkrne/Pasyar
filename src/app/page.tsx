import { TopNavOverlay } from "@/components/landing/top-nav-overlay";
import { Hero } from "@/components/landing/hero";
import { RouteStory } from "@/components/landing/route-story";
import {
  CommunityTeaser,
  FinalCTA,
  Footer,
  HowItWorks,
  IslandFacts,
  MarketTeaser,
  MoneySection,
  OperatorSection,
  StormSection,
  TownsRail,
} from "@/components/landing/sections";
import { TabBar } from "@/components/shell";

export default function Home() {
  return (
    <>
      <TopNavOverlay />
      <main>
        <Hero />
        <IslandFacts />
        <HowItWorks />
        <RouteStory />
        <TownsRail />
        <CommunityTeaser />
        <StormSection />
        <OperatorSection />
        <MoneySection />
        <MarketTeaser />
        <FinalCTA />
      </main>
      <Footer />
      <TabBar />
    </>
  );
}
