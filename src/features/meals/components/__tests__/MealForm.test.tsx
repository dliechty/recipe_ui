import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MealForm from '../MealForm';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { MealStatus, MealClassification } from '../../../../client';

// Mock RecipeSearchSelector
vi.mock('../RecipeSearchSelector', () => ({
    default: ({ selectedRecipeIds, onChange }: { selectedRecipeIds: string[], onChange: (ids: string[]) => void }) => (
        <input
            data-testid="recipe-selector"
            value={selectedRecipeIds.join(',')}
            onChange={(e) => onChange(e.target.value.split(',').filter(Boolean).map(s => s.trim()))}
        />
    )
}));

// Mock react-select
interface MockSelectProps {
    options: Array<{ label: string; value: string }>;
    value: { label: string; value: string } | null;
    onChange: (value: { label: string; value: string } | null) => void;
    inputId?: string;
    'aria-label'?: string;
}

vi.mock('react-select', () => ({
    default: ({ options, value, onChange, inputId, 'aria-label': ariaLabel }: MockSelectProps) => (
        <select
            data-testid={inputId || ariaLabel}
            value={value?.value || ''}
            onChange={(e) => {
                const selected = options.find((o) => o.value === e.target.value);
                onChange(selected || null);
            }}
        >
            <option value="">Select...</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    ),
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
    );
};

describe('MealForm', () => {
    it('renders all form fields', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<MealForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Meal Details')).toBeInTheDocument();
        expect(screen.getByText('Meal Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter meal name')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Classification')).toBeInTheDocument();
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('Recipes')).toBeInTheDocument();
        expect(screen.getByTestId('recipe-selector')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save Meal/i })).toBeInTheDocument();
    });

    it('displays initial data when provided', () => {
        const mockOnSubmit = vi.fn();
        const initialData = {
            name: 'Test Meal',
            status: MealStatus.COOKED,
            classification: MealClassification.DINNER,
            date: '2025-01-15',
            items: [
                { recipe_id: 'recipe1' },
                { recipe_id: 'recipe2' }
            ]
        };

        renderWithProviders(
            <MealForm onSubmit={mockOnSubmit} isLoading={false} initialData={initialData} />
        );

        const nameInput = screen.getByPlaceholderText('Enter meal name') as HTMLInputElement;
        expect(nameInput.value).toBe('Test Meal');

        const statusSelect = screen.getByTestId('status-select') as HTMLSelectElement;
        expect(statusSelect.value).toBe(MealStatus.COOKED);

        const classificationSelect = screen.getByTestId('classification-select') as HTMLSelectElement;
        expect(classificationSelect.value).toBe(MealClassification.DINNER);

        const recipeSelector = screen.getByTestId('recipe-selector') as HTMLInputElement;
        expect(recipeSelector.value).toBe('recipe1,recipe2');
    });

    it('updates form fields on user input', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<MealForm onSubmit={mockOnSubmit} isLoading={false} />);

        const nameInput = screen.getByPlaceholderText('Enter meal name') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'New Meal' } });
        expect(nameInput.value).toBe('New Meal');

        const recipeSelector = screen.getByTestId('recipe-selector') as HTMLInputElement;
        fireEvent.change(recipeSelector, { target: { value: 'abc123,def456' } });
        expect(recipeSelector.value).toBe('abc123,def456');
    });

    it('submits form with correct data', async () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<MealForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Fill in the form
        const nameInput = screen.getByPlaceholderText('Enter meal name');
        fireEvent.change(nameInput, { target: { value: 'Sunday Dinner' } });

        const statusSelect = screen.getByTestId('status-select');
        fireEvent.change(statusSelect, { target: { value: MealStatus.DRAFT } });

        const classificationSelect = screen.getByTestId('classification-select');
        fireEvent.change(classificationSelect, { target: { value: MealClassification.BREAKFAST } });

        const recipeSelector = screen.getByTestId('recipe-selector');
        fireEvent.change(recipeSelector, { target: { value: 'recipe1,recipe2,recipe3' } });

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /Save Meal/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: 'Sunday Dinner',
                status: MealStatus.DRAFT,
                classification: MealClassification.BREAKFAST,
                date: null,
                items: [
                    { recipe_id: 'recipe1' },
                    { recipe_id: 'recipe2' },
                    { recipe_id: 'recipe3' }
                ]
            });
        });
    });

    it('handles empty recipe IDs correctly', async () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<MealForm onSubmit={mockOnSubmit} isLoading={false} />);

        const nameInput = screen.getByPlaceholderText('Enter meal name');
        fireEvent.change(nameInput, { target: { value: 'Empty Meal' } });

        const submitButton = screen.getByRole('button', { name: /Save Meal/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: 'Empty Meal',
                status: MealStatus.DRAFT,
                classification: null,
                date: null,
                items: []
            });
        });
    });

    it('displays cancel button when onCancel prop is provided', () => {
        const mockOnSubmit = vi.fn();
        const mockOnCancel = vi.fn();
        renderWithProviders(
            <MealForm onSubmit={mockOnSubmit} isLoading={false} onCancel={mockOnCancel} />
        );

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        expect(cancelButton).toBeInTheDocument();

        fireEvent.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('does not display cancel button when onCancel prop is not provided', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<MealForm onSubmit={mockOnSubmit} isLoading={false} />);

        const cancelButton = screen.queryByRole('button', { name: /Cancel/i });
        expect(cancelButton).not.toBeInTheDocument();
    });

    it('disables submit button when loading', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<MealForm onSubmit={mockOnSubmit} isLoading={true} />);

        const submitButton = screen.getByText('Save Meal').closest('button');
        expect(submitButton).toHaveAttribute('data-loading');
        expect(submitButton).toBeDisabled();
    });

    // "trims whitespace" test removed as logic is now inside RecipeSearchSelector or handled by array passing
    // "shows all status/classification options" kept implicitly or can be kept.
});
