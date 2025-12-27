import React from 'react';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';
import RecipeList from './RecipeList';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('RecipeList', () => {
    it('renders recipes from API', async () => {
        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        // Wait for the recipes to be displayed
        await waitFor(() => {
            expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
            expect(screen.getByText('Chicken Curry')).toBeInTheDocument();
            expect(screen.getByText('Avocado Toast')).toBeInTheDocument();
        });

        // Verify descriptions are also present
        expect(screen.getByText('A classic Italian pasta dish.')).toBeInTheDocument();

        // Verify new fields are displayed
        expect(screen.getByText('Active: 15m')).toBeInTheDocument();
        expect(screen.getByText('Cook: 15m')).toBeInTheDocument();
        expect(screen.getByText('Yield: 4 servings')).toBeInTheDocument();

        expect(screen.getByText('Active: 20m')).toBeInTheDocument();
        expect(screen.getByText('Cook: 45m')).toBeInTheDocument();
        expect(screen.getByText('Yield: 6 servings')).toBeInTheDocument();

        // Verify tags are displayed
        expect(screen.getByText('Italian')).toBeInTheDocument();
        expect(screen.getByText('Pasta')).toBeInTheDocument();
    });
});
