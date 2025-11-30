import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Info,
  Crown
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'payment' | 'maintenance' | 'tenant' | 'vacant';
  title: string;
  message: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

interface OwnerHeaderProps {
  userName: string;
  userAvatar?: string;
  ownerLevel?: 'particulier' | 'professionnel' | 'expert';
  notifications?: Notification[];
  onMenuClick: () => void;
}

const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  userName,
  userAvatar = "/images/owner-avatar.jpg",
  ownerLevel = "professionnel",
  notifications = [],
  onMenuClick
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') return <AlertCircle className="w-4 h-4 text-semantic-error" />;
    
    switch (type) {
      case 'payment':
        return <CheckCircle className="w-4 h-4 text-semantic-success" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-semantic-warning" />;
      case 'tenant':
        return <Info className="w-4 h-4 text-semantic-info" />;
      case 'vacant':
        return <AlertCircle className="w-4 h-4 text-semantic-warning" />;
      default:
        return <Info className="w-4 h-4 text-semantic-info" />;
    }
  };

  const getOwnerLevelBadge = (level: string) => {
    const levelConfig = {
      particulier: { label: 'Particulier', color: 'bg-blue-100 text-blue-800' },
      professionnel: { label: 'Professionnel', color: 'bg-purple-100 text-purple-800' },
      expert: { label: 'Expert', color: 'bg-amber-100 text-amber-800' }
    };
    
    const config = levelConfig[level as keyof typeof levelConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const unreadCount = notifications.filter(n => n.priority === 'high').length;

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-neutral-700 hover:text-primary-600 hover:bg-neutral-50"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo and brand */}
            <div className="ml-4 lg:ml-0 flex items-center">
              <div className="flex items-center">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-neutral-900">Mon Toit</h1>
                  <p className="text-sm text-neutral-700">Propriétaire</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher une propriété, un locataire..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-semantic-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                  <div className="p-4 border-b border-neutral-200">
                    <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-neutral-100 hover:bg-neutral-50">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                              <p className="text-sm text-neutral-700">{notification.message}</p>
                              <p className="text-xs text-neutral-500 mt-1">Il y a {notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-500">
                        <Bell className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                        <p>Aucune notification</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-neutral-200">
                    <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
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
                className="flex items-center space-x-3 p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900">{userName}</p>
                  <div className="flex items-center">
                    {getOwnerLevelBadge(ownerLevel)}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Profile dropdown menu */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                  <div className="p-4 border-b border-neutral-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neutral-900">{userName}</p>
                        <div className="flex items-center mt-1">
                          {getOwnerLevelBadge(ownerLevel)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Settings className="w-4 h-4 mr-3" />
                      Paramètres
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      <User className="w-4 h-4 mr-3" />
                      Mon profil
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Crown className="w-4 h-4 mr-3" />
                      Passer en Premium
                    </button>
                  </div>
                  
                  <div className="border-t border-neutral-200 py-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-semantic-error hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-3" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default OwnerHeader;