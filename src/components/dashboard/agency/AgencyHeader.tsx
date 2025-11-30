/**
 * Agency Header - En-tête du dashboard agence
 */

import { useState } from 'react';
import { Badge } from '../../ui/Badge';

interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  description: string;
  rating: number;
  totalReviews: number;
}

interface AgencyHeaderProps {
  agency?: Agency;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function AgencyHeader({ agency, onToggleSidebar, sidebarCollapsed }: AgencyHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    {
      id: '1',
      type: 'nouveau_client',
      message: 'Nouveau prospect : Michel Kouassi',
      time: 'Il y a 5 min',
      unread: true,
    },
    {
      id: '2',
      type: 'vente_finalisee',
      message: 'Vente finalisée - Villa Cocody',
      time: 'Il y a 1h',
      unread: true,
    },
    {
      id: '3',
      type: 'rappel_visite',
      message: 'Rappel : Visite programmée à 14h',
      time: 'Il y a 2h',
      unread: false,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background-page/95 backdrop-blur-xl border-b border-neutral-100">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section - Logo and toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg text-text-primary">Dashboard Agence</h1>
              {agency && (
                <p className="text-sm text-text-secondary">{agency.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Notifications and profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors relative"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              {notifications.some(n => n.unread) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-semantic-error rounded-full"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-background-page rounded-xl shadow-lg border border-neutral-100 z-50">
                <div className="p-4 border-b border-neutral-100">
                  <h3 className="font-semibold text-text-primary">Notifications équipe</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer ${
                        notification.unread ? 'bg-primary-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.unread ? 'bg-primary-500' : 'bg-neutral-300'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary">{notification.message}</p>
                          <p className="text-xs text-text-secondary mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-neutral-100">
                  <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-text-primary">
                  {agency?.name || 'Agence'}
                </p>
                <p className="text-xs text-text-secondary">
                  {agency?.totalReviews} avis
                </p>
              </div>
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-background-page rounded-xl shadow-lg border border-neutral-100 z-50">
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text-primary">{agency?.name}</h4>
                      <p className="text-sm text-text-secondary">{agency?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-secondary">⭐ {agency?.rating}</span>
                        <span className="text-xs text-text-secondary">({agency?.totalReviews} avis)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                    <span className="text-sm text-text-primary">⚙️ Paramètres agence</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                    <span className="text-sm text-text-primary">📊 Rapports</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
                    <span className="text-sm text-text-primary">💬 Support</span>
                  </button>
                  <hr className="my-2 border-neutral-100" />
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-semantic-error">
                    <span className="text-sm">🚪 Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}