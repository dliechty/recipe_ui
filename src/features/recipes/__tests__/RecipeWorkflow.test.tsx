import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import AddRecipePage from '../pages/AddRecipePage';
import EditRecipePage from '../pages/EditRecipePage';
import { AuthProvider } from '../../../context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useNavigate
const mockNavigate = vi.fn();
// Mock window.alert
window.alert = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Helper to wrap components
const renderWithProviders = (ui: React.ReactElement, { route = '/' }: { route?: string } = {}) => {
    window.history.pushState({}, 'Test page', route);
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <ChakraProvider value={system}>
                <AuthProvider>
                    <MemoryRouter initialEntries={[route]}>
                        <Routes>
                            <Route path="/recipes/new" element={<AddRecipePage />} />
                            <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
                            <Route path="/recipes/:id" element={<div>Recipe Details</div>} />
                            <Route path="/recipes" element={<div>Recipe List</div>} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        </QueryClientProvider>
    );
};

describe('Recipe Workflows', () => {
    it('creates a new recipe', async () => {
        renderWithProviders(<AddRecipePage />, { route: '/recipes/new' });

        // Fill Form
        fireEvent.change(screen.getByTestId('recipe-name'), { target: { value: 'Test Recipe' } });
        fireEvent.change(screen.getByTestId('recipe-description-short'), { target: { value: 'Test Description' } });
        fireEvent.change(screen.getByTestId('recipe-prep-time'), { target: { value: '10' } });
        fireEvent.change(screen.getByTestId('recipe-cook-time'), { target: { value: '20' } });
        fireEvent.change(screen.getByTestId('recipe-yield'), { target: { value: '4' } });

        // Add Ingredient
        const ingredientInputs = screen.getAllByPlaceholderText(/Ingredient/i);
        fireEvent.change(ingredientInputs[0], { target: { value: 'Test Ing' } });
        const qtyInputs = screen.getAllByPlaceholderText(/Qty/i);
        fireEvent.change(qtyInputs[0], { target: { value: '1' } });
        const unitInputs = screen.getAllByPlaceholderText(/Unit/i);
        fireEvent.change(unitInputs[0], { target: { value: 'cup' } });

        // Add Instruction
        const instructionInputs = screen.getAllByPlaceholderText(/Step 1 description/i);
        fireEvent.change(instructionInputs[0], { target: { value: 'Do something' } });

        // Submit
        fireEvent.click(screen.getByText(/Save Recipe/i));

        // Expect Navigation
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/recipes');
        });
    });

    it('edits an existing recipe', async () => {
        // Need to wait for fetch to complete.
        // MSW mocks GET /recipes/1 return spaghetti carbonara
        renderWithProviders(<EditRecipePage />, { route: '/recipes/1/edit' });

        await waitFor(() => {
            expect(screen.getByTestId('recipe-name')).toHaveValue('Spaghetti Carbonara');
        });

        // Change Name
        fireEvent.change(screen.getByTestId('recipe-name'), { target: { value: 'Updated Spaghetti' } });

        // Submit
        fireEvent.click(screen.getByText(/Save Recipe/i));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/recipes/1');
        });
    });
});
