# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mon Toit is a real estate rental platform certified by ANSUT in Côte d'Ivoire. It's a full-stack TypeScript React application with mobile capabilities, designed to connect property owners, tenants, and agencies.

## Common Commands

### Development
```bash
npm run dev              # Start development server
npm run build           # Production build with optimizations
npm run build:dev       # Development build
npm run build:analyze   # Build with bundle analyzer
```

### Code Quality
```bash
npm run lint            # Run ESLint
npm run lint:fix        # ESLint with auto-fix
npm run format          # Format with Prettier
npm run typecheck       # TypeScript type checking
```

### Testing
```bash
npm run test            # Run unit tests
npm run test:ui         # Test UI
npm run test:coverage   # Coverage report (70% minimum)
npm run test:memory     # Memory leak tests
```

### Mobile
```bash
npm run cap:build       # Build for mobile
npm run cap:sync        # Sync with Capacitor
npm run cap:open        # Open project in native IDE
```

## Architecture

### Feature-Based Structure
The application is organized by domain features in `src/features/`:
- Each feature contains its own components, types, services, and hooks
- New features should follow this pattern
- Feature directories: admin, agency, auth, dashboard, messaging, property, tenant

### State Management
- **Zustand**: Simple client state (see `src/store/`)
- **TanStack Query**: Server state management and caching
- **React Context**: Global state (theme, auth)

### Key Patterns
1. **Protected Routes**: Use `ProtectedRoute` HOC for authenticated pages
2. **Lazy Loading**: All routes must be lazy-loaded for performance
3. **Smart Routing**: `DashboardRouter` handles role-based redirects
4. **Error Boundaries**: Comprehensive error handling throughout

### Database & Backend
- **Supabase**: PostgreSQL database with real-time features
- Migrations in `supabase/migrations/`
- RLS policies implemented for security

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Path aliases configured: `@/` for `src/`, `@/features/*` for feature directories
- Tailwind CSS with custom design tokens (see `tailwind.config.js`)
- WCAG AA accessibility compliance required

### Testing
- Unit tests with Vitest and React Testing Library
- 70% code coverage minimum
- Test files colocated with source files

### Git Workflow
- Conventional commits required (format: `type(scope): description`)
- Protected `dev` branch with PR reviews
- Pre-commit hooks enforce code quality

## Key Technical Details

### Authentication
- JWT-based via Supabase Auth
- Role-based access control (tenant, owner, agency, admin, trust-agent)
- Auth state managed in `src/features/auth/`

### Data Flow
- API services in `src/services/`
- Custom hooks in `src/hooks/`
- Shared utilities in `src/shared/`

### Mobile Development
- Capacitor for cross-platform deployment
- Config files: `capacitor.config.ts` (dev) and `capacitor.config.production.ts`
- Mobile-specific assets in `mobile/`

### Performance Optimizations
- Service worker implementation with Workbox
- Bundle splitting and lazy loading
- Optimized production builds via `vite.config.optimized.ts`

## Important Notes

- This is a French-first application (i18n structure in place)
- Mobile Money integration for payments
- Document processing with AI features
- Mapbox GL and Leaflet for mapping functionality
- Sentry integration for error tracking