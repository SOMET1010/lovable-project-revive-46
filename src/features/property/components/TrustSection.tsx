import { Shield, CreditCard, Users, Award, Phone, CheckCircle } from 'lucide-react';

const trustFeatures = [
  {
    icon: Shield,
    title: 'Certification ANSUT',
    description: 'Tous nos utilisateurs sont vérifiés via le système national d\'identification pour garantir des transactions sécurisées.',
    highlight: 'Identité vérifiée',
  },
  {
    icon: CreditCard,
    title: 'Paiement Mobile Money',
    description: 'Payez en toute sécurité avec Orange Money, MTN Money ou Moov Money. Transactions cryptées et traçables.',
    highlight: '100% Sécurisé',
  },
  {
    icon: Award,
    title: 'Propriétés Vérifiées',
    description: 'Chaque annonce est validée par notre équipe. Photos authentiques, informations exactes, visites garanties.',
    highlight: 'Qualité certifiée',
  },
  {
    icon: Users,
    title: 'Support Dédié',
    description: 'Une équipe à votre écoute 7j/7 pour vous accompagner dans toutes les étapes de votre location.',
    highlight: 'Assistance 24/7',
  },
];

export default function TrustSection() {
  return (
    <section className="py-20 md:py-28 bg-[var(--earth-900)] text-white relative overflow-hidden">
      {/* African Pattern Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Gradient Orbs */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, var(--terracotta-500) 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, var(--gold-500) 0%, transparent 70%)' }}
      />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-[var(--gold-400)] text-sm font-semibold mb-6">
            <CheckCircle className="h-4 w-4" />
            Plateforme de confiance
          </span>
          <h2 className="text-h1 font-display text-white mb-4">
            Pourquoi choisir Mon Toit ?
          </h2>
          <p className="text-body-lg text-white/80 max-w-2xl mx-auto">
            La seule plateforme immobilière en Côte d'Ivoire avec une triple garantie de sécurité
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trustFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-[var(--terracotta-500)]/50 transition-all duration-300"
            >
              {/* Highlight Badge */}
              <div className="absolute -top-3 right-6">
                <span className="px-3 py-1 bg-gradient-to-r from-[var(--terracotta-500)] to-[var(--terracotta-600)] text-white text-xs font-bold rounded-full">
                  {feature.highlight}
                </span>
              </div>
              
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--terracotta-500)] to-[var(--terracotta-600)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="text-h3 font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Row */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="/inscription"
            className="btn-gold inline-flex items-center gap-2 text-lg px-8 h-14"
          >
            <span>Créer mon compte gratuit</span>
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Phone className="h-5 w-5" />
            <span>Besoin d'aide ? Contactez-nous</span>
          </a>
        </div>
      </div>
    </section>
  );
}
