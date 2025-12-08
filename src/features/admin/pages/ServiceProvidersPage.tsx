import { useState, useMemo } from 'react';
import { TrendingUp, ArrowLeft, MessageSquare, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ProviderCard } from '../components/ProviderCard';
import { useServiceConfigurations, useUpdateServiceConfiguration } from '../hooks/useServiceConfigurations';

const SERVICE_TABS = [
  { id: 'sms', label: 'SMS', icon: Phone },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'email', label: 'Email', icon: Mail },
];

export default function ServiceProvidersPage() {
  const [activeTab, setActiveTab] = useState('sms');
  const { data: configurations, isLoading, error } = useServiceConfigurations();
  const updateConfig = useUpdateServiceConfiguration();
  
  const groupedConfigs = useMemo(() => {
    if (!configurations) return {};
    
    return configurations.reduce((acc, config) => {
      const service = config.service_name.toLowerCase();
      if (!acc[service]) acc[service] = [];
      acc[service].push(config);
      return acc;
    }, {} as Record<string, typeof configurations>);
  }, [configurations]);
  
  const handleToggle = (id: string, enabled: boolean) => {
    updateConfig.mutate({ id, updates: { is_enabled: enabled } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">Erreur de chargement des configurations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Service Providers</h1>
            <p className="text-neutral-600">Configuration des fournisseurs SMS, WhatsApp et Email</p>
          </div>
        </div>
        <Link to="/admin/tableau-de-bord">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Système de fallback automatique</p>
          <p className="text-sm text-blue-700">
            Les providers sont utilisés par ordre de priorité (1 = plus haute). 
            Si un provider échoue, le système bascule automatiquement sur le suivant.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          {SERVICE_TABS.map(tab => {
            const Icon = tab.icon;
            const count = groupedConfigs[tab.id]?.length ?? 0;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="text-xs bg-neutral-200 px-1.5 py-0.5 rounded-full">{count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {SERVICE_TABS.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <div className="space-y-3">
              {(groupedConfigs[tab.id]?.length ?? 0) > 0 ? (
                [...(groupedConfigs[tab.id] ?? [])]
                  .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
                  .map(config => (
                    <ProviderCard
                      key={config.id}
                      provider={config}
                      onToggle={(enabled) => handleToggle(config.id, enabled)}
                    />
                  ))
              ) : (
                <div className="bg-neutral-50 rounded-xl p-8 text-center">
                  <p className="text-neutral-500">Aucun provider configuré pour {tab.label}</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        {SERVICE_TABS.map(tab => {
          const providers = groupedConfigs[tab.id] ?? [];
          const activeCount = providers.filter(p => p.is_enabled).length;
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{activeCount}/{providers.length}</p>
                  <p className="text-sm text-neutral-500">{tab.label} actifs</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
