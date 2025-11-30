/**
 * Agency Sidebar - Navigation latérale du dashboard agence
 */

interface AgencySidebarProps {
  collapsed: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AgencySidebar({ collapsed, activeSection, onSectionChange }: AgencySidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: '📊',
      description: 'Résumé de l\'activité',
    },
    {
      id: 'properties',
      label: 'Propriétés',
      icon: '🏠',
      description: 'Gestion du portefeuille',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: '👥',
      description: 'Base de données clients',
    },
    {
      id: 'team',
      label: 'Équipe',
      icon: '👨‍💼',
      description: 'Gestion des agents',
    },
    {
      id: 'sales',
      label: 'Ventes',
      icon: '💰',
      description: 'Suivi commercial',
    },
  ];

  const quickActions = [
    {
      label: 'Ajouter propriété',
      icon: '➕',
      action: 'add_property',
    },
    {
      label: 'Nouveau client',
      icon: '👤',
      action: 'add_client',
    },
    {
      label: 'Planifier visite',
      icon: '📅',
      action: 'schedule_visit',
    },
    {
      label: 'Générer rapport',
      icon: '📈',
      action: 'generate_report',
    },
  ];

  return (
    <aside className={`
      fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background-page border-r border-neutral-100 transition-all duration-300 z-40
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className="flex flex-col h-full">
        {/* Navigation principale */}
        <nav className="flex-1 p-4 space-y-2">
          <div className={collapsed ? 'hidden' : 'block'}>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Navigation
            </h3>
          </div>
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                ${activeSection === item.id 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Actions rapides */}
        <div className="p-4 border-t border-neutral-100">
          <div className={collapsed ? 'hidden' : 'block'}>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Actions rapides
            </h3>
          </div>
          
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.action}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  text-text-secondary hover:bg-neutral-100 hover:text-text-primary
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
                title={collapsed ? action.label : undefined}
              >
                <span className="text-sm flex-shrink-0">{action.icon}</span>
                {!collapsed && (
                  <span className="font-medium text-sm">{action.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Statut équipe en temps réel */}
        <div className={`
          p-4 border-t border-neutral-100 bg-neutral-50/50
          ${collapsed ? 'hidden' : 'block'}
        `}>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Équipe en ligne
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Agents actifs</span>
              <span className="text-sm font-semibold text-semantic-success">4/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Visites aujourd'hui</span>
              <span className="text-sm font-semibold text-primary-500">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Prospects cette semaine</span>
              <span className="text-sm font-semibold text-primary-500">28</span>
            </div>
          </div>
        </div>

        {/* Indicateur de version */}
        <div className={`
          p-3 border-t border-neutral-100 text-center
          ${collapsed ? 'hidden' : 'block'}
        `}>
          <span className="text-xs text-text-secondary">
            Dashboard v2.0.0 - MonToitVProd
          </span>
        </div>
      </div>
    </aside>
  );
}