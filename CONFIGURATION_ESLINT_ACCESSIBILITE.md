# CONFIGURATION ESLINT ACCESSIBILITÉ
## MonToitVPROD - Règles et Configuration

---

## 📋 ESLINT CONFIGURATION

### **Fichier: `.eslintrc.js` - Règles d'Accessibilité**

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended', // Règles d'accessibilité
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: [
    'jsx-a11y',
    '@typescript-eslint',
    'react',
    'react-hooks'
  ],
  rules: {
    // === RÈGLES D'ACCESSIBILITÉ STRICTES ===
    
    // Alt text obligatoire sur toutes les images
    'jsx-a11y/alt-text': [
      'error',
      {
        elements: ['img'],
        img: ['Image']
      }
    ],
    
    // Aria-label obligatoire sur les éléments interactifs sans texte
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    
    // Role et propriétés ARIA appropriés
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    
    // Boutons et liens
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton']
      }
    ],
    
    // Événements du clavier
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    
    // Focus management
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',
    
    // Contrôles de formulaire
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/label-has-for': 'error',
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/form-control-has-label': 'error',
    
    // Media et images
    'jsx-a11y/media-has-caption': 'warn',
    
    // Structure du document
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/lang': 'error',
    'jsx-a11y/no-distracting-elements': 'error',
    
    // === RÈGLES PERSONNALISÉES ===
    
    // Interdiction des boutons iconographiques sans aria-label
    'jsx-a11y/no-icon-without-label': 'error',
    
    // Alt text descriptif pour les images
    'jsx-a11y/alt-text-length': [
      'error',
      {
        minLength: 3,
        maxLength: 100
      }
    ],
    
    // Hiérarchie des titres respectée
    'jsx-a11y/heading-order': 'warn',
    
    // Contraste de couleur (à implémenter avec un autre outil)
    'jsx-a11y/color-contrast': 'off', // Désactivé car géré par stylelint
  },
  settings: {
    'jsx-a11y': {
      components: {
        Button: 'button',
        Input: 'input',
        TextArea: 'textarea',
        Select: 'select'
      }
    }
  }
};
```

---

## 🎨 STYLELINT ACCESSIBILITÉ

### **Fichier: `.stylelintrc.json`**

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-accessibility"
  ],
  "rules": {
    "color-hex-case": "lower",
    "color-hex-length": "short",
    "color-named": "never",
    "color-no-invalid-hex": true,
    "function-allowed-list": [
      "calc",
      "min",
      "max",
      "clamp"
    ],
    
    // === RÈGLES D'ACCESSIBILITÉ ===
    
    // Contraste minimum 4.5:1 pour le texte normal
    "color-contrast-ratio": [
      true,
      {
        "min-contrast-ratio": 4.5
      }
    ],
    
    // Contraste minimum 3:1 pour les éléments UI
    "color-contrast-notation": "hex",
    "color-function-notation": "modern",
    
    // Tailles de police minimales
    "font-size-no-unimportant-values": true,
    
    // Focus visible obligatoire
    "focus-visible-no-unsupported-pseudo-classes": true,
    
    // Pas de pointer-events: none sur les éléments interactifs
    "no-unsupported-browser-features": true,
    
    // Taille minimum des zones cliquables (44px)
    "selector-max-id": 1,
    "selector-combinator-space-after": "always",
    "selector-attribute-quotes": "always"
  }
}
```

---

## 🔧 CONFIGURATION PRETTIER

