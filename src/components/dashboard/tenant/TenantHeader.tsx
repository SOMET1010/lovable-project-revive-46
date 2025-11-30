/**
 * Tenant Header - En-tête du dashboard avec navigation et profil utilisateur
 */

import { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
}

interface TenantHeaderProps {
  user?: User;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function TenantHeader({ user, onToggleSidebar, sidebarCollapsed }: TenantHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la recherche
    console.log('Recherche:', searchQuery);
  };

  const notifications = [
    {
      id: '1',
      title: 'Nouvelle visite confirmée',
      message: 'Votre visite pour l\'appartement Cocody est confirmée',
      time: 'Il y a 2h',
      read: false,
    },
    {
      id: '2',
      title: 'Candidature acceptée',
      message: 'Félicitations ! Votre candidature a été acceptée',
      time: 'Hier',
      read: false,
    },
    {
      id: '3',
      title: 'Nouveau message',
      message: 'Vous avez reçu un message du propriétaire',
      time: 'Il y a 3 jours',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-fixed bg-background-page/95 backdrop-blur-xl border-b border-neutral-100 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Section gauche - Logo et navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="small"
            onClick={onToggleSidebar}
            className="p-2"
            aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden sm:block">
            <h1 className="text-h5 font-bold text-text-primary">
              Mon Dashboard
            </h1>
          </div>
        </div>

        {/* Section centre - Barre de recherche */}
        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une propriété..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl 
                         text-body text-text-primary placeholder-text-disabled
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-disabled" />
          </form>
        </div>

        {/* Section droite - Notifications et profil */}
        <div className="flex items-center gap-3">
          {/* Rechercher mobile */}
          <Button
            variant="ghost"
            size="small"
            className="p-2 md:hidden"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="small"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-semantic-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Menu des notifications */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-background-page rounded-xl shadow-elevated border border-neutral-100 z-popover">
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-text-secondary">
                        {unreadCount} non lues
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-primary-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          !notification.read ? 'bg-primary-500' : 'bg-neutral-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-primary text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-text-secondary mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-text-disabled mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-neutral-100">
                  <Button variant="ghost" size="small" className="w-full text-primary-500">
                    Voir toutes les notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Profil utilisateur */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-500" />
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="font-medium text-text-primary text-sm">
                  {user?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-text-secondary">
                  Locataire
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-text-secondary hidden sm:block" />
            </button>

            {/* Menu utilisateur */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-background-page rounded-xl shadow-elevated border border-neutral-100 z-popover">
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-text-primary">
                        {user?.full_name || 'Utilisateur'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                    <User className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-text-primary">Mon profil</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left">
                    <Settings className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-text-primary">Paramètres</span>
                  </button>
                  <hr className="my-2 border-neutral-100" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors text-left text-semantic-error">
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer les menus en mobile */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-popover bg-black/20" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}