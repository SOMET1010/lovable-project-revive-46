import { useState, useEffect, useRef } from 'react';
import { Search, Heart, FileCheck, Key, Home, CheckCircle } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  description: string;
  iconStart: typeof Search;
  iconEnd: typeof Heart;
  gradient: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Explorez avec Confiance',
    description: 'Fini les mauvaises surprises. Parcourez des centaines d\'annonces 100% vérifiées par nos agents.',
    iconStart: Search,
    iconEnd: Heart,
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    number: '02',
    title: 'Postulez en un Clic',
    description: 'Votre dossier locataire unique et votre Trust Score vous ouvrent les portes. Postulez sans jamais refaire la paperasse.',
    iconStart: Heart,
    iconEnd: FileCheck,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    number: '03',
    title: 'Signez et Emménagez',
    description: 'Signez votre bail électronique sécurisé. Bienvenue chez vous !',
    iconStart: FileCheck,
    iconEnd: Key,
    gradient: 'from-red-500 to-rose-500'
  }
];

/**
 * HowItWorksSection - Scrollytelling avec animations de transformation
 * Design organique avec coins arrondis 22px et palette Sable/Cacao/Orange
 */
export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Observer pour l'animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-progression des étapes quand visible
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Decorative Elements - Subtils */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 opacity-10 blur-3xl"
        style={{ backgroundColor: '#F16522' }}
      />
      <div 
        className="absolute bottom-0 left-0 w-72 h-72 opacity-10 blur-3xl"
        style={{ backgroundColor: '#E6D0B3' }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className="inline-block px-6 py-2.5 text-sm font-semibold mb-6"
            style={{ 
              backgroundColor: 'rgba(241, 101, 34, 0.1)',
              color: '#F16522',
              borderRadius: '22px'
            }}
          >
            Comment ça marche
          </span>
          <h2 
            className="font-bold mb-5"
            style={{ 
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: '#523628',
              letterSpacing: '-0.02em'
            }}
          >
            La location, réinventée en 3 étapes simples
          </h2>
          <p 
            className="max-w-2xl mx-auto"
            style={{ 
              fontSize: '18px',
              lineHeight: '1.7',
              color: '#737373'
            }}
          >
            Un processus transparent et sécurisé pour vous accompagner vers votre nouveau chez-vous
          </p>
        </div>

        {/* Steps Grid with Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const IconStart = step.iconStart;
            const IconEnd = step.iconEnd;
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <div 
                key={step.number}
                className={`relative group cursor-pointer transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  transitionDelay: `${index * 200}ms`
                }}
                onClick={() => setActiveStep(index)}
              >
                {/* Connector Line (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div 
                    className="hidden lg:block absolute top-20 left-full w-full h-0.5 z-0"
                    style={{ 
                      background: isPast || isActive 
                        ? 'linear-gradient(90deg, #F16522 0%, #F16522 50%, #E5E5E5 50%, #E5E5E5 100%)'
                        : '#E5E5E5',
                      transform: 'translateX(-50%)'
                    }}
                  />
                )}

                {/* Step Card */}
                <div
                  className="relative h-full text-center transition-all duration-500"
                  style={{ 
                    backgroundColor: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '22px',
                    padding: '48px 32px',
                    border: isActive ? '2px solid #F16522' : '2px solid transparent',
                    boxShadow: isActive 
                      ? '0 20px 60px -10px rgba(241, 101, 34, 0.25)' 
                      : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    transform: isActive ? 'translateY(-8px)' : 'translateY(0)'
                  }}
                >
                  {/* Step Number */}
                  <div 
                    className="inline-block font-bold mb-6"
                    style={{ 
                      fontSize: '12px',
                      color: '#F16522',
                      letterSpacing: '0.15em'
                    }}
                  >
                    ÉTAPE {step.number}
                  </div>

                  {/* Icon Animation Container */}
                  <div 
                    className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center"
                    style={{ 
                      backgroundColor: isActive ? 'rgba(241, 101, 34, 0.1)' : 'rgba(241, 101, 34, 0.05)',
                      borderRadius: '22px',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    {/* Icon Transformation Animation */}
                    <div className="relative w-12 h-12">
                      {/* Start Icon */}
                      <IconStart 
                        className={`absolute inset-0 w-12 h-12 transition-all duration-700 ${
                          isActive ? 'opacity-0 scale-50 rotate-180' : 'opacity-100 scale-100 rotate-0'
                        }`}
                        style={{ color: '#F16522' }}
                      />
                      {/* End Icon */}
                      <IconEnd 
                        className={`absolute inset-0 w-12 h-12 transition-all duration-700 ${
                          isActive ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-180'
                        }`}
                        style={{ color: '#F16522' }}
                      />
                    </div>

                    {/* Pulse Effect when active */}
                    {isActive && (
                      <div 
                        className="absolute inset-0 animate-ping opacity-20"
                        style={{ 
                          backgroundColor: '#F16522',
                          borderRadius: '22px'
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 
                    className="font-bold mb-4"
                    style={{ 
                      fontSize: '22px',
                      color: '#523628'
                    }}
                  >
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p 
                    style={{ 
                      fontSize: '15px',
                      lineHeight: '1.7',
                      color: '#737373'
                    }}
                  >
                    {step.description}
                  </p>

                  {/* Checkmark for completed steps */}
                  {isPast && (
                    <div 
                      className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#2E4B3E' }}
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className="transition-all duration-300"
              style={{
                width: index === activeStep ? '32px' : '10px',
                height: '10px',
                borderRadius: '5px',
                backgroundColor: index === activeStep ? '#F16522' : '#D4D4D4'
              }}
              aria-label={`Étape ${index + 1}`}
            />
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <div 
            className="inline-flex items-center gap-4 px-8 py-5"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '22px',
              boxShadow: '0 10px 40px rgba(82, 54, 40, 0.1)'
            }}
          >
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(46, 75, 62, 0.1)' }}
            >
              <Home className="w-7 h-7" style={{ color: '#2E4B3E' }} />
            </div>
            <div className="text-left">
              <p 
                className="font-bold"
                style={{ color: '#523628', fontSize: '18px' }}
              >
                Prêt à trouver votre logement ?
              </p>
              <p style={{ color: '#737373', fontSize: '14px' }}>
                Rejoignez 2,500+ locataires satisfaits
              </p>
            </div>
            <button
              className="px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: '#F16522',
                color: '#FFFFFF',
                borderRadius: '14px',
                boxShadow: '0 4px 16px rgba(241, 101, 34, 0.3)'
              }}
            >
              Commencer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
