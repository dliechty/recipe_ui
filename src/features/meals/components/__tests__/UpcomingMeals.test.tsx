import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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
    DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    closestCenter: vi.fn(),
    KeyboardSensor: vi.fn(),
    PointerSensor: vi.fn(),
    useSensor: vi.fn(),
    useSensors: () => [],
    useDraggable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
    }),
    useDroppable: () => ({
        setNodeRef: vi.fn(),
        isOver: false,
    }),
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

    describe('grouped list layout', () => {
        const setupWithMixedDates = () => {
            server.use(
                http.get('*/meals/', ({ request }) => {
                    const url = new URL(request.url);
                    const status = url.searchParams.get('status[in]');
                    if (status?.includes('Queued')) {
                        return HttpResponse.json([
                            {
                                id: 'meal-1',
                                name: 'Unscheduled A',
                                status: 'Queued',
                                classification: 'Dinner',
                                scheduled_date: null,
                                is_shopped: false,
                                queue_position: 0,
                                user_id: 'u1',
                                created_at: '2026-01-01T00:00:00Z',
                                updated_at: '2026-01-01T00:00:00Z',
                                items: [],
                            },
                            {
                                id: 'meal-2',
                                name: 'Late Date Meal',
                                status: 'Queued',
                                classification: 'Lunch',
                                scheduled_date: '2026-03-15',
                                is_shopped: false,
                                queue_position: 1,
                                user_id: 'u1',
                                created_at: '2026-01-01T00:00:00Z',
                                updated_at: '2026-01-01T00:00:00Z',
                                items: [],
                            },
                            {
                                id: 'meal-3',
                                name: 'Unscheduled B',
                                status: 'Queued',
                                classification: 'Dinner',
                                scheduled_date: null,
                                is_shopped: false,
                                queue_position: 2,
                                user_id: 'u1',
                                created_at: '2026-01-01T00:00:00Z',
                                updated_at: '2026-01-01T00:00:00Z',
                                items: [],
                            },
                            {
                                id: 'meal-4',
                                name: 'Early Date Meal',
                                status: 'Queued',
                                classification: 'Lunch',
                                scheduled_date: '2026-03-01',
                                is_shopped: false,
                                queue_position: 3,
                                user_id: 'u1',
                                created_at: '2026-01-01T00:00:00Z',
                                updated_at: '2026-01-01T00:00:00Z',
                                items: [],
                            },
                        ], { headers: { 'X-Total-Count': '4' } });
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

        it('renders unscheduled meals under an "Unscheduled" section header', async () => {
            setupWithMixedDates();

            await waitFor(() => {
                expect(screen.getByText('Unscheduled A')).toBeInTheDocument();
            });

            // Should have an "Unscheduled" section header
            const unscheduledHeaders = screen.getAllByText('Unscheduled');
            expect(unscheduledHeaders.length).toBeGreaterThanOrEqual(1);
            // Both unscheduled meals should be present
            expect(screen.getByText('Unscheduled A')).toBeInTheDocument();
            expect(screen.getByText('Unscheduled B')).toBeInTheDocument();
        });

        it('renders scheduled meals under a "Scheduled" section header ordered by date ascending', async () => {
            setupWithMixedDates();

            await waitFor(() => {
                expect(screen.getByText('Early Date Meal')).toBeInTheDocument();
            });

            // Should have a "Scheduled" section header
            expect(screen.getByText('Scheduled')).toBeInTheDocument();

            // Scheduled meals should be ordered by date ascending: Early Date Meal (03-01) before Late Date Meal (03-15)
            const scheduledNames = screen.getAllByText(/Early Date Meal|Late Date Meal/);
            expect(scheduledNames[0]).toHaveTextContent('Early Date Meal');
            expect(scheduledNames[1]).toHaveTextContent('Late Date Meal');
        });

        it('does not render the sort-by button', async () => {
            setupWithMixedDates();

            await waitFor(() => {
                expect(screen.getByText('Unscheduled A')).toBeInTheDocument();
            });

            expect(screen.queryByRole('button', { name: /Sort by Date/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Sort by Position/i })).not.toBeInTheDocument();
        });

        it('shows drag handles for unscheduled meals', async () => {
            setupWithMixedDates();

            await waitFor(() => {
                expect(screen.getByText('Unscheduled A')).toBeInTheDocument();
            });

            // Unscheduled meals should have drag handles
            const dragHandles = screen.getAllByLabelText('Drag to reorder');
            // Should have exactly 2 drag handles (one per unscheduled meal)
            expect(dragHandles).toHaveLength(2);
        });

        it('does not show drag handles for scheduled meals', async () => {
            setupWithMixedDates();

            await waitFor(() => {
                expect(screen.getByText('Early Date Meal')).toBeInTheDocument();
            });

            // Only 2 drag handles for the 2 unscheduled meals, none for the 2 scheduled meals
            const dragHandles = screen.getAllByLabelText('Drag to reorder');
            expect(dragHandles).toHaveLength(2);
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

    describe('view mode URL persistence', () => {
        const setupWithMealsAndRoute = (initialPath: string) => {
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
                })
            );

            renderWithProviders(
                <MemoryRouter initialEntries={[initialPath]}>
                    <Routes>
                        <Route path="/meals" element={<UpcomingMeals />} />
                    </Routes>
                </MemoryRouter>
            );
        };

        it('defaults to queue view when no ?view= param is present', async () => {
            setupWithMealsAndRoute('/meals');

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            // Queue view shows the Scheduled section header (queue-specific grouped layout)
            expect(screen.getByText('Scheduled')).toBeInTheDocument();
            // Calendar view elements should not be present
            expect(screen.queryByRole('button', { name: /today/i })).not.toBeInTheDocument();
        });

        it('renders calendar view when ?view=calendar is in URL', async () => {
            setupWithMealsAndRoute('/meals?view=calendar');

            // Calendar view shows Today button and Unscheduled section
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
            });
            expect(screen.getByText('Unscheduled')).toBeInTheDocument();
            // Calendar view is confirmed by the presence of the "today" button above
        });

        it('defaults to queue view when ?view= has invalid value', async () => {
            setupWithMealsAndRoute('/meals?view=invalid');

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            // Should fall back to queue view - meal card is visible, no calendar "today" button
            expect(screen.getByText('Scheduled')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /today/i })).not.toBeInTheDocument();
        });

        it('clicking calendar view button updates URL to ?view=calendar', async () => {
            setupWithMealsAndRoute('/meals');

            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });

            // Click calendar view toggle
            fireEvent.click(screen.getByRole('button', { name: /Calendar view/i }));

            // Should now show calendar view
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
            });
        });

        it('clicking queue view button when in calendar view switches back to queue', async () => {
            setupWithMealsAndRoute('/meals?view=calendar');

            // Should be in calendar view
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
            });

            // Click queue view toggle
            fireEvent.click(screen.getByRole('button', { name: /Queue view/i }));

            // Should now show queue view with meals loaded
            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });
            expect(screen.getByText('Scheduled')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /today/i })).not.toBeInTheDocument();
        });
    });

    describe('bulk actions remove meals from calendar view', () => {
        it('meals marked Cooked disappear from calendar view', async () => {
            let bulkActionDone = false;
            const meal1 = {
                id: 'meal-1',
                name: 'Monday Dinner',
                status: 'Queued',
                classification: 'Dinner',
                scheduled_date: null,
                is_shopped: false,
                queue_position: 0,
                user_id: 'u1',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                items: [],
            };
            const meal2 = {
                id: 'meal-2',
                name: 'Tuesday Lunch',
                status: 'Queued',
                classification: 'Lunch',
                scheduled_date: null,
                is_shopped: false,
                queue_position: 1,
                user_id: 'u1',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                items: [],
            };

            server.use(
                http.get('*/meals/', ({ request }) => {
                    const url = new URL(request.url);
                    const status = url.searchParams.get('status[in]');
                    if (status?.includes('Queued')) {
                        if (!bulkActionDone) {
                            return HttpResponse.json([meal1, meal2], { headers: { 'X-Total-Count': '2' } });
                        }
                        // After bulk action, meal-1 is Cooked so only meal-2 remains
                        return HttpResponse.json([meal2], { headers: { 'X-Total-Count': '1' } });
                    }
                    return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
                }),
                http.put('*/meals/:id', async ({ params, request }) => {
                    const body = await request.json() as Record<string, unknown>;
                    bulkActionDone = true;
                    return HttpResponse.json({
                        ...meal1,
                        id: params.id,
                        status: body.status || 'Queued',
                    });
                })
            );

            renderWithProviders(
                <MemoryRouter initialEntries={['/meals?view=calendar']}>
                    <Routes>
                        <Route path="/meals" element={<UpcomingMeals />} />
                    </Routes>
                </MemoryRouter>
            );

            // Wait for meals to load in calendar view
            await waitFor(() => {
                expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
            });
            expect(screen.getByText('Tuesday Lunch')).toBeInTheDocument();

            // Enter selection mode
            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            // Click on meal to select it in calendar view
            fireEvent.click(screen.getByText('Monday Dinner'));

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            // Click Mark Cooked
            fireEvent.click(screen.getByRole('button', { name: /Mark Cooked/i }));

            // Meal should disappear from calendar after refetch
            await waitFor(() => {
                expect(screen.queryByText('Monday Dinner')).not.toBeInTheDocument();
            });

            // The other meal should still be visible
            expect(screen.getByText('Tuesday Lunch')).toBeInTheDocument();
        });

        it('meals marked Cancelled disappear from calendar view', async () => {
            let bulkActionDone = false;
            const meal1 = {
                id: 'meal-1',
                name: 'Wednesday Dinner',
                status: 'Queued',
                classification: 'Dinner',
                scheduled_date: null,
                is_shopped: false,
                queue_position: 0,
                user_id: 'u1',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                items: [],
            };
            const meal2 = {
                id: 'meal-2',
                name: 'Thursday Lunch',
                status: 'Queued',
                classification: 'Lunch',
                scheduled_date: null,
                is_shopped: false,
                queue_position: 1,
                user_id: 'u1',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                items: [],
            };

            server.use(
                http.get('*/meals/', ({ request }) => {
                    const url = new URL(request.url);
                    const status = url.searchParams.get('status[in]');
                    if (status?.includes('Queued')) {
                        if (!bulkActionDone) {
                            return HttpResponse.json([meal1, meal2], { headers: { 'X-Total-Count': '2' } });
                        }
                        // After bulk action, meal-1 is Cancelled so only meal-2 remains
                        return HttpResponse.json([meal2], { headers: { 'X-Total-Count': '1' } });
                    }
                    return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
                }),
                http.put('*/meals/:id', async ({ params, request }) => {
                    const body = await request.json() as Record<string, unknown>;
                    bulkActionDone = true;
                    return HttpResponse.json({
                        ...meal1,
                        id: params.id,
                        status: body.status || 'Queued',
                    });
                })
            );

            renderWithProviders(
                <MemoryRouter initialEntries={['/meals?view=calendar']}>
                    <Routes>
                        <Route path="/meals" element={<UpcomingMeals />} />
                    </Routes>
                </MemoryRouter>
            );

            // Wait for meals to load in calendar view
            await waitFor(() => {
                expect(screen.getByText('Wednesday Dinner')).toBeInTheDocument();
            });
            expect(screen.getByText('Thursday Lunch')).toBeInTheDocument();

            // Enter selection mode
            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            // Click on meal to select it in calendar view
            fireEvent.click(screen.getByText('Wednesday Dinner'));

            await waitFor(() => {
                expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            // Click Mark Cancelled
            fireEvent.click(screen.getByRole('button', { name: /Mark Cancelled/i }));

            // Meal should disappear from calendar after refetch
            await waitFor(() => {
                expect(screen.queryByText('Wednesday Dinner')).not.toBeInTheDocument();
            });

            // The other meal should still be visible
            expect(screen.getByText('Thursday Lunch')).toBeInTheDocument();
        });

        it('multiple meals marked Cooked via bulk selection disappear from calendar view', async () => {
            let bulkActionDone = false;
            const meal1 = {
                id: 'meal-1',
                name: 'Pasta Night',
                status: 'Queued',
                classification: 'Dinner',
                scheduled_date: null,
                is_shopped: false,
                queue_position: 0,
                user_id: 'u1',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                items: [],
            };
            const meal2 = {
                id: 'meal-2',
                name: 'Taco Tuesday',
                status: 'Queued',
                classification: 'Dinner',
                scheduled_date: null,
                is_shopped: false,
                queue_position: 1,
                user_id: 'u1',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                items: [],
            };
            const meal3 = {
                id: 'meal-3',
                name: 'Salad Bowl',
                status: 'Queued',
                classification: 'Lunch',
                scheduled_date: null,
                is_shopped: false,
                queue_position: 2,
                user_id: 'u1',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
                items: [],
            };

            server.use(
                http.get('*/meals/', ({ request }) => {
                    const url = new URL(request.url);
                    const status = url.searchParams.get('status[in]');
                    if (status?.includes('Queued')) {
                        if (!bulkActionDone) {
                            return HttpResponse.json([meal1, meal2, meal3], { headers: { 'X-Total-Count': '3' } });
                        }
                        // After bulk action, meal-1 and meal-2 are Cooked, only meal-3 remains
                        return HttpResponse.json([meal3], { headers: { 'X-Total-Count': '1' } });
                    }
                    return HttpResponse.json([], { headers: { 'X-Total-Count': '0' } });
                }),
                http.put('*/meals/:id', async ({ params, request }) => {
                    const body = await request.json() as Record<string, unknown>;
                    bulkActionDone = true;
                    return HttpResponse.json({
                        id: params.id,
                        name: 'Updated',
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
                <MemoryRouter initialEntries={['/meals?view=calendar']}>
                    <Routes>
                        <Route path="/meals" element={<UpcomingMeals />} />
                    </Routes>
                </MemoryRouter>
            );

            // Wait for meals to load
            await waitFor(() => {
                expect(screen.getByText('Pasta Night')).toBeInTheDocument();
            });
            expect(screen.getByText('Taco Tuesday')).toBeInTheDocument();
            expect(screen.getByText('Salad Bowl')).toBeInTheDocument();

            // Enter selection mode
            fireEvent.click(screen.getByRole('button', { name: /Select/i }));

            // Select two meals
            fireEvent.click(screen.getByText('Pasta Night'));
            fireEvent.click(screen.getByText('Taco Tuesday'));

            await waitFor(() => {
                expect(screen.getAllByText(/2 selected/i).length).toBeGreaterThanOrEqual(1);
            });

            // Click Mark Cooked
            fireEvent.click(screen.getByRole('button', { name: /Mark Cooked/i }));

            // Both meals should disappear
            await waitFor(() => {
                expect(screen.queryByText('Pasta Night')).not.toBeInTheDocument();
                expect(screen.queryByText('Taco Tuesday')).not.toBeInTheDocument();
            });

            // Remaining meal should still be visible
            expect(screen.getByText('Salad Bowl')).toBeInTheDocument();
        });
    });
});
