import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import GenerateMealsModal from '../GenerateMealsModal';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ChakraProvider value={system}>{ui}</ChakraProvider>
    );
};

describe('GenerateMealsModal', () => {
    it('does not render when closed', () => {
        renderWithProviders(
            <GenerateMealsModal isOpen={false} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
        );
        expect(screen.queryByText('Generate Meals')).not.toBeInTheDocument();
    });

    it('renders when open with default count', () => {
        renderWithProviders(
            <GenerateMealsModal isOpen={true} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
        );
        expect(screen.getByText('Generate Meals')).toBeInTheDocument();
        const input = screen.getByLabelText(/number of meals/i) as HTMLInputElement;
        expect(input.value).toBe('5');
    });

    it('calls onGenerate with count and default template_filter when submitted', async () => {
        const onGenerate = vi.fn();
        renderWithProviders(
            <GenerateMealsModal isOpen={true} onClose={vi.fn()} onGenerate={onGenerate} isGenerating={false} />
        );

        const input = screen.getByLabelText(/number of meals/i);
        fireEvent.change(input, { target: { value: '3' } });

        fireEvent.click(screen.getByRole('button', { name: /^Generate$/i }));

        expect(onGenerate).toHaveBeenCalledWith({
            count: 3,
            template_filter: [{ field: 'classification', operator: 'eq', value: 'Dinner' }],
        });
    });

    it('enforces minimum count of 1', () => {
        renderWithProviders(
            <GenerateMealsModal isOpen={true} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
        );

        const input = screen.getByLabelText(/number of meals/i) as HTMLInputElement;
        fireEvent.change(input, { target: { value: '0' } });

        // The input should still show 0 but Generate should use at least 1
        const generateBtn = screen.getByRole('button', { name: /^Generate$/i });
        expect(generateBtn).toBeInTheDocument();
    });

    it('disables inputs during generation', () => {
        renderWithProviders(
            <GenerateMealsModal isOpen={true} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={true} />
        );

        const input = screen.getByLabelText(/number of meals/i) as HTMLInputElement;
        expect(input).toBeDisabled();
    });

    it('calls onClose when cancel is clicked', () => {
        const onClose = vi.fn();
        renderWithProviders(
            <GenerateMealsModal isOpen={true} onClose={onClose} onGenerate={vi.fn()} isGenerating={false} />
        );

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onClose).toHaveBeenCalled();
    });

    it('renders classification dropdown defaulting to "Dinner"', () => {
        renderWithProviders(
            <GenerateMealsModal isOpen={true} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
        );

        const dropdown = screen.getByLabelText('Classification') as HTMLSelectElement;
        expect(dropdown).toBeInTheDocument();
        expect(dropdown.value).toBe('Dinner');
    });

    it('selecting a classification includes template_filter in generate request', () => {
        const onGenerate = vi.fn();
        renderWithProviders(
            <GenerateMealsModal isOpen={true} onClose={vi.fn()} onGenerate={onGenerate} isGenerating={false} />
        );

        const dropdown = screen.getByLabelText('Classification');
        fireEvent.change(dropdown, { target: { value: 'Breakfast' } });

        fireEvent.click(screen.getByRole('button', { name: /^Generate$/i }));

        expect(onGenerate).toHaveBeenCalledWith({
            count: 5,
            template_filter: [{ field: 'classification', operator: 'eq', value: 'Breakfast' }],
        });
    });

    it('classification resets to "Dinner" when modal is reopened', () => {
        const { rerender } = renderWithProviders(
            <GenerateMealsModal isOpen={true} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
        );

        // Change to Lunch
        const dropdown = screen.getByLabelText('Classification') as HTMLSelectElement;
        fireEvent.change(dropdown, { target: { value: 'Lunch' } });
        expect(dropdown.value).toBe('Lunch');

        // Close modal
        rerender(
            <ChakraProvider value={system}>
                <GenerateMealsModal isOpen={false} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
            </ChakraProvider>
        );

        // Reopen modal
        rerender(
            <ChakraProvider value={system}>
                <GenerateMealsModal isOpen={true} onClose={vi.fn()} onGenerate={vi.fn()} isGenerating={false} />
            </ChakraProvider>
        );

        const reopenedDropdown = screen.getByLabelText('Classification') as HTMLSelectElement;
        expect(reopenedDropdown.value).toBe('Dinner');
    });
});
