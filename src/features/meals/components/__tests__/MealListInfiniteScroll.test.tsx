import { renderWithProviders, screen, waitFor, within } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import MealList from '../MealList';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('MealList Infinite Scroll', () => {
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    beforeAll(() => {
        // Mock IntersectionObserver to capture callback
        global.IntersectionObserver = class IntersectionObserver {
            constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
                observerCallback = callback;
            }
            observe = observeMock;
            unobserve() { return null; }
            disconnect = disconnectMock;
            takeRecords() { return []; }
            root = null;
            rootMargin = '';
            thresholds = [];
        } as unknown as typeof IntersectionObserver;
    });

    beforeEach(() => {
        observeMock.mockClear();
        disconnectMock.mockClear();
    });

    it('loads more meals when scrolling to the bottom', async () => {
        // Mock API to return 2 pages of data
        // Page 1: 20 items. Total 40.
        server.use(
            http.get('*/meals/', ({ request }) => {
                const url = new URL(request.url);
                const skip = Number(url.searchParams.get('skip') || '0');
                const limit = Number(url.searchParams.get('limit') || '20');

                // Generate 40 meals
                const allMeals = Array.from({ length: 40 }, (_, i) => ({
                    id: `m${i}`,
                    name: `Meal ${i}`,
                    status: 'Proposed',
                    classification: 'Dinner',
                    date: '2025-01-01',
                    created_at: new Date().toISOString(),
                    user_id: 'u1',
                    items: []
                }));

                const pageMeals = allMeals.slice(skip, skip + limit);

                return HttpResponse.json(pageMeals, {
                    headers: { 'X-Total-Count': '40' }
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

        // Wait for first page (Meal 0 to Meal 19)
        await waitFor(() => {
            expect(screen.getByText('Meal 0')).toBeInTheDocument();
            expect(screen.getByText('Meal 19')).toBeInTheDocument();
        });

        expect(screen.queryByText('Meal 20')).not.toBeInTheDocument();

        // Simulate scrolling to bottom (intersection)
        // We need to trigger the observer callback
        if (observerCallback) {
            observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
        }

        // Wait for second page (Meal 20 to Meal 39)
        await waitFor(() => {
            expect(screen.getByText('Meal 20')).toBeInTheDocument();
            expect(screen.getByText('Meal 39')).toBeInTheDocument();
        });
    });
});
