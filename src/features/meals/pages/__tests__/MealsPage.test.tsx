import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MealsPage from '../MealsPage';
import { describe, it, expect } from 'vitest';

describe('MealsPage', () => {
    it('renders three tabs: Upcoming, Templates, History', () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals']}>
                <Routes>
                    <Route path="/meals" element={<MealsPage />}>
                        <Route index element={<div>Upcoming Component</div>} />
                        <Route path="templates" element={<div>Templates List Component</div>} />
                        <Route path="history" element={<div>History Component</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole('tab', { name: /Upcoming/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Templates/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /History/i })).toBeInTheDocument();
    });

    it('shows Upcoming tab content by default', () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals']}>
                <Routes>
                    <Route path="/meals" element={<MealsPage />}>
                        <Route index element={<div>Upcoming Component</div>} />
                        <Route path="templates" element={<div>Templates List Component</div>} />
                        <Route path="history" element={<div>History Component</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Upcoming Component')).toBeInTheDocument();
    });

    it('navigates to Templates tab', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals']}>
                <Routes>
                    <Route path="/meals" element={<MealsPage />}>
                        <Route index element={<div>Upcoming Component</div>} />
                        <Route path="templates" element={<div>Templates List Component</div>} />
                        <Route path="history" element={<div>History Component</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('tab', { name: /Templates/i }));

        await waitFor(() => {
            expect(screen.getByText('Templates List Component')).toBeInTheDocument();
        });
    });

    it('navigates to History tab', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals']}>
                <Routes>
                    <Route path="/meals" element={<MealsPage />}>
                        <Route index element={<div>Upcoming Component</div>} />
                        <Route path="templates" element={<div>Templates List Component</div>} />
                        <Route path="history" element={<div>History Component</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('tab', { name: /History/i }));

        await waitFor(() => {
            expect(screen.getByText('History Component')).toBeInTheDocument();
        });
    });

    it('navigates back to Upcoming from Templates', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/templates']}>
                <Routes>
                    <Route path="/meals" element={<MealsPage />}>
                        <Route index element={<div>Upcoming Component</div>} />
                        <Route path="templates" element={<div>Templates List Component</div>} />
                        <Route path="history" element={<div>History Component</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Templates List Component')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('tab', { name: /Upcoming/i }));

        await waitFor(() => {
            expect(screen.getByText('Upcoming Component')).toBeInTheDocument();
        });
    });

    it('shows History tab as active when on /meals/history', () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/history']}>
                <Routes>
                    <Route path="/meals" element={<MealsPage />}>
                        <Route index element={<div>Upcoming Component</div>} />
                        <Route path="templates" element={<div>Templates List Component</div>} />
                        <Route path="history" element={<div>History Component</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('History Component')).toBeInTheDocument();
    });
});
