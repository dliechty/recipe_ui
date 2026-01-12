import { render, screen, fireEvent } from '@testing-library/react';
import ExpandableRecipeCard from '../ExpandableRecipeCard';
import { Recipe } from '../../../../client';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

const mockRecipe = {
    core: {
        id: '123',
        name: 'Test Recipe',
        owner_id: 'owner1',
        description: 'Test Description',
        pre_heat_oven: true,
        preparation: 'Test Prep',
        ingredients: 'Test Ingredients',
        instructions: 'Test Instructions',
        category: 'Dinner',
        difficulty: 'Medium',
        cuisine: 'Italian',
        protein: 'Chicken',
        search_vector: '',
        source: 'Test Source',
        source_url: 'http://example.com',
        yield_amount: 4,
        yield_unit: 'servings',
    },
    times: {
        total_time_minutes: 60,
        prep_time_minutes: 20,
        active_time_minutes: 30,
        cook_time_minutes: 40,
    },
    nutrition: {
        calories: 500,
        serving_size: '1 bowl',
    },
    components: [
        {
            name: 'Sauce',
            ingredients: [
                { item: 'Tomato', unit: 'can', quantity: 1, notes: '', preparation: '' }
            ]
        }
    ],
    instructions: [],
    suitable_for_diet: ['Gluten Free'],
    variant_based_on_id: null,
    variant_name: null,
    audit: {
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    }
} as unknown as Recipe;

const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <ChakraProvider value={defaultSystem}>
            <BrowserRouter>{ui}</BrowserRouter>
        </ChakraProvider>
    );
};

describe('ExpandableRecipeCard', () => {
    it('renders collapsed state correctly', () => {
        renderWithProviders(<ExpandableRecipeCard recipe={mockRecipe} mealName="Test Meal" />);
        expect(screen.getByText('Test Recipe')).toBeInTheDocument();
        expect(screen.getByText('Dinner')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('1h')).toBeInTheDocument(); // Format duration

        // Expanded content should not be visible
        expect(screen.queryByText('Cuisine:')).not.toBeInTheDocument();
        expect(screen.queryByText('Italian')).not.toBeInTheDocument();
    });

    it('expands on click', () => {
        renderWithProviders(<ExpandableRecipeCard recipe={mockRecipe} mealName="Test Meal" />);
        fireEvent.click(screen.getByText('Test Recipe'));

        expect(screen.getByText('Italian')).toBeInTheDocument();
        expect(screen.getByText('Chicken')).toBeInTheDocument();
        expect(screen.getByText('Gluten Free')).toBeInTheDocument();
        expect(screen.getByText('View Full Recipe')).toBeInTheDocument();
    });

    it('collapses on second click', () => {
        renderWithProviders(<ExpandableRecipeCard recipe={mockRecipe} mealName="Test Meal" defaultExpanded={true} />);
        expect(screen.getByText('Italian')).toBeInTheDocument();

        // Click header area (finding by recipe name which is in header)
        fireEvent.click(screen.getByText('Test Recipe'));

        expect(screen.queryByText('Italian')).not.toBeInTheDocument();
    });
});
