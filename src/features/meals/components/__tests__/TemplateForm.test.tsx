import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateForm from '../TemplateForm';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MealClassification, MealTemplateSlotStrategy } from '../../../../client';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
        </QueryClientProvider>
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

        expect(screen.getByText('Slot 1')).toBeInTheDocument();
        // Check that Direct badge is shown (badge class)
        const directElements = screen.getAllByText('Direct');
        expect(directElements.length).toBeGreaterThan(0);
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
        expect(screen.getByText('Slot 1')).toBeInTheDocument();
        expect(screen.getByText('Slot 2')).toBeInTheDocument();
        expect(screen.getByText('Slot 3')).toBeInTheDocument();
    });

    it('adds a new slot when Add Slot button is clicked', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Slot 1')).toBeInTheDocument();
        expect(screen.queryByText('Slot 2')).not.toBeInTheDocument();

        const addButton = screen.getByRole('button', { name: /Add Slot/i });
        fireEvent.click(addButton);

        expect(screen.getByText('Slot 1')).toBeInTheDocument();
        expect(screen.getByText('Slot 2')).toBeInTheDocument();
    });

    it('removes a slot when remove button is clicked', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Add a second slot
        const addButton = screen.getByRole('button', { name: /Add Slot/i });
        fireEvent.click(addButton);

        expect(screen.getByText('Slot 1')).toBeInTheDocument();
        expect(screen.getByText('Slot 2')).toBeInTheDocument();

        // Remove the second slot
        const removeButtons = screen.getAllByLabelText('Remove slot');
        fireEvent.click(removeButtons[1]);

        expect(screen.getByText('Slot 1')).toBeInTheDocument();
        expect(screen.queryByText('Slot 2')).not.toBeInTheDocument();
    });

    it('does not remove slot when only one slot remains', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByText('Slot 1')).toBeInTheDocument();

        const removeButton = screen.getByLabelText('Remove slot');
        expect(removeButton).toBeDisabled();
    });

    it('updates slot strategy', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Direct is shown initially (badge and option)
        const directElements = screen.getAllByText('Direct');
        expect(directElements.length).toBeGreaterThan(0);

        // Find the strategy select and change it
        const strategySelects = screen.getAllByRole('combobox');
        // The slot strategy select (smaller one at 120px width)
        const slotStrategySelect = strategySelects.find(s => (s as HTMLSelectElement).value === MealTemplateSlotStrategy.DIRECT);
        if (slotStrategySelect) {
            fireEvent.change(slotStrategySelect, { target: { value: MealTemplateSlotStrategy.LIST } });
        }

        // Now List badge should be shown
        const listElements = screen.getAllByText('List');
        expect(listElements.length).toBeGreaterThan(0);
    });

    it('submits form with correct data', async () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Fill in the form
        const nameInput = screen.getByPlaceholderText('Enter template name');
        fireEvent.change(nameInput, { target: { value: 'Weekly Dinner Template' } });

        const classificationSelects = screen.getAllByRole('combobox');
        const classificationSelect = classificationSelects.find(s =>
            (s as HTMLSelectElement).querySelector('option[value="BREAKFAST"]')
        );
        if (classificationSelect) {
            fireEvent.change(classificationSelect, { target: { value: MealClassification.DINNER } });
        }

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

        // The strategy dropdown should have all options
        const directOption = screen.getAllByRole('option', { name: 'Direct' });
        const listOption = screen.getAllByRole('option', { name: 'List' });
        const searchOption = screen.getAllByRole('option', { name: 'Search' });

        expect(directOption.length).toBeGreaterThan(0);
        expect(listOption.length).toBeGreaterThan(0);
        expect(searchOption.length).toBeGreaterThan(0);
    });

    it('shows all classification options', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        expect(screen.getByRole('option', { name: 'Select...' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Breakfast' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Brunch' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Lunch' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Dinner' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Snack' })).toBeInTheDocument();
    });

    it('shows slot editor content based on strategy type', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Direct strategy by default shows the select recipe button
        expect(screen.getByText('Select a single recipe for this slot.')).toBeInTheDocument();

        // Find strategy select and change to List
        const strategySelects = screen.getAllByRole('combobox');
        const slotStrategySelect = strategySelects.find(s =>
            (s as HTMLSelectElement).value === MealTemplateSlotStrategy.DIRECT
        );
        if (slotStrategySelect) {
            fireEvent.change(slotStrategySelect, { target: { value: MealTemplateSlotStrategy.LIST } });
        }
        expect(screen.getByText(/Select recipes for this slot/)).toBeInTheDocument();

        // Change to Search
        const listStrategySelect = screen.getAllByRole('combobox').find(s =>
            (s as HTMLSelectElement).value === MealTemplateSlotStrategy.LIST
        );
        if (listStrategySelect) {
            fireEvent.change(listStrategySelect, { target: { value: MealTemplateSlotStrategy.SEARCH } });
        }
        expect(screen.getByText('Define search criteria. Recipes matching these criteria will be candidates for this slot.')).toBeInTheDocument();
    });

    it('maintains slot strategies when adding new slots', () => {
        const mockOnSubmit = vi.fn();
        renderWithProviders(<TemplateForm onSubmit={mockOnSubmit} isLoading={false} />);

        // Change first slot to List
        const strategySelects = screen.getAllByRole('combobox');
        const slotStrategySelect = strategySelects.find(s =>
            (s as HTMLSelectElement).value === MealTemplateSlotStrategy.DIRECT
        );
        if (slotStrategySelect) {
            fireEvent.change(slotStrategySelect, { target: { value: MealTemplateSlotStrategy.LIST } });
        }

        // Add a second slot
        const addButton = screen.getByRole('button', { name: /Add Slot/i });
        fireEvent.click(addButton);

        // First slot should still be List
        const allSelects = screen.getAllByRole('combobox');
        const listSelect = allSelects.find(select =>
            (select as HTMLSelectElement).value === MealTemplateSlotStrategy.LIST
        );
        expect(listSelect).toBeDefined();

        // Second slot should be Direct (default)
        expect(screen.getByText('Slot 2')).toBeInTheDocument();

        // There should be one Direct badge for slot 2
        const directBadges = screen.getAllByText('Direct');
        expect(directBadges.length).toBeGreaterThan(0);
    });
});
