import { useState } from 'react';
import { Send, User, Phone, MessageSquare, CheckCircle, Shield, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

interface ContactFormData {
  name: string;
  phone: string;
  project: string;
}

/**
 * CTASection - Design organique avec vraie photo d'agent
 * Formulaire flottant avec coins arrondis 22px et palette Sable/Cacao/Orange
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
    <section 
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #F8E8D8 0%, #FFFFFF 50%, rgba(241, 101, 34, 0.05) 100%)'
      }}
    >
      {/* Decorative Elements */}
      <div 
        className="absolute top-20 right-20 w-64 h-64 opacity-20 blur-3xl"
        style={{ backgroundColor: '#F16522' }}
      />
      <div 
        className="absolute bottom-20 left-20 w-48 h-48 opacity-15 blur-3xl"
        style={{ backgroundColor: '#2E4B3E' }}
      />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Side - Agent Photo */}
          <div className="relative order-2 lg:order-1">
            {/* Agent Photo Container */}
            <div className="relative max-w-lg mx-auto lg:mx-0">
              <div 
                className="relative overflow-hidden"
                style={{ 
                  borderRadius: '28px',
                  boxShadow: '0 32px 64px rgba(82, 54, 40, 0.2)'
                }}
              >
                <img
                  src="/images/cta/agent-real.png"
                  alt="Expert immobilier Mon Toit"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                {/* Gradient Overlay at bottom */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-32"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(82, 54, 40, 0.8), transparent)'
                  }}
                />
              </div>
              
              {/* Floating Badge */}
              <div 
                className="absolute -bottom-6 -right-6 lg:-right-10 flex items-center gap-4 p-5"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '22px',
                  boxShadow: '0 16px 48px rgba(82, 54, 40, 0.15)',
                  border: '1px solid rgba(241, 101, 34, 0.1)'
                }}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(241, 101, 34, 0.1)' }}
                >
                  <Award className="w-7 h-7" style={{ color: '#F16522' }} />
                </div>
                <div>
                  <p 
                    className="font-bold"
                    style={{ color: '#523628', fontSize: '16px' }}
                  >
                    Agent Certifié
                  </p>
                  <p style={{ color: '#737373', fontSize: '14px' }}>
                    Expert Mon Toit
                  </p>
                </div>
              </div>

              {/* Trust Points - Mobile only */}
              <div className="mt-16 grid grid-cols-3 gap-4 lg:hidden">
                {[
                  { icon: Shield, label: '100% gratuit' },
                  { icon: Clock, label: 'Sous 24h' },
                  { icon: CheckCircle, label: 'Sans engagement' }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(46, 75, 62, 0.1)' }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: '#2E4B3E' }} />
                    </div>
                    <span style={{ color: '#737373', fontSize: '12px' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="order-1 lg:order-2">
            {/* Header */}
            <div className="mb-10">
              <span 
                className="inline-block px-6 py-2.5 text-sm font-semibold mb-6"
                style={{ 
                  backgroundColor: 'rgba(241, 101, 34, 0.1)',
                  color: '#F16522',
                  borderRadius: '22px'
                }}
              >
                Accompagnement personnalisé
              </span>
              <h2 
                className="font-bold mb-5"
                style={{ 
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  color: '#523628',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                Votre Projet Mérite un Accompagnement d'Exception
              </h2>
              <p 
                style={{ 
                  fontSize: '18px',
                  lineHeight: '1.7',
                  color: '#737373'
                }}
              >
                Laissez nos experts vous trouver la perle rare. C'est gratuit, rapide et sans engagement.
              </p>
            </div>

            {/* Trust Points - Desktop only */}
            <div className="hidden lg:flex gap-6 mb-10">
              {[
                { icon: Shield, label: 'Service 100% gratuit' },
                { icon: Clock, label: 'Réponse sous 24h' },
                { icon: CheckCircle, label: 'Sans engagement' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(46, 75, 62, 0.1)' }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: '#2E4B3E' }} />
                  </div>
                  <span style={{ color: '#737373', fontSize: '14px' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div 
              className="p-8 md:p-10"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '22px',
                boxShadow: '0 20px 60px rgba(82, 54, 40, 0.1)',
                border: '1px solid rgba(82, 54, 40, 0.08)'
              }}
            >
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: 'rgba(46, 75, 62, 0.1)' }}
                  >
                    <CheckCircle className="w-10 h-10" style={{ color: '#2E4B3E' }} />
                  </div>
                  <h3 
                    className="font-bold mb-3"
                    style={{ color: '#2E4B3E', fontSize: '22px' }}
                  >
                    Demande envoyée avec succès !
                  </h3>
                  <p style={{ color: '#737373' }}>
                    Un expert vous contactera dans les prochaines 24 heures.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Input */}
                  <div className="relative">
                    <div 
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'rgba(241, 101, 34, 0.1)',
                        borderRadius: '12px'
                      }}
                    >
                      <User className="w-5 h-5" style={{ color: '#F16522' }} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom complet *"
                      required
                      className="w-full h-14 pl-20 pr-5 bg-transparent transition-all focus:outline-none"
                      style={{ 
                        border: '2px solid #E5E5E5',
                        borderRadius: '16px',
                        color: '#523628',
                        fontSize: '16px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#F16522'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="relative">
                    <div 
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'rgba(241, 101, 34, 0.1)',
                        borderRadius: '12px'
                      }}
                    >
                      <Phone className="w-5 h-5" style={{ color: '#F16522' }} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Votre téléphone *"
                      required
                      className="w-full h-14 pl-20 pr-5 bg-transparent transition-all focus:outline-none"
                      style={{ 
                        border: '2px solid #E5E5E5',
                        borderRadius: '16px',
                        color: '#523628',
                        fontSize: '16px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#F16522'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                    />
                  </div>

                  {/* Project Textarea */}
                  <div className="relative">
                    <div 
                      className="absolute left-4 top-5 w-11 h-11 flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'rgba(241, 101, 34, 0.1)',
                        borderRadius: '12px'
                      }}
                    >
                      <MessageSquare className="w-5 h-5" style={{ color: '#F16522' }} />
                    </div>
                    <textarea
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      placeholder="Décrivez votre projet en quelques mots (quartier, budget, type de bien...)"
                      rows={4}
                      className="w-full pt-5 pb-5 pl-20 pr-5 bg-transparent transition-all focus:outline-none resize-none"
                      style={{ 
                        border: '2px solid #E5E5E5',
                        borderRadius: '16px',
                        color: '#523628',
                        fontSize: '16px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#F16522'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 flex items-center justify-center gap-3 font-semibold transition-all duration-300 hover:scale-[1.02] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#F16522',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(241, 101, 34, 0.35)',
                      fontSize: '16px'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div 
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" 
                        />
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
                  <p 
                    className="text-center"
                    style={{ color: '#A3A3A3', fontSize: '12px' }}
                  >
                    En soumettant ce formulaire, vous acceptez d'être contacté par nos experts. 
                    Vos données sont protégées conformément à notre politique de confidentialité.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
