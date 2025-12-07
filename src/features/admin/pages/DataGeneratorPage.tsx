import { useState } from 'react';
import { Eye, ArrowLeft, Users, Home, FileText, RefreshCw, CreditCard, CheckCircle, AlertCircle, Loader2, Database, Trash2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

interface GenerationResult {
  success: boolean;
  message: string;
  count?: number;
}

export default function DataGeneratorPage() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, GenerationResult>>({});

  const addResult = (key: string, result: GenerationResult) => {
    setResults(prev => ({ ...prev, [key]: result }));
  };

  // Générer des propriétaires de test
  const generateOwners = async () => {
    setGenerating('owners');
    try {
      const owners = [
        { full_name: 'Jean-Paul Kouassi', email: 'jean-paul.kouassi@test.ci', phone: '2250707070701', user_type: 'owner', city: 'Abidjan' },
        { full_name: 'Marie Diabaté', email: 'marie.diabate@test.ci', phone: '2250707070702', user_type: 'owner', city: 'Abidjan' },
        { full_name: 'Ismaël Traoré', email: 'ismael.traore@test.ci', phone: '2250707070703', user_type: 'owner', city: 'Yamoussoukro' },
        { full_name: 'Agence Immobilière CI', email: 'contact@immobilier-ci.test', phone: '2250707070704', user_type: 'agent', city: 'Abidjan' },
        { full_name: 'Prestige Homes Abidjan', email: 'contact@prestige-homes.test', phone: '2250707070705', user_type: 'agent', city: 'Abidjan' },
      ];

      let count = 0;
      for (const owner of owners) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            user_id: crypto.randomUUID(),
            ...owner,
            oneci_verified: true,
            cnam_verified: true,
            is_verified: true,
            trust_score: 85,
            profile_setup_completed: true,
          }, { onConflict: 'email' });

        if (!error) count++;
      }

      addResult('owners', { success: true, message: `${count} propriétaires créés`, count });
    } catch (error) {
      addResult('owners', { success: false, message: `Erreur: ${error}` });
    } finally {
      setGenerating(null);
    }
  };

  // Générer des locataires avec différents niveaux de vérification
  const generateTenants = async () => {
    setGenerating('tenants');
    try {
      const tenants = [
        // Non vérifié - pour tester le parcours complet
        { full_name: 'Koffi Mensah', email: 'koffi.mensah@test.ci', phone: '2250708080801', user_type: 'tenant', oneci_verified: false, cnam_verified: false, facial_verification_status: 'pending', trust_score: 20 },
        // ONECI seulement - pour tester CNAM + Face
        { full_name: 'Aminata Touré', email: 'aminata.toure@test.ci', phone: '2250708080802', user_type: 'tenant', oneci_verified: true, cnam_verified: false, facial_verification_status: 'pending', trust_score: 45 },
        // ONECI + CNAM - pour tester Face
        { full_name: 'Yao Kouadio', email: 'yao.kouadio@test.ci', phone: '2250708080803', user_type: 'tenant', oneci_verified: true, cnam_verified: true, facial_verification_status: 'pending', trust_score: 65 },
        // Complètement vérifié
        { full_name: 'Fanta Diarra', email: 'fanta.diarra@test.ci', phone: '2250708080804', user_type: 'tenant', oneci_verified: true, cnam_verified: true, facial_verification_status: 'verified', trust_score: 92 },
        { full_name: 'Moussa Koné', email: 'moussa.kone@test.ci', phone: '2250708080805', user_type: 'tenant', oneci_verified: true, cnam_verified: true, facial_verification_status: 'verified', trust_score: 88 },
        // En attente de vérification faciale
        { full_name: 'Adjoua Assi', email: 'adjoua.assi@test.ci', phone: '2250708080806', user_type: 'tenant', oneci_verified: true, cnam_verified: true, facial_verification_status: 'waiting', trust_score: 70 },
        // Vérification échouée
        { full_name: 'Ibrahim Sanogo', email: 'ibrahim.sanogo@test.ci', phone: '2250708080807', user_type: 'tenant', oneci_verified: true, cnam_verified: false, facial_verification_status: 'failed', trust_score: 35 },
      ];

      let count = 0;
      for (const tenant of tenants) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            user_id: crypto.randomUUID(),
            ...tenant,
            city: 'Abidjan',
            is_verified: tenant.oneci_verified && tenant.cnam_verified && tenant.facial_verification_status === 'verified',
            profile_setup_completed: true,
          }, { onConflict: 'email' });

        if (!error) count++;
      }

      addResult('tenants', { success: true, message: `${count} locataires créés avec différents niveaux de vérification`, count });
    } catch (error) {
      addResult('tenants', { success: false, message: `Erreur: ${error}` });
    } finally {
      setGenerating(null);
    }
  };

  // Générer des propriétés
  const generateProperties = async () => {
    setGenerating('properties');
    try {
      // Récupérer les propriétaires existants
      const { data: owners } = await supabase
        .from('profiles')
        .select('user_id')
        .in('user_type', ['owner', 'agent'])
        .limit(5);

      if (!owners || owners.length === 0) {
        addResult('properties', { success: false, message: 'Aucun propriétaire trouvé. Créez d\'abord des propriétaires.' });
        return;
      }

      const properties = [
        { title: 'Villa Moderne 4 Chambres', city: 'Abidjan', neighborhood: 'Cocody Angré', property_type: 'house', monthly_rent: 450000, bedrooms: 4, bathrooms: 3, surface_area: 250, status: 'disponible' },
        { title: 'Appartement 3 Pièces Vue Lagune', city: 'Abidjan', neighborhood: 'Marcory Zone 4', property_type: 'apartment', monthly_rent: 280000, bedrooms: 2, bathrooms: 2, surface_area: 95, status: 'disponible' },
        { title: 'Studio Meublé Centre-Ville', city: 'Abidjan', neighborhood: 'Plateau', property_type: 'studio', monthly_rent: 150000, bedrooms: 1, bathrooms: 1, surface_area: 35, status: 'disponible' },
        { title: 'Duplex Luxueux Riviera', city: 'Abidjan', neighborhood: 'Riviera Palmeraie', property_type: 'apartment', monthly_rent: 650000, bedrooms: 5, bathrooms: 4, surface_area: 320, status: 'disponible' },
        { title: 'Villa Familiale Bingerville', city: 'Bingerville', neighborhood: 'Centre', property_type: 'house', monthly_rent: 350000, bedrooms: 4, bathrooms: 2, surface_area: 200, status: 'disponible' },
        { title: 'Appartement Économique Yopougon', city: 'Abidjan', neighborhood: 'Yopougon Niangon', property_type: 'apartment', monthly_rent: 85000, bedrooms: 2, bathrooms: 1, surface_area: 55, status: 'disponible' },
        { title: 'Penthouse Premium II Plateaux', city: 'Abidjan', neighborhood: 'Cocody II Plateaux', property_type: 'apartment', monthly_rent: 950000, bedrooms: 4, bathrooms: 3, surface_area: 280, status: 'disponible' },
        { title: 'Maison Traditionnelle Rénovée', city: 'Yamoussoukro', neighborhood: 'Centre', property_type: 'house', monthly_rent: 180000, bedrooms: 3, bathrooms: 2, surface_area: 150, status: 'disponible' },
        { title: 'Appartement Standing Deux Plateaux', city: 'Abidjan', neighborhood: 'Deux Plateaux Vallon', property_type: 'apartment', monthly_rent: 420000, bedrooms: 3, bathrooms: 2, surface_area: 120, status: 'loue' },
        { title: 'Villa avec Piscine Riviera 3', city: 'Abidjan', neighborhood: 'Riviera 3', property_type: 'house', monthly_rent: 800000, bedrooms: 5, bathrooms: 4, surface_area: 400, status: 'disponible' },
      ];

      let count = 0;
      for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        const ownerId = owners[i % owners.length]?.user_id;
        if (!ownerId) continue;

        const { error } = await supabase
          .from('properties')
          .insert({
            owner_id: ownerId,
            ...prop,
            address: `${prop.neighborhood}, ${prop.city}`,
            deposit_amount: prop.monthly_rent * 2,
            is_furnished: Math.random() > 0.5,
            has_parking: Math.random() > 0.3,
            has_garden: prop.property_type === 'house' && Math.random() > 0.5,
            has_ac: Math.random() > 0.4,
            latitude: 5.3364 + (Math.random() - 0.5) * 0.1,
            longitude: -4.0266 + (Math.random() - 0.5) * 0.1,
            description: `Magnifique ${prop.property_type === 'house' ? 'villa' : prop.property_type} situé(e) à ${prop.neighborhood}. Idéal pour ${prop.bedrooms > 2 ? 'famille' : 'couple ou professionnel'}. Proche des commodités.`,
          });

        if (!error) count++;
      }

      addResult('properties', { success: true, message: `${count} propriétés créées`, count });
    } catch (error) {
      addResult('properties', { success: false, message: `Erreur: ${error}` });
    } finally {
      setGenerating(null);
    }
  };

  // Générer des contrats de bail à différents stades
  const generateLeases = async () => {
    setGenerating('leases');
    try {
      // Récupérer propriétés et locataires
      const { data: properties } = await supabase
        .from('properties')
        .select('id, owner_id, monthly_rent, title')
        .eq('status', 'disponible')
        .limit(5);

      const { data: tenants } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('user_type', 'tenant')
        .limit(5);

      if (!properties?.length || !tenants?.length) {
        addResult('leases', { success: false, message: 'Besoin de propriétés et locataires. Créez-les d\'abord.' });
        return;
      }

      const leaseStatuses = [
        { status: 'brouillon', description: 'Brouillon - PDF non généré' },
        { status: 'en_attente_signature', description: 'En attente de signature' },
        { status: 'partiellement_signe', description: 'Partiellement signé (proprio OK)' },
        { status: 'actif', description: 'Actif - signé par tous' },
        { status: 'signature_electronique_pending', description: 'Signature CryptoNeo en cours' },
      ];

      let count = 0;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      for (let i = 0; i < Math.min(properties.length, tenants.length, leaseStatuses.length); i++) {
        const prop = properties[i];
        const tenant = tenants[i];
        const leaseStatus = leaseStatuses[i];
        if (!prop || !tenant) continue;

        const contractNumber = `MT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;

        const { error } = await supabase
          .from('lease_contracts')
          .insert({
            contract_number: contractNumber,
            property_id: prop.id,
            owner_id: prop.owner_id,
            tenant_id: tenant.user_id,
            status: leaseStatus.status,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            monthly_rent: prop.monthly_rent,
            deposit_amount: prop.monthly_rent * 2,
            charges_amount: Math.round(prop.monthly_rent * 0.1),
            payment_day: 5,
            landlord_signed_at: leaseStatus.status === 'partiellement_signe' || leaseStatus.status === 'actif' ? new Date().toISOString() : null,
            tenant_signed_at: leaseStatus.status === 'actif' ? new Date().toISOString() : null,
            signed_at: leaseStatus.status === 'actif' ? new Date().toISOString() : null,
          });

        if (!error) count++;
      }

      addResult('leases', { success: true, message: `${count} contrats créés avec différents statuts de signature`, count });
    } catch (error) {
      addResult('leases', { success: false, message: `Erreur: ${error}` });
    } finally {
      setGenerating(null);
    }
  };

  // Générer des paiements
  const generatePayments = async () => {
    setGenerating('payments');
    try {
      const { data: leases } = await supabase
        .from('lease_contracts')
        .select('id, tenant_id, owner_id, monthly_rent, property_id')
        .eq('status', 'actif')
        .limit(3);

      if (!leases?.length) {
        addResult('payments', { success: false, message: 'Aucun contrat actif. Créez d\'abord des contrats.' });
        return;
      }

      const paymentStatuses = ['completed', 'pending', 'failed'];
      let count = 0;

      for (const lease of leases) {
        for (let month = 0; month < 3; month++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() - month);

          const status = month === 0 ? 'pending' : paymentStatuses[Math.floor(Math.random() * 2)];

          const { error } = await supabase
            .from('payments')
            .insert({
              contract_id: lease.id,
              property_id: lease.property_id,
              payer_id: lease.tenant_id,
              receiver_id: lease.owner_id,
              amount: lease.monthly_rent,
              payment_type: 'loyer',
              status,
              due_date: dueDate.toISOString().split('T')[0],
              paid_date: status === 'completed' ? dueDate.toISOString() : null,
              payment_method: status === 'completed' ? 'mobile_money' : null,
              transaction_ref: status === 'completed' ? `TXN-${Date.now()}-${count}` : null,
            });

          if (!error) count++;
        }
      }

      addResult('payments', { success: true, message: `${count} paiements créés`, count });
    } catch (error) {
      addResult('payments', { success: false, message: `Erreur: ${error}` });
    } finally {
      setGenerating(null);
    }
  };

  // Générer le scénario complet
  const generateFullScenario = async () => {
    setGenerating('full');
    try {
      await generateOwners();
      await new Promise(r => setTimeout(r, 500));
      await generateTenants();
      await new Promise(r => setTimeout(r, 500));
      await generateProperties();
      await new Promise(r => setTimeout(r, 500));
      await generateLeases();
      await new Promise(r => setTimeout(r, 500));
      await generatePayments();

      addResult('full', { success: true, message: 'Scénario complet généré avec succès!' });
    } catch (error) {
      addResult('full', { success: false, message: `Erreur: ${error}` });
    } finally {
      setGenerating(null);
    }
  };

  // Nettoyer les données de test
  const cleanupTestData = async () => {
    if (!confirm('⚠️ Supprimer TOUTES les données de test? Cette action est irréversible.')) return;
    
    setGenerating('cleanup');
    try {
      // Supprimer dans l'ordre inverse des dépendances
      await supabase.from('payments').delete().like('transaction_ref', 'TXN-%');
      await supabase.from('lease_contracts').delete().like('contract_number', 'MT-%');
      await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profiles').delete().like('email', '%@test.ci');

      addResult('cleanup', { success: true, message: 'Données de test supprimées' });
    } catch (error) {
      addResult('cleanup', { success: false, message: `Erreur: ${error}` });
    } finally {
      setGenerating(null);
    }
  };

  const ResultBadge = ({ result }: { result?: GenerationResult }) => {
    if (!result) return null;
    return (
      <div className={`flex items-center gap-2 text-sm mt-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
        {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        <span>{result.message}</span>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Veuillez vous connecter en tant qu'admin</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Generator</h1>
            <p className="text-muted-foreground">Génération de données de test pour tester les fonctionnalités métier</p>
          </div>
        </div>
        <Link to="/admin/tableau-de-bord">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour au Dashboard
          </Button>
        </Link>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            ⚠️ Outil de développement - Les données générées permettent de tester : Signature électronique (CryptoNeo), Vérification faciale (NeoFace), Parcours complet locataire/propriétaire
          </p>
        </div>
      </div>

      {/* Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Propriétaires */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Propriétaires</h3>
              <p className="text-sm text-muted-foreground">5 propriétaires/agences</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Crée des propriétaires individuels et des agences avec profils vérifiés.
          </p>
          <Button 
            onClick={generateOwners} 
            disabled={generating !== null}
            className="w-full"
          >
            {generating === 'owners' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
            Générer Propriétaires
          </Button>
          <ResultBadge result={results['owners']} />
        </div>

        {/* Locataires */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Locataires Test</h3>
              <p className="text-sm text-muted-foreground">Différents niveaux de vérification</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Crée des locataires avec: non vérifié, ONECI only, ONECI+CNAM, complet, en attente face, échec.
          </p>
          <Button 
            onClick={generateTenants} 
            disabled={generating !== null}
            className="w-full"
          >
            {generating === 'tenants' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            Générer Locataires
          </Button>
          <ResultBadge result={results['tenants']} />
        </div>

        {/* Propriétés */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Propriétés</h3>
              <p className="text-sm text-muted-foreground">10 biens variés</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Villas, appartements, studios dans différentes villes et quartiers.
          </p>
          <Button 
            onClick={generateProperties} 
            disabled={generating !== null}
            className="w-full"
          >
            {generating === 'properties' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Home className="w-4 h-4 mr-2" />}
            Générer Propriétés
          </Button>
          <ResultBadge result={results['properties']} />
        </div>

        {/* Contrats */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Contrats de Bail</h3>
              <p className="text-sm text-muted-foreground">Différents statuts signature</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Brouillon, en attente, partiellement signé, actif, signature CryptoNeo pending.
          </p>
          <Button 
            onClick={generateLeases} 
            disabled={generating !== null}
            className="w-full"
          >
            {generating === 'leases' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Générer Contrats
          </Button>
          <ResultBadge result={results['leases']} />
        </div>

        {/* Paiements */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Paiements</h3>
              <p className="text-sm text-muted-foreground">Historique de loyers</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Paiements effectués, en attente et échoués pour chaque contrat actif.
          </p>
          <Button 
            onClick={generatePayments} 
            disabled={generating !== null}
            className="w-full"
          >
            {generating === 'payments' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
            Générer Paiements
          </Button>
          <ResultBadge result={results['payments']} />
        </div>

        {/* Scénario Complet */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Scénario Complet</h3>
              <p className="text-sm text-muted-foreground">Tout en un clic</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Génère propriétaires, locataires, propriétés, contrats et paiements en séquence.
          </p>
          <Button 
            onClick={generateFullScenario} 
            disabled={generating !== null}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {generating === 'full' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Générer Tout
          </Button>
          <ResultBadge result={results['full']} />
        </div>
      </div>

      {/* Cleanup Section */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Nettoyer les données de test</h3>
              <p className="text-sm text-red-700">Supprime tous les utilisateurs @test.ci, propriétés et contrats de test</p>
            </div>
          </div>
          <Button 
            onClick={cleanupTestData} 
            disabled={generating !== null}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            {generating === 'cleanup' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Nettoyer
          </Button>
        </div>
        <ResultBadge result={results['cleanup']} />
      </div>

      {/* Test Instructions */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Comment tester les fonctionnalités
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-foreground mb-2">🔐 Signature Électronique (CryptoNeo)</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Générer des contrats avec le bouton ci-dessus</li>
              <li>Aller sur un contrat "en_attente_signature"</li>
              <li>Cliquer sur "Signer électroniquement"</li>
              <li>Recevoir l'OTP et valider</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">👤 Vérification Faciale (NeoFace)</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Se connecter avec un locataire "oneci_only"</li>
              <li>Aller sur Mon Profil → Vérifications</li>
              <li>Lancer la vérification faciale</li>
              <li>Prendre un selfie et comparer avec CNI</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">📝 Parcours Candidature</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Se connecter comme locataire vérifié</li>
              <li>Rechercher une propriété disponible</li>
              <li>Postuler avec lettre de motivation</li>
              <li>Attendre validation propriétaire</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">💰 Paiement de Loyer</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Se connecter comme locataire avec contrat actif</li>
              <li>Aller sur Mes Paiements</li>
              <li>Payer un loyer en attente</li>
              <li>Vérifier la confirmation</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
