import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import CalendarView from '../CalendarView';
import { Meal, MealStatus, MealClassification } from '../../../../client';

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
});
