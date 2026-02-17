import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import CalendarView from '../CalendarView';
import { Meal, MealStatus, MealClassification } from '../../../../client';

// Capture the onDragStart and onDragEnd callbacks from DndContext so we can simulate drag events
let capturedOnDragStart: ((event: unknown) => void) | null = null;
let capturedOnDragEnd: ((event: unknown) => void) | null = null;
let capturedSensors: unknown[] | null = null;

vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children, onDragStart, onDragEnd, sensors }: { children: React.ReactNode; onDragStart?: (event: unknown) => void; onDragEnd?: (event: unknown) => void; sensors?: unknown[] }) => {
        capturedOnDragStart = onDragStart || null;
        capturedOnDragEnd = onDragEnd || null;
        capturedSensors = sensors || null;
        return <div data-testid="dnd-context">{children}</div>;
    },
    DragOverlay: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="drag-overlay">{children}</div>
    ),
    useDraggable: ({ id, disabled }: { id: string; disabled?: boolean }) => ({
        attributes: disabled ? { tabIndex: 0 } : { 'data-draggable-id': id, tabIndex: 0 },
        listeners: disabled ? {} : { onPointerDown: vi.fn() },
        setNodeRef: vi.fn(),
        transform: null,
        isDragging: false,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useDroppable: (_opts: { id: string }) => ({
        setNodeRef: vi.fn(),
        isOver: false,
        active: null,
    }),
    PointerSensor: vi.fn(),
    KeyboardSensor: vi.fn(),
    useSensor: vi.fn(),
    useSensors: () => [],
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ChakraProvider value={system}>
            <MemoryRouter>{ui}</MemoryRouter>
        </ChakraProvider>
    );
};

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const mockMeals: Meal[] = [
    {
        id: 'meal-1',
        name: 'Today Dinner',
        status: MealStatus.QUEUED,
        classification: MealClassification.DINNER,
        scheduled_date: todayStr,
        is_shopped: false,
        queue_position: 0,
        user_id: 'u1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        items: [],
    },
    {
        id: 'meal-2',
        name: 'Tomorrow Lunch',
        status: MealStatus.QUEUED,
        classification: MealClassification.LUNCH,
        scheduled_date: tomorrowStr,
        is_shopped: false,
        queue_position: 1,
        user_id: 'u1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        items: [],
    },
    {
        id: 'meal-3',
        name: 'Unscheduled Meal',
        status: MealStatus.QUEUED,
        classification: MealClassification.DINNER,
        scheduled_date: null,
        is_shopped: false,
        queue_position: 2,
        user_id: 'u1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        items: [],
    },
];

