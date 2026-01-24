import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeBoxPage from '../RecipeBoxPage';
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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

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

describe('RecipeBoxPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(mockAuthContext);
    });

    it('displays empty state when user has no lists', async () => {
        server.use(
            http.get('*/lists/', () => {
                return HttpResponse.json([]);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeBoxPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("You don't have any recipe lists yet.")).toBeInTheDocument();
        });
    });

    it('displays user recipe lists', async () => {
        const mockLists: RecipeList[] = [
            {
                id: 'list-1',
                user_id: 'user-1',
                name: 'Favorites',
                description: 'My favorite recipes',
                items: [],
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
                <RecipeBoxPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Favorites')).toBeInTheDocument();
            expect(screen.getByText('Weeknight Dinners')).toBeInTheDocument();
            expect(screen.getByText('My favorite recipes')).toBeInTheDocument();
        });
    });

    it('filters out lists from other users', async () => {
        const mockLists: RecipeList[] = [
            {
                id: 'list-1',
                user_id: 'user-1',
                name: 'My List',
                description: null,
                items: [],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            },
            {
                id: 'list-2',
                user_id: 'user-2',
                name: 'Other User List',
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
                <RecipeBoxPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('My List')).toBeInTheDocument();
            expect(screen.queryByText('Other User List')).not.toBeInTheDocument();
        });
    });

    it('displays recipe count in list summary', async () => {
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
                    {
                        id: 'item-2',
                        recipe_list_id: 'list-1',
                        recipe_id: 'recipe-2',
                        added_at: '2024-01-02T00:00:00Z',
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
                <RecipeBoxPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('2 recipes')).toBeInTheDocument();
        });
    });

    it('shows "New List" button', async () => {
        server.use(
            http.get('*/lists/', () => {
                return HttpResponse.json([]);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeBoxPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('New List')).toBeInTheDocument();
        });
    });
});
