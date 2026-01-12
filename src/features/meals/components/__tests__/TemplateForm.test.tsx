import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateForm from '../TemplateForm';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { MealClassification, MealTemplateSlotStrategy } from '../../../../client';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
    );
};

describe('TemplateForm', () => {
    it('renders all form fields', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Template Details')).toBeInTheDocument();
        expect(screen.getByText('Template Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter template name')).toBeInTheDocument();
        expect(screen.getByText('Classification')).toBeInTheDocument();
        expect(screen.getByText('Slots')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save Template/i })).toBeInTheDocument();
    });

    it('starts with one slot by default', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Slot 1 Strategy')).toBeInTheDocument();
        expect(screen.getByText('Recipe selected directly')).toBeInTheDocument();
    });

    it('displays initial data when provided', () => {
        const mockOnSubmit = vi.fn();
        const initialData = {
            name: 'Test Template',
            classification: MealClassification.BREAKFAST,
            slots: [
                { strategy: MealTemplateSlotStrategy.DIRECT },
                { strategy: MealTemplateSlotStrategy.LIST },
                { strategy: MealTemplateSlotStrategy.SEARCH }
            ]
        };

        renderWithProviders(
            <TemplateForm onSubmit={mockOnSubmit} isLoading={false} initialData={initialData} />
        );

        const nameInput = screen.getByPlaceholderText('Enter template name') as HTMLInputElement;
        expect(nameInput.value).toBe('Test Template');

        const classificationSelect = screen.getByDisplayValue('Breakfast') as HTMLSelectElement;
        expect(classificationSelect.value).toBe(MealClassification.BREAKFAST);

        // Should have 3 slots
        expect(screen.getByText('Slot 1 Strategy')).toBeInTheDocument();
        expect(screen.getByText('Slot 2 Strategy')).toBeInTheDocument();
        expect(screen.getByText('Slot 3 Strategy')).toBeInTheDocument();
    });

    it('adds a new slot when Add Slot button is clicked', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Slot 1 Strategy')).toBeInTheDocument();
        expect(screen.queryByText('Slot 2 Strategy')).not.toBeInTheDocument();

        const addButton = screen.getByRole('button', { name: /Add Slot/i });
        fireEvent.click(addButton);

        expect(screen.getByText('Slot 1 Strategy')).toBeInTheDocument();
        expect(screen.getByText('Slot 2 Strategy')).toBeInTheDocument();
    });

    it('removes a slot when remove button is clicked', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Add a second slot
        const addButton = screen.getByRole('button', { name: /Add Slot/i });
        fireEvent.click(addButton);

        expect(screen.getByText('Slot 1 Strategy')).toBeInTheDocument();
        expect(screen.getByText('Slot 2 Strategy')).toBeInTheDocument();

        // Remove the second slot
        const removeButtons = screen.getAllByLabelText('Remove slot');
        fireEvent.click(removeButtons[1]);

        expect(screen.getByText('Slot 1 Strategy')).toBeInTheDocument();
        expect(screen.queryByText('Slot 2 Strategy')).not.toBeInTheDocument();
    });

    it('does not remove slot when only one slot remains', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Slot 1 Strategy')).toBeInTheDocument();

        const removeButton = screen.getByLabelText('Remove slot');
        expect(removeButton).toBeDisabled();
    });

    it('updates slot strategy', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Recipe selected directly')).toBeInTheDocument();

        // Change strategy to List
        const strategySelect = screen.getByDisplayValue('Direct');
        fireEvent.change(strategySelect, { target: { value: MealTemplateSlotStrategy.LIST } });

        expect(screen.getByText('Recipe chosen from a list')).toBeInTheDocument();
        expect(screen.queryByText('Recipe selected directly')).not.toBeInTheDocument();
    });

    it('submits form with correct data', async () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Fill in the form
        const nameInput = screen.getByPlaceholderText('Enter template name');
        fireEvent.change(nameInput, { target: { value: 'Weekly Dinner Template' } });

        const classificationSelects = screen.getAllByRole('combobox');
        const classificationSelect = classificationSelects[0]; // First combobox is classification
        fireEvent.change(classificationSelect, { target: { value: MealClassification.DINNER } });

        // Add a second slot
        const addButton = screen.getByRole('button', { name: /Add Slot/i });
        fireEvent.click(addButton);

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /Save Template/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                name: 'Weekly Dinner Template',
                classification: MealClassification.DINNER,
                slots: [
                    { strategy: MealTemplateSlotStrategy.DIRECT },
                    { strategy: MealTemplateSlotStrategy.DIRECT }
                ]
            });
        });
    });

    it('trims whitespace from template name', async () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        const nameInput = screen.getByPlaceholderText('Enter template name');
        fireEvent.change(nameInput, { target: { value: '  Trimmed Name  ' } });

        const submitButton = screen.getByRole('button', { name: /Save Template/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Trimmed Name'
                })
            );
        });
    });

    it('displays cancel button when onCancel prop is provided', () => {
        const mockOnSubmit = vi.fn();
        const mockOnCancel = vi.fn();
        renderWithProviders(
            <TemplateForm onSubmit={mockOnSubmit} isLoading={false} onCancel={mockOnCancel} />
        );

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        expect(cancelButton).toBeInTheDocument();

        fireEvent.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('does not display cancel button when onCancel prop is not provided', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        const cancelButton = screen.queryByRole('button', { name: /Cancel/i });
        expect(cancelButton).not.toBeInTheDocument();
    });

    it('disables submit button when loading', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={true} />);

        const submitButton = screen.getByText('Save Template').closest('button');
        expect(submitButton).toHaveAttribute('data-loading');
        expect(submitButton).toBeDisabled();
    });

    it('disables submit button when name is empty', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        const submitButton = screen.getByRole('button', { name: /Save Template/i });
        expect(submitButton).toBeDisabled();
    });

    it('enables submit button when name is provided', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        const nameInput = screen.getByPlaceholderText('Enter template name');
        fireEvent.change(nameInput, { target: { value: 'Valid Name' } });

        const submitButton = screen.getByRole('button', { name: /Save Template/i });
        expect(submitButton).not.toBeDisabled();
    });

    it('shows all strategy options for each slot', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Direct')).toBeInTheDocument();
        expect(screen.getByText('List')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
    });

    it('shows all classification options', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Select classification...')).toBeInTheDocument();
        expect(screen.getByText('Breakfast')).toBeInTheDocument();
        expect(screen.getByText('Brunch')).toBeInTheDocument();
        expect(screen.getByText('Lunch')).toBeInTheDocument();
        expect(screen.getByText('Dinner')).toBeInTheDocument();
        expect(screen.getByText('Snack')).toBeInTheDocument();
    });

    it('shows correct description for each strategy type', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Direct strategy by default
        expect(screen.getByText('Recipe selected directly')).toBeInTheDocument();

        // Change to List
        const strategySelect = screen.getByDisplayValue('Direct');
        fireEvent.change(strategySelect, { target: { value: MealTemplateSlotStrategy.LIST } });
        expect(screen.getByText('Recipe chosen from a list')).toBeInTheDocument();

        // Change to Search
        fireEvent.change(strategySelect, { target: { value: MealTemplateSlotStrategy.SEARCH } });
        expect(screen.getByText('Recipe found via search criteria')).toBeInTheDocument();
    });

    it('maintains slot strategies when adding new slots', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Change first slot to List
        const strategySelect = screen.getByDisplayValue('Direct');
        fireEvent.change(strategySelect, { target: { value: MealTemplateSlotStrategy.LIST } });

        // Add a second slot
        const addButton = screen.getByRole('button', { name: /Add Slot/i });
        fireEvent.click(addButton);

        // First slot should still be List
        const allSelects = screen.getAllByRole('combobox');
        const slot1Select = allSelects.find(select =>
            (select as HTMLSelectElement).value === MealTemplateSlotStrategy.LIST
        );
        expect(slot1Select).toBeDefined();

        // Second slot should be Direct (default)
        expect(screen.getByText('Slot 2 Strategy')).toBeInTheDocument();
    });
});
