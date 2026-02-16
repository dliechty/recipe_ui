# Technology Stack

## Language

- **TypeScript** (strict mode) - Statically typed JavaScript superset with strict compiler options including `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.

## Frontend Framework

- **React 19** - Core UI library
- **Vite 7** - Build tool and development server, serving from `/recipes/` base path

## UI & Styling

- **Chakra UI v3** - Component library with dark theme
- **Framer Motion** - Animation library for transitions and interactions
- **react-icons** - Icon library

## Data & State Management

- **TanStack React Query v5** - Server state management with infinite scrolling, mutations, and cache invalidation
- **React Context** - Global client state (authentication)

## Routing

- **React Router v7** - Client-side routing with lazy-loaded routes for code splitting

## HTTP & API

- **Axios** - HTTP client with interceptors for auth token management
- **openapi-typescript-codegen** - Auto-generates typed API client from OpenAPI specification into `src/client/`

## Forms & Interaction

- **@dnd-kit** (core, sortable, utilities) - Drag-and-drop for reordering ingredients and instructions
- **react-select** - Multi-select dropdowns for recipe filtering

## Authentication

- **jwt-decode** - JWT token decoding for client-side auth state

## Testing

- **Vitest** - Test runner with jsdom environment
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom DOM matchers
- **MSW v2** (Mock Service Worker) - API request mocking for tests and development

## Linting

- **ESLint 9** - Code linting
- **typescript-eslint** - TypeScript-specific lint rules
- **eslint-plugin-react-hooks** - React hooks lint rules
- **eslint-plugin-react-refresh** - React Refresh compatibility rules
