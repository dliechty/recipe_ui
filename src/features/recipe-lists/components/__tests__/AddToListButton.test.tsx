import { renderWithProviders, screen, waitFor, userEvent } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddToListButton from '../AddToListButton';
import * as AuthContext from '../../../../context/AuthContext';
import { server } from '../../../../mocks/server';
import { http, HttpResponse } from 'msw';
import { RecipeList } from '../../../../client';

// Mock toaster
vi.mock('../../../../toaster', () => ({
    toaster: {
        create: vi.fn(),
    },
}));

const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    is_admin: false,
    is_first_login: false
};

const mockAuthContext = {
    user: mockUser,
    token: 'valid-token',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
};

describe('AddToListButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(mockAuthContext);
    });

    it('displays "Save to List" when recipe is not in any list', async () => {
        server.use(
            http.get('*/lists/', () => {
                return HttpResponse.json([]);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <AddToListButton recipeId="recipe-1" />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Save to List')).toBeInTheDocument();
        });
    });

    it('displays "Saved" when recipe is in at least one list', async () => {
        const mockLists: RecipeList[] = [
            {
                id: 'list-1',
                user_id: 'user-1',
                name: 'Favorites',
                description: null,
                items: [
                    {
                        id: 'item-1',
                        recipe_list_id: 'list-1',
                        recipe_id: 'recipe-1',
                        added_at: '2024-01-01T00:00:00Z',
                    },
                ],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            },
        ];

        server.use(
            http.get('*/lists/', () => {
                return HttpResponse.json(mockLists);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <AddToListButton recipeId="recipe-1" />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Saved')).toBeInTheDocument();
        });
    });

    it('opens menu when button is clicked', async () => {
        const user = userEvent.setup();
        const mockLists: RecipeList[] = [
            {
                id: 'list-1',
                user_id: 'user-1',
                name: 'Favorites',
                description: null,
                items: [],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            },
        ];

        server.use(
            http.get('*/lists/', () => {
                return HttpResponse.json(mockLists);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <AddToListButton recipeId="recipe-1" />
            </MemoryRouter>
        );

        const button = await screen.findByText('Save to List');
        await user.click(button);

        await waitFor(() => {
            expect(screen.getByText('Save to Recipe List')).toBeInTheDocument();
            expect(screen.getByText('Favorites')).toBeInTheDocument();
        });
    });

    it('shows "Create New List" option in menu', async () => {
        const user = userEvent.setup();
        server.use(
            http.get('*/lists/', () => {
                return HttpResponse.json([]);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <AddToListButton recipeId="recipe-1" />
            </MemoryRouter>
        );

        const button = await screen.findByText('Save to List');
        await user.click(button);

        await waitFor(() => {
            expect(screen.getByText('Create New List')).toBeInTheDocument();
        });
    });

    it('shows checkmark for lists that contain the recipe', async () => {
        const user = userEvent.setup();
        const mockLists: RecipeList[] = [
            {
                id: 'list-1',
                user_id: 'user-1',
                name: 'Favorites',
                description: null,
                items: [
                    {
                        id: 'item-1',
                        recipe_list_id: 'list-1',
                        recipe_id: 'recipe-1',
                        added_at: '2024-01-01T00:00:00Z',
                    },
                ],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            },
            {
                id: 'list-2',
                user_id: 'user-1',
                name: 'Weeknight Dinners',
                description: null,
                items: [],
                created_at: '2024-01-02T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
            },
        ];

        server.use(
            http.get('*/lists/', () => {
                return HttpResponse.json(mockLists);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <AddToListButton recipeId="recipe-1" />
            </MemoryRouter>
        );

        const button = await screen.findByText('Saved');
        await user.click(button);

        await waitFor(() => {
            const favoritesItem = screen.getByText('Favorites').closest('[role="menuitem"]');
            expect(favoritesItem?.querySelector('svg')).toBeInTheDocument();
        });
    });
});
