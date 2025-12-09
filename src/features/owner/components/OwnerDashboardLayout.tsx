import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';

interface OwnerDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function OwnerDashboardLayout({ children, title }: OwnerDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex w-full">
      <OwnerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-neutral-600" />
            </button>
            {title && (
              <h1 className="text-lg font-semibold text-neutral-900 truncate">{title}</h1>
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
