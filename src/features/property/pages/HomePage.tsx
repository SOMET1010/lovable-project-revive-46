import HowItWorksCompact from '../components/HowItWorksCompact';
import TrustSection from '../components/TrustSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero statique temporaire */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Mon Toit
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            La plateforme immobilière de confiance en Côte d'Ivoire
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="/recherche" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Rechercher un logement
            </a>
            <a 
              href="/ajouter-propriete" 
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Publier une annonce
            </a>
          </div>
        </div>
      </section>

      {/* Section Comment ça marche - AUCUNE dépendance externe */}
      <HowItWorksCompact />

      {/* Section Confiance - AUCUNE dépendance externe */}
      <TrustSection />
    </div>
  );
}
