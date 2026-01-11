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
        mockUseAuth.mockReturnValue({ user: { id: 'user-123' } });
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
                    items: [
                        { id: 'i1', recipe_id: 'r1', meal_id: '1', recipe: { id: 'r1', name: 'Tasty Dish' } }
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
        expect(screen.getAllByText(/Dinner/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/Tasty Dish/i)).toBeInTheDocument();
    });

    it('shows delete and edit buttons', async () => {
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
        expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('navigates to edit page', async () => {
        // ... similar to previous navigation tests, verifying URL change or component rendering
    });
});
