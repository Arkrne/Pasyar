import { TopNavOverlay } from "@/components/landing/top-nav-overlay";
import { Hero } from "@/components/landing/hero";
import { RouteStory } from "@/components/landing/route-story";
import {
  CommunityTeaser,
  HowItWorks,
  IslandFacts,
  MarketTeaser,
  MoneySection,
  OperatorSection,
  StormSection,
  TownsRail,
} from "@/components/landing/sections";
import { TabBar } from "@/components/shell";
import { SiteFooter } from "@/components/site-footer";
import { ForecastSection, FestivalStrip } from "@/components/landing/island-sections";
import { MosaicBand } from "@/components/icons";

export default function Home() {
  return (
    <>
      <TopNavOverlay />
      <main>
        <Hero />
        <IslandFacts />
        <MosaicBand />
        <HowItWorks />
        <RouteStory />
        <TownsRail />
        <ForecastSection />
        <FestivalStrip />
        <CommunityTeaser />
        <StormSection />
        <OperatorSection />
        <MoneySection />
        <MosaicBand className="mt-10" />
        <MarketTeaser />
      </main>
      <SiteFooter />
      <TabBar />
    </>
  );
}
