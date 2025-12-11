import { useState, useEffect } from 'react';
import { 
  Bell, Clock, Plane, Users, Shield, 
  Save, AlertTriangle, Check
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Switch, Label } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'sonner';

interface NotificationSettings {
  frequency: 'realtime' | 'daily' | 'weekly';
  daily_time: string;
  weekly_day: number;
  weekly_time: string;
  channels: string[];
  alert_thresholds: {
    payment_received: boolean;
    delay_days_5: boolean;
    delay_days_10: boolean;
    schedule_requests: boolean;
    maintenance: boolean;
  };
  travel_mode_enabled: boolean;
  travel_mode_start: string | null;
  travel_mode_end: string | null;
  travel_timezone: string;
  auto_approve_schedule_score: number;
  auto_approve_maintenance_amount: number;
  auto_engage_lawyer_days: number;
  delegate_contact_name: string | null;
  delegate_contact_phone: string | null;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

const TIMEZONES = [
  'Africa/Abidjan',
  'Europe/Paris',
  'America/New_York',
  'Asia/Dubai',
];

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    frequency: 'daily',
    daily_time: '08:00',
    weekly_day: 0,
    weekly_time: '18:00',
    channels: ['push', 'email'],
    alert_thresholds: {
      payment_received: true,
      delay_days_5: true,
      delay_days_10: true,
      schedule_requests: true,
      maintenance: true,
    },
    travel_mode_enabled: false,
    travel_mode_start: null,
    travel_mode_end: null,
    travel_timezone: 'Africa/Abidjan',
    auto_approve_schedule_score: 85,
    auto_approve_maintenance_amount: 50000,
    auto_engage_lawyer_days: 15,
    delegate_contact_name: null,
    delegate_contact_phone: null,
  });

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('owner_notification_settings')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data && !error) {
        setSettings({
          frequency: (data.frequency || 'daily') as 'realtime' | 'daily' | 'weekly',
          daily_time: data.daily_time || '08:00',
          weekly_day: data.weekly_day || 0,
          weekly_time: data.weekly_time || '18:00',
          channels: (data.channels as string[]) || ['push', 'email'],
          alert_thresholds: (data.alert_thresholds as NotificationSettings['alert_thresholds']) || settings.alert_thresholds,
          travel_mode_enabled: data.travel_mode_enabled || false,
          travel_mode_start: data.travel_mode_start,
          travel_mode_end: data.travel_mode_end,
          travel_timezone: data.travel_timezone || 'Africa/Abidjan',
          auto_approve_schedule_score: data.auto_approve_schedule_score || 85,
          auto_approve_maintenance_amount: data.auto_approve_maintenance_amount || 50000,
          auto_engage_lawyer_days: data.auto_engage_lawyer_days || 15,
          delegate_contact_name: data.delegate_contact_name,
          delegate_contact_phone: data.delegate_contact_phone,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('owner_notification_settings')
        .upsert({
          owner_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Paramètres enregistrés');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggleChannel = (channel: string) => {
    setSettings(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const toggleThreshold = (key: keyof NotificationSettings['alert_thresholds']) => {
    setSettings(prev => ({
      ...prev,
      alert_thresholds: {
        ...prev.alert_thresholds,
        [key]: !prev.alert_thresholds[key],
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Paramètres de notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Configurez vos alertes et automatisations
            </p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>

        {/* Frequency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Fréquence des rapports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(['realtime', 'daily', 'weekly'] as const).map(freq => (
                <button
                  key={freq}
                  onClick={() => setSettings(prev => ({ ...prev, frequency: freq }))}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    settings.frequency === freq
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">
                    {freq === 'realtime' ? 'Temps réel' : freq === 'daily' ? 'Quotidien' : 'Hebdomadaire'}
                  </p>
                </button>
              ))}
            </div>

            {settings.frequency === 'daily' && (
              <div className="flex items-center gap-4">
                <Label>Heure du rapport quotidien</Label>
                <Input
                  type="time"
                  value={settings.daily_time}
                  onChange={(e) => setSettings(prev => ({ ...prev, daily_time: e.target.value }))}
                  className="w-32"
                />
              </div>
            )}

            {settings.frequency === 'weekly' && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Jour</Label>
                  <select
                    value={settings.weekly_day}
                    onChange={(e) => setSettings(prev => ({ ...prev, weekly_day: Number(e.target.value) }))}
                    className="px-3 py-2 border rounded-lg bg-background"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Heure</Label>
                  <Input
                    type="time"
                    value={settings.weekly_time}
                    onChange={(e) => setSettings(prev => ({ ...prev, weekly_time: e.target.value }))}
                    className="w-32"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Canaux de notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'push', label: 'Push', icon: '🔔' },
                { id: 'sms', label: 'SMS', icon: '📱' },
                { id: 'email', label: 'Email', icon: '📧' },
                { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
              ].map(channel => (
                <button
                  key={channel.id}
                  onClick={() => toggleChannel(channel.id)}
                  className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${
                    settings.channels.includes(channel.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span>{channel.icon}</span>
                  <span>{channel.label}</span>
                  {settings.channels.includes(channel.id) && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Seuils d'alerte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'payment_received' as const, label: 'Paiement reçu' },
              { key: 'delay_days_5' as const, label: 'Retard de 5 jours' },
              { key: 'delay_days_10' as const, label: 'Retard de 10 jours' },
              { key: 'schedule_requests' as const, label: 'Demandes d\'échéancier' },
              { key: 'maintenance' as const, label: 'Demandes de maintenance' },
            ].map(threshold => (
              <div key={threshold.key} className="flex items-center justify-between">
                <Label>{threshold.label}</Label>
                <Switch
                  checked={settings.alert_thresholds[threshold.key]}
                  onCheckedChange={() => toggleThreshold(threshold.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Travel Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Mode Voyage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activer le mode voyage</p>
                <p className="text-sm text-muted-foreground">
                  Adapte les horaires de notification à votre fuseau horaire
                </p>
              </div>
              <Switch
                checked={settings.travel_mode_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, travel_mode_enabled: checked }))}
              />
            </div>

            {settings.travel_mode_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label>Date début</Label>
                  <Input
                    type="date"
                    value={settings.travel_mode_start || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, travel_mode_start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={settings.travel_mode_end || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, travel_mode_end: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Fuseau horaire</Label>
                  <select
                    value={settings.travel_timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, travel_timezone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto-Approval Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Automatisations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Auto-approuver échéancier si score locataire ≥</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.auto_approve_schedule_score}
                  onChange={(e) => setSettings(prev => ({ ...prev, auto_approve_schedule_score: Number(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-muted-foreground">points</span>
              </div>
            </div>

            <div>
              <Label>Auto-approuver maintenance si montant ≤</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min={0}
                  value={settings.auto_approve_maintenance_amount}
                  onChange={(e) => setSettings(prev => ({ ...prev, auto_approve_maintenance_amount: Number(e.target.value) }))}
                  className="w-32"
                />
                <span className="text-muted-foreground">FCFA</span>
              </div>
            </div>

            <div>
              <Label>Déclencher procédure juridique après</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min={10}
                  max={60}
                  value={settings.auto_engage_lawyer_days}
                  onChange={(e) => setSettings(prev => ({ ...prev, auto_engage_lawyer_days: Number(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-muted-foreground">jours de retard</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delegation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Délégation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Personne à contacter en cas d'urgence si vous êtes injoignable
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nom du contact</Label>
                <Input
                  value={settings.delegate_contact_name || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, delegate_contact_name: e.target.value }))}
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={settings.delegate_contact_phone || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, delegate_contact_phone: e.target.value }))}
                  placeholder="+225 07 00 00 00 00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
