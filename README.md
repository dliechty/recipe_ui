# Recipe UI

A modern web application for managing recipes and meal planning, built with React and Vite.

## Overview

Recipe UI is a frontend application that allows users to view, manage, and plan their meals. It connects to a backend API to retrieve recipe data and handles user authentication and session management.

## Tech Stack & Components

This project is built using the following key technologies and libraries:

- **Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) - For a fast, typed, and efficient development experience.
- **UI Framework**: [Chakra UI](https://chakra-ui.com/) - A simple, modular, and accessible component library.
- **Routing**: [React Router](https://reactrouter.com/) - Client-side routing.
- **HTTP Client**: [Axios](https://axios-http.com/) - For making API requests.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - For production-ready animations.
- **API Client Generation**: [OpenAPI TypeScript Codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) - Generates a strongly-typed client from the OpenAPI specification.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Testing

This project uses [Vitest](https://vitest.dev/) for unit and component testing, along with [MSW (Mock Service Worker)](https://mswjs.io/) to mock API requests.

To run the tests:

```bash
npm run test:once
```

This will run all tests in the project once and exit. To run tests in watch mode, use:

```bash
npm test
```

This will run all tests in the project.

## Updating the API Client

The application uses an auto-generated client to interact with the backend API. This ensures that the frontend code is always in sync with the backend specification.

The client is generated from an `openapi.json` file located in the root of the project.

### How to Update

1.  **Obtain the latest `openapi.json`**: Ensure you have the latest OpenAPI specification file in the project root.
2.  **Run the sync command**:
    ```bash
    npm run api:sync
    ```

This command runs `openapi-typescript-codegen` to regenerate the typed client code in `src/client`. It uses the `axios` client and TypeScript interfaces defined in the spec.

**Note**: Do not modify files in `src/client` manually, as they will be overwritten the next time the sync command is run.

## Design System

The app uses a **VS Code-inspired dark theme** with a semantic token system. All colors are defined as semantic tokens in the Chakra UI theme, ensuring consistency and easy maintenance. Avoid using raw color values — always use semantic tokens.

### Semantic Token Quick Reference

| Token | Purpose |
|---|---|
| `bg.canvas` | Page background |
| `bg.surface` | Card/panel background |
| `bg.muted` | Subtle background (hover states, secondary areas) |
| `fg.default` | Primary text |
| `fg.muted` | Secondary/helper text |
| `border.default` | Standard borders |
| `button.primary` | Primary button background |
| `button.text` | Button text color |
| `button.danger` | Destructive action button |
| `button.success` | Positive action button |
| `button.secondary` | Secondary button background |
| `status.error` / `.errorBg` / `.errorBorder` | Error states |
| `status.success` / `.successBg` / `.successBorder` | Success states |
| `status.warning` / `.warningBg` / `.warningBorder` | Warning states |
| `danger.fg` / `danger.bg` | Danger text and background |
| `success.fg` / `success.bg` | Success text and background |
| `info.fg` / `info.bg` | Informational text and background |
| `link.default` | Link color |
| `badge.admin` / `badge.member` / `badge.pending` | User role badge colors |

### Do / Don't

| Do | Don't |
|---|---|
| `color="button.text"` | `color="white"` on buttons |
| `color="danger.fg"` | `color="red.600"` |
| Import `inputStyles` from `src/utils/styles.ts` | Define local input style objects |
| Use `colorPalette` prop | Use `colorScheme` prop |

### Shared Style Utilities

`src/utils/styles.ts` exports reusable style objects: `inputStyles`, `focusRingStyles`, `buttonStyles`, `selectStyles`, and `scrollbarStyles`. Use these instead of defining one-off styles in components.

### Mobile Responsiveness

All views are tested at **375px** and **768px** breakpoints. Interactive touch targets maintain a minimum size of **44x44px**.

For full details, see [Design System Documentation](./docs/design-system.md).

## Deployment

For instructions on how to deploy this application using Docker, please refer to the [Deployment Guide](./deployment_guide.md).
