import React from 'react';
import { AdminDashboard } from './index';

/**
 * Composant de démonstration simple pour le Dashboard Admin
 * Peut être intégré directement dans App.tsx pour test rapide
 */

const AdminDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-page">
      <AdminDashboard />
    </div>
  );
};

export default AdminDemo;