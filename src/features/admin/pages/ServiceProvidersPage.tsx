import { useState, useMemo } from 'react';
import { TrendingUp, ArrowLeft, MessageSquare, Mail, Phone, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from '@/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { SortableProviderCard } from '../components/SortableProviderCard';
import { ProviderCard } from '../components/ProviderCard';
import { useServiceConfigurations, useUpdateServiceConfiguration, useUpdateProviderPriorities, useResetProviderPriorities } from '../hooks/useServiceConfigurations';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

const SERVICE_TABS = [
  { id: 'sms', label: 'SMS', icon: Phone },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'email', label: 'Email', icon: Mail },
];

export default function ServiceProvidersPage() {
  const [activeTab, setActiveTab] = useState('sms');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { data: configurations, isLoading, error } = useServiceConfigurations();
  const updateConfig = useUpdateServiceConfiguration();
  const updatePriorities = useUpdateProviderPriorities();
  const resetPriorities = useResetProviderPriorities();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const groupedConfigs = useMemo(() => {
    if (!configurations) return {};
    
    return configurations.reduce((acc, config) => {
      const service = config.service_name.toLowerCase();
      if (!acc[service]) acc[service] = [];
      acc[service].push(config);
      return acc;
    }, {} as Record<string, typeof configurations>);
  }, [configurations]);
  
  const activeProvider = useMemo(() => {
    if (!activeId || !configurations) return null;
    return configurations.find(c => c.id === activeId);
  }, [activeId, configurations]);
  
  const handleToggle = (id: string, enabled: boolean) => {
    updateConfig.mutate({ id, updates: { is_enabled: enabled } });
  };
  
  const handleResetPriorities = () => {
    resetPriorities.mutate(activeTab, {
      onSuccess: () => setShowResetConfirm(false),
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const items = groupedConfigs[activeTab] ?? [];
      const sortedItems = [...items].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
      
      const oldIndex = sortedItems.findIndex(i => i.id === active.id);
      const newIndex = sortedItems.findIndex(i => i.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(sortedItems, oldIndex, newIndex);
        
        const updates = reorderedItems.map((item, index) => ({
          id: item.id,
          priority: index + 1,
        }));
        
        updatePriorities.mutate(updates);
      }
    }
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
            Glissez-déposez les providers pour réorganiser les priorités. 
            Le système utilise le provider de priorité 1 en premier, puis passe au suivant en cas d'échec.
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
        
        {SERVICE_TABS.map(tab => {
          const providers = groupedConfigs[tab.id] ?? [];
          const sortedProviders = [...providers].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
          
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              {/* Header avec bouton reset */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-neutral-500">
                  {sortedProviders.length} provider(s) configuré(s)
                </p>
                {sortedProviders.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => setShowResetConfirm(true)}
                    className="text-neutral-500 hover:text-neutral-700 gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser l'ordre
                  </Button>
                )}
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={sortedProviders.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sortedProviders.length > 0 ? (
                      sortedProviders.map(config => (
                        <SortableProviderCard
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
                </SortableContext>
                
                <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                  {activeProvider && (
                    <ProviderCard
                      provider={activeProvider}
                      onToggle={() => {}}
                      isDragging={true}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser les priorités ?</DialogTitle>
            <DialogDescription>
              Cette action remettra les providers {activeTab.toUpperCase()} dans leur ordre par défaut.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleResetPriorities}
              disabled={resetPriorities.isPending}
              className="gap-2"
            >
              {resetPriorities.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
