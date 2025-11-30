import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, Menu, X, User, LogOut, Heart, Calendar, 
  FileText, MessageCircle, PlusCircle, Shield, ChevronDown,
  Building2, Award
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useMessageNotifications } from '@/features/messaging';

export default function HeaderAfricanPremium() {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useMessageNotifications();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isOwner = profile?.user_type === 'proprietaire' || profile?.active_role === 'proprietaire';
  const isAgency = profile?.user_type === 'agence';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Accueil', href: '/', icon: Home },
    { label: 'Rechercher', href: '/recherche', icon: Search },
    ...(user && (isOwner || isAgency) ? [{ label: 'Publier', href: '/ajouter-propriete', icon: PlusCircle }] : []),
    ...(user ? [{ label: 'Messages', href: '/messages', icon: MessageCircle, badge: unreadCount }] : []),
  ];

  const userMenuItems = [
    { label: 'Mon Profil', href: '/profil', icon: User },
    { label: 'Mes Favoris', href: '/favoris', icon: Heart },
    { label: 'Mes Visites', href: '/mes-visites', icon: Calendar },
    { label: 'Mes Contrats', href: '/mes-contrats', icon: FileText },
    ...(profile?.user_type === 'locataire' ? [{ label: 'Mon Score', href: '/locataire/score', icon: Award }] : []),
    ...(isOwner || isAgency ? [{ label: 'Mes Propriétés', href: '/proprietaire/mes-proprietes', icon: Building2 }] : []),
    { label: 'Vérification ANSUT', href: '/verification', icon: Shield },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'glass-african shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      {/* Subtle Kente Pattern */}
      <div className="absolute inset-0 pattern-kente opacity-30 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with Sunrise Animation */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/logo-montoit.png"
                alt="Mon Toit"
                className="h-12 w-12 animate-sunrise-glow transition-transform duration-300 group-hover:scale-110"
              />
              {/* Golden Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-gradient-african">Mon Toit</span>
              <span className={`text-xs transition-colors duration-300 ${isScrolled ? 'text-gray-600' : 'text-gray-500'}`}>
                Plateforme Immobilière
              </span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2.5 rounded-xl
                    font-medium transition-all duration-300
                    link-underline-animate
                    animate-slide-reveal stagger-delay-${index + 1}
                    ${isActive 
                      ? 'text-orange-600 bg-orange-50' 
                      : `${isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-700 hover:text-orange-500'} hover:bg-orange-50/50`
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span>{item.label}</span>
                  
                  {/* Badge for notifications */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full animate-badge-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            
            {/* ANSUT Certified Badge */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full animate-badge-pulse">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700">Certifié ANSUT</span>
            </div>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl
                    font-medium transition-all duration-300 btn-ripple
                    ${isScrolled ? 'bg-orange-50 text-orange-700' : 'bg-white/90 text-gray-700'}
                    hover:bg-orange-100 hover:shadow-md
                  `}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-terracotta-gold flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden lg:inline max-w-24 truncate">
                    {profile?.full_name?.split(' ')[0] || 'Compte'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 glass-african rounded-2xl shadow-2xl border border-orange-100 py-2 animate-scale-bounce overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
                      <p className="font-semibold text-gray-900 truncate">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {userMenuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-orange-100 pt-2">
                      <button
                        onClick={() => signOut()}
                        className="flex items-center space-x-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/connexion"
                  className={`
                    px-4 py-2 rounded-xl font-medium transition-all duration-300
                    ${isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-700 hover:text-orange-500'}
                  `}
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="px-5 py-2.5 bg-gradient-terracotta-gold text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-ripple"
                >
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-orange-50 transition-colors"
              aria-label="Menu"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 glass-african rounded-2xl shadow-2xl border border-orange-100 overflow-hidden animate-scale-bounce">
            <div className="p-4 space-y-2">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl
                      font-medium transition-all duration-200
                      ${isActive ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-orange-50'}
                    `}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* User Menu in Mobile */}
              {user && (
                <>
                  <div className="border-t border-orange-100 my-2 pt-2">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase">Mon Compte</p>
                  </div>
                  {userMenuItems.slice(0, 4).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-xl transition-all"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => { signOut(); setShowMobileMenu(false); }}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Déconnexion</span>
                  </button>
                </>
              )}

              {/* Auth Buttons Mobile */}
              {!user && (
                <div className="border-t border-orange-100 pt-4 mt-4 flex flex-col space-y-2">
                  <Link
                    to="/connexion"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full py-3 text-center font-medium text-gray-700 hover:text-orange-600 rounded-xl border border-gray-200 hover:border-orange-300 transition-all"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full py-3 text-center font-semibold text-white bg-gradient-terracotta-gold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
