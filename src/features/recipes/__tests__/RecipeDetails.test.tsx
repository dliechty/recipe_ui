import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RecipeDetails from '../components/RecipeDetails';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('RecipeDetails', () => {
    it('renders recipe details from API', async () => {
        // Setup MSW handler for this specific test if needed, or rely on global handlers
        // The global handler in handlers.js returns id: 1 as Spaghetti Carbonara so we use that.

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/1']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // Check for loading state first if possible, or straight to waiting for content
        // expect(screen.getByText(/loading/i)).toBeInTheDocument(); 

        await waitFor(() => {
            expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
        });

        // Source
        expect(screen.getByText(/Source:/)).toBeInTheDocument();
        const sourceLink = screen.getByRole('link', { name: /Grandma/i });
        expect(sourceLink).toBeInTheDocument();
        expect(sourceLink).toHaveAttribute('href', 'https://www.example.com/spaghetti-carbonara');
        expect(sourceLink).toHaveAttribute('target', '_blank');

        // Check for Last Updated
        // The mock data has updated_at as new Date().toISOString()
        // We can't match exact date easily, but we can check if "Last Updated:" text is present
        expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();

        // expect(screen.getByText('A classic Italian pasta dish.')).toBeInTheDocument(); // Removed
        expect(screen.getByText('Active Time:')).toBeInTheDocument();
        expect(screen.getAllByText('15 min')).toHaveLength(3);
        // Long description check if rendered, or short description if fallback
        expect(screen.getByText('The classic Italian pasta dish recipe.')).toBeInTheDocument();
        expect(screen.getByText('Cooking Time:')).toBeInTheDocument();
        expect(screen.getByText('4 servings')).toBeInTheDocument();

        // Cuisine
        expect(screen.getByText('Italian')).toBeInTheDocument();

        // Ingredients
        expect(screen.getByText('Spaghetti')).toBeInTheDocument();
        expect(screen.getByText('400 g')).toBeInTheDocument();

        // Instructions
        expect(screen.getByText('Step 1')).toBeInTheDocument();
        expect(screen.getByText('Boil the pasta in salted water.')).toBeInTheDocument();
    });

    it('renders not found when recipe does not exist', async () => {
        // Override handler to return 404
        server.use(
            http.get('*/recipes/:id', () => {
                return new HttpResponse(null, { status: 404 });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/999']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load recipe')).toBeInTheDocument();
        });

        expect(screen.getByText('Back to Recipes')).toBeInTheDocument();
    });

    it('renders "Added By" with user name', async () => {
        // Mock user endpoint
        server.use(
            http.get('*/auth/users/:user_id', () => {
                return HttpResponse.json({
                    id: '1',
                    email: 'test@example.com',
                    first_name: 'John',
                    last_name: 'Doe'
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/1']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Added By: John Doe')).toBeInTheDocument();
        });
    });

    it('renders multiple components', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/2']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Chicken Curry')).toBeInTheDocument();
        });

        // Main component (Header "Main" is hidden by default in UI)
        expect(screen.queryByText('Main')).not.toBeInTheDocument();
        expect(screen.getByText('Chicken Breast')).toBeInTheDocument();

        // New Rice component
        expect(screen.getByText('Rice')).toBeInTheDocument();
        expect(screen.getByText('Basmati Rice')).toBeInTheDocument();
        expect(screen.getByText('Water')).toBeInTheDocument();
        expect(screen.getByText('Salt')).toBeInTheDocument();
    });
});
