import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowUpCircle,
  User,
  Shield,
  Lock,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Dispute {
  id: string;
  dispute_number: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  resolution: string | null;
  resolution_type: string | null;
  created_at: string;
  resolved_at: string | null;
  complainant_id: string;
  respondent_id: string;
  assigned_agent_id: string | null;
  evidence: Array<{ url: string; type: string }>;
}

interface DisputeMessage {
  id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
  is_internal: boolean;
}

interface Profile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  trust_score: number;
  is_verified: boolean;
}

export default function MediationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [resolution, setResolution] = useState({ type: '', text: '' });
  const [escalateReason, setEscalateReason] = useState('');

  useEffect(() => {
    if (id && user) {
      loadDispute();
      loadMessages();
    }
  }, [id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadDispute = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erreur:', error);
      toast.error('Litige non trouvé');
      navigate('/trust-agent/litiges');
      return;
    }

    setDispute(data);

    // Load profiles
    const userIds = [data.complainant_id, data.respondent_id];
    const { data: profilesData } = await supabase.rpc('get_public_profiles_safe', {
      profile_user_ids: userIds
    });

    if (profilesData) {
      const profilesMap: Record<string, Profile> = {};
      profilesData.forEach((p: Profile) => {
        profilesMap[p.user_id] = p;
      });
      setProfiles(profilesMap);
    }

    setIsLoading(false);
  };

  const loadMessages = async () => {
    if (!id) return;

    const { data } = await supabase
      .from('dispute_messages')
      .select('*')
      .eq('dispute_id', id)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !dispute) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: dispute.id,
          sender_id: user.id,
          sender_role: 'mediator',
          content: newMessage.trim(),
          is_internal: isInternal
        });

      if (error) throw error;

      // Update dispute status if first mediator message
      if (dispute.status === 'under_review') {
        await supabase
          .from('disputes')
          .update({ status: 'mediation' })
          .eq('id', dispute.id);
      }

      setNewMessage('');
      loadMessages();
      loadDispute();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.type || !resolution.text) {
      toast.error('Veuillez compléter tous les champs');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('resolve-dispute', {
        body: {
          dispute_id: dispute?.id,
          resolution: resolution.text,
          resolution_type: resolution.type
        }
      });

      if (error) throw error;

      toast.success('Litige résolu avec succès');
      setShowResolveModal(false);
      loadDispute();
      loadMessages();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la résolution');
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason) {
      toast.error('Veuillez indiquer la raison de l\'escalade');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('escalate-dispute', {
        body: {
          dispute_id: dispute?.id,
          reason: escalateReason
        }
      });

      if (error) throw error;

      toast.success('Litige escaladé');
      setShowEscalateModal(false);
      loadDispute();
      loadMessages();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'escalade');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#F16522]" />
      </div>
    );
  }

  if (!dispute) return null;

  const complainant = profiles[dispute.complainant_id];
  const respondent = profiles[dispute.respondent_id];
  const canTakeAction = ['open', 'under_review', 'mediation'].includes(dispute.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/trust-agent/litiges')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#2C1810]">{dispute.dispute_number}</h1>
            <p className="text-sm text-muted-foreground">{dispute.subject}</p>
          </div>
        </div>
        {canTakeAction && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEscalateModal(true)}>
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Escalader
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowResolveModal(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Résoudre
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-[#EFEBE9] p-6">
            <h2 className="font-semibold text-[#2C1810] mb-3">Description du litige</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{dispute.description}</p>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl border border-[#EFEBE9] overflow-hidden">
            <Tabs defaultValue="all">
              <div className="p-4 border-b border-[#EFEBE9] flex items-center justify-between">
                <h2 className="font-semibold text-[#2C1810]">Messages</h2>
                <TabsList>
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="internal">Notes internes</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="m-0">
                <div className="h-[300px] overflow-y-auto p-4 space-y-3">
                  {messages.filter(m => !m.is_internal).map((msg) => (
                    <MessageBubble key={msg.id} message={msg} profiles={profiles} currentUserId={user?.id} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </TabsContent>

              <TabsContent value="internal" className="m-0">
                <div className="h-[300px] overflow-y-auto p-4 space-y-3">
                  {messages.filter(m => m.is_internal).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucune note interne</p>
                  ) : (
                    messages.filter(m => m.is_internal).map((msg) => (
                      <MessageBubble key={msg.id} message={msg} profiles={profiles} currentUserId={user?.id} isInternal />
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {canTakeAction && (
              <div className="p-4 border-t border-[#EFEBE9]">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setIsInternal(!isInternal)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      isInternal ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    {isInternal ? 'Note interne' : 'Message public'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder={isInternal ? 'Ajouter une note interne...' : 'Écrire aux parties...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-[#F16522] hover:bg-[#F16522]/90 self-end"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Parties */}
          <div className="bg-white rounded-xl border border-[#EFEBE9] p-4">
            <h3 className="font-semibold text-[#2C1810] mb-4">Parties concernées</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Plaignant</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{complainant?.full_name || 'Utilisateur'}</p>
                    <p className="text-xs text-muted-foreground">
                      Score: {complainant?.trust_score || 0}
                      {complainant?.is_verified && <Shield className="w-3 h-3 inline ml-1 text-green-500" />}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-600 mb-1">Mis en cause</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{respondent?.full_name || 'Utilisateur'}</p>
                    <p className="text-xs text-muted-foreground">
                      Score: {respondent?.trust_score || 0}
                      {respondent?.is_verified && <Shield className="w-3 h-3 inline ml-1 text-green-500" />}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl border border-[#EFEBE9] p-4">
            <h3 className="font-semibold text-[#2C1810] mb-3">Informations</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Catégorie</dt>
                <dd className="font-medium capitalize">{dispute.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Priorité</dt>
                <dd className={`font-medium ${dispute.priority === 'urgent' ? 'text-red-600' : ''}`}>
                  {dispute.priority}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Créé le</dt>
                <dd>{format(new Date(dispute.created_at), 'dd/MM/yyyy', { locale: fr })}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résoudre le litige</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de résolution</Label>
              <Select value={resolution.type} onValueChange={(v) => setResolution(prev => ({ ...prev, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="favor_complainant">En faveur du plaignant</SelectItem>
                  <SelectItem value="favor_respondent">En faveur du mis en cause</SelectItem>
                  <SelectItem value="compromise">Compromis</SelectItem>
                  <SelectItem value="withdrawn">Litige retiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Détails de la résolution</Label>
              <Textarea
                placeholder="Expliquez la décision et les actions à prendre..."
                value={resolution.text}
                onChange={(e) => setResolution(prev => ({ ...prev, text: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleResolve}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Modal */}
      <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalader le litige</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                L'escalade transmettra ce litige à un administrateur pour traitement prioritaire.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Raison de l'escalade</Label>
              <Textarea
                placeholder="Expliquez pourquoi ce litige nécessite une attention supérieure..."
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleEscalate}>Escalader</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageBubble({ 
  message, 
  profiles, 
  currentUserId,
  isInternal = false 
}: { 
  message: DisputeMessage; 
  profiles: Record<string, Profile>;
  currentUserId?: string;
  isInternal?: boolean;
}) {
  const isOwn = message.sender_id === currentUserId;
  const isSystem = message.sender_role === 'system';
  const profile = profiles[message.sender_id];

  if (isSystem) {
    return (
      <div className="text-center">
        <span className="inline-block px-3 py-1.5 bg-[#EFEBE9] rounded-full text-xs text-muted-foreground">
          {message.content}
        </span>
      </div>
    );
  }

  const roleLabel = {
    complainant: 'Plaignant',
    respondent: 'Mis en cause',
    mediator: 'Médiateur'
  }[message.sender_role] || message.sender_role;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isOwn ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs text-muted-foreground">
            {profile?.full_name || 'Utilisateur'} ({roleLabel})
          </span>
          {isInternal && <Lock className="w-3 h-3 text-amber-500" />}
        </div>
        <div className={`rounded-xl px-3 py-2 text-sm ${
          isInternal 
            ? 'bg-amber-100 text-amber-900' 
            : isOwn 
            ? 'bg-[#F16522] text-white' 
            : 'bg-[#EFEBE9] text-[#2C1810]'
        }`}>
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
        </span>
      </div>
    </div>
  );
}
