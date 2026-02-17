import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
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

    const setupWithMeals = () => {
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
                        {
                            id: 'meal-3',
                            name: 'Wednesday Brunch',
                            status: 'Queued',
                            classification: 'Lunch',
                            scheduled_date: '2026-03-03',
                            is_shopped: false,
                            queue_position: 2,
                            user_id: 'u1',
                            created_at: '2026-01-01T00:00:00Z',
                            updated_at: '2026-01-01T00:00:00Z',
                            items: [],
                        },
                    ], { headers: { 'X-Total-Count': '3' } });
                }
                return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <UpcomingMeals />
            </MemoryRouter>
        );
    };

    describe('selection mode', () => {
        it('shows Select button when meals are loaded', async () => {
            setupWithMeals();

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            expect(screen.getByRole('button', { name: /Select/i })).toBeInTheDocument();
        });

        it('shows checkboxes on meal cards when selection mode is active', async () => {
            setupWithMeals();

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox');
                expect(checkboxes.length).toBeGreaterThanOrEqual(3);
            });
        });

        it('does not show checkboxes before entering selection mode', async () => {
            setupWithMeals();

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
        });

        it('selects and deselects individual meals', async () => {
            setupWithMeals();

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(3);
            });

            // Click the card area to toggle selection (the card click handler toggles in selection mode)
            const mondayText = screen.getByText('Monday Dinner');
            fireEvent.click(mondayText);

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            // Click again to deselect
            fireEvent.click(mondayText);

            await waitFor(() => {
                expect(screen.queryAllByText(/1 selected/i)).toHaveLength(0);
            });
        });

        it('supports select-all and deselect-all toggle', async () => {
            setupWithMeals();

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
            });

            // Select all meals by clicking each card
            fireEvent.click(screen.getByText('Monday Dinner'));
            fireEvent.click(screen.getByText('Tuesday Lunch'));
            fireEvent.click(screen.getByText('Wednesday Brunch'));

            await waitFor(() => {
                expect(screen.getAllByText(/3 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            // Deselect all by clicking each card again
            fireEvent.click(screen.getByText('Monday Dinner'));
            fireEvent.click(screen.getByText('Tuesday Lunch'));
            fireEvent.click(screen.getByText('Wednesday Brunch'));

            await waitFor(() => {
                expect(screen.queryAllByText(/3 selected/i)).toHaveLength(0);
            });
        });

        it('exits selection mode when Cancel is clicked', async () => {
            setupWithMeals();

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

            await waitFor(() => {
                expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
            });
        });
    });

    describe('bulk status action bar', () => {
        it('shows action bar when meals are selected', async () => {
            setupWithMeals();

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(3);
            });

            fireEvent.click(screen.getByText('Monday Dinner'));

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            expect(screen.getByRole('button', { name: /Mark Cooked/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Mark Cancelled/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Mark Shopped/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Mark Unshopped/i })).toBeInTheDocument();
        });

        it('does not show action bar when no meals are selected', async () => {
            setupWithMeals();

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
            });

            expect(screen.queryByRole('button', { name: /Mark Cooked/i })).not.toBeInTheDocument();
        });

        it('Mark Cooked triggers bulk update with status Cooked', async () => {
            const putRequests: Array<{ id: string; body: Record<string, unknown> }> = [];
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
                        ], { headers: { 'X-Total-Count': '1' } });
                    }
                    return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
                }),
                http.put('*/meals/:id', async ({ params, request }) => {
                    const body = await request.json() as Record<string, unknown>;
                    putRequests.push({ id: params.id as string, body });
                    return HttpResponse.json({
                        id: params.id,
                        name: 'Monday Dinner',
                        status: body.status || 'Queued',
                        is_shopped: false,
                        queue_position: 0,
                        user_id: 'u1',
                        created_at: '2026-01-01T00:00:00Z',
                        updated_at: '2026-01-01T00:00:00Z',
                        items: [],
                    });
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

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByText('Monday Dinner'));

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByRole('button', { name: /Mark Cooked/i }));

            await waitFor(() => {
                expect(putRequests.length).toBe(1);
                expect(putRequests[0].id).toBe('meal-1');
                expect(putRequests[0].body.status).toBe('Cooked');
            });
        });

        it('Mark Cancelled triggers bulk update with status Cancelled', async () => {
            const putRequests: Array<{ id: string; body: Record<string, unknown> }> = [];
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
                        ], { headers: { 'X-Total-Count': '1' } });
                    }
                    return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
                }),
                http.put('*/meals/:id', async ({ params, request }) => {
                    const body = await request.json() as Record<string, unknown>;
                    putRequests.push({ id: params.id as string, body });
                    return HttpResponse.json({
                        id: params.id,
                        name: 'Monday Dinner',
                        status: body.status || 'Queued',
                        is_shopped: false,
                        queue_position: 0,
                        user_id: 'u1',
                        created_at: '2026-01-01T00:00:00Z',
                        updated_at: '2026-01-01T00:00:00Z',
                        items: [],
                    });
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

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByText('Monday Dinner'));

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByRole('button', { name: /Mark Cancelled/i }));

            await waitFor(() => {
                expect(putRequests.length).toBe(1);
                expect(putRequests[0].id).toBe('meal-1');
                expect(putRequests[0].body.status).toBe('Cancelled');
            });
        });

        it('Mark Shopped triggers bulk update with is_shopped true', async () => {
            const putRequests: Array<{ id: string; body: Record<string, unknown> }> = [];
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
                                is_shopped: false,
                                queue_position: 0,
                                user_id: 'u1',
                                created_at: '2026-01-01T00:00:00Z',
                                updated_at: '2026-01-01T00:00:00Z',
                                items: [],
                            },
                        ], { headers: { 'X-Total-Count': '1' } });
                    }
                    return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
                }),
                http.put('*/meals/:id', async ({ params, request }) => {
                    const body = await request.json() as Record<string, unknown>;
                    putRequests.push({ id: params.id as string, body });
                    return HttpResponse.json({
                        id: params.id,
                        name: 'Monday Dinner',
                        status: 'Queued',
                        is_shopped: true,
                        queue_position: 0,
                        user_id: 'u1',
                        created_at: '2026-01-01T00:00:00Z',
                        updated_at: '2026-01-01T00:00:00Z',
                        items: [],
                    });
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

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByText('Monday Dinner'));

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByRole('button', { name: /Mark Shopped/i }));

            await waitFor(() => {
                expect(putRequests.length).toBe(1);
                expect(putRequests[0].body.is_shopped).toBe(true);
            });
        });

        it('Mark Unshopped triggers bulk update with is_shopped false', async () => {
            const putRequests: Array<{ id: string; body: Record<string, unknown> }> = [];
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
                                is_shopped: true,
                                queue_position: 0,
                                user_id: 'u1',
                                created_at: '2026-01-01T00:00:00Z',
                                updated_at: '2026-01-01T00:00:00Z',
                                items: [],
                            },
                        ], { headers: { 'X-Total-Count': '1' } });
                    }
                    return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
                }),
                http.put('*/meals/:id', async ({ params, request }) => {
                    const body = await request.json() as Record<string, unknown>;
                    putRequests.push({ id: params.id as string, body });
                    return HttpResponse.json({
                        id: params.id,
                        name: 'Monday Dinner',
                        status: 'Queued',
                        is_shopped: false,
                        queue_position: 0,
                        user_id: 'u1',
                        created_at: '2026-01-01T00:00:00Z',
                        updated_at: '2026-01-01T00:00:00Z',
                        items: [],
                    });
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

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByText('Monday Dinner'));

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByRole('button', { name: /Mark Unshopped/i }));

            await waitFor(() => {
                expect(putRequests.length).toBe(1);
                expect(putRequests[0].body.is_shopped).toBe(false);
            });
        });

        it('resets selection after successful bulk action', async () => {
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
                                is_shopped: false,
                                queue_position: 0,
                                user_id: 'u1',
                                created_at: '2026-01-01T00:00:00Z',
                                updated_at: '2026-01-01T00:00:00Z',
                                items: [],
                            },
                        ], { headers: { 'X-Total-Count': '1' } });
                    }
                    return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
                }),
                http.put('*/meals/:id', async ({ params, request }) => {
                    const body = await request.json() as Record<string, unknown>;
                    return HttpResponse.json({
                        id: params.id,
                        name: 'Monday Dinner',
                        status: body.status || 'Queued',
                        is_shopped: true,
                        queue_position: 0,
                        user_id: 'u1',
                        created_at: '2026-01-01T00:00:00Z',
                        updated_at: '2026-01-01T00:00:00Z',
                        items: [],
                    });
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

            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByText('Monday Dinner'));

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            fireEvent.click(screen.getByRole('button', { name: /Mark Shopped/i }));

            // After successful bulk action, selection should reset and exit selection mode
            await waitFor(() => {
                expect(screen.queryAllByText(/1 selected/i)).toHaveLength(0);
            });

            await waitFor(() => {
                expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
            });
        });
    });
});
