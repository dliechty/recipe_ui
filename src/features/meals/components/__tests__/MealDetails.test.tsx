import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MealDetails from '../MealDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

const mockUseAuth = vi.fn();
vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

describe('MealDetails', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: { id: 'user-123', is_admin: true } });
        // Mock user endpoint
        server.use(
            http.get('*/users/:id', () => {
                return HttpResponse.json({
                    id: 'user-123',
                    email: 'test@example.com',
                    first_name: 'Test',
                    last_name: 'User'
                });
            })
        );
        // Mock recipes endpoint for fetching details
        server.use(
            http.get('*/recipes/', () => {
                return HttpResponse.json([
                    {
                        core: { id: 'r1', name: 'Tasty Dish', difficulty: 'Easy', category: 'Dinner' },
                        times: { total_time_minutes: 30 },
                        items: [],
                        components: [],
                        instructions: [],
                        layout: []
                    }
                ], { headers: { 'x-total-count': '1' } });
            })
        );
    });

    it('renders meal details from API', async () => {
        server.use(
            http.get('*/meals/:id', () => {
                return HttpResponse.json({
                    id: '1',
                    name: 'Special Dinner',
                    status: 'Scheduled',
                    classification: 'Dinner',
                    date: '2025-01-01',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    user_id: 'user-123',
                    items: [
                        { id: 'i1', recipe_id: 'r1', meal_id: '1' }
                    ]
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/1']}>
                <Routes>
                    <Route path="/meals/:id" element={<MealDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Special Dinner' })).toBeInTheDocument();
        });

        expect(screen.getByText(/Scheduled/i)).toBeInTheDocument();
        // Classification is now in grid, "Dinner" badge
        expect(screen.getAllByText('Dinner').length).toBeGreaterThan(0);

        // Wait for recipe to load
        await waitFor(() => {
            expect(screen.getByText('Tasty Dish')).toBeInTheDocument();
        });
    });

    it('shows delete and edit buttons for owner/admin', async () => {
        server.use(
            http.get('*/meals/:id', () => {
                return HttpResponse.json({
                    id: '1',
                    name: 'Delete Me',
                    status: 'Proposed',
                    user_id: 'user-123',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    items: []
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/1']}>
                <Routes>
                    <Route path="/meals/:id" element={<MealDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Delete Me' })).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /Duplicate Meal/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Edit$/ })).toBeInTheDocument();
        // Since there are no recipes in this mock, Edit Recipes might not show?
        // Wait, Edit Recipes button is shown if canEdit is true, regardless of recipes count?
        // Let's check MealDetails.tsx logic.
        // It is inside the Box wrapping recipes list.
        // The Box is rendered even if no recipes?
        // 'Heading size="md"... Recipes' is rendered.
        // And the HStack with buttons is rendered.
        // So Edit Recipes button should be there.
        expect(screen.getByRole('button', { name: /Edit Recipes/i })).toBeInTheDocument();
    });
});
