import { Search, Shield, FileText, CreditCard, Home as HomeIcon, Users, CheckCircle, ArrowRight, Sparkles, TrendingUp, Award, Lock, Zap } from 'lucide-react';
import PageHeader from '@/shared/components/PageHeader';
import FooterCTA from '@/shared/components/FooterCTA';
import SEOHead from '@/shared/components/SEOHead';
import '../../../features/property/styles/homepage-modern.css';

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  imagePosition?: 'left' | 'right';
}

function StepCard({ number, title, description, icon, color, features, imagePosition = 'right' }: StepCardProps) {
  return (
    <div className={`flex flex-col ${imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center mb-16 animate-fade-in`}>
      <div className="flex-1">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
            {number}
          </div>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 text-lg mb-6 leading-relaxed">{description}</p>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <div className={`bg-gradient-to-br ${color} rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300`}>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="text-6xl mb-4">{number === 1 ? '🔍' : number === 2 ? '🛡️' : number === 3 ? '✍️' : '💳'}</div>
            <div className="text-sm uppercase tracking-wider opacity-90 mb-2">Étape {number}</div>
            <div className="text-xl font-bold">{title}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const tenantSteps = [
    {
      number: 1,
      title: 'Recherchez votre bien idéal',
      description: 'Explorez notre catalogue de plus de 31 propriétés disponibles dans 5 villes principales de Côte d\'Ivoire. Utilisez nos filtres avancés pour trouver exactement ce que vous cherchez.',
      icon: <Search className="h-8 w-8 text-white" />,
      color: 'from-orange-500 to-red-500',
      features: [
        '31+ propriétés vérifiées disponibles',
        'Couverture dans 5 villes (Abidjan, Yamoussoukro, Bouaké, Daloa, San-Pédro)',
        'Filtres avancés : prix, chambres, type de bien, équipements',
        'Sauvegardez vos favoris et créez des alertes personnalisées',
        'Photos haute qualité et visites virtuelles'
      ],
      imagePosition: 'right' as const
    },
    {
      number: 2,
      title: 'Vérifiez votre identité',
      description: 'Créez un dossier locataire complet et sécurisé. La vérification d\'identité ONECI et la vérification biométrique renforcent la confiance entre vous et les propriétaires.',
      icon: <Shield className="h-8 w-8 text-white" />,
      color: 'from-cyan-500 to-blue-500',
      features: [
        'Inscription gratuite en 2 minutes',
        'Vérification d\'identité ONECI (Numéro National d\'Identification)',
        'Vérification biométrique faciale avec NeoFace',
        'Score locataire automatique (0-100 points)',
        'Badge "Identité Vérifiée" sur votre profil'
      ],
      imagePosition: 'left' as const
    },
    {
      number: 3,
      title: 'Visitez et postulez',
      description: 'Planifiez des visites en ligne et soumettez votre candidature avec tous vos documents vérifiés. Les propriétaires vous répondent rapidement.',
      icon: <FileText className="h-8 w-8 text-white" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Planification de visite en ligne (frais : 2 000 FCFA)',
        'Soumission de candidature avec documents',
        'Justificatifs de revenus vérifiés',
        'Réponse du propriétaire sous 48h maximum',
        'Suivi de l\'état de votre candidature en temps réel'
      ],
      imagePosition: 'right' as const
    },
    {
      number: 4,
      title: 'Signez et payez en toute sécurité',
      description: 'Signature électronique certifiée CEV avec valeur juridique et paiement 100% sécurisé via Mobile Money ou virement bancaire.',
      icon: <CreditCard className="h-8 w-8 text-white" />,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Contrat généré automatiquement (conforme Code Civil ivoirien)',
        'Signature électronique CEV via CryptoNeo (valeur juridique)',
        'Paiement Mobile Money (Orange, MTN, Moov, Wave)',
        'Virement bancaire via InTouch',
        'Reçus automatiques et historique complet'
      ],
      imagePosition: 'left' as const
    }
  ];

  const ownerSteps = [
    {
      title: 'Inscrivez-vous gratuitement',
      description: 'Créez votre compte propriétaire ou agence en quelques minutes.',
      features: ['Profil propriétaire/agence', 'Vérification identité ONECI', 'Tableau de bord complet']
    },
    {
      title: 'Publiez votre bien',
      description: 'Ajoutez votre propriété avec photos et description détaillée.',
      features: ['1ère annonce gratuite', 'Upload photos HD', 'Visibilité immédiate', 'Modification illimitée']
    },
    {
      title: 'Recevez les candidatures',
      description: 'Consultez les profils vérifiés et choisissez votre locataire idéal.',
      features: ['Notifications temps réel', 'Score locataire visible', 'Documents vérifiés', 'Historique locatif']
    },
    {
      title: 'Signez le contrat',
      description: 'Génération automatique et signature électronique certifiée.',
      features: ['Génération automatique', 'Signature CEV légale', 'Archivage sécurisé', 'Renouvellement auto']
    },
    {
      title: 'Encaissez vos loyers',
      description: 'Recevez vos paiements automatiquement chaque mois.',
      features: ['Paiement automatique', 'Virement sous 48h', 'Commission 5%', 'Reçus fiscaux']
    }
  ];

  const securityFeatures = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Certification ANSUT',
      description: 'Conforme aux normes de l\'Autorité Nationale des Services Universels de Télécommunications'
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'Sécurité Maximum',
      description: 'Chiffrement SSL 256-bit et protection des données personnelles (conformité RGPD)'
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Signature Électronique',
      description: 'Signature CEV via CryptoNeo avec valeur juridique reconnue par l\'État ivoirien'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Traitement Rapide',
      description: 'Candidatures traitées en 48h, paiements virés en 48h, contrats générés instantanément'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEOHead
        title="Comment ça marche | Mon Toit"
        description="Découvrez comment trouver votre logement en 4 étapes simples : recherche, vérification d'identité, signature électronique et paiement sécurisé. Guide complet de la plateforme Mon Toit en Côte d'Ivoire."
        keywords="guide, comment ça marche, location immobilière, côte d'ivoire, étapes, processus"
      />

      <PageHeader
        title="Comment ça marche ?"
        subtitle="Trouvez votre logement en 4 étapes simples et sécurisées"
        icon={<Sparkles className="h-8 w-8 text-white" />}
        breadcrumbs={[
          { label: 'Comment ça marche', href: '/comment-ca-marche' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Section Intro */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-6 py-3 rounded-full font-semibold mb-6">
            <HomeIcon className="h-5 w-5" />
            <span>Pour les Locataires</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            4 étapes pour trouver votre logement idéal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            De la recherche au paiement, nous vous accompagnons à chaque étape avec des outils modernes et sécurisés
          </p>
        </div>

        {/* Étapes Locataires */}
        <div className="mb-32">
          {tenantSteps.map((step, index) => (
            <StepCard key={index} {...step} />
          ))}
        </div>

        {/* Section Propriétaires */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 mb-20 animate-slide-up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-cyan-600 text-white px-6 py-3 rounded-full font-semibold mb-6">
              <Users className="h-5 w-5" />
              <span>Pour les Propriétaires</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Louez votre bien en 5 étapes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gérez vos locations en toute simplicité avec notre plateforme automatisée
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownerSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="mb-20 animate-fade-in">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold mb-6">
              <Shield className="h-5 w-5" />
              <span>Sécurité & Conformité</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Votre sécurité est notre priorité
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Certification ANSUT, vérification d'identité et signature électronique légale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:border-green-300 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 mb-20 text-white animate-slide-up">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">31+</div>
              <div className="text-xl opacity-90">Propriétés Vérifiées</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">5</div>
              <div className="text-xl opacity-90">Villes Couvertes</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-xl opacity-90">Paiements Sécurisés</div>
            </div>
          </div>
        </div>

      </div>

      <FooterCTA
        title="Prêt à commencer ?"
        subtitle="Rejoignez des centaines d'utilisateurs qui font confiance à Mon Toit pour leur location immobilière"
        icon={TrendingUp}
        buttons={[
          {
            label: 'Commencer maintenant',
            href: '/inscription',
            icon: ArrowRight,
            variant: 'primary'
          },
          {
            label: 'Explorer les biens',
            href: '/recherche',
            icon: Search,
            variant: 'secondary'
          }
        ]}
      />
    </div>
  );
}
