import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { toast } from 'sonner';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubscribed(true);
    setIsSubmitting(false);
    toast.success('Inscription réussie ! Vous recevrez nos meilleures offres.');
    setEmail('');
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background with gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)'
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à trouver votre prochain logement ?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers d'Ivoiriens qui font confiance à Mon Toit pour leurs projets immobiliers
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/recherche">
              <Button 
                size="large" 
                className="bg-white text-primary hover:bg-white/90 gap-2 px-8 h-14 text-base font-semibold shadow-lg"
              >
                Rechercher un logement
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/ajouter-propriete">
              <Button 
                size="large" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 gap-2 px-8 h-14 text-base font-semibold"
              >
                Publier une annonce
              </Button>
            </Link>
          </div>

          {/* Newsletter section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-white/20">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Newsletter</span>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
              Recevez les meilleures offres en avant-première
            </h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Soyez informé des nouvelles propriétés correspondant à vos critères
            </p>

            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 text-white">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">Merci pour votre inscription !</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  className="flex-1 h-12 px-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-6 bg-white text-primary hover:bg-white/90 font-semibold"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
