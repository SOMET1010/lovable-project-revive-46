import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * CTASection - Simplified Compact CTA
 * Single row with title and button
 */
export default function CTASection() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              Prêt à trouver votre nouveau chez-vous ?
            </h2>
            <p className="text-primary-foreground/80">
              Rejoignez des milliers de locataires satisfaits
            </p>
          </div>
          
          <Link 
            to="/recherche"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            Voir les propriétés
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
