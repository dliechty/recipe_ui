
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetStore } from '../../../../mocks/handlers';
import AddRecipePage from '../AddRecipePage';
import { AuthProvider } from '../../../../context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useNavigate
const mockNavigate = vi.fn();
// Mock useLocation
const mockLocation = { state: {} };

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocation,
    };
});

const renderWithProviders = () => {
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
                    <MemoryRouter initialEntries={['/recipes/new']}>
                        <Routes>
                            <Route path="/recipes/new" element={<AddRecipePage />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        </QueryClientProvider>
    );
};

describe('AddRecipePage', () => {
    beforeEach(() => {
        resetStore();
        mockLocation.state = {};
    });

    it('renders empty form by default', async () => {
        renderWithProviders();

        // Check for empty fields (or default values)
        // Adjust selectors based on your actual form implementation
        // e.g., name field should be empty
        const nameInput = screen.getByTestId('recipe-name') as HTMLInputElement;
        expect(nameInput.value).toBe('');
    });

    it('populates form with initial data from location state', async () => {
        const initialData = {
            core: {
                name: 'Variant Recipe',
                description: 'A variant.',
                difficulty: 'Medium',
                cuisine: 'Italian',
                category: 'Dinner'
            },
            times: {
                prep_time_minutes: 15,
                cook_time_minutes: 30
            },
            nutrition: {},
            components: [],
            instructions: [],
            suitable_for_diet: [],
            parent_recipe_id: '123'
        };

        mockLocation.state = { initialData };

        renderWithProviders();

        // Check if form is populated
        await waitFor(() => {
            expect(screen.getByTestId('recipe-name')).toHaveValue('Variant Recipe');
            expect(screen.getByTestId('recipe-cuisine')).toHaveValue('Italian');
            expect(screen.getByTestId('recipe-prep-time')).toHaveValue(15);
        });

    });

    it('renders breadcrumb with parent link when creating a variant', async () => {
        const initialData = {
            core: { name: 'New Variant' },
            times: {},
            nutrition: {},
            suitable_for_diet: [],
            parent_recipe_id: '123',
            components: [],
            instructions: []
        };
        const parentName = 'Parent Recipe Name';

        mockLocation.state = { initialData, parentName };

        renderWithProviders();

        // Check if parent breadcrumb is rendered
        const parentLink = screen.getByText('Parent Recipe Name');
        expect(parentLink).toBeInTheDocument();
        expect(parentLink.closest('a')).toHaveAttribute('href', '/recipes/123');

        // Check for "New" breadcrumb
        expect(screen.getByText('New')).toBeInTheDocument();
    });
});
