import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MealFilters from '../MealFilters';
import { TestWrapper } from '../../../../test-utils';
import { MealFilters as MealFiltersType } from '../../../../utils/mealParams';
import { MealStatus } from '../../../../client/models/MealStatus';

import { MealClassification } from '../../../../client/models/MealClassification';

// Mocks
vi.mock('../../../hooks/useUsers', () => ({
    useUsers: () => ({
        data: [
            { id: 'u1', first_name: 'John', last_name: 'Doe' },
            { id: 'u2', first_name: 'Jane', last_name: 'Smith' }
        ]
    })
}));

vi.mock('../../../recipes/components/RecipeMultiSelect', () => ({
    default: ({ label, value, onChange }: { label: string; value: string[]; onChange: (val: string[]) => void }) => (
        <div data-testid={`select-${label}`}>
            <label>{label}</label>
            <button onClick={() => onChange(['test-value'])}>Select Test</button>
            <span data-testid={`value-${label}`}>{value.join(',')}</span>
        </div>
    )
}));

vi.mock('../RecipeFilterModal', () => ({
    default: ({ isOpen, onApply }: { isOpen: boolean; onApply: (ids: string[]) => void }) => isOpen ? (
        <div data-testid="recipe-modal">
            <button onClick={() => onApply(['r1', 'r2'])}>Apply Recipes</button>
        </div>
    ) : null
}));

describe('MealFilters', () => {
    const defaultFilters: MealFiltersType = { sort: '-created_at' };

    it('should render basic filters', () => {
        render(
            <TestWrapper>
                <MealFilters filters={defaultFilters} onFilterChange={vi.fn()} />
            </TestWrapper>
        );

        expect(screen.getByPlaceholderText('Search meals...')).toBeInTheDocument();
        expect(screen.getByTestId('select-Status')).toBeInTheDocument();
        expect(screen.getByText('More Filters')).toBeInTheDocument();
    });

    it('should call onFilterChange when name changes', async () => {
        const onFilterChange = vi.fn();
        render(
            <TestWrapper>
                <MealFilters filters={defaultFilters} onFilterChange={onFilterChange} />
            </TestWrapper>
        );

        const input = screen.getByPlaceholderText('Search meals...');
        fireEvent.change(input, { target: { value: 'Dinner' } });

        await waitFor(() => {
            expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Dinner' }));
        });
    });

    it('should expand advanced filters', () => {
        render(
            <TestWrapper>
                <MealFilters filters={defaultFilters} onFilterChange={vi.fn()} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('More Filters'));

        expect(screen.getByTestId('select-Classification')).toBeInTheDocument();
        expect(screen.getByTestId('select-Owner / Author')).toBeInTheDocument();
        expect(screen.getByText('Scheduled Date Range')).toBeInTheDocument();
    });

    it('should auto-expand if advanced filters are present', () => {
        const filters: MealFiltersType = {
            ...defaultFilters,
            classification: [MealClassification.BREAKFAST] // Trigger boolean check
        };
        render(
            <TestWrapper>
                <MealFilters filters={filters} onFilterChange={vi.fn()} />
            </TestWrapper>
        );

        expect(screen.getByTestId('select-Classification')).toBeInTheDocument();
    });

    it('should open recipe modal and apply filters', () => {
        const onFilterChange = vi.fn();
        render(
            <TestWrapper>
                <MealFilters filters={defaultFilters} onFilterChange={onFilterChange} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('More Filters'));
        fireEvent.click(screen.getByText('Filter by Recipe'));
        
        expect(screen.getByTestId('recipe-modal')).toBeInTheDocument();
        
        fireEvent.click(screen.getByText('Apply Recipes'));
        
        expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
            recipe: ['r1', 'r2']
        }));
    });

    it('should reset filters', () => {
        const filters: MealFiltersType = {
            sort: '-created_at',
            name: 'Pizza',
            status: [MealStatus.COOKED]
        };
        const onFilterChange = vi.fn();
        render(
            <TestWrapper>
                <MealFilters filters={filters} onFilterChange={onFilterChange} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Reset'));

        expect(onFilterChange).toHaveBeenCalledWith({ sort: '-created_at' });
    });
});
