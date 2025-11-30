<<<<<<< HEAD
import React from 'react';
import { 
  Bell, 
  Menu, 
  Settings, 
  Award,
  Building,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface AgencyHeaderProps {
  agencyName: string;
  userName: string;
  userAvatar?: string;
  userRole: 'director' | 'manager' | 'agent';
  roleInfo: {
    style: string;
    label: string;
  };
  notifications: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  onMenuClick: () => void;
}

const AgencyHeader: React.FC<AgencyHeaderProps> = ({
  agencyName,
  userName,
  userAvatar,
  userRole,
  roleInfo,
  notifications,
  onMenuClick
}) => {
  const unreadNotifications = notifications.filter(n => n.priority === 'high').length;
  
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo et titre */}
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex items-center">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-neutral-900">
                    {agencyName}
                  </h1>
                  <p className="text-sm text-neutral-700">
                    Plateforme de Gestion Immobilière
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-semantic-error rounded-full"></span>
                )}
              </button>
            </div>

            {/* Agency Status */}
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Agence Active</span>
              </div>
            </div>

            {/* Role Badge */}
            <div className="hidden sm:block">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.style}`}>
                <Award className="w-3 h-3 mr-1" />
                {roleInfo.label}
              </span>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-neutral-900">{userName}</p>
                <p className="text-xs text-neutral-700">{roleInfo.label} {agencyName}</p>
              </div>
              
              <div className="relative">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-neutral-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center border-2 border-neutral-200">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                
                {/* Status indicator */}
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-semantic-success border-2 border-white rounded-full"></div>
              </div>
            </div>

            {/* Settings */}
            <button className="p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <Settings className="w-5 h-5" />
            </button>
=======
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
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
          </div>
        </div>
      </div>
    </header>
  );
<<<<<<< HEAD
};

export default AgencyHeader;
=======
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
