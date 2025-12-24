# Deployment Guide

This guide explains how to deploy the Recipe UI application using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- A running instance of the Recipe API (e.g., at `http://localhost:8000`).

## Docker Deployment

The application is containerized using a multi-stage Docker build. It builds the React application and serves it using Nginx.

### 1. Build the Docker Image

To build the image, run the following command in the root of the project:

```bash
# Replace http://your-api-server:8000 with your actual API URL
docker build --build-arg VITE_API_URL=http://your-api-server:8000 -t recipe-ui .
```

> [!NOTE]
> The `VITE_API_URL` build argument is optional. If omitted, it defaults to `http://localhost:8000`.

### 2. Run the Container

Once the image is built, you can run it:

```bash
docker run -d -p 8080:80 --name recipe-ui recipe-ui
```

The application will be accessible at `http://localhost:8080`.

## Local Deployment (Without Docker)

If you prefer to run it locally without Docker:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Build the Project:**
    ```bash
    export VITE_API_URL=http://localhost:8000
    npm run build
    ```

3.  **Preview the Build:**
    ```bash
    npm run preview
    ```
