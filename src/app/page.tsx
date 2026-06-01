import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { UnlockCryptoRails } from "@/components/UnlockCryptoRails";
import { FeatureDetails } from "@/components/FeatureDetails";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <AnnouncementBanner />
      <Navigation />
      <main>
        <HeroSection />
        <UnlockCryptoRails />
        <FeatureDetails />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
