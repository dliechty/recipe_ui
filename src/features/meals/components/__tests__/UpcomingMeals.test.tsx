import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import UpcomingMeals from '../UpcomingMeals';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({
        token: 'mock-token',
        user: { id: 'u1', email: 'test@example.com', is_admin: false },
    }),
}));

// Mock @dnd-kit components since JSDOM doesn't support drag-and-drop
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    closestCenter: vi.fn(),
    KeyboardSensor: vi.fn(),
    PointerSensor: vi.fn(),
    useSensor: vi.fn(),
    useSensors: () => [],
}));

vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    sortableKeyboardCoordinates: vi.fn(),
    verticalListSortingStrategy: 'vertical',
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    }),
}));

vi.mock('@dnd-kit/utilities', () => ({
    CSS: {
        Transform: {
            toString: () => undefined,
        },
    },
}));

describe('UpcomingMeals', () => {
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

    it('renders queued meals', async () => {
        server.use(
            http.get('*/meals/', ({ request }) => {
                const url = new URL(request.url);
                const status = url.searchParams.get('status[in]');
                if (status?.includes('Queued')) {
                    return HttpResponse.json([
                        {
                            id: 'meal-1',
                            name: 'Monday Dinner',
                            status: 'Queued',
                            classification: 'Dinner',
                            scheduled_date: '2026-03-01',
                            is_shopped: false,
                            queue_position: 0,
                            user_id: 'u1',
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: '2026-01-01T00:00:00Z',
                            items: [],
                        },
                        {
                            id: 'meal-2',
                            name: 'Tuesday Lunch',
                            status: 'Queued',
                            classification: 'Lunch',
                            scheduled_date: '2026-03-02',
                            is_shopped: true,
                            queue_position: 1,
                            user_id: 'u1',
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: '2026-01-01T00:00:00Z',
                            items: [],
                        },
                    ], { headers: { 'X-Total-Count': '2' } });
                }
                return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <UpcomingMeals />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
        });

        expect(screen.getByText('Tuesday Lunch')).toBeInTheDocument();
    });

    it('shows empty state when no queued meals', async () => {
        server.use(
            http.get('*/meals/', () => {
                return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <UpcomingMeals />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/no upcoming meals/i)).toBeInTheDocument();
        });
    });

    it('shows Generate Meals button', async () => {
        server.use(
            http.get('*/meals/', () => {
                return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <UpcomingMeals />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Generate Meals/i })).toBeInTheDocument();
        });
    });
});
