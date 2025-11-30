import React from 'react';
import { 
  Search,
  Filter,
  Calendar,
  MapPin,
  Building,
  User,
  FileText,
  DollarSign,
  Star,
  X,
  ChevronDown,
  Download,
  Upload
} from 'lucide-react';

export interface FilterOptions {
  search: string;
  status: string;
  documentsStatus: string;
  priority: string;
  propertyType: string;
  propertyAddress: string;
  dateRange: {
    from: string;
    to: string;
  };
  priceRange: {
    min: string;
    max: string;
  };
  hasVisited: boolean | null;
  creditScoreRange: {
    min: string;
    max: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ApplicationFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  role: 'tenant' | 'owner' | 'agency';
  onExport?: () => void;
  onImport?: () => void;
  onClearFilters?: () => void;
  showAdvancedFilters?: boolean;
  propertyOptions?: { value: string; label: string }[];
  agentOptions?: { value: string; label: string }[];
  totalResults?: number;
}

const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  filters,
  onFiltersChange,
  role,
  onExport,
  onImport,
  onClearFilters,
  showAdvancedFilters = true,
  propertyOptions = [],
  agentOptions = [],
  totalResults = 0
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleNestedFilterChange = (parent: keyof FilterOptions, key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [parent]: {
        ...(filters[parent] as any),
        [key]: value
      }
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.status !== 'all' ||
      filters.documentsStatus !== 'all' ||
      filters.priority !== 'all' ||
      filters.propertyType !== 'all' ||
      filters.propertyAddress ||
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.priceRange.min ||
      filters.priceRange.max ||
      filters.hasVisited !== null ||
      filters.creditScoreRange.min ||
      filters.creditScoreRange.max
    );
  };

  const getStatusOptions = () => {
    const baseOptions = [
      { value: 'all', label: 'Tous les statuts' },
      { value: 'en_attente', label: 'En attente' },
      { value: 'en_cours', label: 'En cours' },
      { value: 'accepte', label: 'Accepté' },
      { value: 'refuse', label: 'Refusé' }
    ];

    if (role === 'tenant') {
      baseOptions.push({ value: 'annule', label: 'Annulé' });
    }

    return baseOptions;
  };

  const getDocumentsStatusOptions = () => [
    { value: 'all', label: 'Tous les documents' },
    { value: 'incomplet', label: 'Incomplet' },
    { value: 'en_verification', label: 'En vérification' },
    { value: 'complet', label: 'Complet' }
  ];

  const getPriorityOptions = () => [
    { value: 'all', label: 'Toutes priorités' },
    { value: 'haute', label: 'Haute' },
    { value: 'normale', label: 'Normale' },
    { value: 'basse', label: 'Basse' }
  ];

  const getPropertyTypeOptions = () => [
    { value: 'all', label: 'Tous les types' },
    { value: 'appartement', label: 'Appartement' },
    { value: 'villa', label: 'Villa' },
    { value: 'maison', label: 'Maison' },
    { value: 'studio', label: 'Studio' },
    { value: 'immeuble', label: 'Immeuble' }
  ];

  const getSortOptions = () => {
    const baseOptions = [
      { value: 'applicationDate', label: 'Date de candidature' },
      { value: 'lastUpdate', label: 'Dernière mise à jour' },
      { value: 'propertyTitle', label: 'Nom de la propriété' },
      { value: 'propertyRent', label: 'Loyer' },
      { value: 'applicantName', label: 'Nom du candidat' }
    ];

    if (role === 'owner' || role === 'agency') {
      baseOptions.push(
        { value: 'creditScore', label: 'Score de crédit' },
        { value: 'applicantIncome', label: 'Revenus' }
      );
    }

    baseOptions.push({ value: 'priority', label: 'Priorité' });

    return baseOptions;
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Filtres de recherche</h3>
            <p className="text-sm text-neutral-600">
              {totalResults} candidature{totalResults !== 1 ? 's' : ''} trouvée{totalResults !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Export/Import buttons for owners/agencies */}
            {(role === 'owner' || role === 'agency') && (
              <>
                <button
                  onClick={onImport}
                  className="inline-flex items-center px-3 py-2 text-sm text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors duration-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importer
                </button>
                <button
                  onClick={onExport}
                  className="inline-flex items-center px-3 py-2 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
              </>
            )}

            {/* Clear filters */}
            {hasActiveFilters() && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Effacer
              </button>
            )}

            {/* Toggle advanced filters */}
            {showAdvancedFilters && (
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center px-3 py-2 text-sm text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Avancé
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                  showAdvanced ? 'rotate-180' : ''
                }`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder={
              role === 'tenant' 
                ? 'Rechercher une propriété...' 
                : role === 'owner'
                ? 'Rechercher un candidat...'
                : 'Rechercher une candidature...'
            }
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Row 1: Status, Documents, Priority */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Documents
            </label>
            <select
              value={filters.documentsStatus}
              onChange={(e) => handleFilterChange('documentsStatus', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getDocumentsStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Priorité
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getPriorityOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Property Type, Address (if available), Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Type de propriété
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {getPropertyTypeOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {(role === 'owner' || role === 'agency') && propertyOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Propriété
              </label>
              <select
                value={filters.propertyAddress}
                onChange={(e) => handleFilterChange('propertyAddress', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Toutes les propriétés</option>
                {propertyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Trier par
            </label>
            <div className="flex">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {getSortOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-l-0 border-neutral-300 rounded-r-lg hover:bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                title={filters.sortOrder === 'asc' ? 'Ascendant' : 'Descendant'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-neutral-200 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">Filtres avancés</h4>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => handleNestedFilterChange('dateRange', 'from', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => handleNestedFilterChange('dateRange', 'to', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Loyer minimum (F CFA)
              </label>
              <input
                type="number"
                placeholder="Ex: 100000"
                value={filters.priceRange.min}
                onChange={(e) => handleNestedFilterChange('priceRange', 'min', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Loyer maximum (F CFA)
              </label>
              <input
                type="number"
                placeholder="Ex: 500000"
                value={filters.priceRange.max}
                onChange={(e) => handleNestedFilterChange('priceRange', 'max', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Additional filters for owner/agency */}
          {(role === 'owner' || role === 'agency') && (
            <>
              {/* Credit Score Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Score de crédit minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ex: 70"
                    value={filters.creditScoreRange.min}
                    onChange={(e) => handleNestedFilterChange('creditScoreRange', 'min', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Score de crédit maximum
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ex: 90"
                    value={filters.creditScoreRange.max}
                    onChange={(e) => handleNestedFilterChange('creditScoreRange', 'max', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Visit Status */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Statut de visite
                </label>
                <select
                  value={filters.hasVisited === null ? 'all' : filters.hasVisited.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('hasVisited', value === 'all' ? null : value === 'true');
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Toutes</option>
                  <option value="true">Visitées</option>
                  <option value="false">Non visitées</option>
                </select>
              </div>
            </>
          )}

          {/* Agent filter for agency */}
          {role === 'agency' && agentOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Agent responsable
              </label>
              <select
                value={filters.propertyAddress} // Using propertyAddress as temporary holder for agent filter
                onChange={(e) => handleFilterChange('propertyAddress', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tous les agents</option>
                {agentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationFilters;