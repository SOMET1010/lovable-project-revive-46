import { Home, Search, PlusCircle, User, Heart, Calendar, Bell, FileText, Settings, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useState, useEffect } from 'react';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useLocation } from 'react-router-dom';
import { useUnreadCount } from '@/features/messaging/hooks/useUnreadCount';

export default function HeaderPremium() {
  const { user, profile, signOut } = useAuth();
  const { isMobile } = useBreakpoint();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { count: unreadCount } = useUnreadCount();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  // Simplified: only use user_type
  const isOwner = profile?.user_type === 'proprietaire';

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
  ];

  const userMenuItems = user ? [
    { label: 'Mon Profil', href: '/profil', icon: User },
    { label: 'Messages', href: '/messages', icon: MessageCircle, badge: unreadCount },
    { label: 'Mes Favoris', href: '/favoris', icon: Heart },
    { label: 'Mes Visites', href: '/mes-visites', icon: Calendar },
    { label: 'Mes Alertes', href: '/recherches-sauvegardees', icon: Bell },
    { label: 'Mes Contrats', href: '/mes-contrats', icon: FileText },
    { label: 'Paramètres', href: '/profil', icon: Settings },
  ] : [];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out motion-reduce:transition-none ${
          scrolled 
            ? 'bg-white shadow-md border-b border-neutral-200 backdrop-blur-md' 
            : 'bg-white/95 border-b border-neutral-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-3 group">
              <img
                src="/logo-montoit.png"
                alt="Mon Toit"
                className="h-10 w-10 object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 motion-reduce:transform-none"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-neutral-900 transition-colors duration-200 group-hover:text-primary-500">Mon Toit</span>
                {!isMobile && (
                  <span className="text-xs text-neutral-500 font-medium">Plateforme Immobilière</span>
                )}
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="/"
                className={`font-medium transition-all duration-200 relative group py-2 hover:-translate-y-0.5 motion-reduce:transform-none ${
                  isActive('/') ? 'text-primary-500' : 'text-neutral-700 hover:text-primary-500'
                }`}
              >
                Accueil
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform origin-left transition-transform duration-300 ease-out motion-reduce:transition-none ${
                  isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </a>

              {mainNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`font-medium transition-all duration-200 relative group py-2 hover:-translate-y-0.5 motion-reduce:transform-none ${
                    isActive(item.href) ? 'text-primary-500' : 'text-neutral-700 hover:text-primary-500'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {item.label}
                  </span>
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform origin-left transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Message Badge - WhatsApp Style */}
              {user && (
                <a
                  href="/messages"
                  className={`relative p-2 rounded-lg transition-all duration-200 hover:bg-neutral-100 ${
                    isActive('/messages') ? 'bg-neutral-100' : ''
                  }`}
                  aria-label={`Messages${unreadCount > 0 ? `, ${unreadCount} non lus` : ''}`}
                >
                  <MessageCircle className={`h-6 w-6 ${isActive('/messages') ? 'text-primary-500' : 'text-neutral-600'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-[#25D366] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md whatsapp-badge-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </a>
              )}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none"
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
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-500 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <span className="bg-[#25D366] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
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
                    className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:border-neutral-400 hover:bg-neutral-50 hover:-translate-y-0.5 transition-all duration-200 motion-reduce:transform-none"
                  >
                    Connexion
                  </a>
                  <a 
                    href="/inscription" 
                    className="px-5 py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none"
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

      {/* Spacer */}
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
          <div className="flex justify-end">
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {user && (
            <div className="pb-4 border-b border-neutral-200">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {profile?.full_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          )}

          <nav className="space-y-1">
            <a
              href="/"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-r-lg transition-colors ${
                isActive('/') 
                  ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500' 
                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-500'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Accueil</span>
            </a>

            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-r-lg transition-colors ${
                  isActive(item.href) 
                    ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500' 
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-500'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}

            {user && userMenuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-r-lg transition-colors ${
                  isActive(item.href) 
                    ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500' 
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-[#25D366] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

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
