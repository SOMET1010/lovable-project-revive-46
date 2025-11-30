import React from 'react';
<<<<<<< HEAD
import { 
  Bell, 
  Menu, 
  Settings, 
  Award,
  Shield,
  User
} from 'lucide-react';

interface TrustHeaderProps {
  userName: string;
  userAvatar?: string;
  agentLevel: 'junior' | 'senior' | 'expert';
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

const TrustHeader: React.FC<TrustHeaderProps> = ({
  userName,
  userAvatar,
  agentLevel,
  notifications,
  onMenuClick
}) => {
  const unreadNotifications = notifications.filter(n => n.priority === 'high').length;
  
  const getLevelBadge = (level: string) => {
    const styles = {
      junior: 'bg-blue-100 text-blue-800',
      senior: 'bg-green-100 text-green-800', 
      expert: 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      junior: 'Agent Junior',
      senior: 'Agent Senior',
      expert: 'Agent Expert'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level as keyof typeof styles]}`}>
        <Award className="w-3 h-3 mr-1" />
        {labels[level as keyof typeof labels]}
      </span>
    );
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
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-neutral-900">
                    Trust Agent ANSUT
                  </h1>
                  <p className="text-sm text-neutral-700">
                    Plateforme de Certification Immobilière
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

            {/* Agent Level Badge */}
            <div className="hidden sm:block">
              {getLevelBadge(agentLevel)}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-neutral-900">{userName}</p>
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Agent ANSUT Certifié
                  </span>
                  <p className="text-xs text-neutral-700">Validation & Inspection</p>
                </div>
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
import { Bell, Search, Settings } from 'lucide-react';

interface TrustHeaderProps {
  userName?: string;
  agentLevel?: 'junior' | 'senior' | 'expert';
}

export function TrustHeader({ userName, agentLevel }: TrustHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MA</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">
              Mon Toit ANSUT
            </h1>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">Agent ANSUT Certifié</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher propriétés, utilisateurs..."
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-80"
            />
          </div>

          <button className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{userName}</p>
              <p className="text-xs text-neutral-500 capitalize">Niveau {agentLevel}</p>
            </div>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {userName?.charAt(0) || 'A'}
              </span>
            </div>
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
          </div>
        </div>
      </div>
    </header>
  );
<<<<<<< HEAD
};

export default TrustHeader;
=======
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
