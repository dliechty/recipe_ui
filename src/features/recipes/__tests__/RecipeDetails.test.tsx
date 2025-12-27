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

        expect(screen.getByText('Authentication spaghetti.')).toBeInTheDocument();
        expect(screen.getByText('Active Time:')).toBeInTheDocument();
        expect(screen.getAllByText('15 min')).toHaveLength(2);
        expect(screen.getByText('Cooking Time:')).toBeInTheDocument();
        expect(screen.getByText('4 servings')).toBeInTheDocument();

        // Tags
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
});
