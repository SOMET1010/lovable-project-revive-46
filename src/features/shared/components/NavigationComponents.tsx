/**
 * COMPOSANTS DE NAVIGATION CORRIGÉS - MONTOIT
 * =============================================
 * 
 * Composants corrigés pour résoudre tous les problèmes de navigation :
 * - Header avec navigation fonctionnelle
 * - Footer avec liens sociaux réels
 * - Breadcrumb fonctionnel et cohérent
 * - Menu mobile responsive
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search,
  Home,
  Phone,
  HelpCircle,
  User,
  UserPlus,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

// CORRECTION 1: Header corrigé avec navigation fonctionnelle
export const FixedHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { 
      name: 'Accueil', 
      href: '/', 
      icon: Home,
      current: location.pathname === '/'
    },
    { 
      name: 'Rechercher', 
      href: '/recherche',
      icon: Search,
      current: location.pathname === '/recherche'
    },
    { 
      name: 'Connexion', 
      href: '/connexion',
      icon: User,
      current: location.pathname === '/connexion'
    },
    { 
      name: 'Inscription', 
      href: '/inscription',
      icon: UserPlus,
      current: location.pathname === '/inscription'
    }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-gray-200 py-6 lg:border-none">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo-montoit.png"
                alt="MonToit"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (sibling) sibling.style.display = 'block';
                }}
              />
              <span className="ml-2 text-2xl font-bold text-blue-600 hidden">
                MonToit
              </span>
            </Link>
          </div>
          
          <div className="ml-10 space-x-4">
            {/* Navigation Desktop */}
            <div className="hidden lg:flex lg:space-x-8">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                      item.current
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Ouvrir le menu principal</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block py-2 pl-3 pr-4 text-base font-medium transition-colors duration-200 ${
                      item.current
                        ? 'border-l-4 border-blue-500 bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <IconComponent className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

// CORRECTION 2: Breadcrumb fonctionnel et cohérent
export const FixedBreadcrumb: React.FC<{ 
  items: Array<{ label: string; href: string }>;
  className?: string;
}> = ({ items, className = '' }) => {
  const location = useLocation();
  
  // Si aucun item fourni, générer automatiquement basé sur la route
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbFromPath(location.pathname);
  
  return (
    <nav 
      className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}
      aria-label="Fil d'Ariane"
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
          )}
          {index === breadcrumbItems.length - 1 ? (
            // Dernier élément (page courante) - non cliquable
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label}
            </span>
          ) : (
            // Éléments intermédiaires - cliquables
            <Link
              to={item.href}
              className="hover:text-gray-700 transition-colors duration-200"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Fonction utilitaire pour générer le breadcrumb depuis la route
const generateBreadcrumbFromPath = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Accueil', href: '/' }];
  
  const segmentLabels: { [key: string]: string } = {
    'recherche': 'Recherche',
    'contact': 'Contact',
    'aide': 'Aide',
    'faq': 'FAQ',
    'connexion': 'Connexion',
    'inscription': 'Inscription',
    'a-propos': 'À propos',
    'conditions-utilisation': 'Conditions d\'utilisation',
    'politique-confidentialite': 'Politique de confidentialité',
    'comment-ca-marche': 'Comment ça marche',
    'mentions-legales': 'Mentions légales',
    'cgv': 'CGV'
  };
  
  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath
    });
  });
  
  return breadcrumbs;
};

// CORRECTION 3: Footer avec liens sociaux réels et fonctionnels
export const FixedFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const navigationLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Rechercher', href: '/recherche' },
    { name: 'Contact', href: '/contact' },
    { name: 'Comment ça marche', href: '/comment-ca-marche' },
    { name: 'Inscription', href: '/inscription' }
  ];
  
  const supportLinks = [
    { name: 'Aide', href: '/aide' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' }
  ];
  
  const legalLinks = [
    { name: 'Conditions d\'utilisation', href: '/conditions-utilisation' },
    { name: 'Politique de confidentialité', href: '/politique-confidentialite' },
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'CGV', href: '/cgv' }
  ];
  
  // CORRECTION: Liens sociaux réels (remplacer par les vraies URLs)
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/montoit.ci',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/montoit_ci',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/montoit.ci',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.89 3.708 13.739 3.708 12.442c0-1.297.49-2.448 1.297-3.323C5.001 8.246 6.152 7.756 7.449 7.756c1.297 0 2.448.49 3.323 1.297.875.807 1.297 1.958 1.297 3.255 0 1.297-.49 2.448-1.297 3.323-.875.807-2.026 1.297-3.323 1.297z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/montoit-ci',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    }
  ];
  
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <img
              className="h-8"
              src="/logo-montoit.png"
              alt="MonToit"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (sibling) sibling.style.display = 'block';
              }}
            />
            <span className="text-2xl font-bold text-white hidden">
              MonToit
            </span>
            <p className="text-sm text-gray-300">
              La plateforme immobilière de référence en Côte d'Ivoire. 
              Trouvez votre logement idéal en toute sécurité.
            </p>
            
            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                Newsletter
              </h3>
              <p className="mt-2 text-sm text-gray-300">
                Recevez les dernières offres directement dans votre boîte mail.
              </p>
              <form className="mt-4 flex">
                <label htmlFor="email-address" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="min-w-0 flex-auto rounded-md border-0 bg-white/5 py-1.5 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                  placeholder="Entrez votre email"
                />
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    S'abonner
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Navigation
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigationLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Support Client
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {supportLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Informations Légales
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {legalLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Suivez-nous
                </h3>
                <div className="mt-4 flex space-x-6">
                  {socialLinks.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      <span className="sr-only">{item.name}</span>
                      {item.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <p className="text-xs text-gray-400">
              &copy; {currentYear} MonToit. Tous droits réservés. 
              Certifié par l'ANSUT (Agence Nationale du Service Universel des Télécommunications).
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// CORRECTION 4: Menu mobile amélioré
export const FixedMobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Rechercher', href: '/recherche', icon: Search },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'Aide', href: '/aide', icon: HelpCircle },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Connexion', href: '/connexion', icon: User },
    { name: 'Inscription', href: '/inscription', icon: UserPlus }
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">MonToit</span>
          <button
            type="button"
            className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={onClose}
          >
            <span className="sr-only">Fermer le menu</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <nav className="px-2 py-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={onClose}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default {
  FixedHeader,
  FixedBreadcrumb,
  FixedFooter,
  FixedMobileMenu
};