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
    <div className="flex min-h-screen bg-[#FAF7F4] w-full">
      {/* Sidebar - badges are now handled internally via useNavigationItems */}
      <TenantSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#EFEBE9] px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-[#FAF7F4] rounded-lg transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6 text-[#2C1810]" />
            </button>
            {title && (
              <h1 className="text-lg font-semibold text-[#2C1810] truncate">{title}</h1>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
