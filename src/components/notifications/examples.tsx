import React, { useState } from 'react';
import { NotificationBell, NotificationCenter } from '@/components/notifications';

/**
 * Exemple d'intégration du système de notifications
 * 
 * Ce composant montre comment intégrer le système de notifications
 * dans l'application principale (header, sidebar, etc.)
 */

export function NotificationsExample() {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const toggleNotificationCenter = () => {
    setIsNotificationCenterOpen(!isNotificationCenterOpen);
  };

  return (
    <>
      {/* Header avec la cloche de notifications */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-neutral-200">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="MonToit" className="h-8 w-8" />
            <span className="font-bold text-xl text-neutral-900">MonToit</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/properties" className="text-neutral-700 hover:text-neutral-900">
              Propriétés
            </a>
            <a href="/dashboard" className="text-neutral-700 hover:text-neutral-900">
              Tableau de bord
            </a>
            <a href="/messages" className="text-neutral-700 hover:text-neutral-900">
              Messages
            </a>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <NotificationBell
              size="medium"
              showTooltip={true}
            />
            
            {/* User avatar */}
            <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              JD
            </button>
          </div>
        </div>
      </header>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  );
}

/**
 * Alternative: Dans un composant de sidebar
 */
export function SidebarNotifications() {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <a
          href="/dashboard"
          className="flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
        >
          <span>🏠</span>
          <span>Tableau de bord</span>
        </a>
        
        <a
          href="/properties"
          className="flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
        >
          <span>🏢</span>
          <span>Mes propriétés</span>
        </a>
        
        <a
          href="/applications"
          className="flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
        >
          <span>📋</span>
          <span>Candidatures</span>
        </a>
        
        <a
          href="/messages"
          className="flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
        >
          <span>💬</span>
          <span>Messages</span>
        </a>
        
        {/* Notification bell in sidebar */}
        <button
          onClick={() => setIsNotificationCenterOpen(true)}
          className="w-full flex items-center space-x-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
        >
          <NotificationBell size="small" showTooltip={false} />
          <span>Notifications</span>
        </button>
      </nav>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </div>
  );
}

/**
 * Exemple d'utilisation dans une page de dashboard
 */
export function DashboardWithNotifications() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar avec notifications */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Tableau de bord</h1>
          
          <div className="flex items-center space-x-4">
            {/* Bouton pour ouvrir le centre de notifications */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <NotificationBell size="medium" />
            </button>
            
            {/* Menu utilisateur */}
            <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Cards du dashboard */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Propriétés actives
            </h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Candidatures en attente
            </h3>
            <p className="text-3xl font-bold text-amber-600">5</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Messages non lus
            </h3>
            <p className="text-3xl font-bold text-green-600">3</p>
          </div>
        </div>

        {/* Autres contenus du dashboard... */}
      </main>

      {/* Centre de notifications */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}

/**
 * Hook personnalisé pour une intégration avancée
 */
export function useNotificationIntegration() {
  const [isOpen, setIsOpen] = useState(false);

  const openNotifications = () => setIsOpen(true);
  const closeNotifications = () => setIsOpen(false);
  const toggleNotifications = () => setIsOpen(!isOpen);

  return {
    isOpen,
    openNotifications,
    closeNotifications,
    toggleNotifications,
    
    // Composant à intégrer dans votre UI
    NotificationButton: (
      <button
        onClick={toggleNotifications}
        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <NotificationBell />
      </button>
    ),
    
    // Centre de notifications
    NotificationCenterComponent: (
      <NotificationCenter
        isOpen={isOpen}
        onClose={closeNotifications}
      />
    )
  };
}