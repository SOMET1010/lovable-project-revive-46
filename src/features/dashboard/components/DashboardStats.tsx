/**
 * Composant Statistiques Dashboard
 * Affiche les statistiques clés du dashboard utilisateur
 */

import { Heart, Clock, Bell, Search } from 'lucide-react';
import type { DashboardStats } from '@/services/userDashboardService';

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      label: 'Favoris',
      value: stats.totalFavorites,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Recherches',
      value: stats.totalSearches,
      icon: Search,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Alertes Actives',
      value: stats.totalAlerts,
      icon: Bell,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Notifications',
      value: stats.unreadNotifications,
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="bg-white border-b border-neutral-100">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-lg border border-neutral-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-neutral-500 mb-1">{stat.label}</p>
                  <p className="text-h2 font-bold text-neutral-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
