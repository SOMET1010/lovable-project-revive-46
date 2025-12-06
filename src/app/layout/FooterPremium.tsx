import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT } from '@/shared/constants/contact';

export default function FooterPremium() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="relative bg-[#2C1810] text-[#E8D4C5] overflow-hidden pt-20 pb-10">
      
      {/* Texture de fond Premium */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/images/pattern-topo.svg')] bg-repeat pointer-events-none" />
      
      {/* Lueur d'ambiance Orange */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#F16522]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Grille 4 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#F16522]">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Mon Toit</span>
              </div>
            </Link>
            <p className="text-[#E8D4C5]/70 text-sm leading-relaxed max-w-xs">
              La première plateforme immobilière certifiée en Côte d'Ivoire. 
              Accès universel, transparent et sécurisé au logement.
            </p>
            
            {/* Réseaux Sociaux */}
            <div className="flex gap-4">
              {[
                { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a 
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#F16522] transition-all duration-300 border border-white/10 hover:border-[#F16522] group"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-[#E8D4C5] group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Liens Rapides</h3>
            <ul className="space-y-4">
              {[
                { label: 'Accueil', href: '/' },
                { label: 'Rechercher un bien', href: '/recherche' },
                { label: 'À propos', href: '/a-propos' },
                { label: 'Comment ça marche', href: '/comment-ca-marche' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-[#E8D4C5]/70 hover:text-[#F16522] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#F16522] transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Légal</h3>
            <ul className="space-y-4">
              {[
                { label: "Conditions d'utilisation", href: '/conditions-utilisation' },
                { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
                { label: 'Mentions légales', href: '/mentions-legales' },
                { label: 'CGV', href: '/cgv' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-[#E8D4C5]/70 hover:text-[#F16522] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Restez informé</h3>
            <p className="text-[#E8D4C5]/70 text-sm mb-4">
              Recevez nos dernières offres exclusives.
            </p>
            
            {/* Input Newsletter Premium */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-3 mb-8">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#E8D4C5]/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#E8D4C5]/30 focus:outline-none focus:border-[#F16522] focus:ring-1 focus:ring-[#F16522] transition-all"
                />
              </div>
              <button
                type="submit"
                className={`w-full rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition-all duration-300 group ${
                  subscribed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#F16522] hover:bg-[#d95a1d] text-white shadow-lg shadow-[#F16522]/20 hover:shadow-[#F16522]/40'
                }`}
              >
                <span>{subscribed ? 'Inscrit !' : "S'inscrire"}</span>
                {!subscribed && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {/* Infos Contact */}
            <div className="space-y-3 pt-6 border-t border-white/10">
              <a 
                href={`tel:${CONTACT.PHONE}`}
                className="flex items-center gap-3 text-[#E8D4C5]/80 hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-[#F16522]" />
                {CONTACT.PHONE_DISPLAY}
              </a>
              <a 
                href={`mailto:${CONTACT.EMAIL}`}
                className="flex items-center gap-3 text-[#E8D4C5]/80 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-[#F16522]" />
                {CONTACT.EMAIL}
              </a>
              <div className="flex items-center gap-3 text-[#E8D4C5]/80 text-sm">
                <MapPin className="w-4 h-4 text-[#F16522]" />
                {CONTACT.ADDRESS}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#E8D4C5]/40">
          <p>© {new Date().getFullYear()} Mon Toit. Tous droits réservés.</p>
          
          <div className="flex items-center gap-6">
            {[
              { label: 'Aide', href: '/aide' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Blog', href: '/blog' },
            ].map((link) => (
              <Link 
                key={link.label}
                to={link.href} 
                className="hover:text-[#F16522] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Badge Certifié */}
        <div className="mt-6 flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-[#E8D4C5]/70">Service Opérationnel</span>
          </div>
          <span className="text-xs text-[#E8D4C5]/40">Fait avec ♥ à Abidjan</span>
        </div>
      </div>
    </footer>
  );
}
