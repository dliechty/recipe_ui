import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
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
        // Select Recipes button allows inline recipe editing via modal
        expect(screen.getByRole('button', { name: /Select Recipes/i })).toBeInTheDocument();
    });

    it('allows editing meal name', async () => {
        server.use(
            http.get('*/meals/:id', () => {
                return HttpResponse.json({
                    id: '1',
                    name: 'Old Name',
                    status: 'Proposed',
                    classification: 'Dinner',
                    date: '2025-01-01',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    user_id: 'user-123',
                    items: []
                });
            }),
            http.put('*/meals/1', async ({ request }) => {
                const body = await request.json() as { name: string };
                return HttpResponse.json({
                    id: '1',
                    name: body.name,
                    status: 'Proposed',
                    // ... other fields
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
            expect(screen.getByRole('heading', { name: 'Old Name' })).toBeInTheDocument();
        });

        // Click heading to edit
        const heading = screen.getByRole('heading', { name: 'Old Name' });
        // Need to click the parent HStack? The onClick is on the HStack.
        // fireEvent.click on the heading (child) should bubble up.
        // But verifying that "Edit" icon is present might be good?
        // It has opacity 0 by default, so might be checking its existence.

        fireEvent.click(heading);

        // Input should appear
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('Old Name');

        // Change name
        fireEvent.change(input, { target: { value: 'New Name' } });

        // Save
        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        // Expectation: mutation called. 
        // We can't easily check mutation internal state here without spying.
        // But we can check if it goes back to view mode?
        // Or check if toast appears? Toaster is mocked/stubbed usually? 
        // We see `toaster.create` in `EditableMealName`.
        // Let's assume on successful mutation (which MSW handles), it switches back.

                // Wait for input to disappear

                await waitFor(() => {

                    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

                });

            });

        

                it('allows editing meal date', async () => {

        

                    let currentMealDate = '2025-01-01';

        

                    server.use(

        

                        http.get('*/meals/:id', () => {

        

                            return HttpResponse.json({

        

                                id: '1',

        

                                name: 'Date Test',

        

                                status: 'Proposed',

        

                                classification: 'Dinner',

        

                                date: currentMealDate,

        

                                created_at: '2024-01-01T00:00:00Z',

        

                                updated_at: '2024-01-01T00:00:00Z',

        

                                user_id: 'user-123',

        

                                items: []

        

                            });

        

                        }),

        

                        http.put('*/meals/1', async ({ request }) => {

        

                            const body = await request.json() as { date: string };

        

                            currentMealDate = body.date;

        

                            return HttpResponse.json({

        

                                id: '1',

        

                                name: 'Date Test',

        

                                status: 'Proposed',

        

                                date: currentMealDate,

        

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

        

                        // Use regex to be more flexible with leading zeros (1/1/2025 vs 01/01/2025)

        

                        expect(screen.getByText(/1\/1\/2025|01\/01\/2025/)).toBeInTheDocument();

        

                    });

        

            

        

                    // Click date to edit

        

                    const dateText = screen.getByText(/1\/1\/2025|01\/01\/2025/);

        

                    fireEvent.click(dateText);

        

            

        

                    // Date input should appear (type="date" is still a textbox or special input)

        

                    const input = screen.getByDisplayValue('2025-01-01');

        

                    expect(input).toBeInTheDocument();

        

            

        

                    // Change date

        

                    fireEvent.change(input, { target: { value: '2025-12-25' } });

        

            

        

                    // Save

        

                    const saveButton = screen.getByRole('button', { name: /save/i });

        

                    fireEvent.click(saveButton);

        

            

        

                    // Wait for input to disappear and new date to appear

        

                    await waitFor(() => {

        

                        expect(screen.queryByDisplayValue('2025-12-25')).not.toBeInTheDocument();

        

                    });

        

                    

        

                    await waitFor(() => {

        

                        expect(screen.getByText(/12\/25\/2025/)).toBeInTheDocument();

        

                    });

        

                });

        

            it('allows setting classification when blank', async () => {
        server.use(
            http.get('*/meals/:id', () => {
                return HttpResponse.json({
                    id: '1',
                    name: 'Unclassified Meal',
                    status: 'Proposed',
                    classification: null,
                    date: '2025-01-01',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    user_id: 'user-123',
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
            expect(screen.getByRole('heading', { name: 'Unclassified Meal' })).toBeInTheDocument();
        });

        // Should show "Classification:" label
        expect(screen.getByText('Classification:')).toBeInTheDocument();

        // Should show "Add Classification" badge/button
        expect(screen.getByText('Add Classification')).toBeInTheDocument();
    });

    it('shows template breadcrumb when navigating from template details', async () => {
        server.use(
            http.get('*/meals/:id', () => {
                return HttpResponse.json({
                    id: '1',
                    name: 'Generated Meal',
                    status: 'Proposed',
                    classification: 'Dinner',
                    template_id: 't1',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    user_id: 'user-123',
                    items: []
                });
            })
        );

        const locationState = {
            sourceTemplate: {
                id: 't1',
                name: 'My Template'
            }
        };

        renderWithProviders(
            <MemoryRouter initialEntries={[{ pathname: '/meals/1', state: locationState }]}>
                <Routes>
                    <Route path="/meals/:id" element={<MealDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Generated Meal' })).toBeInTheDocument();
        });

        // Should show Templates > My Template > Generated Meal breadcrumb
        expect(screen.getByRole('link', { name: 'Templates' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'My Template' })).toBeInTheDocument();
        // Meal name appears in both heading and breadcrumb, just verify link structure
        expect(screen.getByRole('link', { name: 'Templates' })).toHaveAttribute('href', '/meals/templates');
        expect(screen.getByRole('link', { name: 'My Template' })).toHaveAttribute('href', '/meals/templates/t1');
    });

    it('shows template list breadcrumb when navigating from template list', async () => {
        server.use(
            http.get('*/meals/:id', () => {
                return HttpResponse.json({
                    id: '1',
                    name: 'Generated Meal',
                    status: 'Proposed',
                    classification: 'Dinner',
                    template_id: 't1',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    user_id: 'user-123',
                    items: []
                });
            })
        );

        const locationState = {
            sourceTemplate: {
                id: 't1',
                name: 'My Template'
            },
            fromTemplateList: true
        };

        renderWithProviders(
            <MemoryRouter initialEntries={[{ pathname: '/meals/1', state: locationState }]}>
                <Routes>
                    <Route path="/meals/:id" element={<MealDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Generated Meal' })).toBeInTheDocument();
        });

        // Should show Templates > Generated Meal breadcrumb (no template name link)
        expect(screen.getByRole('link', { name: 'Templates' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Templates' })).toHaveAttribute('href', '/meals/templates');
        // Should NOT show the template name as a link
        expect(screen.queryByRole('link', { name: 'My Template' })).not.toBeInTheDocument();
    });

    it('shows default meals breadcrumb when no source template', async () => {
        server.use(
            http.get('*/meals/:id', () => {
                return HttpResponse.json({
                    id: '1',
                    name: 'Regular Meal',
                    status: 'Proposed',
                    classification: 'Dinner',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    user_id: 'user-123',
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
            expect(screen.getByRole('heading', { name: 'Regular Meal' })).toBeInTheDocument();
        });

        // Should show Meals > Regular Meal breadcrumb
        expect(screen.getByRole('link', { name: 'Meals' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Meals' })).toHaveAttribute('href', '/meals');
        expect(screen.queryByRole('link', { name: 'Templates' })).not.toBeInTheDocument();
    });
});
