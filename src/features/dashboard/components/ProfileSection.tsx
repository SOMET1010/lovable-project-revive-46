/**
 * Section Profil Utilisateur
 * Permet de visualiser et modifier le profil
 */

import { useState, useRef } from 'react';
import { Camera, Save, User, Mail, Phone, MapPin, Edit2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import {
  updateUserProfile,
  uploadAvatar,
  type UserProfile,
} from '@/services/userDashboardService';

interface ProfileSectionProps {
  profile: UserProfile;
  onUpdate: () => void;
}

export function ProfileSection({ profile, onUpdate }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    city: profile.city || '',
    address: profile.address || '',
    bio: profile.bio || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La taille du fichier ne doit pas dépasser 5 MB');
      return;
    }

    setUploading(true);
    try {
      const { error } = await uploadAvatar(file);
      if (error) throw error;
      
      onUpdate();
      alert('Photo de profil mise à jour avec succès');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateUserProfile(formData);
      if (error) throw error;
      
      setIsEditing(false);
      onUpdate();
      alert('Profil mis à jour avec succès');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      city: profile.city || '',
      address: profile.address || '',
      bio: profile.bio || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header avec avatar */}
        <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-700">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-white bg-neutral-100 flex items-center justify-center shadow-lg">
                  <User className="h-16 w-16 text-neutral-400" />
                </div>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full text-white hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50"
              >
                {uploading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="pt-20 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-h3 font-bold text-neutral-900">
                {profile.full_name || 'Nom non renseigné'}
              </h2>
              <p className="text-neutral-500">{profile.email}</p>
              {profile.is_verified && (
                <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Profil vérifié
                </span>
              )}
            </div>
            
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Nom complet */}
            <div>
              <label className="block text-small font-semibold text-neutral-700 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Nom complet
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input w-full"
                  placeholder="Votre nom complet"
                />
              ) : (
                <p className="text-neutral-900">{profile.full_name || 'Non renseigné'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-small font-semibold text-neutral-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email
              </label>
              <p className="text-neutral-900">{profile.email}</p>
              <p className="text-xs text-neutral-500 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-small font-semibold text-neutral-700 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input w-full"
                  placeholder="+225 XX XX XX XX XX"
                />
              ) : (
                <p className="text-neutral-900">{profile.phone || 'Non renseigné'}</p>
              )}
            </div>

            {/* Ville */}
            <div>
              <label className="block text-small font-semibold text-neutral-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-2" />
                Ville
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input w-full"
                  placeholder="Votre ville"
                />
              ) : (
                <p className="text-neutral-900">{profile.city || 'Non renseigné'}</p>
              )}
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-small font-semibold text-neutral-700 mb-2">
                Adresse
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input w-full"
                  placeholder="Votre adresse"
                />
              ) : (
                <p className="text-neutral-900">{profile.address || 'Non renseigné'}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-small font-semibold text-neutral-700 mb-2">
                À propos
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input w-full"
                  rows={4}
                  placeholder="Parlez-nous un peu de vous..."
                />
              ) : (
                <p className="text-neutral-900">{profile.bio || 'Non renseigné'}</p>
              )}
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  loading={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Annuler
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