### **Fichier: `.prettierrc`**

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "jsxBracketSameLine": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  
  // === ACCESSIBILITÉ ===
  
  // S'assurer que les balises auto-fermantes ont un espace
  "htmlWhitespaceSensitivity": "css",
  
  // Garder les attributs ARIA sur une seule ligne
  "proseWrap": "preserve"
}
```

---

## 🧪 CONFIGURATION JEST ACCESSIBILITÉ

### **Fichier: `jest.config.js`**

```javascript
module.exports = {
  // ... autres config
  setupFilesAfterEnv: ['<rootDir>/src/test/setup-a11y-tests.ts'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### **Fichier: `src/test/setup-a11y-tests.ts`**

```typescript
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Étendre les matchers Jest
expect.extend(toHaveNoViolations);

// Configuration globale pour les tests d'accessibilité
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Helper pour les tests d'accessibilité
export const testA11y = async (component: React.ReactElement) => {
  const { container } = render(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Helper pour les tests d'accessibilité avec options
export const testA11yWithOptions = async (
  component: React.ReactElement,
  options: Parameters<typeof axe>[1] = {}
) => {
  const { container } = render(component);
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};
```

---

## 📝 EXEMPLES DE TESTS D'ACCESSIBILITÉ

### **Test d'un Composant Button**

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { testA11y } from '@/test/setup-a11y-tests';
import Button from './Button';

describe('Button Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    await testA11y(
      <Button variant="primary" onClick={() => {}}>
        Click me
      </Button>
    );
  });

  it('should have proper aria-label when used as icon button', async () => {
    render(
      <Button
        variant="ghost"
        onClick={() => {}}
        aria-label="Close modal"
        className="p-2"
      >
        ×
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /close modal/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Close modal');
  });

  it('should have loading state announced to screen readers', async () => {
    render(
      <Button loading onClick={() => {}}>
        Submit
      </Button>
    );
    
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
```

### **Test d'un Composant Modal**

```typescript
// Modal.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testA11y } from '@/test/setup-a11y-tests';
import Modal from './Modal';

describe('Modal Accessibility', () => {
  it('should not have accessibility violations when open', async () => {
    await testA11y(
      <Modal isOpen onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );
  });

  it('should trap focus when modal is open', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    
    render(
      <div>
        <button>Before Modal</button>
        <Modal isOpen onClose={handleClose} title="Test Modal">
          <button data-testid="modal-button">Modal Button</button>
        </Modal>
        <button>After Modal</button>
      </div>
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveFocus();
    
    // Test that focus is trapped within modal
    await user.tab();
    expect(screen.getByTestId('modal-button')).toHaveFocus();
  });

  it('should close with Escape key', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    
    render(
      <Modal isOpen onClose={handleClose} title="Test Modal">
        Modal content
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });
});
```

---

## 📋 CHECKLIST PRÉ-COMMIT

### **Fichier: `.husky/pre-commit`**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running accessibility checks..."

# 1. Vérification ESLint avec règles d'accessibilité
echo "Running ESLint with accessibility rules..."
npx eslint src --ext .ts,.tsx --max-warnings 0

if [ $? -ne 0 ]; then
  echo "❌ ESLint accessibility checks failed!"
  exit 1
fi

# 2. Tests d'accessibilité
echo "Running accessibility tests..."
npm run test:a11y

if [ $? -ne 0 ]; then
  echo "❌ Accessibility tests failed!"
  exit 1
fi

# 3. Build de test pour vérifier qu'il n'y a pas d'erreurs de build
echo "Running build check..."
npm run build:test

if [ $? -ne 0 ]; then {
  echo "❌ Build failed!"
  exit 1
}

echo "✅ All accessibility checks passed!"
exit 0
```

### **Package.json Scripts**

```json
{
  "scripts": {
    "lint:a11y": "eslint src --ext .ts,.tsx --rule 'jsx-a11y/*:error'",
    "test:a11y": "jest --testPathPattern=a11y.test.tsx",
    "test:a11y:watch": "jest --testPathPattern=a11y.test.tsx --watch",
    "test:a11y:coverage": "jest --coverage --testPathPattern=a11y.test.tsx",
    "build:test": "tsc --noEmit"
  }
}
```

---

## 🛠️ COMMANDES UTILES

### **Tests d'Accessibilité**

```bash
# Lancer tous les tests d'accessibilité
npm run test:a11y

# Lancer les tests en mode watch
npm run test:a11y:watch

# Générer un rapport de couverture
npm run test:a11y:coverage

# Vérifier manuellement avec axe DevTools
npm run dev
# Puis ouvrir Chrome DevTools > axe DevTools
```

### **Lint avec Règles d'Accessibilité**

```bash
# Vérifier uniquement les règles d'accessibilité
npm run lint:a11y

# Corriger automatiquement certains problèmes
npx eslint src --ext .ts,.tsx --fix

# Vérifier un fichier spécifique
npx eslint src/components/Button.tsx --rule 'jsx-a11y/alt-text:error'
```

---

**Cette configuration complète garantit que les problèmes d'accessibilité sont détectés tôt dans le processus de développement et prevents their introduction dans la codebase.**