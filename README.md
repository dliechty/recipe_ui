# Recipe UI

A modern web application for managing recipes and meal planning, built with React and Vite.

## Overview

Recipe UI is a frontend application that allows users to view, manage, and plan their meals. It connects to a backend API to retrieve recipe data and handles user authentication and session management.

## Tech Stack & Components

This project is built using the following key technologies and libraries:

- **Core**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) - For a fast and efficient development experience.
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

This command runs `openapi-typescript-codegen` to regenerate the client code in `src/client`. It uses the `axios` client and types defined in the spec.

**Note**: Do not modify files in `src/client` manually, as they will be overwritten the next time the sync command is run.

## Deployment

For instructions on how to deploy this application using Docker, please refer to the [Deployment Guide](./deployment_guide.md).
