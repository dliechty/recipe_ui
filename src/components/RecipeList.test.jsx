import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import RecipeList from './RecipeList';
import { describe, it, expect } from 'vitest';

describe('RecipeList', () => {
    it('renders recipes from API', async () => {
        render(<RecipeList />);

        // Check for loading state initially
        expect(screen.getByText(/loading recipes/i)).toBeInTheDocument();

        // Wait for the recipes to be displayed
        await waitFor(() => {
            expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
            expect(screen.getByText('Chicken Curry')).toBeInTheDocument();
            expect(screen.getByText('Avocado Toast')).toBeInTheDocument();
        });

        // Verify descriptions are also present
        expect(screen.getByText('A classic Italian pasta dish.')).toBeInTheDocument();
    });
});
