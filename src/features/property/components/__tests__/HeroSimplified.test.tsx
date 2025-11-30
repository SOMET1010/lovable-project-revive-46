import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroSimplified } from './HeroSimplified';

describe('HeroSimplified', () => {
  const defaultProps = {
    onSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu', () => {
    it('affiche le titre et sous-titre par défaut', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      expect(screen.getByText('Trouvez votre logement idéal')).toBeInTheDocument();
      expect(screen.getByText('Des milliers de propriétés vous attendent dans toute la Côte d\'Ivoire')).toBeInTheDocument();
    });

    it('affiche les props title et subtitle personnalisées', () => {
      render(
        <HeroSimplified 
          {...defaultProps}
          title="Titre personnalisé"
          subtitle="Sous-titre personnalisé"
        />
      );
      
      expect(screen.getByText('Titre personnalisé')).toBeInTheDocument();
      expect(screen.getByText('Sous-titre personnalisé')).toBeInTheDocument();
    });

    it('affiche l\'image de fond', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const image = screen.getByAltText('Résidence moderne');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/hero-residence-moderne.jpg');
    });

    it('utilise l\'image de fond personnalisée', () => {
      render(
        <HeroSimplified 
          {...defaultProps}
          backgroundImage="/images/custom-hero.jpg"
        />
      );
      
      const image = screen.getByAltText('Résidence moderne');
      expect(image).toHaveAttribute('src', '/images/custom-hero.jpg');
    });

    it('affiche le formulaire de recherche', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      expect(screen.getByLabelText('Sélectionner une ville ou un quartier')).toBeInTheDocument();
      expect(screen.getByLabelText('Sélectionner un type de propriété')).toBeInTheDocument();
      expect(screen.getByLabelText('Saisir un budget maximum en FCFA')).toBeInTheDocument();
      expect(screen.getByLabelText('Lancer la recherche de propriétés')).toBeInTheDocument();
    });

    it('affiche les options de ville', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const citySelect = screen.getByLabelText('Sélectionner une ville ou un quartier');
      expect(citySelect).toBeInTheDocument();
      
      // Vérifier quelques villes
      const options = screen.getAllByText(/Abidjan|Bouaké|Yamoussoukro/);
      expect(options.length).toBeGreaterThan(0);
    });

    it('affiche les options de type de propriété', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const typeSelect = screen.getByLabelText('Sélectionner un type de propriété');
      expect(typeSelect).toBeInTheDocument();
      
      expect(screen.getByText('Tous les types')).toBeInTheDocument();
      expect(screen.getByText('Appartement')).toBeInTheDocument();
      expect(screen.getByText('Villa')).toBeInTheDocument();
    });
  });

  describe('Interaction formulaire', () => {
    it('permet de sélectionner une ville', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const citySelect = screen.getByLabelText('Sélectionner une ville ou un quartier');
      fireEvent.change(citySelect, { target: { value: 'Abidjan' } });
      
      expect(citySelect).toHaveValue('Abidjan');
    });

    it('permet de sélectionner un type de propriété', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const typeSelect = screen.getByLabelText('Sélectionner un type de propriété');
      fireEvent.change(typeSelect, { target: { value: 'appartement' } });
      
      expect(typeSelect).toHaveValue('appartement');
    });

    it('permet de saisir un budget', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const budgetInput = screen.getByLabelText('Saisir un budget maximum en FCFA');
      fireEvent.change(budgetInput, { target: { value: '200000' } });
      
      expect(budgetInput).toHaveValue('200000');
    });

    it('ne garde que les chiffres dans le budget', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const budgetInput = screen.getByLabelText('Saisir un budget maximum en FCFA');
      fireEvent.change(budgetInput, { target: { value: '200 000 FCFA' } });
      
      expect(budgetInput).toHaveValue('200000');
    });
  });

  describe('Soumission du formulaire', () => {
    it('appelle onSearch avec les bonnes données lors de la soumission', async () => {
      render(<HeroSimplified {...defaultProps} />);
      
      // Remplir le formulaire
      fireEvent.change(screen.getByLabelText('Sélectionner une ville ou un quartier'), {
        target: { value: 'Abidjan' }
      });
      
      fireEvent.change(screen.getByLabelText('Sélectionner un type de propriété'), {
        target: { value: 'appartement' }
      });
      
      fireEvent.change(screen.getByLabelText('Saisir un budget maximum en FCFA'), {
        target: { value: '300000' }
      });
      
      // Soumettre le formulaire
      const submitButton = screen.getByLabelText('Lancer la recherche de propriétés');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onSearch).toHaveBeenCalledWith({
          city: 'Abidjan',
          propertyType: 'appartement',
          maxBudget: '300000'
        });
      });
    });

    it('fonctionne avec des champs vides', async () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const submitButton = screen.getByLabelText('Lancer la recherche de propriétés');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onSearch).toHaveBeenCalledWith({
          city: '',
          propertyType: '',
          maxBudget: ''
        });
      });
    });

    it('empêche la soumission par défaut', () => {
      const preventDefault = jest.fn();
      render(<HeroSimplified {...defaultProps} />);
      
      const form = screen.getByRole('search');
      fireEvent.submit(form, { preventDefault });
      
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Accessibilité', () => {
    it('a les attributs ARIA appropriés', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      // Section banner
      expect(screen.getByRole('banner')).toBeInTheDocument();
      
      // Formulaire de recherche
      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByLabelText('Formulaire de recherche de propriétés')).toBeInTheDocument();
    });

    it('a les descriptions ARIA pour les champs', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      expect(screen.getByLabelText(/Ville ou quartier/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Type de bien/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Budget max.*FCFA/)).toBeInTheDocument();
    });

    it('utilise des icônes avec aria-hidden', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const mapPinIcons = screen.getAllByLabelText('', { selector: '[aria-hidden="true"]' });
      expect(mapPinIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive', () => {
    it('rend correctement sur desktop', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      // Le composant doit être présent
      expect(screen.getByRole('banner')).toBeInTheDocument();
      
      // Vérifier la classe de hauteur desktop (h-[500px])
      const heroSection = screen.getByRole('banner');
      expect(heroSection).toHaveClass('md:h-[500px]');
      expect(heroSection).toHaveClass('h-[400px]');
    });
  });

  describe('Performance', () => {
    it('l\'image est eager loaded', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const image = screen.getByAltText('Résidence moderne');
      expect(image).toHaveAttribute('loading', 'eager');
    });
  });

  describe('Validation des props', () => {
    it('fonctionne avec une fonction onSearch personnalisée', () => {
      const customOnSearch = jest.fn((filters) => {
        console.log('Recherche personnalisée:', filters);
      });
      
      render(
        <HeroSimplified 
          onSearch={customOnSearch}
          title="Test"
          subtitle="Test subtitle"
        />
      );
      
      fireEvent.click(screen.getByLabelText('Lancer la recherche de propriétés'));
      
      expect(customOnSearch).toHaveBeenCalledWith({
        city: '',
        propertyType: '',
        maxBudget: ''
      });
    });

    it('utilise l\'image par défaut si none fournie', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      const image = screen.getByAltText('Résidence moderne');
      expect(image).toHaveAttribute('src', '/images/hero-residence-moderne.jpg');
    });
  });

  describe('Message d\'aide', () => {
    it('affiche le message d\'aide pour l\'accessibilité', () => {
      render(<HeroSimplified {...defaultProps} />);
      
      expect(screen.getByText(/Laissez les champs vides pour voir toutes les annonces/)).toBeInTheDocument();
    });
  });
});

