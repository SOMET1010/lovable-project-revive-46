import { Shield, CreditCard, UserCheck, FileCheck, Star, Lock } from 'lucide-react';

const features = [
  {
    icon: UserCheck,
    title: 'Identité vérifiée',
    description: 'Chaque utilisateur est vérifié via sa CNI ou son passeport pour garantir des échanges fiables.',
  },
  {
    icon: Shield,
    title: 'Propriétés certifiées',
    description: 'Documents fonciers vérifiés et photos authentifiées pour chaque annonce sur la plateforme.',
  },
  {
    icon: CreditCard,
    title: 'Paiement sécurisé',
    description: 'Transactions protégées via Mobile Money (Orange, MTN, Wave) ou carte bancaire.',
  },
  {
    icon: FileCheck,
    title: 'Contrats digitaux',
    description: 'Signature électronique légalement reconnue et archivage sécurisé de tous vos documents.',
  },
  {
    icon: Lock,
    title: 'Données protégées',
    description: 'Vos informations personnelles sont cryptées et ne sont jamais partagées sans votre accord.',
  },
  {
    icon: Star,
    title: 'Support premium',
    description: 'Une équipe dédiée disponible 24/7 pour vous accompagner à chaque étape de votre projet.',
  },
];

/**
 * TrustSection - Premium Design
 * 
 * Features:
 * - Uses shadcn/ui CSS variables for theming
 * - 96px vertical padding
 * - Orange icon accents via primary color
 * - Professional grid layout
 */
export default function TrustSection() {
  return (
    <section className="relative bg-background py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full text-sm font-semibold mb-6 bg-primary/10 text-primary">
            Sécurité & Confiance
          </span>
          <h2 className="font-bold mb-5 text-foreground text-[clamp(28px,4vw,44px)] tracking-tight">
            Votre sécurité est notre priorité
          </h2>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-muted-foreground">
            Nous mettons en place les meilleurs standards de sécurité pour protéger vos transactions et vos données
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group transition-all duration-300 bg-muted rounded-[20px] p-8 md:p-10 border border-border hover:shadow-[0_20px_40px_-10px_hsl(var(--primary)/0.1)] hover:-translate-y-1 hover:border-primary"
            >
              {/* Icon */}
              <div className="w-14 h-14 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-primary/10 rounded-[14px]">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              
              {/* Title */}
              <h3 className="font-semibold mb-3 text-xl text-foreground">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
