import { useState } from 'react';
import { Menu } from 'lucide-react';
import TenantSidebar from './TenantSidebar';

interface TenantDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function TenantDashboardLayout({ children, title }: TenantDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar - badges are now handled internally via useNavigationItems */}
      <TenantSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6 text-neutral-700" />
            </button>
            {title && (
              <h1 className="text-lg font-semibold text-neutral-900 truncate">{title}</h1>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
