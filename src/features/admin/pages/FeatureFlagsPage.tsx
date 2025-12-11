import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Flag, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  Shield, 
  Map, 
  CreditCard,
  Bot,
  Bell,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { toast } from '@/shared/hooks/useSafeToast';
import { useAllFeatureFlags, useInvalidateFeatureFlags, type FeatureFlagType } from '@/shared/hooks';

const categoryIcons: Record<string, LucideIcon> = {
  verification: Shield,
  maps: Map,
  payments: CreditCard,
  signature: Shield,
  ai: Bot,
  notifications: Bell,
  default: Flag,
};

const categoryLabels: Record<string, string> = {
  verification: 'Vérification',
  maps: 'Cartes',
  payments: 'Paiements',
  signature: 'Signature',
  ai: 'Intelligence Artificielle',
  notifications: 'Notifications',
};

export default function FeatureFlagsPage() {
  const { data: flags = [], isLoading, refetch } = useAllFeatureFlags();
  const invalidateFlags = useInvalidateFeatureFlags();
  const [toggling, setToggling] = useState<string | null>(null);

  const toggleFlag = async (flag: FeatureFlagType) => {
    setToggling(flag.id);
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: !flag.is_enabled, updated_at: new Date().toISOString() })
        .eq('id', flag.id);

      if (error) throw error;
      
      toast.success(`${flag.feature_name} ${!flag.is_enabled ? 'activé' : 'désactivé'}`);
      invalidateFlags(); // Invalidate cache to refresh all components using feature flags
      refetch();
    } catch (err) {
      console.error('Error toggling flag:', err);
      toast.error('Erreur lors de la modification');
    } finally {
      setToggling(null);
    }
  };

  const getCategory = (flag: FeatureFlagType): string => {
    const config = flag.config;
    return (config?.['category'] as string) || 'default';
  };

  const groupedFlags = flags.reduce((acc, flag) => {
    const category = getCategory(flag);
    if (!acc[category]) acc[category] = [];
    acc[category].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlagType[]>);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Flag className="w-7 h-7 text-primary" />
            Feature Flags
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez l'activation des fonctionnalités de la plateforme
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="small">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{flags.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Activés</p>
          <p className="text-2xl font-bold text-green-600">{flags.filter(f => f.is_enabled).length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Désactivés</p>
          <p className="text-2xl font-bold text-amber-600">{flags.filter(f => !f.is_enabled).length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Catégories</p>
          <p className="text-2xl font-bold text-foreground">{Object.keys(groupedFlags).length}</p>
        </div>
      </div>

      {/* Flags by Category */}
      <div className="space-y-6">
        {Object.entries(groupedFlags).map(([category, categoryFlags]) => {
          const IconComponent = categoryIcons[category] ?? Flag;
          return (
            <div key={category} className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-3">
                <IconComponent className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">
                  {categoryLabels[category] || category}
                </h2>
                <span className="ml-auto text-sm text-muted-foreground">
                  {categoryFlags.filter(f => f.is_enabled).length}/{categoryFlags.length} actifs
                </span>
              </div>
              <div className="divide-y divide-border">
                {categoryFlags.map((flag) => (
                  <FlagRow
                    key={flag.id}
                    flag={flag}
                    toggling={toggling === flag.id}
                    onToggle={() => toggleFlag(flag)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Example */}
      <div className="bg-muted/30 rounded-xl p-6 border border-border">
        <h3 className="font-semibold text-foreground mb-3">Utilisation dans le code</h3>
        <pre className="bg-card p-4 rounded-lg text-sm overflow-x-auto">
{`// Vérifier un flag
import { useFeatureFlag, FEATURE_FLAGS } from '@/shared/hooks';

function MyComponent() {
  const { isEnabled } = useFeatureFlag(FEATURE_FLAGS.AI_CHATBOT);
  
  if (!isEnabled) return null;
  return <ChatbotWidget />;
}

// Ou avec le composant FeatureGate
import { FeatureGate } from '@/shared/components';

<FeatureGate feature="ai_chatbot">
  <ChatbotWidget />
</FeatureGate>`}
        </pre>
      </div>
    </div>
  );
}

function FlagRow({ 
  flag, 
  toggling, 
  onToggle 
}: { 
  flag: FeatureFlagType; 
  toggling: boolean;
  onToggle: () => void;
}) {
  const config = flag.config;
  const requiresApiKey = config?.['requires_api_key'] as boolean;

  return (
    <div className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-foreground">{flag.feature_name}</h3>
          {requiresApiKey && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Nécessite API Key
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{flag.description}</p>
      </div>
      
      <button
        onClick={onToggle}
        disabled={toggling}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          flag.is_enabled
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {toggling ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : flag.is_enabled ? (
          <ToggleRight className="w-5 h-5" />
        ) : (
          <ToggleLeft className="w-5 h-5" />
        )}
        <span className="font-medium">
          {flag.is_enabled ? 'Actif' : 'Inactif'}
        </span>
      </button>
    </div>
  );
}