// Test d'intégration avec router
describe('HeroSimplified Integration', () => {
  it('fonctionne correctement avec useRouter de Next.js', () => {
    // Simulation d'un environnement Next.js
    const mockRouter = {
      push: jest.fn(),
    };
    
    const handleSearch = (filters) => {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.propertyType) params.set('type', filters.propertyType);
      if (filters.maxBudget) params.set('max_price', filters.maxBudget);
      
      mockRouter.push(`/search?${params.toString()}`);
    };
    
    render(<HeroSimplified onSearch={handleSearch} />);
    
    // Simuler une recherche
    fireEvent.change(screen.getByLabelText('Sélectionner une ville ou un quartier'), {
      target: { value: 'Abidjan' }
    });
    
    fireEvent.click(screen.getByLabelText('Lancer la recherche de propriétés'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/search?city=Abidjan');
  });
});

// Test de快照 pour vérifier le rendu visuel
describe('HeroSimplified Snapshots', () => {
  it('rendu par défaut correspond au snapshot', () => {
    const { container } = render(<HeroSimplified {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('rendu avec props personnalisées correspond au snapshot', () => {
    const { container } = render(
      <HeroSimplified 
        {...defaultProps}
        title="Titre personnalisé"
        subtitle="Sous-titre personnalisé"
        backgroundImage="/images/custom.jpg"
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});