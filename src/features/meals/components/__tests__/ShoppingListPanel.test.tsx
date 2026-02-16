import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import ShoppingListPanel from '../ShoppingListPanel';
import { Meal, MealStatus, MealClassification } from '../../../../client';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ChakraProvider value={system}>{ui}</ChakraProvider>
    );
};

const mockMeals: Meal[] = [
    {
        id: 'meal-1',
        name: 'Monday Dinner',
        status: MealStatus.QUEUED,
        classification: MealClassification.DINNER,
        scheduled_date: '2026-03-01',
        is_shopped: false,
        queue_position: 0,
        user_id: 'u1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        items: [
            { id: 'i1', recipe_id: 'r1', meal_id: 'meal-1' },
        ],
    },
    {
        id: 'meal-2',
        name: 'Tuesday Lunch',
        status: MealStatus.QUEUED,
        classification: MealClassification.LUNCH,
        scheduled_date: '2026-03-02',
        is_shopped: false,
        queue_position: 1,
        user_id: 'u1',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        items: [
            { id: 'i2', recipe_id: 'r2', meal_id: 'meal-2' },
        ],
    },
];

describe('ShoppingListPanel', () => {
    it('does not render when closed', () => {
        renderWithProviders(
            <ShoppingListPanel isOpen={false} onClose={vi.fn()} meals={mockMeals} recipeNames={{ r1: 'Pasta', r2: 'Salad' }} />
        );
        expect(screen.queryByText('Shopping List')).not.toBeInTheDocument();
    });

    it('renders meal names when open', () => {
        renderWithProviders(
            <ShoppingListPanel isOpen={true} onClose={vi.fn()} meals={mockMeals} recipeNames={{ r1: 'Pasta', r2: 'Salad' }} />
        );
        expect(screen.getByText('Shopping List')).toBeInTheDocument();
        expect(screen.getByText('Monday Dinner')).toBeInTheDocument();
        expect(screen.getByText('Tuesday Lunch')).toBeInTheDocument();
    });

    it('shows recipe names for each meal', () => {
        renderWithProviders(
            <ShoppingListPanel isOpen={true} onClose={vi.fn()} meals={mockMeals} recipeNames={{ r1: 'Pasta', r2: 'Salad' }} />
        );
        expect(screen.getByText('Pasta')).toBeInTheDocument();
        expect(screen.getByText('Salad')).toBeInTheDocument();
    });

    it('shows empty state when no un-shopped meals', () => {
        renderWithProviders(
            <ShoppingListPanel isOpen={true} onClose={vi.fn()} meals={[]} recipeNames={{}} />
        );
        expect(screen.getByText(/no items to shop/i)).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        renderWithProviders(
            <ShoppingListPanel isOpen={true} onClose={onClose} meals={mockMeals} recipeNames={{ r1: 'Pasta', r2: 'Salad' }} />
        );
        fireEvent.click(screen.getByLabelText(/close/i));
        expect(onClose).toHaveBeenCalled();
    });
});
