import { Search, Shield, Key } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Recherchez',
    description: 'Trouvez parmi nos logements vérifiés',
  },
  {
    icon: Shield,
    title: 'Vérifiez',
    description: 'Consultez les documents certifiés',
  },
  {
    icon: Key,
    title: 'Emménagez',
    description: 'Signez et recevez vos clés',
  },
];

export default function HowItWorksCompact() {
  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center gap-4">
              {/* Step indicator */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              
              {/* Text */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-semibold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Connector (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block w-16 h-px bg-border ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
