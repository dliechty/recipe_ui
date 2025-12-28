import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import RecipeList from '../components/RecipeList';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../context/AuthContext', () => ({
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

        // Verify time and yield fields are displayed
        expect(screen.getByText('Total Time: 30m')).toBeInTheDocument();
        expect(screen.getByText('Yield: 4 servings')).toBeInTheDocument();

        expect(screen.getByText('Total Time: 65m')).toBeInTheDocument();
        expect(screen.getByText('Yield: 6 servings')).toBeInTheDocument();

        // Verify tags are displayed
        expect(screen.getByText('Italian')).toBeInTheDocument();
    });
});
