/**
 * AdminSidebar - Sidebar pour le dashboard admin
 * Premium Ivorian Design System
 */

import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Home, Shield, Settings, 
  FileText, Flag, Bell, BarChart3, X, CheckCircle,
  Cog, Database
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users },
  { name: 'Propriétés', href: '/admin/proprietes', icon: Home },
  { name: 'Validation Documents', href: '/admin/validation-documents', icon: FileText },
  { name: 'Gestion CEV', href: '/admin/cev-management', icon: CheckCircle },
  { name: 'Signalements', href: '/admin/signalements', icon: Flag },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Statistiques', href: '/admin/statistiques', icon: BarChart3 },
  { name: 'Services', href: '/admin/services', icon: Database },
  { name: 'Feature Flags', href: '/admin/feature-flags', icon: Cog },
  { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (href: string) => {
    if (href === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-[#2C1810] text-white flex flex-col',
          'transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F16522] rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">Admin</span>
              <p className="text-xs text-white/60">Mon Toit</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  active 
                    ? 'bg-[#F16522] text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Retour au site</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
