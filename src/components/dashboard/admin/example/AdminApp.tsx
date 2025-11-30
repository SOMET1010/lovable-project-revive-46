import React from 'react';
import AdminDashboard from './AdminDashboard';

/**
 * Exemple d'utilisation du Dashboard Admin ANSUT
 * 
 * Ce composant démontre comment intégrer le dashboard administrateur
 * dans une application React avec Vite.
 */

const AdminApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-page">
      <AdminDashboard 
        userName="Super Administrateur ANSUT"
        userAvatar="/images/admin-avatar.jpg"
        adminLevel="super"
      />
    </div>
  );
};

export default AdminApp;

/**
 * Intégration dans App.tsx:
 * 
 * import React from 'react';
 * import AdminApp from './components/dashboard/admin/example/AdminApp';
 * 
 * function App() {
 *   return (
 *     <div className="App">
 *       <AdminApp />
 *     </div>
 *   );
 * }
 * 
 * export default App;
 */

/**
 * Route avec React Router:
 * 
 * import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 * import AdminApp from './components/dashboard/admin/example/AdminApp';
 * 
 * function App() {
 *   return (
 *     <Router>
 *       <Routes>
 *         <Route path="/admin" element={<AdminApp />} />
 *       </Routes>
 *     </Router>
 *   );
 * }
 */

/**
 * Props disponibles:
 * 
 * - userName: string (optionnel, défaut: "Administrateur ANSUT")
 * - userAvatar: string (optionnel, chemin vers l'avatar)
 * - adminLevel: 'super' | 'senior' | 'moderator' (optionnel, défaut: "super")
 * 
 * Fonctionnalités intégrées:
 * 
 * 1. Gestion des utilisateurs avec filtres et recherche
 * 2. Administration des propriétés immobilières
 * 3. Analytics et métriques en temps réel
 * 4. Configuration système et monitoring
 * 5. Interface responsive (mobile + desktop)
 * 6. Design moderne avec tokens CSS
 * 7. Couleur principale #FF6C2F respectée
 * 8. Navigation par sidebar avec états système
 * 9. Alertes et notifications admin
 * 10. Actions rapides pour opérations courantes
 */