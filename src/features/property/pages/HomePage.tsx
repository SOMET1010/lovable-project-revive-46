import HeroPremium from '../components/HeroPremium';
import FeaturedPropertiesSection from '../components/FeaturedPropertiesSection';
import HowItWorksCompact from '../components/HowItWorksCompact';
import Testimonials from '../components/Testimonials';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero premium avec barre de recherche intégrée */}
      <HeroPremium />

      {/* Propriétés en vedette - chargées dynamiquement */}
      <FeaturedPropertiesSection />

      {/* Section Comment ça marche */}
      <HowItWorksCompact />

      {/* Témoignages */}
      <Testimonials />
    </div>
  );
}
