import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecipeFiltersDisplay from '../RecipeFilters';
import { RecipeFilters } from '../../../../hooks/useRecipes';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the hook
vi.mock('../../hooks/useRecipeMeta', () => ({
    useRecipeMeta: (field: string) => {
        if (field === 'category') return { data: ['Breakfast', 'Dinner'] };
        if (field === 'cuisine') return { data: ['Italian', 'Mexican'] };
        if (field === 'protein') return { data: ['Chicken', 'Beef'] };
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

    it('text input calls onFilterChange on blur', () => {
        const onFilterChange = vi.fn();
        renderWithProviders(<RecipeFiltersDisplay filters={{}} onFilterChange={onFilterChange} />);

        const input = screen.getByPlaceholderText('Search recipes...');
        fireEvent.change(input, { target: { value: 'Test' } });
        fireEvent.blur(input);

        expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }));
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
});
