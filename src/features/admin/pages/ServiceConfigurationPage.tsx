import { useState, ChangeEvent } from 'react';
import { Settings, ArrowLeft, Shield, Database, Globe, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { SettingRow } from '../components/SettingRow';
import { useSystemSettings, useUpdateSystemSetting } from '../hooks/useSystemSettings';
import type { Json } from '@/integrations/supabase/types';

const SETTING_TABS = [
  { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'limits', label: 'Limites', icon: Database },
  { id: 'localization', label: 'Localisation', icon: Globe },
];

export default function ServiceConfigurationPage() {
  const [activeTab, setActiveTab] = useState('maintenance');
  const { data: settings, isLoading, error } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  
  const getSettingsByCategory = (category: string) => {
    return settings?.filter(s => s.category === category) || [];
  };
  
  const handleSave = async (id: string, value: Json) => {
    await updateSetting.mutateAsync({ id, setting_value: value });
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
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">Erreur de chargement des paramètres</p>
      </div>
    );
  }

  const maintenanceSetting = settings?.find(s => s.setting_key === 'maintenance_mode');
  const maintenanceValue = maintenanceSetting?.setting_value as Record<string, unknown> | null;
  const isMaintenanceEnabled = Boolean(maintenanceValue?.['enabled']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Configuration Système</h1>
            <p className="text-neutral-600">Paramètres globaux de la plateforme</p>
          </div>
        </div>
        <Link to="/admin/tableau-de-bord">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
      </div>

      {/* Maintenance Mode Alert */}
      {isMaintenanceEnabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">Mode maintenance activé</p>
            <p className="text-sm text-amber-700">
              Les utilisateurs voient actuellement le message de maintenance.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          {SETTING_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Mode Maintenance
            </h3>
            
            {maintenanceSetting && maintenanceValue && (
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                  <div>
                    <h4 className="font-medium text-neutral-900">Activer le mode maintenance</h4>
                    <p className="text-sm text-neutral-500">Bloque l'accès à la plateforme pour les utilisateurs</p>
                  </div>
                  <Switch 
                    checked={(maintenanceValue['enabled'] as boolean) || false}
                    onCheckedChange={(checked) => handleSave(maintenanceSetting.id, {
                      ...maintenanceValue,
                      enabled: checked
                    } as Json)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Message affiché</label>
                  <Textarea
                    value={(maintenanceValue['message'] as string) || ''}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleSave(maintenanceSetting.id, {
                      ...maintenanceValue,
                      message: e.target.value
                    } as Json)}
                    className="h-24"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Date de fin estimée</label>
                  <Input
                    type="datetime-local"
                    value={(maintenanceValue['estimated_end'] as string) || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleSave(maintenanceSetting.id, {
                      ...maintenanceValue,
                      estimated_end: e.target.value
                    } as Json)}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Paramètres de Sécurité
            </h3>
            
            <div className="divide-y divide-neutral-100">
              {getSettingsByCategory('security').map(setting => (
                <SettingRow
                  key={setting.id}
                  setting={setting}
                  onSave={(value) => handleSave(setting.id, value)}
                  type="number"
                />
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Limits Tab */}
        <TabsContent value="limits" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              Limites Système
            </h3>
            
            <div className="divide-y divide-neutral-100">
              {getSettingsByCategory('limits').map(setting => (
                <SettingRow
                  key={setting.id}
                  setting={setting}
                  onSave={(value) => handleSave(setting.id, value)}
                  type="number"
                />
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Localization Tab */}
        <TabsContent value="localization" className="mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              Localisation
            </h3>
            
            <div className="divide-y divide-neutral-100">
              {getSettingsByCategory('localization').map(setting => (
                <SettingRow
                  key={setting.id}
                  setting={setting}
                  onSave={(value) => handleSave(setting.id, value)}
                  type="text"
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {SETTING_TABS.map(tab => {
          const Icon = tab.icon;
          const count = getSettingsByCategory(tab.id).length;
          return (
            <div key={tab.id} className="bg-white rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{count}</p>
                  <p className="text-sm text-neutral-500">{tab.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
