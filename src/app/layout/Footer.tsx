import { Mail, Phone, MapPin, Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-16">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-8">
              <img
                src="/logo.png"
                alt="Mon Toit Logo"
                className="h-14 w-14 object-contain"
              />
              <span className="text-2xl font-bold tracking-wide">MON TOIT</span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-8 max-w-sm">
              Plateforme immobilière pour un accès universel au logement en Côte d'Ivoire. 
              Signature électronique certifiée et sécurisée.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors duration-200 group">
                <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors duration-200 group">
                <Twitter className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors duration-200 group">
                <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors duration-200 group">
                <Linkedin className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Liens */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-8 tracking-wide">LIENS</h3>
            <ul className="space-y-4">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors duration-200 block">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/recherche" className="text-gray-300 hover:text-white transition-colors duration-200 block">
                  Rechercher
                </a>
              </li>
              <li>
                <a href="/a-propos" className="text-gray-300 hover:text-white transition-colors duration-200 block">
                  À propos
                </a>
              </li>
              <li>
                <a href="/aide" className="text-gray-300 hover:text-white transition-colors duration-200 block">
                  Aide
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 block">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-8 tracking-wide">CONTACT</h3>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 flex items-center justify-center mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-300">Email</p>
                  <a href="mailto:contact@mon-toit.ci" className="text-white hover:text-gray-200 transition-colors duration-200">
                    contact@mon-toit.ci
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 flex items-center justify-center mt-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-300">Téléphone</p>
                  <p className="text-gray-400 italic">Numéro disponible prochainement</p>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="w-6 h-6 flex items-center justify-center mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-300">Localisation</p>
                  <p className="text-white">Abidjan, Côte d'Ivoire</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-8 tracking-wide">LÉGAL</h3>
            <ul className="space-y-4">
              <li>
                <a href="/conditions-utilisation" className="text-gray-300 hover:text-white transition-colors duration-200 block">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="/politique-confidentialite" className="text-gray-300 hover:text-white transition-colors duration-200 block">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/mentions-legales" className="text-gray-300 hover:text-white transition-colors duration-200 block">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 pt-12">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-gray-400">
                &copy; 2025 <span className="text-white font-semibold">Mon Toit</span> - Tous droits réservés.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">Fait avec</span>
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-gray-400">pour l'accès universel au logement</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
