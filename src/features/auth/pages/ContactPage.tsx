import { Mail, Phone, MapPin, MessageCircle, HelpCircle, ExternalLink } from 'lucide-react';
import PageHeader from '@/shared/components/PageHeader';
import FooterCTA from '@/shared/components/FooterCTA';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Contactez-nous"
        subtitle="Une question ? Besoin d'aide ? Notre équipe est là pour vous accompagner."
        icon={<Mail className="h-8 w-8 text-white" />}
        breadcrumbs={[
          { label: 'Contact', href: '/contact' }
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="grid md:grid-cols-3 gap-8 mb-16 animate-fade-in">
          <a
            href="mailto:contact@mon-toit.ci"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 text-sm mb-2">Réponse sous 24h</p>
            <p className="text-orange-600 font-semibold">contact@mon-toit.ci</p>
          </a>

          <a
            href="tel:+2250700000000"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Téléphone</h3>
            <p className="text-gray-600 text-sm mb-2">Lun-Ven 8h-18h</p>
            <p className="text-orange-600 font-semibold">+225 07 00 00 00 00</p>
          </a>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Adresse</h3>
            <p className="text-gray-600 text-sm mb-2">Bureau principal</p>
            <p className="text-gray-700">Abidjan, Cocody<br />Côte d'Ivoire</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-slide-up stagger-1 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Comment pouvons-nous vous aider ?
          </h2>
          
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Pour toute demande, envoyez-nous un email à l'adresse ci-dessous. 
            Notre équipe vous répondra dans les plus brefs délais.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:contact@mon-toit.ci?subject=Contact Mon Toit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Mail className="h-5 w-5" />
              <span>Envoyer un email</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            
            <a
              href="tel:+2250700000000"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all duration-300"
            >
              <Phone className="h-5 w-5" />
              <span>Nous appeler</span>
            </a>
          </div>
        </div>
      </div>

      <FooterCTA
        title="Besoin d'aide supplémentaire ?"
        subtitle="Consultez notre FAQ pour des réponses immédiates ou explorez notre centre d'aide complet."
        icon={HelpCircle}
        buttons={[
          {
            label: 'Voir la FAQ',
            href: '/faq',
            icon: MessageCircle,
            variant: 'primary'
          },
          {
            label: "Centre d'aide",
            href: '/aide',
            icon: HelpCircle,
            variant: 'secondary'
          }
        ]}
      />
    </div>
  );
}