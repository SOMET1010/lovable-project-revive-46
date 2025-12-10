import React from 'react';
import {
  Building2,
  Users,
  Home,
  Coins,
  UserPlus,
  Settings,
  BarChart3,
  FileText,
  UserCheck,
  Calendar,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/agence/dashboard',
    icon: Building2,
  },
  {
    label: 'Gestion équipe',
    href: '/agence/equipe',
    icon: Users,
  },
  {
    label: 'Propriétés',
    href: '/agence/proprietes',
    icon: Home,
  },
  {
    label: 'Commissions',
    href: '/agence/commissions',
    icon: Coins,
  },
  {
    label: 'Demandes',
    href: '/agence/inscriptions',
    icon: UserPlus,
  },
  {
    label: 'Analytics',
    href: '/agence/analytics',
    icon: BarChart3,
  },
  {
    label: 'Rapports',
    href: '/agence/rapports',
    icon: FileText,
  },
  {
    label: 'Validation',
    href: '/agence/validation',
    icon: UserCheck,
  },
  {
    label: 'Calendrier',
    href: '/agence/calendrier',
    icon: Calendar,
  },
];

export default function Sidebar({ isOpen, onClose, currentPath }: SidebarProps) {
  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-neutral-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-neutral-900">MonToit Pro</h2>
              <p className="text-xs text-neutral-500">Agence Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 lg:hidden"
            aria-label="Fermer la navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? 'text-primary-600'
                        : 'text-neutral-400 group-hover:text-primary-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Section settings en bas */}
        <div className="p-4 border-t border-neutral-200">
          <a
            href="/agence/configurations"
            className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 rounded-xl transition-all duration-200"
          >
            <Settings className="w-5 h-5 text-neutral-400" />
            <span>Configurations</span>
          </a>
        </div>
      </div>
    </>
  );
}
