import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Bed, Bath, Maximize, Heart, Share2, Calendar, MessageCircle, 
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Car, Shield, 
  Wifi, Zap, Droplets, Building, Home, Star, Phone, Mail 
} from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/shared/lib/database.types';
import MapWrapper from '@/shared/ui/MapWrapper';

type Property = Database['public']['Tables']['properties']['Row'];

interface ImageGalleryProps {
  images: string[];
  title: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

function ImageGallery({ images, title, currentIndex, onIndexChange }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    images = ['/images/placeholder-property.jpg'];
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-neutral-100 rounded-xl overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-6 w-6 text-neutral-700" />
            </button>
            <button
              onClick={() => onIndexChange((currentIndex + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-6 w-6 text-neutral-700" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-sm font-semibold">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            aria-label="Ajouter aux favoris"
          >
            <Heart className="h-5 w-5 text-neutral-700" />
          </button>
          <button
            className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            aria-label="Partager"
          >
            <Share2 className="h-5 w-5 text-neutral-700" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-primary-500 shadow-lg' 
                  : 'border-neutral-200 hover:border-primary-300'
              }`}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Miniature ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PropertyFeaturesProps {
  property: Property;
}

function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const features = [];

  // Ajouter les caractéristiques principales
  if (property.bedrooms) {
    features.push({
      icon: <Bed className="h-6 w-6" />,
      label: 'Chambres',
      value: property.bedrooms.toString(),
      color: 'text-primary-500'
    });
  }

  if (property.bathrooms) {
    features.push({
      icon: <Bath className="h-6 w-6" />,
      label: 'Salles de bain',
      value: property.bathrooms.toString(),
      color: 'text-primary-500'
    });
  }

  if (property.surface_area) {
    features.push({
      icon: <Maximize className="h-6 w-6" />,
      label: 'Surface',
      value: `${property.surface_area} m²`,
      color: 'text-primary-500'
    });
  }

  if (property.parking_spaces) {
    features.push({
      icon: <Car className="h-6 w-6" />,
      label: 'Places de parking',
      value: property.parking_spaces.toString(),
      color: 'text-primary-500'
    });
  }

  if (property.property_type) {
    features.push({
      icon: property.property_type === 'house' ? <Home className="h-6 w-6" /> : <Building className="h-6 w-6" />,
      label: 'Type de bien',
      value: property.property_type === 'house' ? 'Maison' : 
             property.property_type === 'apartment' ? 'Appartement' : 
             property.property_type === 'studio' ? 'Studio' : 
             property.property_type,
      color: 'text-primary-500'
    });
  }

  // Ajouter les équipements disponibles
  if (property.amenities && property.amenities.length > 0) {
    const amenityIcons: { [key: string]: any } = {
      'wifi': <Wifi className="h-5 w-5" />,
      'electricity': <Zap className="h-5 w-5" />,
      'water': <Droplets className="h-5 w-5" />,
      'security': <Shield className="h-5 w-5" />
    };

    property.amenities.slice(0, 4).forEach((amenity) => {
      features.push({
        icon: amenityIcons[amenity] || <CheckCircle className="h-5 w-5" />,
        label: amenity.charAt(0).toUpperCase() + amenity.slice(1),
        value: 'Disponible',
        color: 'text-semantic-success'
      });
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
          <div className={`${feature.color}`}>
            {feature.icon}
          </div>
          <div>
            <div className="text-sm text-neutral-500">{feature.label}</div>
            <div className="font-semibold text-neutral-900">{feature.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface StickyCTABarProps {
  propertyId: string;
  monthlyRent: number;
}

function StickyCTABar({ propertyId, monthlyRent }: StickyCTABarProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-lg z-50 md:hidden">
      <div className="flex gap-3 max-w-sm mx-auto">
        <button
          onClick={() => navigate(`/visites/planifier/${propertyId}`)}
          className="flex-1 px-4 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="h-5 w-5" />
          <span>Planifier visite</span>
        </button>
        <button
          onClick={() => navigate(`/postuler/${propertyId}`)}
          className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Postuler
        </button>
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyBar(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProperty = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-500 font-medium">Chargement de la propriété...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Propriété introuvable</h2>
          <p className="text-neutral-500 mb-8">Cette propriété n'existe pas ou a été supprimée</p>
          <button
            onClick={() => navigate('/recherche')}
            className="btn-primary w-full sm:w-auto"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  const images = property.images || ['/images/placeholder-property.jpg'];

  return (
    <div className="min-h-screen bg-background-page">
      {/* Page Header */}
      <header className="bg-white border-b border-neutral-100">
        <div className="container max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-neutral-50 hover:bg-neutral-100 rounded-full flex items-center justify-center transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-700" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              {property.title}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-8 space-y-12">
            {/* Image Gallery */}
            <section>
              <ImageGallery
                images={images}
                title={property.title}
                currentIndex={currentImageIndex}
                onIndexChange={setCurrentImageIndex}
              />
            </section>

            {/* Property Info */}
            <section className="space-y-8">
              {/* Title, Location & Price */}
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <MapPin className="h-5 w-5" />
                      <span className="font-medium">
                        {property.city}, {property.neighborhood}
                      </span>
                    </div>
                    {property.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < property.rating! ? 'text-yellow-400 fill-current' : 'text-neutral-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-neutral-500">
                          {property.rating}/5 ({property.review_count || 0} avis)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-bold text-primary-500">
                    {property.monthly_rent?.toLocaleString()}
                  </span>
                  <span className="text-xl text-neutral-500 font-medium">FCFA/mois</span>
                </div>
              </div>

              {/* Property Features */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Caractéristiques</h2>
                <PropertyFeatures property={property} />
              </div>

              {/* Description */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Description</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-neutral-700 leading-relaxed text-lg">
                    {property.description || 'Aucune description disponible pour ce bien.'}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Équipements</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <CheckCircle className="h-5 w-5 text-semantic-success flex-shrink-0" />
                        <span className="text-neutral-700 font-medium capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Localisation</h2>
                <div className="bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200">
                  {property.longitude && property.latitude ? (
                    <MapWrapper
                      center={[property.longitude, property.latitude]}
                      zoom={15}
                      height="400px"
                      properties={[{ 
                        ...property, 
                        id: property.id, 
                        title: property.title, 
                        monthly_rent: property.monthly_rent!,
                        longitude: property.longitude,
                        latitude: property.latitude
                      }]}
                      singleMarker
                    />
                  ) : (
                    <div className="h-96 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-500 font-medium">Localisation non disponible</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <MapPin className="h-4 w-4" />
                  <span>{property.address || `${property.city}, ${property.neighborhood}`}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Owner Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Owner Contact Card */}
              <div className="card shadow-xl border-2 border-primary-100">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Propriétaire</h3>
                  <p className="text-neutral-500">Propriété gérée par Mon Toit</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate(`/postuler/${property.id}`)}
                    className="w-full btn-primary text-lg py-4"
                  >
                    Postuler maintenant
                  </button>

                  <button
                    onClick={() => navigate(`/visites/planifier/${property.id}`)}
                    className="w-full btn-secondary text-lg py-4 flex items-center justify-center gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Planifier une visite</span>
                  </button>

                  <button
                    onClick={() => navigate(`/messages/nouveau?property=${property.id}`)}
                    className="w-full px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Envoyer un message</span>
                  </button>
                </div>

                <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-neutral-900 mb-1">Sécurisé par Mon Toit</p>
                      <p className="text-neutral-600">
                        Tous les paiements et échanges sont sécurisés. Réponse garantie sous 24h.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-neutral-500">
                  <p>✅ Vérification d'identité</p>
                  <p>✅ Transaction sécurisée</p>
                  <p>✅ Support 7j/7</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h4 className="font-bold text-neutral-900 mb-4">Actions rapides</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(`tel:+22500000000`, '_self')}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <Phone className="h-5 w-5 text-primary-500" />
                    <span className="text-neutral-700">Appeler directement</span>
                  </button>
                  <button
                    onClick={() => window.open(`mailto:contact@montoit.ci`, '_self')}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <Mail className="h-5 w-5 text-primary-500" />
                    <span className="text-neutral-700">Envoyer un email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA Bar for Mobile */}
      {showStickyBar && (
        <StickyCTABar 
          propertyId={property.id} 
          monthlyRent={property.monthly_rent || 0} 
        />
      )}

      {/* Bottom padding for sticky bar on mobile */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}