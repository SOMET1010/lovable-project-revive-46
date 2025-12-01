import { Home, Users, FileText, MapPin, Shield, TrendingUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface StatsSectionProps {
  stats: {
    propertiesCount: number;
    tenantsCount: number;
    citiesCount: number;
    contractsCount: number;
  };
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={ref} className="font-display text-h1 font-bold text-[var(--terracotta-500)]">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const statItems = [
    {
      icon: Home,
      value: stats.propertiesCount,
      suffix: '+',
      label: 'Propriétés disponibles',
      description: 'Vérifiées et certifiées',
    },
    {
      icon: Users,
      value: stats.tenantsCount,
      suffix: '+',
      label: 'Utilisateurs actifs',
      description: 'Communauté grandissante',
    },
    {
      icon: FileText,
      value: stats.contractsCount,
      suffix: '+',
      label: 'Contrats signés',
      description: 'En toute sécurité',
    },
    {
      icon: MapPin,
      value: stats.citiesCount,
      suffix: '',
      label: 'Villes couvertes',
      description: 'Partout en Côte d\'Ivoire',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-[var(--terracotta-100)] text-[var(--terracotta-600)] text-sm font-semibold mb-4">
            Nos Chiffres
          </span>
          <h2 className="text-h1 font-display text-[var(--earth-900)] mb-4">
            La confiance de milliers d'Ivoiriens
          </h2>
          <p className="text-body-lg text-[var(--earth-700)] max-w-2xl mx-auto">
            Mon Toit connecte chaque jour propriétaires et locataires dans un environnement sécurisé et certifié
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative bg-[var(--sand-50)] rounded-2xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[var(--terracotta-200)]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-[var(--terracotta-500)] to-[var(--terracotta-600)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              
              {/* Counter */}
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              
              {/* Label */}
              <h3 className="text-h4 font-semibold text-[var(--earth-900)] mt-2 mb-1">
                {stat.label}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-[var(--earth-700)]">
                {stat.description}
              </p>
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                <div 
                  className="absolute -top-10 -right-10 w-20 h-20 rotate-45 bg-[var(--terracotta-100)] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-3 text-[var(--earth-700)]">
            <Shield className="h-6 w-6 text-[var(--forest-500)]" />
            <span className="font-medium">Certifié ANSUT</span>
          </div>
          <div className="w-px h-8 bg-[var(--sand-300)] hidden sm:block" />
          <div className="flex items-center gap-3 text-[var(--earth-700)]">
            <TrendingUp className="h-6 w-6 text-[var(--terracotta-500)]" />
            <span className="font-medium">98% Satisfaction</span>
          </div>
          <div className="w-px h-8 bg-[var(--sand-300)] hidden sm:block" />
          <div className="flex items-center gap-3 text-[var(--earth-700)]">
            <Users className="h-6 w-6 text-[var(--gold-500)]" />
            <span className="font-medium">Support 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
