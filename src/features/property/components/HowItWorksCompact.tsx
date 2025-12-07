import { Search, Shield, FileCheck, Key } from 'lucide-react';
import { useScrollAnimation, getAnimationClasses } from '@/shared/hooks/useScrollAnimation';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Recherchez',
    description: 'Parcourez notre catalogue de logements vérifiés dans toute la Côte d\'Ivoire',
  },
  {
    icon: Shield,
    number: '02',
    title: 'Vérifiez',
    description: 'Consultez les documents certifiés et le score de confiance du propriétaire',
  },
  {
    icon: FileCheck,
    number: '03',
    title: 'Postulez',
    description: 'Soumettez votre candidature en quelques clics avec votre dossier complet',
  },
  {
    icon: Key,
    number: '04',
    title: 'Emménagez',
    description: 'Signez électroniquement votre bail et recevez vos clés en toute sécurité',
  },
];

export default function HowItWorksCompact() {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1 });

  return (
    <section 
      ref={ref}
      className="py-20 md:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.03), hsl(var(--background)))'
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 ${getAnimationClasses(isVisible, 'fadeUp', 0)}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            4 étapes simples
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trouvez votre logement idéal en toute confiance grâce à notre processus simplifié
          </p>
        </div>

        {/* Timeline - Desktop */}
        <div className="hidden lg:block relative mb-8">
          <div className="absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary via-primary/60 to-primary/30 rounded-full" />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className={`relative ${getAnimationClasses(isVisible, 'fadeUp', index * 150)}`}
            >
              {/* Mobile/Tablet connector line */}
              {index < steps.length - 1 && (
                <div className="lg:hidden absolute left-8 top-16 w-0.5 h-[calc(100%+2rem)] bg-gradient-to-b from-primary/40 to-primary/10" />
              )}

              {/* Card */}
              <div className="relative bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                {/* Number badge */}
                <div className="absolute -top-3 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>

                {/* Icon container */}
                <div className="mt-6 mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Text content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-12 ${getAnimationClasses(isVisible, 'fadeUp', 600)}`}>
          <a 
            href="/recherche" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors duration-200 shadow-lg shadow-primary/25"
          >
            <Search className="h-5 w-5" />
            Commencer ma recherche
          </a>
        </div>
      </div>
    </section>
  );
}
