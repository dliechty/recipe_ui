import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateFilters from '../TemplateFilters';
import { TestWrapper } from '../../../../test-utils';
import { TemplateFilters as TemplateFiltersType } from '../../../../utils/mealParams';

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
    default: ({ label, value, onChange }: any) => (
        <div data-testid={`select-${label}`}>
            <label>{label}</label>
            <button onClick={() => onChange(['test-value'])}>Select Test</button>
            <span data-testid={`value-${label}`}>{value.join(',')}</span>
        </div>
    )
}));

vi.mock('../RecipeFilterModal', () => ({
    default: ({ isOpen, onApply }: any) => isOpen ? (
        <div data-testid="recipe-modal">
            <button onClick={() => onApply(['r1', 'r2'])}>Apply Recipes</button>
        </div>
    ) : null
}));

describe('TemplateFilters', () => {
    const defaultFilters: TemplateFiltersType = { sort: 'name' };

    it('should render basic filters', () => {
        render(
            <TestWrapper>
                <TemplateFilters filters={defaultFilters} onFilterChange={vi.fn()} />
            </TestWrapper>
        );

        expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
        expect(screen.getByTestId('select-Classification')).toBeInTheDocument();
        expect(screen.getByText('More Filters')).toBeInTheDocument();
    });

    it('should call onFilterChange when name changes', async () => {
        const onFilterChange = vi.fn();
        render(
            <TestWrapper>
                <TemplateFilters filters={defaultFilters} onFilterChange={onFilterChange} />
            </TestWrapper>
        );

        const input = screen.getByPlaceholderText('Search templates...');
        fireEvent.change(input, { target: { value: 'My Template' } });

        await waitFor(() => {
            expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'My Template' }));
        });
    });

    it('should expand advanced filters', () => {
        render(
            <TestWrapper>
                <TemplateFilters filters={defaultFilters} onFilterChange={vi.fn()} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('More Filters'));

        expect(screen.getByTestId('select-Owner / Author')).toBeInTheDocument();
        expect(screen.getByText('Number of Slots')).toBeInTheDocument();
    });

    it('should auto-expand if advanced filters are present', () => {
        const filters: TemplateFiltersType = {
            ...defaultFilters,
            owner: ['u1']
        };
        render(
            <TestWrapper>
                <TemplateFilters filters={filters} onFilterChange={vi.fn()} />
            </TestWrapper>
        );

        expect(screen.getByTestId('select-Owner / Author')).toBeInTheDocument();
    });

    it('should open recipe modal and apply filters', () => {
        const onFilterChange = vi.fn();
        render(
            <TestWrapper>
                <TemplateFilters filters={defaultFilters} onFilterChange={onFilterChange} />
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
        const filters: TemplateFiltersType = {
            sort: 'name',
            name: 'Template 1',
            classification: [1 as any]
        };
        const onFilterChange = vi.fn();
        render(
            <TestWrapper>
                <TemplateFilters filters={filters} onFilterChange={onFilterChange} />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Reset'));

        expect(onFilterChange).toHaveBeenCalledWith({ sort: 'name' });
    });
});
