import { useEffect, useState, useRef } from 'react';
import { Building2, Users, MapPin, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  properties: number;
  users: number;
  cities: number;
  verified: number;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
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

          cleanup = () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, [value]);

  return (
    <span ref={ref}>
      {count.toLocaleString('fr-FR')}{suffix}
    </span>
  );
}

export default function PlatformStats() {
  const [stats, setStats] = useState<Stats>({
    properties: 0,
    users: 0,
    cities: 12,
    verified: 0
  });

  useEffect(() => {
    async function fetchStats() {
      // Fetch properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      // Fetch unique cities
      const { data: citiesData } = await supabase
        .from('properties')
        .select('city')
        .eq('status', 'available');

      const uniqueCities = new Set(citiesData?.map(p => p.city) ?? []);

      // Fetch verified properties
      const { count: verifiedCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('ansut_verified', true);

      // Fetch users count (via profiles)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        properties: propertiesCount ?? 150,
        users: usersCount ?? 500,
        cities: Math.max(uniqueCities.size, 12),
        verified: verifiedCount ?? 80
      });
    }
    fetchStats();
  }, []);

  const statItems = [
    {
      icon: Building2,
      value: stats.properties,
      suffix: '+',
      label: 'Propriétés disponibles'
    },
    {
      icon: Users,
      value: stats.users,
      suffix: '+',
      label: 'Utilisateurs actifs'
    },
    {
      icon: MapPin,
      value: stats.cities,
      suffix: '',
      label: 'Villes couvertes'
    },
    {
      icon: Shield,
      value: stats.verified,
      suffix: '%',
      label: 'Annonces vérifiées'
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            La confiance de milliers d'Ivoiriens
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Mon Toit simplifie la recherche immobilière en Côte d'Ivoire
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {statItems.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <stat.icon className="h-7 w-7" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-primary-foreground/80">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
