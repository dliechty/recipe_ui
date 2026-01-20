import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecipeFilterModal from '../RecipeFilterModal';
import { TestWrapper } from '../../../../test-utils';

// Mock RecipeSearchSelector to avoid complex internal logic
vi.mock('../RecipeSearchSelector', () => ({
    default: ({ selectedRecipeIds, onChange }: { selectedRecipeIds: string[], onChange: (ids: string[]) => void }) => (
        <div data-testid="recipe-selector">
            <button onClick={() => onChange([...selectedRecipeIds, '123'])}>Select Recipe 123</button>
            <button onClick={() => onChange([])}>Clear Selection</button>
            <div data-testid="selected-count">{selectedRecipeIds.length}</div>
        </div>
    )
}));

describe('RecipeFilterModal', () => {
    it('should not render when isOpen is false', () => {
        render(
            <TestWrapper>
                <RecipeFilterModal
                    isOpen={false}
                    onClose={vi.fn()}
                    selectedRecipeIds={[]}
                    onApply={vi.fn()}
                />
            </TestWrapper>
        );
        expect(screen.queryByText('Filter by Recipes')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
        render(
            <TestWrapper>
                <RecipeFilterModal
                    isOpen={true}
                    onClose={vi.fn()}
                    selectedRecipeIds={[]}
                    onApply={vi.fn()}
                />
            </TestWrapper>
        );
        expect(screen.getByText('Filter by Recipes')).toBeInTheDocument();
        expect(screen.getByTestId('recipe-selector')).toBeInTheDocument();
    });

    it('should update temp state without calling onApply', () => {
        const onApply = vi.fn();
        render(
            <TestWrapper>
                <RecipeFilterModal
                    isOpen={true}
                    onClose={vi.fn()}
                    selectedRecipeIds={[]}
                    onApply={onApply}
                />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Select Recipe 123'));
        expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
        expect(onApply).not.toHaveBeenCalled();
    });

    it('should call onApply with selected ids when Apply button is clicked', () => {
        const onApply = vi.fn();
        const onClose = vi.fn();
        render(
            <TestWrapper>
                <RecipeFilterModal
                    isOpen={true}
                    onClose={onClose}
                    selectedRecipeIds={[]}
                    onApply={onApply}
                />
            </TestWrapper>
        );

        fireEvent.click(screen.getByText('Select Recipe 123'));
        fireEvent.click(screen.getByText(/Apply Filter/));

        expect(onApply).toHaveBeenCalledWith(['123']);
        expect(onClose).toHaveBeenCalled();
    });

    it('should reset temp state when modal re-opens', () => {
        const { rerender } = render(
            <TestWrapper>
                <RecipeFilterModal
                    isOpen={true}
                    onClose={vi.fn()}
                    selectedRecipeIds={['999']}
                    onApply={vi.fn()}
                />
            </TestWrapper>
        );

        expect(screen.getByTestId('selected-count')).toHaveTextContent('1');

        // Close modal
        rerender(
            <TestWrapper>
                <RecipeFilterModal
                    isOpen={false}
                    onClose={vi.fn()}
                    selectedRecipeIds={['999']}
                    onApply={vi.fn()}
                />
            </TestWrapper>
        );

        // Re-open modal
        rerender(
            <TestWrapper>
                <RecipeFilterModal
                    isOpen={true}
                    onClose={vi.fn()}
                    selectedRecipeIds={['999']}
                    onApply={vi.fn()}
                />
            </TestWrapper>
        );

        expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
    });
});
