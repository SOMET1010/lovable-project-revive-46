import { useState } from 'react';
import { Send, User, Phone, MessageSquare, CheckCircle, Shield, Clock, Award, Bot, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useScrollAnimation } from '@/shared/hooks/useScrollAnimation';
import SUTAChatWidget from '@/shared/components/SUTAChatWidget';

interface ContactFormData {
  name: string;
  phone: string;
  project: string;
}

type TabType = 'chat' | 'form';

/**
 * CTASection - Design organique avec onglets Chat SUTA / Formulaire
 * Fusion de l'accompagnement personnalisé et du chatbot IA
 */
export default function CTASection() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    project: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Scroll animations
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

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
      ref={sectionRef}
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ backgroundColor: '#F5E6D3' }}
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch max-w-6xl mx-auto">
          {/* Left Side - Agent Photo - Animation slideLeft */}
          <div 
            className={`relative order-2 lg:order-1 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            {/* Agent Photo Container */}
            <div className="relative max-w-lg mx-auto lg:mx-0 h-full">
              <div 
                className="relative overflow-hidden h-full min-h-[400px] lg:min-h-[500px]"
                style={{ 
                  borderRadius: '28px',
                  boxShadow: '0 32px 64px rgba(82, 54, 40, 0.2)'
                }}
              >
                <img
                  src="/images/hero-controle-acces.jpg"
                  alt="Expert immobilier Mon Toit"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Gradient Overlay at bottom */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-32"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(82, 54, 40, 0.8), transparent)'
                  }}
                />

                {/* Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-bold text-lg">Nos agents sur le terrain</p>
                  <p className="text-white/80 text-sm">Vérification physique de chaque bien</p>
                </div>
              </div>
              
              {/* Floating Badge - Animation delay */}
              <div 
                className={`absolute -bottom-6 -right-6 lg:-right-10 flex items-center gap-4 p-5 transition-all duration-700 ease-out delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
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

              {/* Trust Points - Mobile only - Animation stagger */}
              <div className="mt-16 grid grid-cols-3 gap-4 lg:hidden">
                {[
                  { icon: Shield, label: '100% gratuit' },
                  { icon: Clock, label: 'Sous 24h' },
                  { icon: CheckCircle, label: 'Sans engagement' }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col items-center gap-2 text-center transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: isVisible ? `${400 + index * 100}ms` : '0ms' }}
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

          {/* Right Side - Tabs (Chat/Form) - Animation slideRight */}
          <div 
            className={`order-1 lg:order-2 transition-all duration-700 ease-out delay-100 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Header */}
            <div className="mb-6">
              <span 
                className={`inline-block px-6 py-2.5 text-sm font-semibold mb-6 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ 
                  backgroundColor: 'rgba(241, 101, 34, 0.1)',
                  color: '#F16522',
                  borderRadius: '22px',
                  transitionDelay: isVisible ? '200ms' : '0ms'
                }}
              >
                Accompagnement personnalisé
              </span>
              <h2 
                className={`font-bold mb-4 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ 
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  color: '#523628',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  transitionDelay: isVisible ? '250ms' : '0ms'
                }}
              >
                Besoin d'aide ? Choisissez votre mode de contact
              </h2>
            </div>

            {/* Trust Points - Desktop only - Animation stagger */}
            <div className="hidden lg:flex gap-6 mb-6">
              {[
                { icon: Shield, label: 'Service 100% gratuit' },
                { icon: Clock, label: 'Réponse instantanée' },
                { icon: CheckCircle, label: 'Sans engagement' }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-2 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: isVisible ? `${350 + index * 100}ms` : '0ms' }}
                >
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(46, 75, 62, 0.1)' }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: '#2E4B3E' }} />
                  </div>
                  <span style={{ color: '#737373', fontSize: '13px' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div 
              className={`transition-all duration-700 ease-out delay-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '22px',
                boxShadow: '0 20px 60px rgba(82, 54, 40, 0.1)',
                border: '1px solid rgba(82, 54, 40, 0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Tab Headers */}
              <div 
                className="flex border-b"
                style={{ borderColor: 'rgba(82, 54, 40, 0.1)' }}
              >
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all duration-300 ${
                    activeTab === 'chat' ? 'text-white' : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === 'chat' ? '#075E54' : 'transparent',
                    color: activeTab === 'chat' ? '#FFFFFF' : '#737373'
                  }}
                >
                  <Bot className="w-5 h-5" />
                  <span>Chat avec SUTA</span>
                </button>
                <button
                  onClick={() => setActiveTab('form')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 font-semibold transition-all duration-300 ${
                    activeTab === 'form' ? 'text-white' : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === 'form' ? '#F16522' : 'transparent',
                    color: activeTab === 'form' ? '#FFFFFF' : '#737373'
                  }}
                >
                  <FileText className="w-5 h-5" />
                  <span>Formulaire</span>
                </button>
              </div>

              {/* Tab Content */}
              <div style={{ height: '420px' }}>
                {activeTab === 'chat' ? (
                  <SUTAChatWidget className="h-full" />
                ) : (
                  <div className="p-6 h-full overflow-y-auto">
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
                          Demande envoyée !
                        </h3>
                        <p style={{ color: '#737373' }}>
                          Un expert vous contactera dans les 24h.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Input */}
                        <div className="relative">
                          <div 
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center"
                            style={{ 
                              backgroundColor: 'rgba(241, 101, 34, 0.1)',
                              borderRadius: '10px'
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
                            className="w-full h-14 pl-18 pr-5 bg-transparent transition-all focus:outline-none"
                            style={{ 
                              paddingLeft: '60px',
                              border: '2px solid #E5E5E5',
                              borderRadius: '14px',
                              color: '#523628',
                              fontSize: '15px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#F16522'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                          />
                        </div>

                        {/* Phone Input */}
                        <div className="relative">
                          <div 
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center"
                            style={{ 
                              backgroundColor: 'rgba(241, 101, 34, 0.1)',
                              borderRadius: '10px'
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
                            className="w-full h-14 pl-18 pr-5 bg-transparent transition-all focus:outline-none"
                            style={{ 
                              paddingLeft: '60px',
                              border: '2px solid #E5E5E5',
                              borderRadius: '14px',
                              color: '#523628',
                              fontSize: '15px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#F16522'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                          />
                        </div>

                        {/* Project Textarea */}
                        <div className="relative">
                          <div 
                            className="absolute left-4 top-4 w-10 h-10 flex items-center justify-center"
                            style={{ 
                              backgroundColor: 'rgba(241, 101, 34, 0.1)',
                              borderRadius: '10px'
                            }}
                          >
                            <MessageSquare className="w-5 h-5" style={{ color: '#F16522' }} />
                          </div>
                          <textarea
                            name="project"
                            value={formData.project}
                            onChange={handleChange}
                            placeholder="Décrivez votre projet..."
                            rows={3}
                            className="w-full pt-4 pb-4 pl-18 pr-5 bg-transparent transition-all focus:outline-none resize-none"
                            style={{ 
                              paddingLeft: '60px',
                              border: '2px solid #E5E5E5',
                              borderRadius: '14px',
                              color: '#523628',
                              fontSize: '15px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#F16522'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-14 flex items-center justify-center gap-3 font-semibold transition-all duration-300 hover:scale-[1.02] focus:outline-none disabled:opacity-70"
                          style={{ 
                            backgroundColor: '#F16522',
                            color: '#FFFFFF',
                            borderRadius: '14px',
                            boxShadow: '0 8px 24px rgba(241, 101, 34, 0.35)',
                            fontSize: '15px'
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Envoi en cours...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              <span>Contacter un expert</span>
                            </>
                          )}
                        </button>

                        {/* Privacy Note */}
                        <p 
                          className="text-center"
                          style={{ color: '#A3A3A3', fontSize: '11px' }}
                        >
                          Vos données sont protégées conformément à notre politique de confidentialité.
                        </p>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
