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
            expect(screen.getAllByText('Chicken Pasta 1')[0]).toBeInTheDocument();
        });

        // Generated recipe doesn't have source
        expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();

        expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
        expect(screen.getByText('Active Time:')).toBeInTheDocument();
        expect(screen.getByText('Delicious chicken pasta recipe number 1.')).toBeInTheDocument();
        expect(screen.getByText('Cooking Time:')).toBeInTheDocument();
        expect(screen.getByText('2 servings')).toBeInTheDocument();
        expect(screen.getByText('Italian')).toBeInTheDocument();
        expect(screen.getByText('Step 1')).toBeInTheDocument();
        expect(screen.getByText('Prepare the chicken.')).toBeInTheDocument();

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
            expect(screen.getAllByText('Beef Curry 2')[0]).toBeInTheDocument();
        });

        expect(screen.queryByText('Main')).not.toBeInTheDocument();
        // Generated recipes have simple ingredients
        expect(screen.getByText('Ingredient 2-1')).toBeInTheDocument();
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
            expect(screen.getAllByText('Simple Salad')[0]).toBeInTheDocument();
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
            expect(screen.getAllByText('Fraction Recipe')[0]).toBeInTheDocument();
        });

        expect(screen.getByText('½ cup')).toBeInTheDocument();
        expect(screen.getByText('¼ tsp')).toBeInTheDocument();
        expect(screen.getByText('1 ½ cup')).toBeInTheDocument();
        expect(screen.getByText('⅓ tsp')).toBeInTheDocument();
        expect(screen.getByText('1 ½ cup')).toBeInTheDocument();
        expect(screen.getByText('⅓ tsp')).toBeInTheDocument();
    });

    it('renders nutrition and diet info', async () => {
        server.use(
            http.get('*/recipes/:id', () => {
                return HttpResponse.json({
                    id: 99,
                    core: {
                        name: 'Healthy Recipe',
                        owner_id: '1',
                        protein: 'Tofu',
                        yield_amount: 1,
                        yield_unit: 'serving',
                    },
                    times: {},
                    nutrition: {
                        calories: 350,
                        serving_size: '1 bowl'
                    },
                    suitable_for_diet: ['vegan', 'gluten-free'],
                    instructions: [],
                    components: []
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/99']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByText('Healthy Recipe')[0]).toBeInTheDocument();
        });

        expect(screen.getByText('Tofu')).toBeInTheDocument();
        expect(screen.getByText('350 kcal')).toBeInTheDocument();
        expect(screen.getByText('1 bowl')).toBeInTheDocument();
        expect(screen.getByText('Vegan')).toBeInTheDocument();
        expect(screen.getByText('Gluten Free')).toBeInTheDocument();
    });

    it('displays "To Taste" ingredients correctly', async () => {
        server.use(
            http.get('*/recipes/:id', () => {
                return HttpResponse.json({
                    id: 5,
                    core: {
                        name: 'To Taste Recipe',
                        description: 'Testing to taste.',
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
                                { item: 'Salt', quantity: 0, unit: 'To Taste' },
                                { item: 'Pepper', quantity: 0, unit: 'to taste' }, // Check case insensitivity if needed, sticking to requirement "To Taste" for now but checking tolerance
                            ]
                        }
                    ]
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/5']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByText('To Taste Recipe')[0]).toBeInTheDocument();
        });

        // Expectation: "Salt To Taste" NOT "0 To Taste Salt"
        // We use closest('li') and toHaveTextContent because the text is split across a span and a text node
        const saltItem = screen.getByText('Salt').closest('li');
        expect(saltItem).toHaveTextContent('Salt To Taste');
        expect(saltItem).not.toHaveTextContent('0');

        const pepperItem = screen.getByText('Pepper').closest('li');
        expect(pepperItem).toHaveTextContent('Pepper to taste');
        expect(pepperItem).not.toHaveTextContent('0');
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
            expect(screen.getAllByText('Chicken Pasta 1')[0]).toBeInTheDocument();
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
            expect(screen.getAllByText('My Recipe')[0]).toBeInTheDocument();
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
            expect(screen.getAllByText('Imposter Recipe')[0]).toBeInTheDocument();
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
            expect(screen.getAllByText('Public Recipe')[0]).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /Edit Recipe/i })).not.toBeInTheDocument();
    });

    it('renders parent recipe link when present', async () => {
        server.use(
            http.get('*/recipes/10', () => {
                return HttpResponse.json({
                    id: 10,
                    core: {
                        name: 'Child Recipe',
                        owner_id: '1',
                        yield_amount: 1,
                        yield_unit: 'serving',
                        source: 'Family Cookbook'
                    },
                    times: {},
                    instructions: [],
                    components: [],
                    parent_recipe_id: '11'
                });
            }),
            http.get('*/recipes/11', () => {
                return HttpResponse.json({
                    id: 11,
                    core: {
                        name: 'Parent Recipe Name',
                        owner_id: '1',
                        yield_amount: 1,
                        yield_unit: 'serving',
                    },
                    times: {},
                    instructions: [],
                    components: []
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/10']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByText('Child Recipe')[0]).toBeInTheDocument();
        });

        // Check for Parent Recipe Link
        await waitFor(() => {
            expect(screen.getByText('Parent Recipe:')).toBeInTheDocument();
        });
        const link = screen.getByText('Parent Recipe Name');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/recipes/11');
    });
});
