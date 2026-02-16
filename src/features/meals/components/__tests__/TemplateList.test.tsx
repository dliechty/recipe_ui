import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import TemplateList from '../TemplateList';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { toaster } from '../../../../toaster';

const mockNavigate = vi.fn();

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
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

describe('TemplateList', () => {
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
        } as unknown as typeof IntersectionObserver;
    });

    beforeEach(() => {
        mockNavigate.mockClear();
        vi.mocked(toaster.create).mockClear();
    });

    it('renders templates from API', async () => {
        server.use(
            http.get('*/meals/templates', () => {
                const mockData = [
                    {
                        id: 't1',
                        name: 'Weeknight Dinner',
                        classification: 'Dinner',
                        created_at: '2024-01-01T00:00:00Z',
                        slots: []
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Weeknight Dinner')).toBeInTheDocument();
        });
    });

    it('shows add template button', async () => {
        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /Add Template/i })).toBeInTheDocument();
    });

    it('shows generate meal button for each template', async () => {
        server.use(
            http.get('*/meals/templates', () => {
                const mockData = [
                    {
                        id: 't1',
                        name: 'Template 1',
                        classification: 'Dinner',
                        created_at: '2024-01-01T00:00:00Z',
                        slots: []
                    },
                    {
                        id: 't2',
                        name: 'Template 2',
                        classification: 'Lunch',
                        created_at: '2024-01-02T00:00:00Z',
                        slots: []
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '2' }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Template 1')).toBeInTheDocument();
        });

        const generateButtons = screen.getAllByRole('button', { name: /Generate Meal/i });
        expect(generateButtons).toHaveLength(2);
    });

    it('generates meal from template list and navigates to the new meal', async () => {
        const generatedMealId = 'generated-meal-456';

        server.use(
            http.get('*/meals/templates', () => {
                const mockData = [
                    {
                        id: 't1',
                        name: 'Test Template',
                        classification: 'Dinner',
                        created_at: '2024-01-01T00:00:00Z',
                        slots: []
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
            }),
            http.post('*/meals/', () => {
                return HttpResponse.json({
                    id: generatedMealId,
                    name: 'Test Template',
                    status: 'Queued',
                    template_id: 't1',
                    items: [],
                    user_id: 'user-123',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }, { status: 201 });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Template')).toBeInTheDocument();
        });

        // Click generate on the list item
        const generateButton = screen.getByRole('button', { name: /Generate Meal/i });
        fireEvent.click(generateButton);

        // Wait for modal
        await waitFor(() => {
            expect(screen.getByText(/Generating meal from template/i)).toBeInTheDocument();
        });

        // Click generate in modal
        // Since there might be multiple buttons with same name (one in list, one in modal), 
        // we target the one in modal.
        const modalGenerateButton = screen.getAllByRole('button', { name: /Generate Meal/i }).pop();
        if (!modalGenerateButton) throw new Error("Modal generate button not found");
        fireEvent.click(modalGenerateButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(`/meals/${generatedMealId}`, {
                state: {
                    sourceTemplate: {
                        id: 't1',
                        name: 'Test Template'
                    },
                    fromTemplateList: true
                }
            });
        });

        expect(toaster.create).toHaveBeenCalledWith({
            title: 'Meal generated successfully',
            type: 'success',
        });
    });

    it('shows error toast when meal generation fails from template list', async () => {
        server.use(
            http.get('*/meals/templates', () => {
                const mockData = [
                    {
                        id: 't1',
                        name: 'Test Template',
                        classification: 'Dinner',
                        created_at: '2024-01-01T00:00:00Z',
                        slots: []
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
            }),
            http.post('*/meals/', () => {
                return HttpResponse.json(
                    { detail: 'Failed to generate meal' },
                    { status: 500 }
                );
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Template')).toBeInTheDocument();
        });

        const generateButton = screen.getByRole('button', { name: /Generate Meal/i });
        fireEvent.click(generateButton);

        // Wait for modal
        await waitFor(() => {
            expect(screen.getByText(/Generating meal from template/i)).toBeInTheDocument();
        });

        // Click generate in modal
        const modalGenerateButton = screen.getAllByRole('button', { name: /Generate Meal/i }).pop();
        if (!modalGenerateButton) throw new Error("Modal generate button not found");
        fireEvent.click(modalGenerateButton);

        await waitFor(() => {
            expect(toaster.create).toHaveBeenCalledWith({
                title: 'Failed to generate meal',
                type: 'error',
            });
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not navigate to template details when clicking generate meal button', async () => {
        server.use(
            http.get('*/meals/templates', () => {
                const mockData = [
                    {
                        id: 't1',
                        name: 'Test Template',
                        classification: 'Dinner',
                        created_at: '2024-01-01T00:00:00Z',
                        slots: []
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
            }),
            http.post('*/meals/', () => {
                return HttpResponse.json({
                    id: 'generated-meal-789',
                    name: 'Test Template',
                    status: 'Queued',
                    template_id: 't1',
                    items: [],
                    user_id: 'user-123',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }, { status: 201 });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Template')).toBeInTheDocument();
        });

        const generateButton = screen.getByRole('button', { name: /Generate Meal/i });
        fireEvent.click(generateButton);
        
        // Wait for modal to ensure we didn't navigate
        await waitFor(() => {
             expect(screen.getByText(/Generating meal from template/i)).toBeInTheDocument();
        });

        // Click generate in modal
        const modalGenerateButton = screen.getAllByRole('button', { name: /Generate Meal/i }).pop();
        if (!modalGenerateButton) throw new Error("Modal generate button not found");
        fireEvent.click(modalGenerateButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/meals/generated-meal-789', {
                state: {
                    sourceTemplate: {
                        id: 't1',
                        name: 'Test Template'
                    },
                    fromTemplateList: true
                }
            });
        });

        // Should NOT navigate to the template details page
        expect(mockNavigate).not.toHaveBeenCalledWith('/meals/templates/t1');
    });

    it('shows "No more templates to load" when all templates are loaded', async () => {
        // Mock API to return 5 templates with total count 5
        server.use(
            http.get('*/meals/templates', () => {
                const templates = Array.from({ length: 5 }, (_, i) => ({
                    id: `t${i}`,
                    name: `Template ${i}`,
                    classification: 'Dinner',
                    created_at: new Date().toISOString(),
                    user_id: 'u1',
                    slots: []
                }));

                return HttpResponse.json(templates, {
                    headers: { 'X-Total-Count': '5' }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        // Wait for templates to load
        await waitFor(() => {
            expect(screen.getByText('Template 0')).toBeInTheDocument();
            expect(screen.getByText('Template 4')).toBeInTheDocument();
        });

        // Check for the end message
        expect(screen.getByText('No more templates to load')).toBeInTheDocument();
    });
});