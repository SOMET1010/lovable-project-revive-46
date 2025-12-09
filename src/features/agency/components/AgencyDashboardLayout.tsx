import { useState, ReactNode } from 'react';
import { Menu } from 'lucide-react';
import AgencySidebar from './AgencySidebar';

interface AgencyDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AgencyDashboardLayout({ children, title }: AgencyDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <AgencySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-neutral-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6 text-neutral-600" />
          </button>
          {title && (
            <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
          )}
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
