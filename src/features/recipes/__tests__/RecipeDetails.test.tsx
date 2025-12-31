import React from 'react';
import { renderWithProviders, screen, waitFor } from '../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RecipeDetails from '../components/RecipeDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';

// Mock AuthContext - default to non-admin, different user
const mockUseAuth = vi.fn();
vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

describe('RecipeDetails', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: { id: '999', is_admin: false } }); // Default: random user
    });

    it('renders recipe details from API', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/1']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
        });

        // Source
        expect(screen.getByText(/Source:/)).toBeInTheDocument();
        const sourceLink = screen.getByRole('link', { name: /Grandma/i });
        expect(sourceLink).toBeInTheDocument();
        expect(sourceLink).toHaveAttribute('href', 'https://www.example.com/spaghetti-carbonara');
        expect(sourceLink).toHaveAttribute('target', '_blank');

        expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
        expect(screen.getByText('Active Time:')).toBeInTheDocument();
        expect(screen.getAllByText('15m')).toHaveLength(3);
        expect(screen.getByText('The classic Italian pasta dish recipe.')).toBeInTheDocument();
        expect(screen.getByText('Cooking Time:')).toBeInTheDocument();
        expect(screen.getByText('4 servings')).toBeInTheDocument();
        expect(screen.getByText('Italian')).toBeInTheDocument();
        expect(screen.getByText('Spaghetti')).toBeInTheDocument();
        expect(screen.getByText('400 g')).toBeInTheDocument();
        expect(screen.getByText('Step 1')).toBeInTheDocument();
        expect(screen.getByText('Boil the pasta in salted water.')).toBeInTheDocument();

        // Comments
        await waitFor(() => {
            expect(screen.getByText(/COMMENTS/)).toBeInTheDocument();
        });
    });



    it('renders not found when recipe does not exist', async () => {
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

        expect(screen.queryByText('Main')).not.toBeInTheDocument();
        expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
        expect(screen.getByText('Rice')).toBeInTheDocument();
        expect(screen.getByText('Basmati Rice')).toBeInTheDocument();
        expect(screen.getByText('Water')).toBeInTheDocument();
        expect(screen.getByText('Salt')).toBeInTheDocument();
    });

    it('hides time categories when not provided', async () => {
        server.use(
            http.get('*/recipes/:id', () => {
                return HttpResponse.json({
                    id: 3,
                    core: {
                        name: 'Simple Salad',
                        description: 'A quick salad.',
                        owner_id: '1',
                        yield_amount: 1,
                        yield_unit: 'serving',
                        difficulty: 'Easy',
                        cuisine: 'American',
                        category: 'Salad'
                    },
                    times: {
                        total_time_minutes: 0,
                        prep_time_minutes: 0,
                        active_time_minutes: 0,
                        cook_time_minutes: 0
                    },
                    instructions: [],
                    components: []
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/3']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Simple Salad')).toBeInTheDocument();
        });

        expect(screen.queryByText('Total Time:')).not.toBeInTheDocument();
        expect(screen.queryByText('Prep Time:')).not.toBeInTheDocument();
        expect(screen.queryByText('Active Time:')).not.toBeInTheDocument();
        expect(screen.queryByText('Cooking Time:')).not.toBeInTheDocument();
        expect(screen.getByText('Yield:')).toBeInTheDocument();
    });

    it('displays ingredient quantities as fractions', async () => {
        server.use(
            http.get('*/recipes/:id', () => {
                return HttpResponse.json({
                    id: 4,
                    core: {
                        name: 'Fraction Recipe',
                        description: 'Testing fractions.',
                        owner_id: '1',
                        yield_amount: 1,
                        yield_unit: 'serving',
                    },
                    times: {},
                    instructions: [],
                    components: [
                        {
                            name: 'Main',
                            ingredients: [
                                { item: 'Sugar', quantity: 0.5, unit: 'cup' },
                                { item: 'Salt', quantity: 0.25, unit: 'tsp' },
                                { item: 'Water', quantity: 1.5, unit: 'cup' },
                                { item: 'Spice', quantity: 0.333, unit: 'tsp' },
                            ]
                        }
                    ]
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/4']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Fraction Recipe')).toBeInTheDocument();
        });

        expect(screen.getByText('½ cup')).toBeInTheDocument();
        expect(screen.getByText('¼ tsp')).toBeInTheDocument();
        expect(screen.getByText('1 ½ cup')).toBeInTheDocument();
        expect(screen.getByText('⅓ tsp')).toBeInTheDocument();
    });

    // Access Control Tests
    it('shows edit button for admin user', async () => {
        mockUseAuth.mockReturnValue({ user: { id: '999', is_admin: true } });

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/1']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /Edit Recipe/i })).toBeInTheDocument();
    });

    it('shows edit button for recipe owner', async () => {
        // Recipe 1 owner_id is '1' (from global mocks or assumed)
        // Let's ensure the component gets the user id correctly.
        // We need to match the mock logic. In previous tests user was fetched separately.
        // The RecipeDetails component uses useUser(recipe.owner_id) to display name,
        // but uses useAuth() to check permissions.

        // Let's verify Recipe 1 owner in our mock logic.
        // Looking at handlers.ts (implied), Recipe 1 usually has owner_id '1' or similar.
        // We'll trust the component logic: currentUser.id === recipe.core.owner_id

        // Let's force a recipe return so we know the owner_id
        server.use(
            http.get('*/recipes/:id', () => {
                return HttpResponse.json({
                    id: 1,
                    core: {
                        name: 'My Recipe',
                        owner_id: 'user-123',
                    },
                    times: {},
                    instructions: [],
                    components: []
                });
            })
        );

        mockUseAuth.mockReturnValue({ user: { id: 'user-123', is_admin: false } });

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/1']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('My Recipe')).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /Edit Recipe/i })).toBeInTheDocument();
    });

    it('hides edit button for non-owner non-admin', async () => {
        server.use(
            http.get('*/recipes/:id', () => {
                return HttpResponse.json({
                    id: 1,
                    core: {
                        name: 'Imposter Recipe',
                        owner_id: 'user-123',
                    },
                    times: {},
                    instructions: [],
                    components: []
                });
            })
        );

        mockUseAuth.mockReturnValue({ user: { id: 'user-456', is_admin: false } });

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/1']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Imposter Recipe')).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /Edit Recipe/i })).not.toBeInTheDocument();
    });

    it('hides edit button for logged out user', async () => {
        server.use(
            http.get('*/recipes/:id', () => {
                return HttpResponse.json({
                    id: 1,
                    core: {
                        name: 'Public Recipe',
                        owner_id: 'user-123',
                    },
                    times: {},
                    instructions: [],
                    components: []
                });
            })
        );

        mockUseAuth.mockReturnValue({ user: null });

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/1']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Public Recipe')).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /Edit Recipe/i })).not.toBeInTheDocument();
    });
});
