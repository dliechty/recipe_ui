import { renderWithProviders, screen, waitFor, within, fireEvent } from '../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import RecipeList from '../components/RecipeList';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';

vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('RecipeList', () => {
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    beforeAll(() => {
        // Mock IntersectionObserver
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

    it('renders recipes from API', async () => {
        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        // Wait for the recipes to be displayed
        await waitFor(() => {
            expect(screen.getByText('Chicken Noodles 11')).toBeInTheDocument();
            expect(screen.getByText('Beef Curry 2')).toBeInTheDocument();
            // Expect Pork Stir Fry 3 & Chicken Pasta 1 to NOT be in document because they are pushed to page 2
        });
    });

    it('hides total time badge when not provided', async () => {
        server.use(
            http.get('*/recipes', () => {
                const mockData = [
                    {
                        id: 3,
                        core: {
                            id: '3',
                            name: 'Quick Snack',
                            description: 'No time needed.',
                            owner_id: '1',
                            yield_amount: 1,
                            yield_unit: 'serving',
                            difficulty: 'Easy',
                            cuisine: 'American',
                            category: 'Snack'
                        },
                        times: {
                            total_time_minutes: 0
                        }
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Quick Snack')).toBeInTheDocument();
        });

        const row = screen.getByRole('row', { name: /Quick Snack/i });
        const utils = within(row);
        expect(utils.getByText('-')).toBeInTheDocument();
        expect(utils.getByText('1 serving')).toBeInTheDocument();
    });

    it('sets up intersection observer on sentinel', async () => {
        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(observeMock).toHaveBeenCalled();
        });
    });


    it('groups variants under their parent and handles collapse/expand', async () => {
        server.use(
            http.get('*/recipes', () => {
                const mockData = [
                    {
                        core: { id: '10', name: 'Variant A', yield_amount: 1, yield_unit: 'serving' },
                        parent_recipe_id: '1',
                        times: { total_time_minutes: 30 }
                    },
                    {
                        core: { id: '1', name: 'Parent Recipe', yield_amount: 2, yield_unit: 'servings' },
                        times: { total_time_minutes: 60 }
                    },
                    {
                        core: { id: '2', name: 'Unrelated Recipe', yield_amount: 4, yield_unit: 'servings' },
                        times: { total_time_minutes: 45 }
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '3' }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Parent Recipe')).toBeInTheDocument();
            expect(screen.getByText('Variant A')).toBeInTheDocument();
        });

        const rows = screen.getAllByRole('row');
        // Header row + 3 data rows
        expect(rows).toHaveLength(4);

        // Verify order: Parent, then Variant
        const parentIndex = rows.findIndex(row => within(row).queryByText('Parent Recipe'));
        const variantIndex = rows.findIndex(row => within(row).queryByText('Variant A'));


        expect(parentIndex).toBeGreaterThan(0); // 0 is header
        expect(variantIndex).toEqual(parentIndex + 1); // Variant immediately follows parent

        // Check for indentation on variant (we'll check for styling or specific rendering)
        const variantCell = within(rows[variantIndex]).getByText('Variant A').closest('td');
        expect(variantCell).toHaveStyle({ paddingLeft: '2rem' }); // Assuming we use 2rem for indentation

        // Check for collapse/expand
        const parentRow = rows[parentIndex];
        const toggleButton = within(parentRow).getByRole('button', { name: /collapse/i }); // We expect a toggle button

        // Collapse
        fireEvent.click(toggleButton);
        expect(screen.queryByText('Variant A')).not.toBeInTheDocument();

        // Expand
        fireEvent.click(toggleButton); // It should toggle back to expand, name might change to 'expand' or use aria-expanded
        expect(screen.getByText('Variant A')).toBeInTheDocument();
    });

    it('renders orphan variants as normal rows', async () => {
        server.use(
            http.get('*/recipes', () => {
                const mockData = [
                    {
                        core: { id: '20', name: 'Orphan Variant', yield_amount: 1, yield_unit: 'serving' },
                        parent_recipe_id: '999',
                        times: { total_time_minutes: 30 }
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <RecipeList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Orphan Variant')).toBeInTheDocument();
        });

        const row = screen.getByRole('row', { name: /Orphan Variant/i });
        const nameCell = within(row).getByText('Orphan Variant').closest('td');
        expect(nameCell).not.toHaveStyle({ paddingLeft: '2rem' });
    });
});
