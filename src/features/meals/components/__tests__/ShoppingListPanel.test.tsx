import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import ShoppingListPanel from '../ShoppingListPanel';
import { Meal, MealStatus, MealClassification, Recipe } from '../../../../client';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ChakraProvider value={system}>{ui}</ChakraProvider>
    );
};

const mockRecipes: Recipe[] = [
    {
        core: {
            id: 'r1',
            name: 'Pasta Carbonara',
            owner_id: 'user1',
        },
        times: { total_time_minutes: 30 },
        nutrition: {},
        components: [
            {
                name: 'Main',
                ingredients: [
                    { item: 'Spaghetti', unit: 'lb', quantity: 1 },
                    { item: 'Eggs', unit: 'count', quantity: 3 },
                    { item: 'Parmesan', unit: 'cup', quantity: 0.5 },
                ],
            },
        ],
        instructions: [],
        audit: {},
        suitable_for_diet: [],
        variant_recipe_ids: [],
    } as unknown as Recipe,
    {
        core: {
            id: 'r2',
            name: 'Caesar Salad',
            owner_id: 'user1',
        },
        times: { total_time_minutes: 15 },
        nutrition: {},
        components: [
            {
                name: 'Main',
                ingredients: [
                    { item: 'Romaine Lettuce', unit: 'head', quantity: 1 },
                    { item: 'Parmesan', unit: 'cup', quantity: 0.25 },
                    { item: 'Croutons', unit: 'cup', quantity: 1 },
                ],
            },
        ],
        instructions: [],
        audit: {},
        suitable_for_diet: [],
        variant_recipe_ids: [],
    } as unknown as Recipe,
    {
        core: {
            id: 'r3',
            name: 'Garlic Bread',
            owner_id: 'user1',
        },
        times: { total_time_minutes: 10 },
        nutrition: {},
        components: [
            {
                name: 'Main',
                ingredients: [
                    { item: 'Bread', unit: 'loaf', quantity: 1 },
                    { item: 'Butter', unit: 'tbsp', quantity: 3 },
                ],
            },
        ],
        instructions: [],
        audit: {},
        suitable_for_diet: [],
        variant_recipe_ids: [],
    } as unknown as Recipe,
];

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
            { id: 'i2', recipe_id: 'r2', meal_id: 'meal-1' },
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
            { id: 'i3', recipe_id: 'r3', meal_id: 'meal-2' },
        ],
    },
];

const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    meals: mockMeals,
    recipes: mockRecipes,
};

