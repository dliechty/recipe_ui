import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeListItemDisplay from '../RecipeListItemDisplay';
import { server } from '../../../../mocks/server';
import { http, HttpResponse } from 'msw';
import { RecipeListItem } from '../../../../client';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockItem: RecipeListItem = {
    id: 'item-1',
    recipe_list_id: 'list-1',
    recipe_id: 'recipe-1',
    added_at: '2024-01-15T00:00:00Z',
};

const mockRecipe = {
    core: {
        id: 'recipe-1',
        name: 'Chocolate Cake',
        description: 'A delicious chocolate cake',
        owner_id: 'user-1',
        yield_amount: 8,
        yield_unit: 'servings',
    },
    times: {},
    nutrition: null,
    components: [],
    instructions: [],
    suitable_for_diet: [],
    unit_system: 'metric',
};

describe('RecipeListItemDisplay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('displays recipe name after loading', async () => {
        server.use(
            http.get('*/recipes/recipe-1', () => {
                return HttpResponse.json(mockRecipe);
            })
        );

        const onRemove = vi.fn();

        renderWithProviders(
            <MemoryRouter>
                <RecipeListItemDisplay item={mockItem} onRemove={onRemove} />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
        });

        expect(screen.getByText('View Recipe')).toBeInTheDocument();
        expect(screen.getByText(/Added/)).toBeInTheDocument();
    });

    it('navigates with correct state when clicked', async () => {
        server.use(
            http.get('*/recipes/recipe-1', () => {
                return HttpResponse.json(mockRecipe);
            })
        );

        const onRemove = vi.fn();

        renderWithProviders(
            <MemoryRouter>
                <RecipeListItemDisplay item={mockItem} onRemove={onRemove} />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
        });

        // Click on the recipe name area
        screen.getByText('Chocolate Cake').click();

        expect(mockNavigate).toHaveBeenCalledWith('/recipes/recipe-1', {
            state: {
                backUrl: '/recipe-box',
                backLabel: 'Recipe Box',
                breadcrumbs: [{ label: 'Recipe Box', url: '/recipe-box' }]
            }
        });
    });

    it('calls onRemove with recipe name when remove button clicked', async () => {
        server.use(
            http.get('*/recipes/recipe-1', () => {
                return HttpResponse.json(mockRecipe);
            })
        );

        const onRemove = vi.fn();

        renderWithProviders(
            <MemoryRouter>
                <RecipeListItemDisplay item={mockItem} onRemove={onRemove} />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
        });

        const removeButton = screen.getByRole('button', { name: /remove recipe/i });
        removeButton.click();

        expect(onRemove).toHaveBeenCalledWith('recipe-1', 'Chocolate Cake');
    });

    it('shows skeleton while loading', async () => {
        // Delay the response to see loading state
        server.use(
            http.get('*/recipes/recipe-1', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return HttpResponse.json(mockRecipe);
            })
        );

        const onRemove = vi.fn();

        renderWithProviders(
            <MemoryRouter>
                <RecipeListItemDisplay item={mockItem} onRemove={onRemove} />
            </MemoryRouter>
        );

        // Should show View Recipe link while loading
        expect(screen.getByText('View Recipe')).toBeInTheDocument();

        // Wait for recipe name to appear
        await waitFor(() => {
            expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
        });
    });
});
