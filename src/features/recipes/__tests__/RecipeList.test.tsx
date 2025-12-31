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

        expect(screen.getByText('-')).toBeInTheDocument();
        expect(screen.getByText('1 serving')).toBeInTheDocument();
    });

    it('paginates recipes', async () => {
        // Create 25 mock recipes
        const mockRecipes = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            core: {
                name: `Recipe ${i + 1}`,
                id: `${i + 1}`,
                description: 'Test recipe',
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
            http.get('*/recipes', () => {
                return HttpResponse.json(mockRecipes);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Recipe 1')).toBeInTheDocument();
        });

        // Set items per page to 10 for testing
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '10' } });

        // Verify pagination with 10 items
        expect(screen.getByText('Recipe 10')).toBeInTheDocument();
        expect(screen.queryByText('Recipe 11')).not.toBeInTheDocument();

        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

        // Click next
        const nextButton = screen.getByLabelText('Next Page');
        fireEvent.click(nextButton);

        expect(screen.getByText('Recipe 11')).toBeInTheDocument();
        expect(screen.getByText('Recipe 20')).toBeInTheDocument();
        expect(screen.queryByText('Recipe 21')).not.toBeInTheDocument();
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });

    it('changes items per page', async () => {
        // Create 20 mock recipes
        const mockRecipes = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            core: {
                name: `Recipe ${i + 1}`,
                id: `${i + 1}`,
                description: 'Test recipe',
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
            http.get('*/recipes', () => {
                return HttpResponse.json(mockRecipes);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Recipe 1')).toBeInTheDocument();
        });

        // Change to 25 items per page
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: '25' } });

        expect(screen.getByText('Recipe 20')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });
});
