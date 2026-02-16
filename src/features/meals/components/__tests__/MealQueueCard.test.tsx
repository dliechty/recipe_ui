import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import MealQueueCard from '../MealQueueCard';
import { Meal, MealStatus, MealClassification } from '../../../../client';

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
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

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ChakraProvider value={system}>
            <MemoryRouter>{ui}</MemoryRouter>
        </ChakraProvider>
    );
};

const baseMeal: Meal = {
    id: 'meal-1',
    name: 'Sunday Dinner',
    status: MealStatus.QUEUED,
    classification: MealClassification.DINNER,
    scheduled_date: '2026-03-01',
    is_shopped: false,
    queue_position: 0,
    user_id: 'u1',
    template_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    items: [
        { id: 'i1', recipe_id: 'r1', meal_id: 'meal-1' },
        { id: 'i2', recipe_id: 'r2', meal_id: 'meal-1' },
    ],
};

describe('MealQueueCard', () => {
    it('renders meal name', () => {
        renderWithProviders(<MealQueueCard meal={baseMeal} recipeNames={{}} />);
        expect(screen.getByText('Sunday Dinner')).toBeInTheDocument();
    });

    it('renders classification badge', () => {
        renderWithProviders(<MealQueueCard meal={baseMeal} recipeNames={{}} />);
        expect(screen.getByText('Dinner')).toBeInTheDocument();
    });

    it('renders recipe count', () => {
        renderWithProviders(<MealQueueCard meal={baseMeal} recipeNames={{}} />);
        expect(screen.getByText(/2 recipes/i)).toBeInTheDocument();
    });

    it('renders recipe names when available', () => {
        const recipeNames = { r1: 'Pasta', r2: 'Salad' };
        renderWithProviders(<MealQueueCard meal={baseMeal} recipeNames={recipeNames} />);
        expect(screen.getByText(/Pasta/)).toBeInTheDocument();
        expect(screen.getByText(/Salad/)).toBeInTheDocument();
    });

    it('shows scheduled date when present', () => {
        renderWithProviders(<MealQueueCard meal={baseMeal} recipeNames={{}} />);
        expect(screen.getByText(new Date('2026-03-01').toLocaleDateString())).toBeInTheDocument();
    });

    it('shows "Unscheduled" when no date', () => {
        const meal = { ...baseMeal, scheduled_date: null };
        renderWithProviders(<MealQueueCard meal={meal} recipeNames={{}} />);
        expect(screen.getByText('Unscheduled')).toBeInTheDocument();
    });

    it('shows shopped indicator when is_shopped is true', () => {
        const meal = { ...baseMeal, is_shopped: true };
        renderWithProviders(<MealQueueCard meal={meal} recipeNames={{}} />);
        expect(screen.getByText('Shopped')).toBeInTheDocument();
    });

    it('shows unshopped indicator when is_shopped is false', () => {
        renderWithProviders(<MealQueueCard meal={baseMeal} recipeNames={{}} />);
        expect(screen.getByText('Not Shopped')).toBeInTheDocument();
    });

    it('renders drag handle', () => {
        renderWithProviders(<MealQueueCard meal={baseMeal} recipeNames={{}} />);
        expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
    });

    it('renders with no items gracefully', () => {
        const meal = { ...baseMeal, items: [] };
        renderWithProviders(<MealQueueCard meal={meal} recipeNames={{}} />);
        expect(screen.getByText('0 recipes')).toBeInTheDocument();
    });
});
