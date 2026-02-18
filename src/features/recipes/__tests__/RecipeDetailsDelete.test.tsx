import { renderWithProviders, screen, waitFor, fireEvent } from '../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RecipeDetails from '../components/RecipeDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock AdminModeContext - default mode
const mockUseAdminMode = vi.fn();
vi.mock('../../../context/AdminModeContext', () => ({
    useAdminMode: () => mockUseAdminMode(),
}));

const OWNER_ID = "550e8400-e29b-41d4-a716-446655440000";

describe('RecipeDetails Delete Functionality', () => {
    beforeEach(() => {
        // Default to owner
        mockUseAuth.mockReturnValue({ user: { id: OWNER_ID, is_admin: false } });
        mockUseAdminMode.mockReturnValue({ adminModeActive: false, impersonatedUserId: null });
    });

    it('shows delete button for owner (Recipe 2 - No Variants)', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/2']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            // Use getAllByText because name appears in Breadcrumb and Heading
            expect(screen.getAllByText(/2/)[0]).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).not.toBeDisabled();
    });

    it('does not show delete button for non-owner/non-admin', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 'other-user', is_admin: false } });

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/2']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByText(/2/)[0]).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: /^Delete$/i })).not.toBeInTheDocument();
    });

    it('opens confirmation modal on click', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/2']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByText(/2/)[0]).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to delete this recipe? This action cannot be undone.')).toBeInTheDocument();
        });
    });

    it('calls delete API on confirm', async () => {
        const deleteSpy = vi.fn();
        server.use(
            http.delete('*/recipes/:id', ({ params }) => {
                deleteSpy();
                return HttpResponse.json({ id: params.id });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/2']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByText(/2/)[0]).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Are you sure you want to delete this recipe? This action cannot be undone.')).toBeInTheDocument();
        });

        const confirmButton = screen.getByTestId('confirm-delete-btn');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(deleteSpy).toHaveBeenCalled();
        });
    });

    it('disables delete button if variants exist (Recipe 1)', async () => {
        // Recipe 1 has variants in mock data
        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes/1']}>
                <Routes>
                    <Route path="/recipes/:id" element={<RecipeDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getAllByText(/1/)[0]).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toBeDisabled();
        expect(deleteButton).toHaveAttribute('title', 'Cannot delete recipe with variants');
    });
});
