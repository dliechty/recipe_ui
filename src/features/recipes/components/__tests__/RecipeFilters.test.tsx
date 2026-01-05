import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecipeFiltersDisplay from '../RecipeFilters';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the hook
vi.mock('../../hooks/useRecipeMeta', () => ({
    useRecipeMeta: (field: string) => {
        if (field === 'category') return { data: ['Breakfast', 'Dinner'] };
        if (field === 'cuisine') return { data: ['Italian', 'Mexican'] };
        if (field === 'protein') return { data: ['Chicken', 'Beef'] };
        if (field === 'suitable_for_diet') return { data: ['Vegan', 'Gluten-Free'] };
        return { data: [] };
    }
}));

const queryClient = new QueryClient();

// Mock ChakraProvider helper if needed, but for v3 we utilize defaultSystem or Provider
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
        </QueryClientProvider>
    );
};

describe('RecipeFiltersDisplay', () => {
    it('renders filter inputs', () => {
        renderWithProviders(<RecipeFiltersDisplay filters={{}} onFilterChange={() => { }} />);

        expect(screen.getByPlaceholderText('Search recipes...')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();

        // Cuisine should be hidden initially
        expect(screen.queryByText('Cuisine')).not.toBeInTheDocument();

        // Expand
        fireEvent.click(screen.getByText('More Filters'));
        expect(screen.getByText('Cuisine')).toBeInTheDocument();
        expect(screen.getByText('Protein')).toBeInTheDocument();
        expect(screen.getByText('Yield (Typically Servings)')).toBeInTheDocument();
    });

    it('text input calls onFilterChange after debounce', async () => {
        vi.useFakeTimers();
        const onFilterChange = vi.fn();
        renderWithProviders(<RecipeFiltersDisplay filters={{}} onFilterChange={onFilterChange} />);

        const input = screen.getByPlaceholderText('Search recipes...');
        fireEvent.change(input, { target: { value: 'Test' } });

        // Should not be called immediately
        expect(onFilterChange).not.toHaveBeenCalled();

        // Advance time
        await act(async () => {
            vi.advanceTimersByTime(350);
        });

        expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }));
        vi.useRealTimers();
    });

    it('ingredients input calls onFilterChange with like property after debounce', async () => {
        vi.useFakeTimers();
        const onFilterChange = vi.fn();
        renderWithProviders(<RecipeFiltersDisplay filters={{}} onFilterChange={onFilterChange} />);

        // Expand filters
        fireEvent.click(screen.getByText('More Filters'));

        const input = screen.getByPlaceholderText('e.g. egg');
        fireEvent.change(input, { target: { value: 'Cheese' } });

        // Advance time
        await act(async () => {
            vi.advanceTimersByTime(350);
        });

        expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
            ingredients: { like: 'Cheese' }
        }));
        vi.useRealTimers();
    });

    it('select input calls onFilterChange immediately', () => {
        const onFilterChange = vi.fn();
        renderWithProviders(<RecipeFiltersDisplay filters={{}} onFilterChange={onFilterChange} />);

        // Chakra v3 NativeSelect renders a select element
        // For react-select, we interact by clicking the control
        // The placeholder is "All Categories"
        const control = screen.getByText('All Categories');
        fireEvent.mouseDown(control);

        // Options are "Breakfast", "Dinner" (from mock)
        const option = screen.getByText('Dinner');
        fireEvent.click(option);

        expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ category: ['Dinner'] }));
    });

    it('enables reset button when filters are active', () => {
        const onFilterChange = vi.fn();
        // Render with an active filter
        renderWithProviders(<RecipeFiltersDisplay filters={{ category: ['Dinner'] }} onFilterChange={onFilterChange} />);

        const resetButton = screen.getByRole('button', { name: /reset/i });
        expect(resetButton).toBeInTheDocument();
        expect(resetButton).not.toBeDisabled();

        fireEvent.click(resetButton);
        expect(onFilterChange).toHaveBeenCalledWith({ sort: 'name' });
    });

    it('disables reset button when no filters are active (default sort only)', () => {
        renderWithProviders(<RecipeFiltersDisplay filters={{ sort: 'name' }} onFilterChange={() => { }} />);
        const resetButton = screen.getByRole('button', { name: /reset/i });
        expect(resetButton).toBeInTheDocument();
        // Chakra v3 disabled might implementation detail, but typically sets disabled attribute
        // Check disabled via attribute or style if custom
        // Since we passed `disabled={true}`, standard matcher should work
        expect(resetButton).toBeDisabled();
    });

    it('dietary suitability filter updates as string array', () => { // Verify OR logic structure
        const onFilterChange = vi.fn();
        renderWithProviders(<RecipeFiltersDisplay filters={{}} onFilterChange={onFilterChange} />);

        // Expand filters
        fireEvent.click(screen.getByText('More Filters'));

        const control = screen.getByText('Any Diet');
        fireEvent.mouseDown(control);

        const option = screen.getByText('Vegan');
        fireEvent.click(option);

        expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ suitable_for_diet: ['Vegan'] }));
    });
});
