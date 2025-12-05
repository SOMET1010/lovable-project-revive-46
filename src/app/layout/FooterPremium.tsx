import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';
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
    <footer className="bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/logo-montoit.png"
                alt="Mon Toit Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-white">Mon Toit</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              Plateforme immobilière certifiée pour un accès universel au logement en Côte d'Ivoire.
            </p>
            
            {/* Social Icons Simple */}
            <div className="flex items-center space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-primary-500 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-primary-500 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-primary-500 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-primary-500 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
              Liens rapides
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Accueil', href: '/' },
                { label: 'Rechercher', href: '/recherche' },
                { label: 'À propos', href: '/a-propos' },
                { label: 'Comment ça marche', href: '/comment-ca-marche' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
              Légal
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Conditions d'utilisation", href: '/conditions-utilisation' },
                { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
                { label: 'Mentions légales', href: '/mentions-legales' },
                { label: 'CGV', href: '/cgv' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
              Newsletter
            </h3>
            <p className="text-sm text-neutral-400 mb-4">
              Recevez nos dernières offres et actualités
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors duration-200"
              />
              <button
                type="submit"
                className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 ${
                  subscribed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>{subscribed ? 'Inscrit !' : "S'inscrire"}</span>
              </button>
            </form>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <a 
                  href={`tel:${CONTACT.PHONE}`}
                  className="text-neutral-400 hover:text-primary-500 transition-colors"
                >
                  {CONTACT.PHONE_DISPLAY}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <a 
                  href={`mailto:${CONTACT.EMAIL}`}
                  className="text-neutral-400 hover:text-primary-500 transition-colors"
                >
                  {CONTACT.EMAIL}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <span className="text-neutral-400">{CONTACT.ADDRESS}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Mon Toit. Tous droits réservés.
            </p>
            
            <div className="flex items-center space-x-6">
              {[
                { label: 'Aide', href: '/aide' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Blog', href: '/blog' },
              ].map((link) => (
                <Link 
                  key={link.label}
                  to={link.href} 
                  className="text-sm text-neutral-500 hover:text-primary-500 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Badge ANSUT Simple */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-800 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-neutral-400">Certifié ANSUT</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}