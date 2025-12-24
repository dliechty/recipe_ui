import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import RecipeList from './RecipeList';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

const system = createSystem(defaultConfig);

describe('RecipeList', () => {
    it('renders recipes from API', async () => {
        render(
            <ChakraProvider value={system}>
                <RecipeList />
            </ChakraProvider>
        );

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
