import HeroPremium from '../components/HeroPremium';
import HowItWorksCompact from '../components/HowItWorksCompact';
import TrustSection from '../components/TrustSection';
import PlatformStats from '../components/PlatformStats';
import Testimonials from '../components/Testimonials';
import CTASection from '../components/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-background-page)]">
      {/* Hero premium avec barre de recherche intégrée */}
      <HeroPremium />

      {/* Section Comment ça marche */}
      <HowItWorksCompact />

      {/* Statistiques plateforme */}
      <PlatformStats />

      {/* Section Confiance */}
      <TrustSection />

      {/* Témoignages */}
      <Testimonials />

      {/* CTA final */}
      <CTASection />
    </div>
  );
}
