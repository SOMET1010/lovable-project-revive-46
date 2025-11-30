/**
 * Admin Header - En-tête administrateur avec accès admin et notifications système
 */

import { useState } from 'react';

interface AdminHeaderProps {
  admin?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    permissions: string[];
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function AdminHeader({ admin, alerts, onToggleSidebar, sidebarCollapsed }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
  const recentAlerts = alerts.slice(0, 5);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-semantic-error bg-red-50 border-red-200';
      case 'high': return 'text-semantic-error bg-orange-50 border-orange-200';
      case 'medium': return 'text-semantic-warning bg-yellow-50 border-yellow-200';
      case 'low': return 'text-semantic-info bg-blue-50 border-blue-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `il y a ${minutes}min`;
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${days}j`;
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-background-page border-b border-neutral-100 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section - Toggle + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-h5 font-bold text-text-primary">Panel Administrateur</h1>
              <p className="text-xs text-neutral-500">MONTOITVPROD - Contrôle système</p>
            </div>
          </div>
        </div>

        {/* Right section - Status + Notifications + Profile */}
        <div className="flex items-center gap-4">
          {/* System Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-success-50 border border-success-200 rounded-lg">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-success-700">Système Opérationnel</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Notifications"
            >
              <svg className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a2 2 0 01-2-2V9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2z" />
              </svg>
              {criticalAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-semantic-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                  {criticalAlerts.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-background-page rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <h3 className="text-h6 font-semibold text-text-primary">Notifications Système</h3>
                  <p className="text-sm text-neutral-500">{alerts.length} alertes actives</p>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {recentAlerts.length > 0 ? (
                    recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`px-4 py-3 border-l-4 ${getAlertColor(alert.severity)} hover:bg-neutral-50 transition-colors cursor-pointer`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getAlertIcon(alert.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {alert.message}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {formatTime(alert.timestamp)}
                            </p>
                          </div>
                          <span className={`
                            px-2 py-1 text-xs font-semibold rounded-full
                            ${alert.severity === 'critical' ? 'bg-semantic-error text-white' :
                              alert.severity === 'high' ? 'bg-semantic-error text-white' :
                              alert.severity === 'medium' ? 'bg-semantic-warning text-white' :
                              'bg-semantic-info text-white'}
                          `}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-neutral-500">
                      <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">Aucune notification récente</p>
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-2 border-t border-neutral-100">
                  <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                {admin?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text-primary">{admin?.full_name || 'Admin'}</p>
                <p className="text-xs text-neutral-500">{admin?.role || 'Administrateur'}</p>
              </div>
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-background-page rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="font-semibold text-text-primary">{admin?.full_name || 'Admin Système'}</p>
                  <p className="text-sm text-neutral-500">{admin?.email || 'admin@montoitvprod.com'}</p>
                  <p className="text-xs text-primary-600 mt-1">{admin?.role || 'Super Admin'}</p>
                </div>
                
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-text-primary">Mon Profil</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-text-primary">Paramètres</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm text-text-primary">Sécurité</span>
                    </div>
                  </button>
                </div>
                
                <div className="px-4 py-2 border-t border-neutral-100">
                  <button className="w-full text-left px-4 py-2 hover:bg-neutral-50 transition-colors text-semantic-error">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Déconnexion</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {(showNotifications || showProfile) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
}