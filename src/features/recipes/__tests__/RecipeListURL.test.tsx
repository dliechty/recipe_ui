import { renderWithProviders, screen, waitFor, fireEvent } from '../../../test-utils';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import RecipeList from '../components/RecipeList';
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Utility to spy on location
const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-search">{location.search}</div>;
};

describe('RecipeList URL Persistence', () => {
    // Mock IntersectionObserver as RecipeList uses it
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    beforeAll(() => {
        global.IntersectionObserver = class IntersectionObserver {
            constructor() { }
            observe = observeMock;
            unobserve() { return null; }
            disconnect = disconnectMock;
            takeRecords() { return []; }
            root = null;
            rootMargin = '';
            thresholds = [];
        } as any;
    });

    it('initializes filters from URL', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes?name=Pasta']}>
                <Routes>
                    <Route path="/recipes" element={<>
                        <RecipeList />
                        <LocationDisplay />
                    </>} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for search input to be populated
        await waitFor(() => {
            const searchInput = screen.getByPlaceholderText(/Search recipes/i);
            expect(searchInput).toHaveValue('Pasta');
        });
    });

    it('updates URL when filters change', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/recipes']}>
                <Routes>
                    <Route path="/recipes" element={<>
                        <RecipeList />
                        <LocationDisplay />
                    </>} />
                </Routes>
            </MemoryRouter>
        );

        const searchInput = await screen.findByPlaceholderText(/Search recipes/i);

        // Create change event
        fireEvent.change(searchInput, { target: { value: 'Curry' } });

        // Since input is debounced, we wait for URL update
        await waitFor(() => {
            expect(screen.getByTestId('location-search')).toHaveTextContent('name=Curry');
        }, { timeout: 3000 });
    });

    it('preserves multiple filters in URL', async () => {
        const initialUrl = '/recipes?name=Soup&category=Lunch';
        renderWithProviders(
            <MemoryRouter initialEntries={[initialUrl]}>
                <Routes>
                    <Route path="/recipes" element={<>
                        <RecipeList />
                        <LocationDisplay />
                    </>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Search recipes/i)).toHaveValue('Soup');
            // Check formatted URL params are strictly preserved or equivalent
            expect(screen.getByTestId('location-search').textContent).toContain('name=Soup');
            expect(screen.getByTestId('location-search').textContent).toContain('category=Lunch');
        });
    });
});
