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
                        status: 'Scheduled',
                        classification: 'Dinner',
                        date: '2025-01-01',
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

        const row = screen.getByRole('row', { name: /Dinner Party/i });
        const utils = within(row);

        const cells = utils.getAllByRole('cell');

        // Name (index 0) tested above
        expect(cells[1]).toHaveTextContent(/Scheduled/i);
        expect(cells[2]).toHaveTextContent(/Dinner/i);
        expect(cells[3]).toHaveTextContent('2'); // Recipe count
        expect(cells[4]).toHaveTextContent('Test User'); // Created By
        // index 5 is Created At
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
