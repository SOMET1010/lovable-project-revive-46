/**
 * AdminDashboardLayout - Layout pour toutes les pages admin
 * Premium Ivorian Design System
 */

import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

interface AdminDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminDashboardLayout({ children, title }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex w-full">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#EFEBE9] px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-[#FAF7F4] rounded-lg transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5 text-[#2C1810]" />
            </button>
            {title && (
              <h1 className="text-lg font-semibold text-[#2C1810] truncate">{title}</h1>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
