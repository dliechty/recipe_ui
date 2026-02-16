import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import MealHistoryList from '../MealHistoryList';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({
        token: 'mock-token',
        user: { id: 'u1', email: 'test@example.com', is_admin: false },
    }),
}));

describe('MealHistoryList', () => {
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    beforeAll(() => {
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

    it('renders cooked and cancelled meals', async () => {
        server.use(
            http.get('*/meals/', ({ request }) => {
                const url = new URL(request.url);
                const status = url.searchParams.get('status[in]');
                if (status?.includes('Cooked') && status?.includes('Cancelled')) {
                    return HttpResponse.json([
                        {
                            id: 'meal-h1',
                            name: 'Cooked Dinner',
                            status: 'Cooked',
                            classification: 'Dinner',
                            scheduled_date: '2026-01-15',
                            is_shopped: true,
                            queue_position: null,
                            user_id: 'u1',
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: '2026-01-15T00:00:00Z',
                            items: [],
                        },
                        {
                            id: 'meal-h2',
                            name: 'Cancelled Lunch',
                            status: 'Cancelled',
                            classification: 'Lunch',
                            scheduled_date: '2026-01-14',
                            is_shopped: false,
                            queue_position: null,
                            user_id: 'u1',
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: '2026-01-14T00:00:00Z',
                            items: [],
                        },
                    ], { headers: { 'X-Total-Count': '2' } });
                }
                return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <MealHistoryList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Cooked Dinner')).toBeInTheDocument();
        });

        expect(screen.getByText('Cancelled Lunch')).toBeInTheDocument();
    });

    it('shows empty state when no history', async () => {
        server.use(
            http.get('*/meals/', () => {
                return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <MealHistoryList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/no meal history/i)).toBeInTheDocument();
        });
    });
});
