import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import CalendarView from '../CalendarView';
import { Meal, MealStatus, MealClassification } from '../../../../client';

// Capture the onDragEnd callback from DndContext so we can simulate drag events
let capturedOnDragEnd: ((event: unknown) => void) | null = null;

vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd?: (event: unknown) => void }) => {
        capturedOnDragEnd = onDragEnd || null;
        return <div data-testid="dnd-context">{children}</div>;
    },
    DragOverlay: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="drag-overlay">{children}</div>
    ),
    useDraggable: ({ id }: { id: string }) => ({
        attributes: { 'data-draggable-id': id, tabIndex: 0 },
        listeners: { onPointerDown: vi.fn() },
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
        capturedOnDragEnd = null;
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
    });
});
