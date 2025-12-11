import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Coins, Filter, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

interface SearchFilters {
  city: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
}

interface EnhancedSearchProps {
  onSearch?: (filters: SearchFilters) => void;
  showQuickFilters?: boolean;
  compact?: boolean;
}

export default function EnhancedSearch({ onSearch, showQuickFilters = true, compact = false }: EnhancedSearchProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = () => {
    if (filters.city) {
      const searches = [filters.city, ...recentSearches.filter(s => s !== filters.city)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches);
    }

    if (onSearch) {
      onSearch(filters);
    } else {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.propertyType) params.set('type', filters.propertyType);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);

      navigate(`/recherche?${params.toString()}`);
    }
  };

  const quickPriceRanges = [
    { label: '< 100k', min: '0', max: '100000' },
    { label: '100k - 250k', min: '100000', max: '250000' },
    { label: '250k - 500k', min: '250000', max: '500000' },
    { label: '> 500k', min: '500000', max: '10000000' }
  ];

  const quickCities = ['Abidjan', 'Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Abobo'];

  if (compact) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-white/70 rounded-xl px-4 py-3 border-2 border-white/50 focus-within:border-terracotta-300 transition-colors">
            <MapPin className="h-5 w-5 text-terracotta-500 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Où cherchez-vous ?"
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-600 focus:outline-none"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary px-6 py-3 flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="flex-1 flex items-center bg-white/80 rounded-2xl px-6 py-4 border-2 border-white/60 focus-within:border-terracotta-400 transition-all duration-300">
            <MapPin className="h-6 w-6 text-terracotta-500 mr-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Ville ou quartier (ex: Cocody, Plateau...)"
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-600 focus:outline-none text-lg"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              list="recent-searches"
            />
            {filters.city && (
              <button
                onClick={() => setFilters({ ...filters, city: '' })}
                className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <datalist id="recent-searches">
              {recentSearches.map((search, i) => (
                <option key={i} value={search} />
              ))}
            </datalist>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all flex items-center space-x-3 ${
              showAdvanced
                ? 'bg-terracotta-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </button>

          <button
            onClick={handleSearch}
            className="btn-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg font-semibold"
          >
            <Search className="h-6 w-6" />
            <span>Rechercher</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-white/40">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Type de bien
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-white/80 border-2 border-white/60 focus:border-terracotta-400 focus:outline-none transition-colors"
                >
                  <option value="">Tous les types</option>
                  <option value="appartement">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="chambre">Chambre</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Prix minimum (FCFA)
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Ex: 100000"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/80 border-2 border-white/60 focus:border-terracotta-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Prix maximum (FCFA)
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Ex: 500000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/80 border-2 border-white/60 focus:border-terracotta-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Chambres minimum
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl bg-white/80 border-2 border-white/60 focus:border-terracotta-400 focus:outline-none transition-colors"
                >
                  <option value="">Peu importe</option>
                  <option value="1">1+ chambre</option>
                  <option value="2">2+ chambres</option>
                  <option value="3">3+ chambres</option>
                  <option value="4">4+ chambres</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {showQuickFilters && (
        <div className="space-y-4">
          {profile?.user_type === 'locataire' && recentSearches.length > 0 && (
            <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-2xl border border-white/40">
              <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-800">Recherches récentes:</span>
                <div className="flex flex-wrap gap-3 mt-2">
                  {recentSearches.slice(0, 3).map((search, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setFilters({ ...filters, city: search });
                        handleSearch();
                      }}
                      className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 hover:bg-terracotta-50 hover:text-terracotta-700 transition-colors border border-gray-200 font-medium"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-2xl border border-white/40">
            <MapPin className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-800">Villes populaires:</span>
              <div className="flex flex-wrap gap-3 mt-2">
                {quickCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setFilters({ ...filters, city });
                      handleSearch();
                    }}
                    className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors border border-gray-200 font-medium"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-2xl border border-white/40">
            <Coins className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-800">Gammes de prix:</span>
              <div className="flex flex-wrap gap-3 mt-2">
                {quickPriceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      setFilters({ ...filters, minPrice: range.min, maxPrice: range.max });
                      handleSearch();
                    }}
                    className="px-4 py-2 bg-white rounded-full text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border border-gray-200 font-medium"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
