# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MonToit is a comprehensive real estate rental platform built for the Ivorian market, connecting tenants, property owners, and agencies. The platform supports property listings, rental applications, contract management, and secure payments with integrated verification systems.

## Tech Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand for global state, TanStack Query for server state
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Mobile**: Capacitor 7.4.4 for iOS/Android deployment
- **Maps**: Transitioning from Mapbox to OpenStreetMap with Leaflet
- **Testing**: Vitest with React Testing Library
- **Error Tracking**: Sentry
- **Monitoring**: Google Analytics 4

## Project Structure

### Core Architecture

```
src/
├── app/                 # App routing and layout configuration
├── features/            # Domain-driven feature modules
│   ├── admin/          # Admin panel functionality
│   ├── agency/         # Agency management features
│   ├── auth/           # Authentication flows
│   ├── contract/       # Rental contract management
│   ├── dashboard/      # Role-based dashboards
│   ├── dispute/        # Dispute resolution system
│   ├── messaging/      # Internal messaging
│   ├── owner/          # Property owner features
│   ├── property/       # Property listings and management
│   ├── tenant/         # Tenant features
│   ├── trust-agent/    # Verification services
│   └── verification/   # Document verification
├── shared/             # Cross-cutting concerns
│   ├── constants/      # Application constants
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript type definitions
│   ├── ui/             # Reusable UI components
│   └── utils/          # Utility functions
├── hooks/              # Custom React hooks
├── lib/                # External library integrations
├── store/              # Zustand stores
└── pages/              # Route components
```

### Key Patterns

1. **Feature-First Architecture**: Each domain (property, auth, etc.) has its own module with components, services, types, and hooks
2. **Service Layer**: API calls are abstracted into service classes with built-in caching and error handling
3. **Route Protection**: Role-based access control using ProtectedRoute components
4. **Lazy Loading**: Code splitting at the route level for performance
5. **Type Safety**: Full TypeScript coverage with auto-generated Supabase types

## Database Schema

### Core Tables

- **profiles**: User profiles with role-based access (tenant, owner, agent)
- **properties**: Property listings with location, pricing, and amenities
- **applications**: Rental applications with status tracking
- **contracts**: Rental agreements with digital signatures
- **documents**: File storage for verification and contracts
- **messages**: Internal messaging system
- **reviews**: User rating and review system

### Security

- Row Level Security (RLS) on all tables
- Secure views for public data (e.g., `public_profiles_view`)
- Edge functions for sensitive operations
- JWT-based authentication with Supabase Auth

## Key Services

### API Services

- **property.api.ts**: Property CRUD with caching and location-based search
- **auth.api.ts**: Authentication and user management
- **application.api.ts**: Rental application processing
- **contract.api.ts**: Contract generation and management
- **messaging.api.ts**: Real-time messaging

### Business Services

- **validationService.ts**: Multi-step form validation
- **scoringService.ts**: Trust score calculations
- **businessRulesService.ts**: Platform business logic
- **exportService.ts**: Data export functionality

## State Management

### Zustand Stores

- **authStore**: User authentication state
- **uiStore**: UI state (modals, sidebars)
- **messageSettingsStore**: Notification preferences

### React Query

Used for all server state with:
- Automatic caching and refetching
- Optimistic updates
- Infinite queries for paginated data

## Development Workflow

### Scripts

```bash
# Development
npm run dev              # Start dev server on port 8080
npm run build            # Production build
npm run build:dev        # Development build
npm run build:analyze    # Build with bundle analyzer

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier formatting
npm run typecheck        # TypeScript type checking

# Testing
npm run test             # Run unit tests
npm run test:ui          # Test UI with Vitest
npm run test:coverage    # Coverage report
npm run memory-check     # Memory leak detection

# Mobile
npx cap sync            # Sync web assets to native
npx cap run android     # Run on Android
npx cap run ios         # Run on iOS
```

### Environment Configuration

The app detects local Supabase instances and adjusts behavior:
- Edge Functions are simulated locally
- RPC calls are skipped in development
- Hot reload from Lovable sandbox in dev mode

## Important Notes

### Map Integration

Currently transitioning from Mapbox to OpenStreetMap:
- New components use Leaflet/OpenStreetMap
- Legacy Mapbox components are being replaced
- Check `MapWrapper` component for latest implementation

### Mobile Responsiveness

- Responsive design with mobile-first approach
- Capacitor configuration in `capacitor.config.ts`
- Native features: Camera, Geolocation, Push Notifications

### Testing Strategy

- Unit tests for business logic and utilities
- Integration tests for API services
- Memory leak validation for React components
- Automated validation testing for forms

### Role-Based Access

Three main user types:
1. **Tenants** (`locataire`): Browse properties, apply for rentals
2. **Owners** (`proprietaire`): List properties, manage rentals
3. **Agencies** (`agence`): Manage properties for multiple owners

Plus system roles:
- **Admin**: Full platform access
- **Trust Agent**: Verify users and properties
- **Moderator**: Content moderation

### Performance Optimizations

- Service worker for caching
- Lazy loading for routes and components
- Image compression for uploads
- IndexedDB for client-side caching
- Bundle optimization with rollup-plugin-visualizer

### Security Considerations

- Never use direct table joins in favor of secure views
- All API calls go through service layer with error handling
- File uploads are validated and compressed
- Input validation on all forms
- CSRF protection with Supabase

## Common Pitfalls

1. **Direct Database Access**: Always use service layer, not direct Supabase calls
2. **Role Checks**: Use `ProtectedRoute` component for route protection
3. **Form Validation**: Use `validationService` for consistent validation
4. **Caching**: Be mindful of cache invalidation when updating data
5. **Type Safety**: Always use generated types from Supabase

## Debugging Tips

- Check browser console for Supabase connection issues
- Use React Query DevTools for API debugging
- Sentry integration for error tracking
- Memory leak detection tools available via npm scripts
- Network tab for Edge Function debugging

## Future Considerations

- Complete migration from Mapbox to OpenStreetMap
- Enhanced offline capabilities with IndexedDB
- Real-time updates with Supabase subscriptions
- Advanced search and filtering
- Payment integration with local providers