
import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AddMealPage from '../AddMealPage';
import { describe, it, expect, vi } from 'vitest';

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(),
    },
});

describe('AddMealPage Breadcrumbs', () => {
    it('shows default breadcrumbs when visiting directly', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/new']}>
                <Routes>
                    <Route path="/meals/new" element={<AddMealPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('link', { name: /meals/i })).toBeInTheDocument();
        });

        // "Meals" is a link
        const mealsLink = screen.getByRole('link', { name: /meals/i });
        expect(mealsLink).toHaveAttribute('href', '/meals');

        // "Add Meal" is current page (text, not link)
        expect(screen.getByText('Add Meal')).toBeInTheDocument();
        expect(screen.queryByText('Duplicate Meal')).not.toBeInTheDocument();
    });

    it('shows duplicate breadcrumbs when sourceMeal is present in state', async () => {
        const sourceMeal = { id: '123', name: 'Original Meal' };

        renderWithProviders(
            <MemoryRouter initialEntries={[{
                pathname: '/meals/new',
                state: { sourceMeal }
            }]}>
                <Routes>
                    <Route path="/meals/new" element={<AddMealPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('link', { name: /meals/i })).toBeInTheDocument();
        });

        // "Meals" link
        expect(screen.getByRole('link', { name: /meals/i })).toHaveAttribute('href', '/meals');

        // "Original Meal" link
        const sourceLink = screen.getByRole('link', { name: 'Original Meal' });
        expect(sourceLink).toBeInTheDocument();
        expect(sourceLink).toHaveAttribute('href', '/meals/123');

        // "Duplicate Meal" current text
        expect(screen.getByText('Duplicate Meal')).toBeInTheDocument();
        expect(screen.queryByText('Add Meal')).not.toBeInTheDocument();
    });
});
