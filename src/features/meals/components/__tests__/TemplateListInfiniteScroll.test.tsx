import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import TemplateList from '../TemplateList';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

vi.mock('../../../../context/HouseholdContext', () => ({
    HouseholdContext: { _currentValue: null },
    useHouseholdContext: () => ({ activeHouseholdId: null, setActiveHousehold: vi.fn(), primaryHouseholdId: null, households: [] }),
}));

describe('TemplateList Infinite Scroll', () => {
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

    it('loads more templates when scrolling to the bottom', async () => {
        // Mock API to return 2 pages of data
        server.use(
            http.get('*/meals/templates', ({ request }) => {
                const url = new URL(request.url);
                const skip = Number(url.searchParams.get('skip') || '0');
                const limit = Number(url.searchParams.get('limit') || '20');

                // Generate 40 templates
                const allTemplates = Array.from({ length: 40 }, (_, i) => ({
                    id: `t${i}`,
                    name: `Template ${i}`,
                    classification: 'Dinner',
                    created_at: new Date().toISOString(),
                    user_id: 'u1',
                    slots: []
                }));

                const pageTemplates = allTemplates.slice(skip, skip + limit);

                return HttpResponse.json(pageTemplates, {
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
                <TemplateList />
            </MemoryRouter>
        );

        // Wait for first page (Template 0 to Template 19)
        await waitFor(() => {
            expect(screen.getByText('Template 0')).toBeInTheDocument();
            expect(screen.getByText('Template 19')).toBeInTheDocument();
        });

        expect(screen.queryByText('Template 20')).not.toBeInTheDocument();

        // Simulate scrolling to bottom (intersection)
        if (observerCallback) {
            observerCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
        }

        // Wait for second page (Template 20 to Template 39)
        await waitFor(() => {
            expect(screen.getByText('Template 20')).toBeInTheDocument();
            expect(screen.getByText('Template 39')).toBeInTheDocument();
        });
    });
});