describe('CalendarView', () => {
    beforeEach(() => {
        capturedOnDragStart = null;
        capturedOnDragEnd = null;
        capturedSensors = null;
    });

    it('renders 7-day grid', () => {
        renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
        // Should show 7 day headers
        const dayHeaders = screen.getAllByTestId(/^calendar-day-/);
        expect(dayHeaders.length).toBe(7);
    });

    it('shows meals on their scheduled days', () => {
        renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
        expect(screen.getByText('Today Dinner')).toBeInTheDocument();
        expect(screen.getByText('Tomorrow Lunch')).toBeInTheDocument();
    });

    it('shows unscheduled meals section', () => {
        renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
        expect(screen.getByText('Unscheduled')).toBeInTheDocument();
        expect(screen.getByText('Unscheduled Meal')).toBeInTheDocument();
    });

    it('has week navigation buttons', () => {
        renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
        expect(screen.getByLabelText(/previous week/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/next week/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    });

    it('navigates to next week', () => {
        renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
        const nextBtn = screen.getByLabelText(/next week/i);
        fireEvent.click(nextBtn);
        // After navigation, the date range text should change
        // The meals from the current week won't show since they're now outside the view
    });

    describe('drag-and-drop', () => {
        it('wraps content in a DndContext', () => {
            renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
            expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
        });

        it('meal cards in day slots have draggable attributes', () => {
            renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
            // Scheduled meal cards should have data-draggable-id
            const draggable1 = screen.getByText('Today Dinner').closest('[data-draggable-id]');
            expect(draggable1).not.toBeNull();
            expect(draggable1?.getAttribute('data-draggable-id')).toBe('meal-1');

            const draggable2 = screen.getByText('Tomorrow Lunch').closest('[data-draggable-id]');
            expect(draggable2).not.toBeNull();
            expect(draggable2?.getAttribute('data-draggable-id')).toBe('meal-2');
        });

        it('unscheduled meal cards have draggable attributes', () => {
            renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
            const draggable3 = screen.getByText('Unscheduled Meal').closest('[data-draggable-id]');
            expect(draggable3).not.toBeNull();
            expect(draggable3?.getAttribute('data-draggable-id')).toBe('meal-3');
        });

        it('day slots have droppable test ids', () => {
            renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
            // Day slots should be droppable
            const todaySlot = screen.getByTestId(`calendar-day-${todayStr}`);
            expect(todaySlot).toBeInTheDocument();

            const tomorrowSlot = screen.getByTestId(`calendar-day-${tomorrowStr}`);
            expect(tomorrowSlot).toBeInTheDocument();
        });

        it('unscheduled area has a droppable test id', () => {
            renderWithProviders(<CalendarView meals={mockMeals} recipeNames={{}} />);
            const unscheduledDrop = screen.getByTestId('calendar-unscheduled');
            expect(unscheduledDrop).toBeInTheDocument();
        });

        it('dropping a meal on a different day calls onMealUpdate with new date', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            expect(capturedOnDragEnd).not.toBeNull();

            // Simulate dropping meal-1 (today) onto tomorrow's slot
            capturedOnDragEnd!({
                active: { id: 'meal-1' },
                over: { id: tomorrowStr },
            });

            expect(onMealUpdate).toHaveBeenCalledWith('meal-1', { scheduled_date: tomorrowStr });
        });

        it('dropping an unscheduled meal onto a day schedules it', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            expect(capturedOnDragEnd).not.toBeNull();

            // Simulate dropping unscheduled meal-3 onto today's slot
            capturedOnDragEnd!({
                active: { id: 'meal-3' },
                over: { id: todayStr },
            });

            expect(onMealUpdate).toHaveBeenCalledWith('meal-3', { scheduled_date: todayStr });
        });

        it('dropping a scheduled meal on unscheduled area clears scheduled_date', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            expect(capturedOnDragEnd).not.toBeNull();

            // Simulate dropping meal-1 onto the unscheduled area
            capturedOnDragEnd!({
                active: { id: 'meal-1' },
                over: { id: 'unscheduled' },
            });

            expect(onMealUpdate).toHaveBeenCalledWith('meal-1', { scheduled_date: null });
        });

        it('does not call onMealUpdate when dropped on the same day', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            // Simulate dropping meal-1 back on its current day (today)
            capturedOnDragEnd!({
                active: { id: 'meal-1' },
                over: { id: todayStr },
            });

            expect(onMealUpdate).not.toHaveBeenCalled();
        });

        it('does not call onMealUpdate when dropping an unscheduled meal on unscheduled', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            // Simulate dropping unscheduled meal-3 back on unscheduled area
            capturedOnDragEnd!({
                active: { id: 'meal-3' },
                over: { id: 'unscheduled' },
            });

            expect(onMealUpdate).not.toHaveBeenCalled();
        });

        it('does not call onMealUpdate when dropped with no target', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            // Simulate dropping with no over target
            capturedOnDragEnd!({
                active: { id: 'meal-1' },
                over: null,
            });

            expect(onMealUpdate).not.toHaveBeenCalled();
        });

        it('does not error when onMealUpdate is not provided', () => {
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} />
            );

            expect(capturedOnDragEnd).not.toBeNull();

            // Should not throw when no onMealUpdate is provided
            expect(() => {
                capturedOnDragEnd!({
                    active: { id: 'meal-1' },
                    over: { id: tomorrowStr },
                });
            }).not.toThrow();
        });

        it('optimistically moves meal to new date slot immediately after drop', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            // Verify meal-1 starts in today's slot
            const todaySlot = screen.getByTestId(`calendar-day-${todayStr}`);
            expect(todaySlot).toHaveTextContent('Today Dinner');

            const tomorrowSlot = screen.getByTestId(`calendar-day-${tomorrowStr}`);
            // Tomorrow slot should have only Tomorrow Lunch, not Today Dinner
            expect(tomorrowSlot).not.toHaveTextContent('Today Dinner');

            // Simulate full drag flow: start then end
            act(() => {
                capturedOnDragStart!({ active: { id: 'meal-1' } });
            });
            act(() => {
                capturedOnDragEnd!({
                    active: { id: 'meal-1' },
                    over: { id: tomorrowStr },
                });
            });

            // After drop, meal should optimistically appear in tomorrow's slot
            // (without waiting for prop changes from server)
            const tomorrowSlotAfter = screen.getByTestId(`calendar-day-${tomorrowStr}`);
            expect(tomorrowSlotAfter).toHaveTextContent('Today Dinner');
        });

        it('removes meal from old slot immediately after drop (no snap-back)', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            // Verify meal-1 starts in today's slot
            const todaySlotBefore = screen.getByTestId(`calendar-day-${todayStr}`);
            expect(todaySlotBefore).toHaveTextContent('Today Dinner');

            // Simulate full drag flow: start then end
            act(() => {
                capturedOnDragStart!({ active: { id: 'meal-1' } });
            });
            act(() => {
                capturedOnDragEnd!({
                    active: { id: 'meal-1' },
                    over: { id: tomorrowStr },
                });
            });

            // After drop, the meal should NOT appear in the original (today) slot
            const todaySlotAfter = screen.getByTestId(`calendar-day-${todayStr}`);
            expect(todaySlotAfter).not.toHaveTextContent('Today Dinner');
        });

        it('optimistically moves a scheduled meal to unscheduled area after drop', () => {
            const onMealUpdate = vi.fn();
            renderWithProviders(
                <CalendarView meals={mockMeals} recipeNames={{}} onMealUpdate={onMealUpdate} />
            );

            // Verify meal-1 starts in today's slot
            expect(screen.getByTestId(`calendar-day-${todayStr}`)).toHaveTextContent('Today Dinner');

            // Simulate dropping meal-1 onto unscheduled area
            act(() => {
                capturedOnDragStart!({ active: { id: 'meal-1' } });
            });
            act(() => {
                capturedOnDragEnd!({
                    active: { id: 'meal-1' },
                    over: { id: 'unscheduled' },
                });
            });

            // After drop, meal should be removed from today's slot
            expect(screen.getByTestId(`calendar-day-${todayStr}`)).not.toHaveTextContent('Today Dinner');

            // And should appear in unscheduled area
            const unscheduledArea = screen.getByTestId('calendar-unscheduled');
            expect(unscheduledArea).toHaveTextContent('Today Dinner');
        });
    });

    describe('selection mode', () => {
        it('accepts selectionMode, selectedIds, and onToggleSelect props', () => {
            const onToggleSelect = vi.fn();
            renderWithProviders(
                <CalendarView
                    meals={mockMeals}
                    recipeNames={{}}
                    selectionMode={true}
                    selectedIds={new Set(['meal-1'])}
                    onToggleSelect={onToggleSelect}
                />
            );
            // Should render without errors
            expect(screen.getByText('Today Dinner')).toBeInTheDocument();
        });

        it('renders accent border when a meal card is selected', () => {
            renderWithProviders(
                <CalendarView
                    meals={mockMeals}
                    recipeNames={{}}
                    selectionMode={true}
                    selectedIds={new Set(['meal-1'])}
                    onToggleSelect={vi.fn()}
                />
            );
            // The selected meal card should have the accent border style
            const mealCard = screen.getByText('Today Dinner').closest('[data-selected]');
            expect(mealCard).not.toBeNull();
            expect(mealCard?.getAttribute('data-selected')).toBe('true');
        });

        it('does not render accent border for unselected meal cards', () => {
            renderWithProviders(
                <CalendarView
                    meals={mockMeals}
                    recipeNames={{}}
                    selectionMode={true}
                    selectedIds={new Set(['meal-1'])}
                    onToggleSelect={vi.fn()}
                />
            );
            // meal-2 is not selected
            const mealCard = screen.getByText('Tomorrow Lunch').closest('[data-selected]');
            expect(mealCard).toBeNull();
        });

        it('calls onToggleSelect instead of navigate when clicking in selection mode', () => {
            const onToggleSelect = vi.fn();
            renderWithProviders(
                <CalendarView
                    meals={mockMeals}
                    recipeNames={{}}
                    selectionMode={true}
                    selectedIds={new Set()}
                    onToggleSelect={onToggleSelect}
                />
            );
            fireEvent.click(screen.getByText('Today Dinner'));
            expect(onToggleSelect).toHaveBeenCalledWith('meal-1');
        });

        it('does not have draggable attributes when selectionMode is true', () => {
            renderWithProviders(
                <CalendarView
                    meals={mockMeals}
                    recipeNames={{}}
                    selectionMode={true}
                    selectedIds={new Set()}
                    onToggleSelect={vi.fn()}
                />
            );
            // In selection mode, useDraggable is called with disabled:true so data-draggable-id should not be present
            const draggable1 = screen.getByText('Today Dinner').closest('[data-draggable-id]');
            expect(draggable1).toBeNull();
        });

        it('passes empty sensors to DndContext when selectionMode is true', () => {
            renderWithProviders(
                <CalendarView
                    meals={mockMeals}
                    recipeNames={{}}
                    selectionMode={true}
                    selectedIds={new Set()}
                    onToggleSelect={vi.fn()}
                />
            );
            expect(capturedSensors).toEqual([]);
        });

        it('has draggable attributes when selectionMode is false', () => {
            renderWithProviders(
                <CalendarView
                    meals={mockMeals}
                    recipeNames={{}}
                    selectionMode={false}
                    selectedIds={new Set()}
                    onToggleSelect={vi.fn()}
                />
            );
            const draggable1 = screen.getByText('Today Dinner').closest('[data-draggable-id]');
            expect(draggable1).not.toBeNull();
            expect(draggable1?.getAttribute('data-draggable-id')).toBe('meal-1');
        });
    });

    describe('shopping bag icon', () => {
        const shoppedMeals: Meal[] = [
            {
                ...mockMeals[0],
                is_shopped: true,
            },
            {
                ...mockMeals[1],
                is_shopped: false,
            },
            mockMeals[2],
        ];

        it('renders green shopping icon when is_shopped is true', () => {
            renderWithProviders(<CalendarView meals={shoppedMeals} recipeNames={{}} />);
            const icon = screen.getByTestId('shopping-icon-meal-1');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveStyle({ color: 'var(--chakra-colors-green-400)' });
        });

        it('renders muted shopping icon when is_shopped is false', () => {
            renderWithProviders(<CalendarView meals={shoppedMeals} recipeNames={{}} />);
            const icon = screen.getByTestId('shopping-icon-meal-2');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveStyle({ color: 'var(--chakra-colors-fg-muted)' });
        });

        it('renders shopping icon in both selection mode and non-selection mode', () => {
            // Non-selection mode
            const { unmount } = renderWithProviders(
                <CalendarView meals={shoppedMeals} recipeNames={{}} />
            );
            expect(screen.getByTestId('shopping-icon-meal-1')).toBeInTheDocument();
            expect(screen.getByTestId('shopping-icon-meal-2')).toBeInTheDocument();
            expect(screen.getByTestId('shopping-icon-meal-3')).toBeInTheDocument();
            unmount();

            // Selection mode
            renderWithProviders(
                <CalendarView
                    meals={shoppedMeals}
                    recipeNames={{}}
                    selectionMode={true}
                    selectedIds={new Set()}
                    onToggleSelect={vi.fn()}
                />
            );
            expect(screen.getByTestId('shopping-icon-meal-1')).toBeInTheDocument();
            expect(screen.getByTestId('shopping-icon-meal-2')).toBeInTheDocument();
            expect(screen.getByTestId('shopping-icon-meal-3')).toBeInTheDocument();
        });
    });
});
