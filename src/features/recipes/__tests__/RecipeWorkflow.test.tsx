import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetStore } from '../../../mocks/handlers';
import AddRecipePage from '../pages/AddRecipePage';
import EditRecipePage from '../pages/EditRecipePage';
import RecipeForm from '../components/RecipeForm';
import { RecipeCreate, RecipeIngredientCreate } from '../../../client';
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
    beforeEach(() => {
        resetStore();
    });

    it('creates a new recipe', async () => {
        renderWithProviders(<AddRecipePage />, { route: '/recipes/new' });

        // Fill Form
        fireEvent.change(screen.getByTestId('recipe-name'), { target: { value: 'Test Recipe' } });
        fireEvent.change(screen.getByTestId('recipe-prep-time'), { target: { value: '10' } });
        fireEvent.change(screen.getByTestId('recipe-cook-time'), { target: { value: '20' } });
        fireEvent.change(screen.getByTestId('recipe-source-url'), { target: { value: 'http://example.com' } });
        fireEvent.change(screen.getByTestId('recipe-difficulty'), { target: { value: 'Easy' } });
        fireEvent.change(screen.getByTestId('recipe-cuisine'), { target: { value: 'Italian' } });
        fireEvent.change(screen.getByTestId('recipe-category'), { target: { value: 'Dinner' } });
        fireEvent.change(screen.getByTestId('recipe-total-time'), { target: { value: '30' } });
        fireEvent.change(screen.getByTestId('recipe-yield'), { target: { value: '4' } });

        // Add Ingredient
        const ingredientInputs = screen.getAllByPlaceholderText(/Ingredient/i);
        fireEvent.change(ingredientInputs[0], { target: { value: 'Test Ing' } });
        const qtyInputs = screen.getAllByPlaceholderText(/Qty/i);
        fireEvent.change(qtyInputs[0], { target: { value: '1' } });
        const unitInputs = screen.getAllByPlaceholderText(/Unit/i);
        fireEvent.change(unitInputs[0], { target: { value: 'cup' } });

        // Add Instruction
        const instructionInputs = screen.getAllByPlaceholderText(/Step 1/i);
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
            expect(screen.getByTestId('recipe-name')).toHaveValue('Chicken Pasta 1');
        });

        // Change Name
        fireEvent.change(screen.getByTestId('recipe-name'), { target: { value: 'Updated Spaghetti' } });

        // Submit
        fireEvent.click(screen.getByText(/Save Recipe/i));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/recipes/1');
        });
    });

    it('manages recipe components', async () => {
        renderWithProviders(<EditRecipePage />, { route: '/recipes/1/edit' });

        await waitFor(() => {
            expect(screen.getByTestId('recipe-name')).toHaveValue('Chicken Pasta 1');
        });

        // Check for 'Main' text
        expect(screen.getByText('Main', { selector: 'h2' })).toBeInTheDocument();

        // Add a new component
        const addComponentButton = screen.getByRole('button', { name: /add component/i });
        fireEvent.click(addComponentButton);

        // Find component name inputs
        // Main is text, so we should only find 1 input for the new component
        const componentNameInputs = screen.getAllByPlaceholderText('Component Name (e.g., Main, Sauce)');
        expect(componentNameInputs).toHaveLength(1);

        // Rename new component
        fireEvent.change(componentNameInputs[0], { target: { value: 'Frosting' } });
        expect(componentNameInputs[0]).toHaveValue('Frosting');

        // Add Ingredient to new component (Frosting is at index 0 of the *editable* components)
        // const addIngredientButtons = screen.getAllByText(/Add Ingredient/i);

        // Find inputs for the new ingredient in the second component
        // This is tricky as there are multiple ingredient inputs now.
        // We can scope searches within the component container if we had test ids,
        // but sticking to global queries for now implies rely on order.
        // Main component (mocked) likely has ingredients.
        // Let's assume we just want to verify we can interact with it.
        // Actually, just checking the add worked by counting inputs might be safer.
        // const ingredientNameInputs = screen.getAllByPlaceholderText('Ingredient');
        // Initial load spaghetti has ingredients. Adding one to Sauce adds another.
        // const initialCount = ingredientNameInputs.length;

        // Remove the Sauce component
        const removeComponentButton = screen.getByLabelText('Remove component'); // There should only be one, for Sauce
        fireEvent.click(removeComponentButton);

        // Verify Sauce is gone
        expect(screen.queryByDisplayValue('Sauce')).not.toBeInTheDocument();
        expect(screen.queryAllByPlaceholderText('Component Name (e.g., Main, Sauce)')).toHaveLength(0);

        // Verify Main cannot be deleted (no remove button for it)
        expect(screen.queryByLabelText('Remove component')).not.toBeInTheDocument();

        // Verify Main name is displayed as text
        expect(screen.getByRole('heading', { level: 2, name: 'Main' })).toBeInTheDocument();
    });
});


describe('RecipeForm Component Unit Tests', () => {
    const mockSubmit = vi.fn();
    const initialData: RecipeCreate = {
        core: {
            name: 'Test Recipe',
            yield_amount: 1,
            yield_unit: 'servings',
            description: null,
            source: null,
            difficulty: null,
            cuisine: null,
            category: null,
            source_url: null,
            slug: null
        },
        times: {
            prep_time_minutes: 0,
            cook_time_minutes: 0,
            active_time_minutes: 0,
            total_time_minutes: 0
        },
        nutrition: {
            calories: null,
            serving_size: null
        },
        audit: {},
        components: [
            {
                name: 'Main',
                ingredients: [
                    { ingredient_name: 'Ing 1', quantity: 1, unit: 'cup', notes: null } as RecipeIngredientCreate,
                    { ingredient_name: 'Ing 2', quantity: 2, unit: 'tbsp', notes: null } as RecipeIngredientCreate,
                    { ingredient_name: 'Ing 3', quantity: 3, unit: 'tsp', notes: null } as RecipeIngredientCreate
                ]
            }
        ],
        instructions: []
    };

    it('renders reordering controls', async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });

        render(
            <QueryClientProvider client={queryClient}>
                <ChakraProvider value={system}>
                    <AuthProvider>
                        <MemoryRouter>
                            <RecipeForm initialData={initialData} onSubmit={mockSubmit} isLoading={false} />
                        </MemoryRouter>
                    </AuthProvider>
                </ChakraProvider>
            </QueryClientProvider>
        );

        // Check initial order
        const inputs = await screen.findAllByPlaceholderText('Ingredient');
        expect(inputs[0]).toHaveValue('Ing 1');
        expect(inputs[1]).toHaveValue('Ing 2');
        expect(inputs[2]).toHaveValue('Ing 3');

        // Check for drag handles
        const dragHandles = screen.getAllByLabelText('Drag to reorder');
        expect(dragHandles).toHaveLength(3);
    });
});
