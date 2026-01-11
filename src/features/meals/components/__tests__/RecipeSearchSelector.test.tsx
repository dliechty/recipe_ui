import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeSearchSelector from '../RecipeSearchSelector';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as useRecipesHook from '../../../../hooks/useRecipes';
import * as useRecipeMetaHook from '../../../recipes/hooks/useRecipeMeta';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../../../../hooks/useRecipes');
vi.mock('../../../recipes/hooks/useRecipeMeta');

const mockRecipes = [
    { core: { id: '1', name: 'Recipe A', category: 'Dinner', difficulty: 'Easy' }, times: { total_time_minutes: 30 } },
    { core: { id: '2', name: 'Recipe B', category: 'Lunch', difficulty: 'Medium' }, times: { total_time_minutes: 45 } }
];

const renderWithProviders = (ui: React.ReactNode) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
        </QueryClientProvider>
    );
};

describe('RecipeSearchSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock useRecipeMeta
        vi.mocked(useRecipeMetaHook.useRecipeMeta).mockReturnValue({ data: ['Dinner', 'Lunch'] } as unknown as any); // eslint-disable-line @typescript-eslint/no-explicit-any

        // Mock useInfiniteRecipes
        vi.mocked(useRecipesHook.useInfiniteRecipes).mockImplementation((_limit?: number, filters?: useRecipesHook.RecipeFilters) => {
            // Check if it's the "selected ids" fetch
            if (filters?.ids) {
                const ids = filters.ids;
                return {
                    data: { pages: [{ recipes: mockRecipes.filter(r => ids.includes(r.core.id)) }] },
                    isLoading: false,
                    isPending: false
                } as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            }
            // Default search results
            return {
                data: { pages: [{ recipes: mockRecipes }] },
                isLoading: false,
                isPending: false,
                fetchNextPage: vi.fn(),
                hasNextPage: false,
                isFetchingNextPage: false
            } as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        });
    });

    it('renders search input and filters', () => {
        renderWithProviders(<RecipeSearchSelector selectedRecipeIds={[]} onChange={vi.fn()} />);
        expect(screen.getByPlaceholderText('Search recipes...')).toBeInTheDocument();
        expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('displays search results', () => {
        renderWithProviders(<RecipeSearchSelector selectedRecipeIds={[]} onChange={vi.fn()} />);
        // Might appear multiple times if selected, but here none selected.
        expect(screen.getByText('Recipe A')).toBeInTheDocument();
        expect(screen.getByText('Recipe B')).toBeInTheDocument();
    });

    it('displays selected recipes as chips', () => {
        renderWithProviders(<RecipeSearchSelector selectedRecipeIds={['1']} onChange={vi.fn()} />);
        expect(screen.getByText('Selected Recipes (1)')).toBeInTheDocument();
        // Since it's also in search results, we use getAllByText or check presence
        expect(screen.getAllByText('Recipe A').length).toBeGreaterThan(0);
    });

    it('calls onChange when selecting a recipe', () => {
        const handleChange = vi.fn();
        renderWithProviders(<RecipeSearchSelector selectedRecipeIds={[]} onChange={handleChange} />);

        // Click recipe row (Recipe A)
        // Ensure we click the list item, not the chip (no chip here)
        fireEvent.click(screen.getByText('Recipe A'));
        expect(handleChange).toHaveBeenCalledWith(['1']);
    });

    it('calls onChange when removing a selected recipe', async () => {
        const handleChange = vi.fn();
        renderWithProviders(<RecipeSearchSelector selectedRecipeIds={['1']} onChange={handleChange} />);

        // We have "Selected Recipes (1)" section.
        // We need to find the "X" button for Recipe A.
        // Screen text: "Selected Recipes (1)" ... "Recipe A" ... "Recipe A" (in list).

        // Find the Badge or container for selected items.
        // We can find the text "Selected Recipes" and look nearby.
        /* 
           Please note: rendering might be async due to mock impl, waitFor can help.
        */
        await waitFor(() => expect(screen.getAllByText('Recipe A').length).toBeGreaterThan(0));

        const recipeNameElements = screen.getAllByText('Recipe A');
        // We expect one in Badge, one in List.
        // The Badge one is likely first or we can distinguish by parents.

        // Let's try to click the one that looks like a chip removal.
        // The chip has text "Recipe A" and a button/icon.
        // The button is a sibling of the text.

        let chipRemoveBtn: Element | null = null;
        for (const el of recipeNameElements) {
            // Check if parent is badge (has "chakra-badge" or similar class, or check structure)
            // Or check if it has a sibling button.
            const sibling = el.nextSibling;
            // In Badge: <Text>{name}</Text><Box onClick...>
            if (sibling && (sibling as HTMLElement).onclick || (sibling as HTMLElement).getAttribute('type') === 'button' || (sibling as HTMLElement).tagName === 'BUTTON' || (sibling as HTMLElement).querySelector('svg')) {
                chipRemoveBtn = sibling as Element;
                break;
            }
            // Or maybe parent's sibling?
        }

        // Fallback: If we can't find it easily this way, assume the first one is chip and its sibling is button
        if (!chipRemoveBtn && recipeNameElements.length > 0) {
            chipRemoveBtn = recipeNameElements[0].nextSibling as Element;
        }

        if (chipRemoveBtn) {
            fireEvent.click(chipRemoveBtn);
        } else {
            // Fail safely
            throw new Error("Could not find remove button");
        }

        expect(handleChange).toHaveBeenCalledWith([]);
    });
});
