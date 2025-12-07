import HeroSlideshow from '../components/HeroSlideshow';
import HowItWorksCompact from '../components/HowItWorksCompact';
import TrustSection from '../components/TrustSection';
import PlatformStats from '../components/PlatformStats';
import Testimonials from '../components/Testimonials';
import CTASection from '../components/CTASection';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero avec slideshow animé */}
      <section className="relative py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Colonne texte */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Mon Toit
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                La plateforme immobilière de confiance en Côte d'Ivoire
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link 
                  to="/recherche" 
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
                >
                  Rechercher un logement
                </Link>
                <Link 
                  to="/ajouter-propriete" 
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors text-center"
                >
                  Publier une annonce
                </Link>
              </div>
            </div>
            
            {/* Colonne slideshow */}
            <div className="h-[350px] md:h-[450px] order-1 lg:order-2">
              <HeroSlideshow />
            </div>
          </div>
        </div>
      </section>

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
