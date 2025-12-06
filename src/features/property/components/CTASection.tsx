import { useState } from 'react';
import { Send, User, Phone, MessageSquare, CheckCircle, Shield, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

interface ContactFormData {
  name: string;
  phone: string;
  project: string;
}

/**
 * CTASection - Agent-Centric CTA with Contact Form
 * Photo d'agent + formulaire de contact simplifié
 */
export default function CTASection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    project: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Demande envoyée ! Un expert vous contactera sous 24h.');
    
    // Reset form after delay
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', project: '' });
    }, 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Agent Photo & Trust Badges */}
          <div className="relative order-2 lg:order-1">
            {/* Agent Photo */}
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-background">
                <img
                  src="/images/cta/agent-pro.jpg"
                  alt="Expert immobilier Mon Toit"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-background rounded-2xl shadow-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Agent certifié</p>
                    <p className="text-sm text-muted-foreground">Expert Mon Toit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Points - Below image on mobile, side on desktop */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:hidden">
              {[
                { icon: Shield, label: 'Service 100% gratuit' },
                { icon: Clock, label: 'Réponse sous 24h' },
                { icon: CheckCircle, label: 'Sans engagement' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="order-1 lg:order-2">
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
                Accompagnement personnalisé
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Votre Projet Mérite un Accompagnement d'Exception
              </h2>
              <p className="text-lg text-muted-foreground">
                Laissez nos experts vous trouver la perle rare. Gratuit, rapide et sans engagement.
              </p>
            </div>

            {/* Trust Points - Desktop only */}
            <div className="hidden lg:flex gap-6 mb-8">
              {[
                { icon: Shield, label: 'Service 100% gratuit' },
                { icon: Clock, label: 'Réponse sous 24h' },
                { icon: CheckCircle, label: 'Sans engagement' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Demande envoyée avec succès !
                </h3>
                <p className="text-green-700">
                  Un expert vous contactera dans les prochaines 24 heures.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom complet *"
                    required
                    className="w-full h-14 pl-18 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    style={{ paddingLeft: '4.5rem' }}
                  />
                </div>

                {/* Phone Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Votre téléphone *"
                    required
                    className="w-full h-14 pl-18 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    style={{ paddingLeft: '4.5rem' }}
                  />
                </div>

                {/* Project Textarea */}
                <div className="relative">
                  <div className="absolute left-4 top-4 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <textarea
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    placeholder="Décrivez votre projet (quartier souhaité, budget, type de bien...)"
                    rows={3}
                    className="w-full pt-4 pb-4 pl-18 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    style={{ paddingLeft: '4.5rem' }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Contacter mon expert dédié</span>
                    </>
                  )}
                </button>

                {/* Privacy Note */}
                <p className="text-xs text-center text-muted-foreground">
                  En soumettant ce formulaire, vous acceptez d'être contacté par nos experts. 
                  Vos données sont protégées conformément à notre politique de confidentialité.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
