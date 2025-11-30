import { ArrowRight, Home, PlusCircle } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-[var(--sand-100)] relative overflow-hidden">
      {/* Decorative Elements */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, var(--terracotta-200) 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, var(--gold-300) 0%, transparent 70%)' }}
      />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For Tenants */}
          <div className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Background Accent */}
            <div 
              className="absolute top-0 right-0 w-40 h-40 -translate-y-1/2 translate-x-1/2 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
              style={{ background: 'var(--terracotta-500)' }}
            />
            
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--terracotta-500)] to-[var(--terracotta-600)] flex items-center justify-center mb-6 shadow-lg">
              <Home className="h-8 w-8 text-white" />
            </div>
            
            {/* Content */}
            <h3 className="text-h2 font-display text-[var(--earth-900)] mb-4">
              Vous cherchez un logement ?
            </h3>
            <p className="text-body-lg text-[var(--earth-700)] mb-8 leading-relaxed">
              Accédez à des centaines de propriétés vérifiées dans toute la Côte d'Ivoire. 
              Appartements, villas, studios — trouvez le logement idéal pour vous et votre famille.
            </p>
            
            {/* CTA */}
            <a
              href="/recherche"
              className="btn-primary inline-flex items-center gap-3 group/btn"
            >
              <span>Voir les propriétés</span>
              <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Card 2: For Owners */}
          <div className="group relative bg-[var(--earth-900)] rounded-3xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            
            {/* Gradient Orb */}
            <div 
              className="absolute bottom-0 right-0 w-40 h-40 translate-y-1/2 translate-x-1/4 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
              style={{ background: 'var(--gold-500)' }}
            />
            
            {/* Icon */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gold-400)] to-[var(--gold-600)] flex items-center justify-center mb-6 shadow-lg">
              <PlusCircle className="h-8 w-8 text-[var(--earth-900)]" />
            </div>
            
            {/* Content */}
            <h3 className="relative text-h2 font-display text-white mb-4">
              Vous êtes propriétaire ?
            </h3>
            <p className="relative text-body-lg text-white/80 mb-8 leading-relaxed">
              Publiez gratuitement votre bien et touchez des milliers de locataires qualifiés. 
              Gestion simplifiée, paiements sécurisés et accompagnement personnalisé.
            </p>
            
            {/* CTA */}
            <a
              href="/ajouter-propriete"
              className="btn-gold inline-flex items-center gap-3 group/btn"
            >
              <span>Publier mon bien</span>
              <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
