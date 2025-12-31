import React from 'react';
import { renderWithProviders, screen, waitFor, fireEvent } from '../../../test-utils';
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
        expect(screen.getByText('30m')).toBeInTheDocument();
        expect(screen.getByText('4 servings')).toBeInTheDocument();

        expect(screen.getByText('65m')).toBeInTheDocument();
        expect(screen.getByText('6 servings')).toBeInTheDocument();

        // Verify tags are displayed
        expect(screen.getByText('Italian')).toBeInTheDocument();
    });

    it('hides total time badge when not provided', async () => {
        server.use(
            http.get('*/recipes', () => {
                const mockData = [
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
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
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

        expect(screen.getByText('-')).toBeInTheDocument();
        expect(screen.getByText('1 serving')).toBeInTheDocument();
    });

    it('changes items per page', async () => {
        // Create 20 mock recipes
        const mockRecipes = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            core: {
                name: `Recipe ${i + 1}`,
                id: `${i + 1}`,
                description: 'Pagination test recipe',
                owner_id: '1',
                yield_amount: 1,
                yield_unit: 'serving',
                difficulty: 'Easy',
                cuisine: 'Test',
                category: 'Test'
            },
            times: {
                total_time_minutes: 30
            }
        }));

        server.use(
            http.get('*/recipes', ({ request }) => {
                const url = new URL(request.url);
                const skip = Number(url.searchParams.get('skip') || '0');
                const limit = Number(url.searchParams.get('limit') || '10');

                const paginatedDocs = mockRecipes.slice(skip, skip + limit);

                return HttpResponse.json(paginatedDocs, {
                    headers: { 'X-Total-Count': mockRecipes.length.toString() }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        // Wait for recipes to load
        await waitFor(() => {
            expect(screen.getByText('Recipe 1')).toBeInTheDocument();
        });

        // Set items per page to 10 for testing
        const select = screen.getByTestId('items-per-page-select');
        fireEvent.change(select, { target: { value: '10' } });

        await waitFor(() => {
            expect(select).toHaveValue('10');
        });

        // Verify pagination state: 20 items / 10 per page = 2 pages
        await waitFor(() => {
            expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
        });

        // Verify items
        expect(screen.getByText('Recipe 10')).toBeInTheDocument();
        // Recipe 11 should NOT be visible on page 1 (limit 10)
        expect(screen.queryByText('Recipe 11')).not.toBeInTheDocument();
    });
});
