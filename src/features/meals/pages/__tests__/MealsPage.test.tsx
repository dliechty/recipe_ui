import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MealsPage from '../MealsPage';
import { describe, it, expect } from 'vitest';

describe('MealsPage', () => {
    it('renders tabs and navigates correctly', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals']}>
                <Routes>
                    <Route path="/meals" element={<MealsPage />}>
                        <Route index element={<div>Meals List Component</div>} />
                        <Route path="templates" element={<div>Templates List Component</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        // Check if Tabs are rendered
        expect(screen.getByRole('tab', { name: /Meals/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Templates/i })).toBeInTheDocument();

        // Check default content (Meals List)
        expect(screen.getByText('Meals List Component')).toBeInTheDocument();

        // Click Templates tab
        const templatesTab = screen.getByRole('tab', { name: /Templates/i });
        fireEvent.click(templatesTab);

        // Wait for navigation
        await waitFor(() => {
            expect(screen.getByText('Templates List Component')).toBeInTheDocument();
        });
    });

    it('navigates back to meals tab', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/templates']}>
                <Routes>
                    <Route path="/meals" element={<MealsPage />}>
                        <Route index element={<div>Meals List Component</div>} />
                        <Route path="templates" element={<div>Templates List Component</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Templates List Component')).toBeInTheDocument();

        // Click Meals tab
        const mealsTab = screen.getByRole('tab', { name: /^Meals$/i });
        fireEvent.click(mealsTab);

        await waitFor(() => {
            expect(screen.getByText('Meals List Component')).toBeInTheDocument();
        });
    });
});
