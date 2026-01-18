import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TemplateDetails from '../TemplateDetails';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { toaster } from '../../../../toaster';
import { MealScheduleRequest } from '../../../../client';

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../../../toaster', () => ({
    toaster: {
        create: vi.fn(),
    },
}));

describe('TemplateDetails', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: { id: 'user-123' } });
        mockNavigate.mockClear();
        vi.mocked(toaster.create).mockClear();
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

    it('generates a meal and navigates to the new meal on success', async () => {
        const generatedMealId = 'generated-meal-123';

        server.use(
            http.get('*/meals/templates/:id', () => {
                return HttpResponse.json({
                    id: 't1',
                    name: 'Test Template',
                    user_id: 'user-123',
                    slots: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                });
            }),
            http.post('*/meals/generate', () => {
                return HttpResponse.json({
                    id: generatedMealId,
                    name: 'Generated Meal',
                    status: 'Draft',
                    template_id: 't1',
                    items: [],
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
            expect(screen.getByRole('heading', { name: 'Test Template' })).toBeInTheDocument();
        });

        // Open modal
        const generateButton = screen.getByRole('button', { name: /Generate Meal/i });
        fireEvent.click(generateButton);

        // Wait for modal and click confirm
        await waitFor(() => {
            expect(screen.getByText(/Generating meal from template/i)).toBeInTheDocument();
        });

        // Target the button inside the modal (it's the second one with "Generate Meal" text usually, or use role in modal)
        // Since there are two buttons with "Generate Meal", we can use a more specific selector or index
        const modalGenerateButton = screen.getAllByRole('button', { name: /Generate Meal/i })[1]; 
        fireEvent.click(modalGenerateButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(`/meals/${generatedMealId}`, {
                state: {
                    sourceTemplate: {
                        id: 't1',
                        name: 'Test Template'
                    }
                }
            });
        });

        expect(toaster.create).toHaveBeenCalledWith({
            title: 'Meal generated successfully',
            type: 'success',
        });
    });

    it('generates a meal with scheduled date', async () => {
        const generatedMealId = 'generated-meal-date';
        const scheduledDate = '2026-01-20';
        let capturedBody: MealScheduleRequest | undefined;

        server.use(
            http.get('*/meals/templates/:id', () => {
                return HttpResponse.json({
                    id: 't1',
                    name: 'Test Template',
                    user_id: 'user-123',
                    slots: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                });
            }),
            http.post('*/meals/generate', async ({ request }) => {
                capturedBody = await request.json() as MealScheduleRequest;
                return HttpResponse.json({
                    id: generatedMealId,
                    name: 'Generated Meal',
                    status: 'Draft',
                    template_id: 't1',
                    items: [],
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
            expect(screen.getByRole('heading', { name: 'Test Template' })).toBeInTheDocument();
        });

        // Open modal
        fireEvent.click(screen.getByRole('button', { name: /Generate Meal/i }));

        // Enter date
        const dateInput = await screen.findByLabelText(/Scheduled Date/i);
        
        fireEvent.change(dateInput, { target: { value: scheduledDate } });

        // Click generate
        const modalGenerateButton = screen.getAllByRole('button', { name: /Generate Meal/i })[1];
        fireEvent.click(modalGenerateButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
        });

        expect(capturedBody).toEqual({
            scheduled_date: scheduledDate
        });
    });

    it('shows error toast when meal generation fails', async () => {
        server.use(
            http.get('*/meals/templates/:id', () => {
                return HttpResponse.json({
                    id: 't1',
                    name: 'Test Template',
                    user_id: 'user-123',
                    slots: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                });
            }),
            http.post('*/meals/generate', () => {
                return HttpResponse.json(
                    { detail: 'Failed to generate meal' },
                    { status: 500 }
                );
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
            expect(screen.getByRole('heading', { name: 'Test Template' })).toBeInTheDocument();
        });

        // Open modal
        fireEvent.click(screen.getByRole('button', { name: /Generate Meal/i }));

        // Confirm
        const modalGenerateButton = screen.getAllByRole('button', { name: /Generate Meal/i })[1];
        fireEvent.click(modalGenerateButton);

        await waitFor(() => {
            expect(toaster.create).toHaveBeenCalledWith({
                title: 'Failed to generate meal',
                type: 'error',
            });
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});