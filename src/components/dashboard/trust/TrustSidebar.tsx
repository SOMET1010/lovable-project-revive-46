import React from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, Users, BarChart3 } from 'lucide-react';

interface TrustSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function TrustSidebar({ activeSection, onSectionChange }: TrustSidebarProps) {
  const sections = [
    {
      id: 'validation',
      label: 'Validation Propriétés',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: AlertCircle,
      color: 'text-blue-600'
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      id: 'users',
      label: 'Validation Utilisateurs',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-5rem)] bg-white border-r border-neutral-200 p-6">
      <nav className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : section.color}`} />
              <span className="font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Statut ANSUT
          </span>
        </div>
        <p className="text-xs text-green-700">
          Certification active - Validé jusqu'en 2025
        </p>
      </div>
    </aside>
  );
}