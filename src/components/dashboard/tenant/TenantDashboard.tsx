import React, { useState } from 'react';
import {
  Home,
  User,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  UserCircle,
  ChevronDown,
  MessageSquare,
  Calendar,
  Building,
  Heart,
  Star,
  Bell as NotificationIcon
} from 'lucide-react';
import TenantApplicationsSection from './sections/TenantApplicationsSection';

interface TenantDashboardProps {
  tenantId: number;
  tenantName: string;
  onLogout?: () => void;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({
  tenantId,
  tenantName,
  onLogout
}) => {
  const [activeSection, setActiveSection] = useState('applications');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: 'status',
      title: 'Candidature acceptée',
      message: 'Votre candidature pour Villa Bellevue a été acceptée!',
      date: '2025-11-29',
      read: false
    },
    {
      id: 2,
      type: 'document',
      title: 'Documents manquants',
      message: 'Veuillez compléter vos documents pour Appartement Riviera',
      date: '2025-11-28',
      read: false
    }
  ]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'applications', label: 'Mes Candidatures', icon: FileText, count: 4 },
    { id: 'properties', label: 'Propriétés Favorites', icon: Heart, count: 8 },
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: 2 },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'applications':
        return (
          <TenantApplicationsSection
            tenantId={tenantId}
            tenantName={tenantName}
          />
        );
      case 'properties':
        return (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Propriétés Favorites</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      case 'profile':
        return (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Mon Profil</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      case 'messages':
        return (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Messages</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Calendrier</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Paramètres</h3>
            <p className="text-neutral-600">Fonctionnalité à venir</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center ml-4 lg:ml-0">
              <Home className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-neutral-900">LocatHub</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-3 p-2 hover:bg-neutral-100 rounded-lg">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {tenantName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900">{tenantName}</p>
                  <p className="text-xs text-neutral-500">Locataire</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* User Info */}
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">
                    {tenantName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">{tenantName}</h2>
                  <p className="text-sm text-neutral-600">Locataire</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                          activeSection === item.id
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="flex-1">{item.label}</span>
                        {item.count && (
                          <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${
                            activeSection === item.id
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Besoin d'aide?</h3>
                <p className="text-xs text-blue-700 mb-3">
                  Consultez notre guide ou contactez le support.
                </p>
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Centre d'aide
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantDashboard;