/**
 * Owner Header - En-tête du dashboard propriétaire
 */

import { Badge } from '../../ui/Badge';

interface OwnerHeaderProps {
  user?: {
    full_name: string;
    email: string;
    company?: string;
  };
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function OwnerHeader({ user, onToggleSidebar, sidebarCollapsed }: OwnerHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background-page/95 backdrop-blur-xl border-b border-neutral-100 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo + Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
          >
            <svg className="h-5 w-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-text-primary">Owner Dashboard</h1>
              <p className="text-xs text-text-secondary">Gestion immobilière</p>
            </div>
          </div>
        </div>

        {/* Center: Quick Stats (Desktop only) */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-text-primary">
              {user?.full_name}
            </div>
            <div className="text-xs text-text-secondary">
              Propriétaire
            </div>
          </div>
        </div>

        {/* Right: Actions + Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-semantic-error rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </div>

          {/* Add Property */}
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Ajouter</span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-text-primary">{user?.full_name}</div>
              <div className="text-xs text-text-secondary">{user?.company || 'Propriétaire'}</div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.full_name?.charAt(0).toUpperCase() || 'P'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile quick actions */}
      <div className="lg:hidden border-t border-neutral-100 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-text-primary">{user?.full_name}</div>
            <div className="text-xs text-text-secondary">{user?.company || 'Propriétaire'}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="small">En ligne</Badge>
            <button className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}