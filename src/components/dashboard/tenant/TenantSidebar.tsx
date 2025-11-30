/**
 * Tenant Sidebar - Navigation latérale du dashboard
 */

import { 
  LayoutDashboard, 
  Heart, 
  FileText, 
  Calendar, 
  CreditCard,
  Home,
  MessageSquare,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface TenantSidebarProps {
  collapsed: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function TenantSidebar({ collapsed, activeSection, onSectionChange }: TenantSidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: LayoutDashboard,
      description: 'Tableau de bord principal',
    },
    {
      id: 'favorites',
      label: 'Mes favoris',
      icon: Heart,
      description: 'Propriétés favorites',
    },
    {
      id: 'applications',
      label: 'Candidatures',
      icon: FileText,
      description: 'Mes candidatures',
    },
    {
      id: 'visits',
      label: 'Visites',
      icon: Calendar,
      description: 'Planifier et gérer',
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: CreditCard,
      description: 'Historique et échéances',
    },
  ];

  const bottomItems = [
    {
      id: 'properties',
      label: 'Rechercher',
      icon: Home,
      description: 'Explorer les biens',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      description: 'Mes conversations',
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration',
    },
    {
      id: 'help',
      label: 'Aide',
      icon: HelpCircle,
      description: 'Support et FAQ',
    },
  ];

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header du sidebar */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MT</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-text-primary">MONTOIT</h2>
              <p className="text-xs text-text-secondary">Dashboard Locataire</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-xs font-semibold text-text-disabled uppercase tracking-wide px-3 py-2">
              Navigation
            </p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                  }
                  ${collapsed ? 'justify-center' : 'justify-start'}
                `}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={`text-xs ${isActive ? 'text-primary-100' : 'text-text-disabled'}`}>
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation secondaire */}
        <div className="space-y-1 pt-4">
          {!collapsed && (
            <p className="text-xs font-semibold text-text-disabled uppercase tracking-wide px-3 py-2">
              Actions
            </p>
          )}
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                  }
                  ${collapsed ? 'justify-center' : 'justify-start'}
                `}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer du sidebar */}
      {!collapsed && (
        <div className="p-4 border-t border-neutral-100">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">★</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-text-primary">Version Premium</p>
                <p className="text-xs text-text-secondary">Accès illimité</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Sidebar principal */}
      <aside className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background-page border-r border-neutral-100 shadow-sm z-sticky
        transition-all duration-300 ease-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}>
        <SidebarContent />
      </aside>

      {/* Overlay pour mobile */}
      <div className={`
        fixed inset-0 bg-black/50 z-modal-backdrop lg:hidden
        ${collapsed ? 'hidden' : 'block'}
      `} />
    </>
  );
}