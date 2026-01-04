
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetStore } from '../../../../mocks/handlers'; // Adjust path
import EditRecipePage from '../EditRecipePage';
import { AuthProvider } from '../../../../context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../../theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { DietType } from '../../../../client';

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

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
                            <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        </QueryClientProvider>
    );
};

describe('EditRecipePage', () => {
    beforeEach(() => {
        resetStore();
    });

    it('populates diet values from API', async () => {
        // Mock API response with diet values
        server.use(
            http.get('*/recipes/:id', () => {
                return HttpResponse.json({
                    id: 1,
                    core: {
                        name: 'Vegan Cake',
                        description: 'A dedicated vegan cake.',
                        difficulty: 'Easy',
                        cuisine: 'American',
                        category: 'Dessert'
                    },
                    times: {
                        prep_time_minutes: 10,
                        cook_time_minutes: 20
                    },
                    nutrition: {},
                    components: [],
                    instructions: [],
                    suitable_for_diet: [DietType.VEGAN, DietType.GLUTEN_FREE]
                });
            })
        );

        renderWithProviders(<EditRecipePage />, { route: '/recipes/1/edit' });

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByDisplayValue('Vegan Cake')).toBeInTheDocument();
        });

        // Check if DietSelect populates values
        // React-Select renders selected values as text
        expect(screen.getByText('Vegan')).toBeInTheDocument();
        expect(screen.getByText('Gluten Free')).toBeInTheDocument();
    });
});
