import React from 'react';
import { 
  Bell, 
  Menu, 
  Settings, 
  Crown,
  Shield,
  User,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AdminHeaderProps {
  userName: string;
  userAvatar?: string;
  adminLevel: 'super' | 'senior' | 'moderator';
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

const AdminHeader: React.FC<AdminHeaderProps> = ({
  userName,
  userAvatar,
  adminLevel,
  notifications,
  onMenuClick
}) => {
  const highPriorityNotifications = notifications.filter(n => n.priority === 'high').length;
  
  const getLevelBadge = (level: string) => {
    const styles = {
      super: 'bg-purple-100 text-purple-800',
      senior: 'bg-blue-100 text-blue-800', 
      moderator: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      super: 'Super Admin',
      senior: 'Admin Senior',
      moderator: 'Modérateur'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level as keyof typeof styles]}`}>
        <Crown className="w-3 h-3 mr-1" />
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-semantic-error" />;
      case 'medium':
        return <Bell className="w-4 h-4 text-semantic-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-semantic-success" />;
    }
  };

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
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-neutral-900">
                    Administration ANSUT
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
            {/* Notifications Dropdown */}
            <div className="relative group">
              <button className="p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 relative">
                <Bell className="w-5 h-5" />
                {highPriorityNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-semantic-error rounded-full"></span>
                )}
              </button>
              
              {/* Dropdown content (hover) */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 border-b border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
                  <p className="text-sm text-neutral-700">{notifications.length} notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="p-3 border-b border-neutral-100 hover:bg-neutral-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {getPriorityIcon(notification.priority)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-neutral-700 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Il y a {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-neutral-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Level Badge */}
            <div className="hidden sm:block">
              {getLevelBadge(adminLevel)}
            </div>

            {/* System Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-semantic-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">Système Opérationnel</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-neutral-900">{userName}</p>
                <p className="text-xs text-neutral-700">Administrateur Système</p>
              </div>
              
              <div className="relative">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center border-2 border-primary-200">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                
                {/* Admin status indicator */}
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-primary-500 border-2 border-white rounded-full"></div>
              </div>
            </div>

            {/* Settings */}
            <button className="p-2 text-neutral-700 hover:text-primary-600 hover:bg-neutral-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;