import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import RecipeList from '../components/RecipeList';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';

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
    it('hides total time badge when not provided', async () => {
        server.use(
            http.get('*/recipes', () => {
                return HttpResponse.json([
                    {
                        id: 3,
                        core: {
                            name: 'Quick Snack',
                            description: 'No time needed.',
                            owner_id: '1',
                            yield_amount: 1,
                            yield_unit: 'serving',
                            difficulty: 'Easy',
                            cuisine: 'American',
                            category: 'Snack'
                        },
                        times: {
                            total_time_minutes: 0
                        }
                    }
                ]);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Quick Snack')).toBeInTheDocument();
        });

        expect(screen.queryByText(/Total Time:/)).not.toBeInTheDocument();
        expect(screen.getByText('Yield: 1 serving')).toBeInTheDocument();
    });
});