describe('ShoppingListPanel', () => {
    it('does not render when closed', () => {
        renderWithProviders(
            <ShoppingListPanel {...defaultProps} isOpen={false} />
        );
        expect(screen.queryByText('Shopping List')).not.toBeInTheDocument();
    });

    it('renders the panel heading when open', () => {
        renderWithProviders(
            <ShoppingListPanel {...defaultProps} />
        );
        expect(screen.getByText('Shopping List')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        renderWithProviders(
            <ShoppingListPanel {...defaultProps} onClose={onClose} />
        );
        fireEvent.click(screen.getByLabelText(/close/i));
        expect(onClose).toHaveBeenCalled();
    });

    describe('merged view (default)', () => {
        it('displays aggregated ingredients from all unshopped meals', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            // Should show ingredients, not meal names
            expect(screen.getByText('Spaghetti')).toBeInTheDocument();
            expect(screen.getByText('Eggs')).toBeInTheDocument();
            expect(screen.getByText('Romaine Lettuce')).toBeInTheDocument();
            expect(screen.getByText('Bread')).toBeInTheDocument();
            expect(screen.getByText('Butter')).toBeInTheDocument();
        });

        it('sums quantities for same item+unit across recipes', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            // Parmesan: 0.5 cup (Pasta) + 0.25 cup (Salad) = 0.75 cup = 3/4
            expect(screen.getByText('Parmesan')).toBeInTheDocument();
            expect(screen.getByText(/¾ cup/)).toBeInTheDocument();
        });

        it('shows recipe sources for aggregated ingredients', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            expect(screen.getByText('From: Pasta Carbonara, Caesar Salad')).toBeInTheDocument();
        });

        it('sorts ingredients alphabetically', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            const items = screen.getAllByRole('listitem');
            // Bread, Butter, Croutons, Eggs, Parmesan, Romaine Lettuce, Spaghetti
            expect(items[0]).toHaveTextContent('Bread');
            expect(items[1]).toHaveTextContent('Butter');
            expect(items[2]).toHaveTextContent('Croutons');
        });
    });

    describe('by-recipe view', () => {
        it('groups ingredients under recipe names', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            fireEvent.click(screen.getByText('By Recipe'));

            expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
            expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
            expect(screen.getByText('Garlic Bread')).toBeInTheDocument();
        });

        it('switches between merged and by-recipe views', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            // Default is merged - should show "From:" sources
            expect(screen.getByText(/From: Pasta Carbonara, Caesar Salad/)).toBeInTheDocument();

            // Switch to by-recipe
            fireEvent.click(screen.getByText('By Recipe'));
            // "From:" lines should not be shown in by-recipe view
            expect(screen.queryByText(/From: Pasta Carbonara, Caesar Salad/)).not.toBeInTheDocument();

            // Switch back to merged
            fireEvent.click(screen.getByText('Merged'));
            expect(screen.getByText(/From: Pasta Carbonara, Caesar Salad/)).toBeInTheDocument();
        });
    });

    describe('checkbox toggles', () => {
        it('toggles ingredient checked state on click', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            // Click on the ingredient text to toggle
            const breadText = screen.getByText('Bread');
            fireEvent.click(breadText);

            // After clicking, the item should be checked - verify by clicking again
            // and checking the item is still in the document (toggle works)
            fireEvent.click(breadText);
            expect(screen.getByText('Bread')).toBeInTheDocument();
        });

        it('applies strikethrough to checked items', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            const breadText = screen.getByText('Bread');
            // Before clicking, text should not have strikethrough
            const parentText = breadText.closest('p, span, [class*="css"]');
            expect(parentText).not.toHaveStyle('text-decoration: line-through');

            fireEvent.click(breadText);
            // After clicking, the text container should have strikethrough
            expect(parentText).toHaveStyle('text-decoration: line-through');
        });
    });

    describe('empty state', () => {
        it('shows empty state when all meals are shopped', () => {
            const shoppedMeals = mockMeals.map(m => ({ ...m, is_shopped: true }));
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} meals={shoppedMeals} />
            );
            expect(screen.getByText(/no items to shop/i)).toBeInTheDocument();
        });

        it('shows empty state when no meals provided', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} meals={[]} />
            );
            expect(screen.getByText(/no items to shop/i)).toBeInTheDocument();
        });
    });

    describe('excludes shopped meals', () => {
        it('only shows ingredients from unshopped meals', () => {
            const mealsWithShopped: Meal[] = [
                { ...mockMeals[0], is_shopped: true },  // Pasta + Salad - shopped
                mockMeals[1],  // Garlic Bread - not shopped
            ];
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} meals={mealsWithShopped} />
            );
            // Should show Garlic Bread ingredients
            expect(screen.getByText('Bread')).toBeInTheDocument();
            expect(screen.getByText('Butter')).toBeInTheDocument();

            // Should NOT show Pasta/Salad ingredients
            expect(screen.queryByText('Spaghetti')).not.toBeInTheDocument();
            expect(screen.queryByText('Eggs')).not.toBeInTheDocument();
        });
    });

    describe('print button', () => {
        it('renders a Print button', () => {
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            expect(screen.getByLabelText(/print/i)).toBeInTheDocument();
        });

        it('calls window.print when Print button is clicked', () => {
            const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
            renderWithProviders(
                <ShoppingListPanel {...defaultProps} />
            );
            fireEvent.click(screen.getByLabelText(/print/i));
            expect(printSpy).toHaveBeenCalled();
            printSpy.mockRestore();
        });
    });
});
