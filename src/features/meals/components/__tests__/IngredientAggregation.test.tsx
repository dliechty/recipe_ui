import { render, screen, fireEvent } from '@testing-library/react';
import IngredientAggregation from '../IngredientAggregation';
import { Recipe } from '../../../../client';
import { describe, it, expect } from 'vitest';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

const mockRecipes: Recipe[] = [
    {
        core: {
            id: '1',
            name: 'Recipe 1',
            owner_id: 'user1',
            description: '',
            pre_heat_oven: false,
            preparation: '',
            ingredients: '',
            instructions: '',
            search_vector: '',
            source: '',
            source_url: '',
            yield_amount: 1,
            yield_unit: 'servings',
            created_at: '',
            updated_at: ''
        },
        items: [],
        times: { total_time_minutes: 10 },
        nutrition: {},
        components: [
            {
                name: 'Main',
                ingredients: [
                    { item: 'Flour', unit: 'cup', quantity: 2, notes: '', preparation: '' },
                    { item: 'Salt', unit: 'tsp', quantity: 1, notes: '', preparation: '' }
                ]
            }
        ],
        instructions: [],
        audit: { created_at: '', updated_at: '' }
    } as unknown as Recipe,
    {
        core: {
            id: '2',
            name: 'Recipe 2',
            owner_id: 'user1',
            description: '',
            created_at: '',
            updated_at: ''
        },
        items: [],
        times: { total_time_minutes: 20 },
        nutrition: {},
        components: [
            {
                name: 'Main',
                ingredients: [
                    { item: 'Flour', unit: 'cup', quantity: 1, notes: '', preparation: '' },
                    { item: 'Sugar', unit: 'cup', quantity: 1, notes: '', preparation: '' }
                ]
            }
        ],
        instructions: [],
        audit: { created_at: '', updated_at: '' }
    } as unknown as Recipe
];

const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
    );
};

describe('IngredientAggregation', () => {
    it('aggregates ingredients correctly', () => {
        renderWithProviders(<IngredientAggregation recipes={mockRecipes} />);

        // Should be collapsed initially
        expect(screen.getByText('Shopping List')).toBeInTheDocument();
        expect(screen.queryByText('Flour')).not.toBeInTheDocument();

        // Expand
        fireEvent.click(screen.getByText('Shopping List'));

        // Flour: 2 + 1 = 3 cups
        expect(screen.getByText('3 cup')).toBeInTheDocument();
        expect(screen.getByText('Flour')).toBeInTheDocument();

        // Salt: 1 tsp
        expect(screen.getByText('1 tsp')).toBeInTheDocument();
        expect(screen.getByText('Salt')).toBeInTheDocument();

        // Sugar: 1 cup
        expect(screen.getByText('1 cup')).toBeInTheDocument();
        expect(screen.getByText('Sugar')).toBeInTheDocument();
    });

    it('shows recipe sources', () => {
        renderWithProviders(<IngredientAggregation recipes={mockRecipes} />);
        fireEvent.click(screen.getByText('Shopping List'));

        expect(screen.getByText('From: Recipe 1, Recipe 2')).toBeInTheDocument(); // Flour sources
    });


    it('sorts alphabetically', () => {
        renderWithProviders(<IngredientAggregation recipes={mockRecipes} />);
        fireEvent.click(screen.getByText('Shopping List'));

        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveTextContent('Flour');
        expect(items[1]).toHaveTextContent('Salt');
        expect(items[2]).toHaveTextContent('Sugar'); // F, Sa, Su
    });

    it('expands all recipes by default when switching to By Recipe mode', () => {
        renderWithProviders(<IngredientAggregation recipes={mockRecipes} />);
        fireEvent.click(screen.getByText('Shopping List'));
        fireEvent.click(screen.getByText('By Recipe'));

        // Check if recipes are expanded by looking for ingredients
        expect(screen.getAllByText('Flour').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Salt').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Sugar').length).toBeGreaterThan(0);
    });
});
