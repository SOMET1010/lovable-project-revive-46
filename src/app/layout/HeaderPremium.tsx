import { Home, Search, PlusCircle, MessageCircle, User, Heart, Calendar, Bell, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useMessageNotifications } from '@/features/messaging';
import { useState, useEffect } from 'react';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

export default function HeaderPremium() {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useMessageNotifications();
  const { isMobile } = useBreakpoint();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isOwner = profile?.user_type === 'proprietaire' || profile?.active_role === 'proprietaire';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainNavItems = [
    { label: 'Rechercher', href: '/recherche', icon: Search },
    ...(user && isOwner ? [{ label: 'Publier', href: '/ajouter-propriete', icon: PlusCircle }] : []),
    ...(user ? [{ label: 'Messages', href: '/messages', icon: MessageCircle, badge: unreadCount }] : []),
  ];

  const userMenuItems = user ? [
    { label: 'Mon Profil', href: '/profil', icon: User },
    { label: 'Mes Favoris', href: '/favoris', icon: Heart },
    { label: 'Mes Visites', href: '/mes-visites', icon: Calendar },
    { label: 'Mes Alertes', href: '/recherches-sauvegardees', icon: Bell },
    { label: 'Mes Contrats', href: '/mes-contrats', icon: FileText },
    { label: 'Paramètres', href: '/profil', icon: Settings },
  ] : [];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-200 ${
          scrolled ? 'shadow-sm border-b border-neutral-200' : 'border-b border-neutral-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo Minimaliste */}
            <a href="/" className="flex items-center space-x-3 group">
              <img
                src="/logo-montoit.png"
                alt="Mon Toit"
                className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-neutral-900">Mon Toit</span>
                {!isMobile && (
                  <span className="text-xs text-neutral-500 font-medium">Plateforme Immobilière</span>
                )}
              </div>
            </a>

            {/* Desktop Navigation Minimaliste */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="/"
                className="text-neutral-700 hover:text-primary-500 font-medium transition-colors duration-200 relative group"
              >
                Accueil
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-200 group-hover:w-full" />
              </a>

              {mainNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-neutral-700 hover:text-primary-500 font-medium transition-colors duration-200 relative group"
                >
                  <span className="flex items-center gap-1">
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-200 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Actions Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span>Mon Compte</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {profile?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>

                      {userMenuItems.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-500 transition-colors duration-150"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </a>
                      ))}

                      <div className="border-t border-neutral-100 mt-2 pt-2">
                        <button
                          onClick={signOut}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <a 
                    href="/connexion" 
                    className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200"
                  >
                    Connexion
                  </a>
                  <a 
                    href="/inscription" 
                    className="px-5 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors duration-200"
                  >
                    Inscription
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors duration-200"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[72px]" />

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-out md:hidden ${
          showMobileMenu ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info Mobile */}
          {user && (
            <div className="pb-4 border-b border-neutral-200">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {profile?.full_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          )}

          {/* Navigation Mobile */}
          <nav className="space-y-1">
            <a
              href="/"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-neutral-50 hover:text-primary-500 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Accueil</span>
            </a>

            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-neutral-50 hover:text-primary-500 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </a>
            ))}

            {user && userMenuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-neutral-700 hover:bg-neutral-50 hover:text-primary-500 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Actions Mobile */}
          <div className="pt-4 border-t border-neutral-200 space-y-3">
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setShowMobileMenu(false);
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            ) : (
              <>
                <a
                  href="/connexion"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors font-medium"
                >
                  Connexion
                </a>
                <a
                  href="/inscription"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium"
                >
                  Inscription
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
