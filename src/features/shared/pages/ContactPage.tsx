import React from 'react';
import PageLayout from '../../../shared/components/PageLayout';
import Breadcrumb from '../../../shared/components/Breadcrumb';
import ContactForm from '../components/ContactForm';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  const contactInfo = [
    {
      title: "Email",
      description: "contact@montoit.ci",
      icon: Mail,
      href: "mailto:contact@montoit.ci"
    },
    {
      title: "Téléphone",
      description: "+225 27 XX XX XX XX",
      icon: Phone,
      href: "tel:+22500000000"
    },
    {
      title: "Adresse",
      description: "Plateau, Abidjan, Côte d'Ivoire",
      icon: MapPin,
      href: "#"
    },
    {
      title: "Heures d'ouverture",
      description: "Lun-Ven: 8h00-18h00, Sam: 9h00-15h00",
      icon: Clock,
      href: "#"
    }
  ];

  const faqLinks = [
    {
      title: "Questions fréquentes",
      description: "Consultez notre FAQ pour des réponses rapides",
      href: "/faq"
    },
    {
      title: "Centre d'aide",
      description: "Guides et tutoriels pour utiliser la plateforme",
      href: "/help"
    }
  ];

  return (
    <PageLayout>
      <Breadcrumb items={[
        { label: 'Accueil', href: '/' },
        { label: 'Contact', href: '/contact' }
      ]} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter pour toute question 
            concernant nos services immobiliers ou votre compte.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                Envoyez-nous un message
              </h2>
              <ContactForm />
            </div>
          </div>
          
          {/* Informations de contact */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <a href={info.href} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.title}</h3>
                      <p className="text-gray-600">{info.description}</p>
                    </div>
                  </a>
                </div>
              );
            })}
            
            {/* Liens rapides */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Besoin d'aide rapide ?
              </h3>
              <div className="space-y-3">
                {faqLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <h4 className="font-medium text-gray-900">{link.title}</h4>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Section map ou informations supplémentaires */}
        <div className="mt-12">
          <div className="bg-gray-50 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Pourquoi nous contacter ?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Support réactif</h4>
                <p className="text-sm text-gray-600">
                  Nous répondons à toutes les demandes dans les 24h ouvrables
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Équipe dédiée</h4>
                <p className="text-sm text-gray-600">
                  Des experts immobiliers à votre disposition
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Service local</h4>
                <p className="text-sm text-gray-600">
                  Une connaissance parfaite du marché ivoirien
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
