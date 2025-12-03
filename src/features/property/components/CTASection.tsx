import { ArrowRight, Home, PlusCircle } from 'lucide-react';

/**
 * CTASection - Modern Minimalism Premium Design
 * 
 * Features:
 * - Clean layout with two CTA cards
 * - White backgrounds with subtle shadows
 * - Orange primary CTA buttons
 * - 64px section padding
 */
export default function CTASection() {
  return (
    <section 
      style={{ 
        backgroundColor: 'var(--color-neutral-50)',
        paddingTop: 'var(--spacing-16)',
        paddingBottom: 'var(--spacing-16)'
      }}
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For Tenants */}
          <div 
            className="group transition-all duration-300"
            style={{ 
              backgroundColor: 'var(--color-background-page)',
              borderRadius: 'var(--border-radius-xl)',
              padding: 'var(--spacing-12)',
              boxShadow: 'var(--shadow-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-base)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon */}
            <div 
              className="w-14 h-14 flex items-center justify-center mb-6"
              style={{ 
                backgroundColor: 'var(--color-primary-500)',
                borderRadius: 'var(--border-radius-md)'
              }}
            >
              <Home className="h-7 w-7 text-white" />
            </div>
            
            {/* Content */}
            <h3 
              className="font-bold mb-4"
              style={{ 
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: 'var(--color-neutral-900)'
              }}
            >
              Vous cherchez un logement ?
            </h3>
            <p 
              className="mb-8 leading-relaxed"
              style={{ 
                fontSize: '18px',
                color: 'var(--color-neutral-700)'
              }}
            >
              Accédez à des centaines de propriétés vérifiées dans toute la Côte d'Ivoire. 
              Appartements, villas, studios — trouvez le logement idéal pour vous et votre famille.
            </p>
            
            {/* CTA */}
            <a
              href="/recherche"
              className="inline-flex items-center gap-3 text-white font-semibold transition-all"
              style={{ 
                backgroundColor: 'var(--color-primary-500)',
                padding: '14px 28px',
                borderRadius: 'var(--border-radius-md)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Voir les propriétés</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          {/* Card 2: For Owners */}
          <div 
            className="group transition-all duration-300"
            style={{ 
              backgroundColor: 'var(--color-neutral-900)',
              borderRadius: 'var(--border-radius-xl)',
              padding: 'var(--spacing-12)',
              boxShadow: 'var(--shadow-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-base)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon */}
            <div 
              className="w-14 h-14 flex items-center justify-center mb-6"
              style={{ 
                backgroundColor: 'var(--color-primary-500)',
                borderRadius: 'var(--border-radius-md)'
              }}
            >
              <PlusCircle className="h-7 w-7 text-white" />
            </div>
            
            {/* Content */}
            <h3 
              className="font-bold text-white mb-4"
              style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}
            >
              Vous êtes propriétaire ?
            </h3>
            <p 
              className="mb-8 leading-relaxed"
              style={{ 
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              Publiez gratuitement votre bien et touchez des milliers de locataires qualifiés. 
              Gestion simplifiée, paiements sécurisés et accompagnement personnalisé.
            </p>
            
            {/* CTA */}
            <a
              href="/ajouter-propriete"
              className="inline-flex items-center gap-3 font-semibold transition-all"
              style={{ 
                backgroundColor: 'var(--color-primary-500)',
                color: 'white',
                padding: '14px 28px',
                borderRadius: 'var(--border-radius-md)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-500)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Publier mon bien</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
