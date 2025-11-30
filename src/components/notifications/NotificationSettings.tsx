import React, { useState } from 'react';
import { Volume2, VolumeX, Mail, Bell, Save, X } from 'lucide-react';
import { NotificationSettings as NotificationSettingsType, NotificationType } from '@/types';
import { Button } from '@/components/ui/Button';

interface NotificationSettingsProps {
  settings: NotificationSettingsType | null;
  onUpdateSettings: (settings: Partial<NotificationSettingsType>) => Promise<void>;
  onClose?: () => void;
}

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  application_received: 'Nouvelle candidature',
  application_status_change: 'Changement de statut',
  document_reminder: 'Documents manquants',
  contract_deadline: 'Échéance contrat',
  new_message: 'Nouveau message',
  payment_reminder: 'Rappel paiement',
  lease_expiry: 'Expiration bail'
};

export function NotificationSettings({ 
  settings, 
  onUpdateSettings, 
  onClose 
}: NotificationSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings || {
    id: '',
    user_id: '',
    email_enabled: true,
    push_enabled: true,
    sound_enabled: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    notification_types: {
      application_received: { email: true, push: true, sound: true },
      application_status_change: { email: true, push: true, sound: true },
      document_reminder: { email: true, push: true, sound: true },
      contract_deadline: { email: true, push: true, sound: true },
      new_message: { email: true, push: true, sound: true },
      payment_reminder: { email: true, push: true, sound: true },
      lease_expiry: { email: true, push: true, sound: true }
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: keyof NotificationSettingsType, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleNotificationTypeChange = (
    type: NotificationType,
    channel: 'email' | 'push' | 'sound',
    enabled: boolean
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: {
          ...prev.notification_types[type],
          [channel]: enabled
        }
      }
    }));
    setHasChanges(true);
  };

  const handleQuickToggle = (type: NotificationType, enabled: boolean) => {
    const current = localSettings.notification_types[type];
    setLocalSettings(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: {
          email: enabled,
          push: enabled,
          sound: enabled
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateSettings(localSettings);
      setHasChanges(false);
      onClose?.();
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasAnyNotificationEnabled = Object.values(localSettings.notification_types).some(
    type => type.email || type.push || type.sound
  );

  return (
    <div className="p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-900">
          Paramètres des notifications
        </h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Global Settings */}
      <div className="space-y-4 mb-6">
        <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
          Paramètres généraux
        </h4>

        {/* Email notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Notifications par email</p>
              <p className="text-xs text-neutral-500">Recevoir les notifications par email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.email_enabled}
              onChange={(e) => handleSettingChange('email_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Push notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-4 h-4 text-neutral-500" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Notifications push</p>
              <p className="text-xs text-neutral-500">Recevoir les notifications du navigateur</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.push_enabled}
              onChange={(e) => handleSettingChange('push_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Sound notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {localSettings.sound_enabled ? (
              <Volume2 className="w-4 h-4 text-neutral-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
            <div>
              <p className="text-sm font-medium text-neutral-900">Sons de notification</p>
              <p className="text-xs text-neutral-500">Jouer un son lors de nouvelles notifications</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.sound_enabled}
              onChange={(e) => handleSettingChange('sound_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Quiet hours */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-900">Heures silencieuses</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.quiet_hours_enabled}
                onChange={(e) => handleSettingChange('quiet_hours_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {localSettings.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Début
                </label>
                <input
                  type="time"
                  value={localSettings.quiet_hours_start}
                  onChange={(e) => handleSettingChange('quiet_hours_start', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Fin
                </label>
                <input
                  type="time"
                  value={localSettings.quiet_hours_end}
                  onChange={(e) => handleSettingChange('quiet_hours_end', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
          Types de notifications
        </h4>

        <div className="space-y-3">
          {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => {
            const typeSettings = localSettings.notification_types[type as NotificationType];
            const isEnabled = typeSettings.email || typeSettings.push || typeSettings.sound;

            return (
              <div key={type} className="p-3 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-neutral-900">{label}</h5>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuickToggle(type as NotificationType, !isEnabled)}
                      className={`text-xs px-2 py-1 rounded ${
                        isEnabled 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {isEnabled ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Email */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeSettings.email}
                      onChange={(e) => handleNotificationTypeChange(
                        type as NotificationType,
                        'email',
                        e.target.checked
                      )}
                      className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                    />
                    <Mail className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs text-neutral-700">Email</span>
                  </label>

                  {/* Push */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeSettings.push}
                      onChange={(e) => handleNotificationTypeChange(
                        type as NotificationType,
                        'push',
                        e.target.checked
                      )}
                      className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                    />
                    <Bell className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs text-neutral-700">Push</span>
                  </label>

                  {/* Sound */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeSettings.sound}
                      onChange={(e) => handleNotificationTypeChange(
                        type as NotificationType,
                        'sound',
                        e.target.checked
                      )}
                      className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                    />
                    <Volume2 className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs text-neutral-700">Son</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enregistrement...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Enregistrer les paramètres</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}