/**
 * Owner Sidebar - Navigation latérale du dashboard propriétaire
 */

interface OwnerSidebarProps {
  collapsed: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: '📊',
    description: 'Statistiques et aperçu général'
  },
  {
    id: 'properties',
    label: 'Mes Propriétés',
    icon: '🏠',
    description: 'Gestion de vos biens immobiliers'
  },
  {
    id: 'tenants',
    label: 'Mes Locataires',
    icon: '👥',
    description: 'Suivi des locataires actuels'
  },
  {
    id: 'applications',
    label: 'Candidatures',
    icon: '📝',
    description: 'Demandes de location reçues'
  },
  {
    id: 'payments',
    label: 'Revenus & Paiements',
    icon: '💳',
    description: 'Suivi des paiements et revenus'
  },
];

const bottomItems = [
  {
    id: 'settings',
    label: 'Paramètres',
    icon: '⚙️'
  },
  {
    id: 'help',
    label: 'Aide',
    icon: '❓'
  },
  {
    id: 'logout',
    label: 'Déconnexion',
    icon: '🚪'
  },
];

export function OwnerSidebar({ collapsed, activeSection, onSectionChange }: OwnerSidebarProps) {
  return (
    <aside className={`
      fixed left-0 top-16 bottom-0 bg-background-page border-r border-neutral-100 z-40
      transition-all duration-300 ease-out
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Navigation principale */}
      <nav className="flex flex-col h-full">
        <div className="flex-1 px-3 py-6 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                ${activeSection === item.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label}</div>
                  <div className="text-xs text-text-secondary truncate">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Séparateur */}
        {!collapsed && <hr className="mx-3 border-neutral-200" />}

        {/* Actions rapides */}
        <div className="px-3 py-4 space-y-2">
          {!collapsed && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Actions rapides
              </h3>
            </div>
          )}
          
          <button className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
            text-primary-600 hover:bg-primary-50
            ${collapsed ? 'justify-center px-2' : ''}
          `}>
            <span className="text-lg flex-shrink-0">➕</span>
            {!collapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium">Ajouter propriété</div>
              </div>
            )}
          </button>

          <button className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
            text-semantic-info hover:bg-blue-50
            ${collapsed ? 'justify-center px-2' : ''}
          `}>
            <span className="text-lg flex-shrink-0">📞</span>
            {!collapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium">Contacter support</div>
              </div>
            )}
          </button>
        </div>

        {/* Navigation du bas */}
        <div className="px-3 py-4 border-t border-neutral-100 space-y-2">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                text-text-secondary hover:bg-neutral-100 hover:text-text-primary
                ${collapsed ? 'justify-center px-2' : ''}
              `}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Indicator de section active (collapsed mode) */}
      {collapsed && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full">
          <div className="w-2 h-8 bg-primary-500 rounded-l-full"></div>
        </div>
      )}
    </aside>
  );
}