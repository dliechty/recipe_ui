import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TemplateDetails from '../TemplateDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

const mockUseAuth = vi.fn();
vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

describe('TemplateDetails', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: { id: 'user-123' } });
    });

    it('renders template details from API', async () => {
        server.use(
            http.get('*/meals/templates/:id', () => {
                return HttpResponse.json({
                    id: 't1',
                    name: 'Standard Breakfast',
                    classification: 'Breakfast',
                    created_at: '2024-01-01T00:00:00Z',
                    slots: [
                        { id: 's1', strategy: 'Direct', recipe_id: 'r1' },
                        { id: 's2', strategy: 'List', recipe_ids: ['r2', 'r3'] }
                    ]
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/templates/t1']}>
                <Routes>
                    <Route path="/meals/templates/:id" element={<TemplateDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Standard Breakfast' })).toBeInTheDocument();
        });

        expect(screen.getByText('Breakfast')).toBeInTheDocument();
        expect(screen.getByText('Slot 1')).toBeInTheDocument(); // Index based name
        expect(screen.getByText(/Direct/)).toBeInTheDocument();
        expect(screen.getByText('Slot 2')).toBeInTheDocument();
        expect(screen.getByText(/List/)).toBeInTheDocument();
    });

    it('shows actions: edit, delete, generate', async () => {
        server.use(
            http.get('*/meals/templates/:id', () => {
                return HttpResponse.json({
                    id: 't1',
                    name: 'Action Template',
                    user_id: 'user-123',
                    slots: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                });
            })
        );

        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/templates/t1']}>
                <Routes>
                    <Route path="/meals/templates/:id" element={<TemplateDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Action Template' })).toBeInTheDocument();
        });

        expect(screen.getByRole('button', { name: /Duplicate Template/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate Meal/i })).toBeInTheDocument();
    });
});
