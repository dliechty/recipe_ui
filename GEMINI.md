# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Project Overview

Recipe UI is a React + TypeScript frontend application for managing recipes and meal planning. It uses Vite as the build tool, Chakra UI for components, React Query for data fetching, and connects to a backend API via auto-generated TypeScript clients from OpenAPI specifications.

## Common Commands

### Development
```bash
npm run dev           # Start development server (http://localhost:5173)
npm run build         # Build production bundle
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

### Testing
```bash
npm run test:once     # Run all tests once and exit. Do NOT use `npm run test` (it watches file for changes and agents can't handle that gracefully)
npm test:once src/features/recipes/__tests__/RecipeDetails.test.tsx  # Run a single test file
```

### API Client Generation
```bash
npm run api:sync      # Regenerate TypeScript client from openapi.json
```

**Important**: After updating `openapi.json`, always run `npm run api:sync` to regenerate the client code in `src/client/`. Never manually edit files in `src/client/` as they will be overwritten.

## Architecture Overview

### Application Structure

```
src/
├── features/           # Feature-based modules (auth, recipes, meals, admin, users)
│   ├── auth/          # Authentication (login, protected routes, password management)
│   ├── recipes/       # Recipe CRUD, filtering, comments
│   ├── meals/         # Meal planning (feature-flagged with VITE_ENABLE_MEALS_FEATURE)
│   ├── admin/         # Admin dashboard, user management, pending requests
│   └── users/         # User account management
├── components/        # Shared components (layout, error handling, common UI)
├── hooks/             # Custom React Query hooks (useRecipes, useMeals, useComments, useUsers)
├── context/           # React Context providers (AuthContext for global auth state)
├── client/            # Auto-generated API client (from openapi.json) - DO NOT EDIT MANUALLY
├── mocks/             # MSW (Mock Service Worker) handlers for testing and development
└── utils/             # Utility functions (formatters, recipeParams)
```

### Key Architectural Patterns

**Feature-Based Organization**: Each feature domain (recipes, meals, auth, etc.) contains its own components, pages, and tests. Shared components live in `src/components/`.

**Data Fetching with React Query**: All API interactions use custom hooks (e.g., `useRecipes`, `useMeals`) built on React Query. These hooks are in `src/hooks/` and handle:
- Infinite scrolling with `useInfiniteQuery`
- Mutations with automatic cache invalidation
- Custom header parsing (e.g., `X-Total-Count` for pagination)

**Auto-Generated API Client**: The `src/client/` directory contains TypeScript types and service methods generated from `openapi.json` using `openapi-typescript-codegen`. This ensures type safety between frontend and backend.

**Authentication Flow**:
- `AuthContext` (src/context/AuthContext.tsx) manages global auth state using JWT tokens
- Tokens are stored in localStorage and set on `OpenAPI.TOKEN`
- An Axios interceptor automatically logs out users on 401 responses
- `ProtectedRoute` component guards authenticated routes and redirects first-time users to `/change-password`

**Route Code Splitting**: All page components are lazy-loaded via `React.lazy()` in `AppRoutes.tsx` for optimal bundle size.

**Base URL Configuration**: The app is served from `/recipes/` base path (see `vite.config.ts` and router basename). This affects routing and asset URLs.

**MSW for Mocking**: In development mode, Mock Service Worker intercepts API requests. Handlers are in `src/mocks/`. The worker is conditionally enabled in `src/main.tsx`.

**Feature Flags**: The Meals feature can be toggled with the `VITE_ENABLE_MEALS_FEATURE=true` environment variable (see `AppRoutes.tsx` for conditional route rendering).

### Form Handling Patterns

Recipe forms use a multi-step pattern split across:
- `RecipeBasicsForm`: Core metadata, times, nutrition
- `RecipeIngredientsForm`: Component-based ingredient lists with drag-and-drop reordering
- `RecipeInstructionsForm`: Step-by-step instructions with drag-and-drop reordering

Forms maintain internal state with stable IDs for UI elements (e.g., `RecipeIngredientWithId`, `InstructionWithId`) to support drag-and-drop reordering via `@dnd-kit`. IDs are stripped before API submission.

### Recipe Filtering

Recipe filtering supports complex query parameters including:
- Text search (name, ingredients)
- Multi-select filters (category, cuisine, difficulty, diet type, protein, owner)
- Numeric range filters (calories, time fields, yield)

Filters are managed via URL search params (`src/utils/recipeParams.ts`) and passed to `useInfiniteRecipes` hook.

## Testing Strategy

- **Framework**: Vitest with jsdom environment
- **Testing Library**: React Testing Library + jest-dom matchers
- **API Mocking**: MSW configured in `src/setupTests.ts` with server.listen()
- **Test Location**: Tests are co-located with features in `__tests__/` subdirectories
- **Coverage**: Tests include unit tests for utilities, integration tests for workflows, and component tests with mocked API responses

## Environment Variables

Configure via `.env` file (see `.env.example`):
- `VITE_API_URL`: Backend API base URL (default: http://localhost:8000)
- `VITE_ENABLE_MEALS_FEATURE`: Enable meals functionality (true/false)
- `RECIPE_UI_PORT`: Port for deployment (used in Docker)

## Development Notes

- **Dark Theme**: The application uses a dark theme. All pages, components, input fields, widgets, and UI elements must conform to dark-inspired styling. Ensure high contrast and consistent use of the dark color palette provided by Chakra UI.
- The app uses React 19 with React Router v7 for routing
- Chakra UI v3 provides the component library and theming system
- All routes except login (`/`) and request account (`/request-account`) require authentication
- Admin routes (`/admin`) require the `is_admin` flag on the user object
- Recipe forms support complex nested structures (components with ingredients, multiple instructions)
- The codebase uses TypeScript strict mode with ESLint configured for React hooks and TypeScript

## General Workflow Requirements

- **Before finalizing changes or committing**:
  - Run the full test suite: `npm run test:once`
  - Check for typing errors: `npx tsc --noEmit`
  - Run the linter: `npm run lint`
  - Address all issues found before proceeding.