import { renderWithProviders, screen, waitFor, within } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import MealList from '../MealList';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('MealList', () => {
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    beforeAll(() => {
        // Mock IntersectionObserver
        global.IntersectionObserver = class IntersectionObserver {
            constructor() { }
            observe = observeMock;
            unobserve() { return null; }
            disconnect = disconnectMock;
            takeRecords() { return []; }
            root = null;
            rootMargin = '';
            thresholds = [];
        } as unknown as typeof IntersectionObserver;
    });

    it('renders meals from API', async () => {
        renderWithProviders(
            <MemoryRouter>
                <MealList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Add Meal/i })).toBeInTheDocument();
        });
    });

    it('renders specific mocked meals', async () => {
        server.use(
            http.get('*/meals/', () => {
                const mockData = [
                    {
                        id: '1',
                        name: 'Dinner Party',
                        status: 'Queued',
                        classification: 'Dinner',
                        scheduled_date: '2025-01-01',
                        created_at: '2024-01-01T00:00:00Z',
                        user_id: 'u1',
                        items: [
                            { id: 'i1', recipe_id: 'r1', meal_id: '1' },
                            { id: 'i2', recipe_id: 'r2', meal_id: '1' }
                        ]
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
            }),
            http.get('*/auth/users/u1', () => {
                return HttpResponse.json({
                    id: 'u1',
                    email: 'test@example.com',
                    first_name: 'Test',
                    last_name: 'User'
                });
            }),
            http.get('*/recipes/', () => {
                const mockRecipes = [
                    { core: { id: 'r1', name: 'Pasta' } },
                    { core: { id: 'r2', name: 'Salad' } }
                ];
                return HttpResponse.json(mockRecipes, {
                    headers: { 'X-Total-Count': '2' }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <MealList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Dinner Party')).toBeInTheDocument();
        });

        // Wait for user name to resolve
        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument();
        });

        // Wait for recipes to resolve
        await waitFor(() => {
            expect(screen.getByText('Pasta')).toBeInTheDocument();
        });

        const row = screen.getByRole('row', { name: /Dinner Party/i });
        const utils = within(row);

        const cells = utils.getAllByRole('cell');

        // Name (index 0) tested above
        // Recipes (index 1)
        expect(cells[1]).toHaveTextContent(/Pasta/i);
        expect(cells[1]).toHaveTextContent(/Salad/i);

        // Status (index 2)
        expect(cells[2]).toHaveTextContent(/Queued/i);

        // Classification (index 3)
        expect(cells[3]).toHaveTextContent(/Dinner/i);

        // Created By (index 4)
        expect(cells[4]).toHaveTextContent('Test User');
        
        // Date (index 5)
        expect(cells[5]).toHaveTextContent(new Date(2025, 0, 1).toLocaleDateString());
    });

    it('shows add meal button', async () => {
        renderWithProviders(
            <MemoryRouter>
                <MealList />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /Add Meal/i })).toBeInTheDocument();
    });
});
