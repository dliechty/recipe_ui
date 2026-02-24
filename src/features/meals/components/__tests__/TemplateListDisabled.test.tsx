import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import TemplateList from '../TemplateList';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

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

// Mutable mock state for HouseholdContext
let mockActiveHouseholdId: string | null = 'hh-1';

vi.mock('../../../../context/HouseholdContext', () => ({
    HouseholdContext: { _currentValue: null },
    useHouseholdContext: () => ({
        activeHouseholdId: mockActiveHouseholdId,
        setActiveHousehold: vi.fn(),
        primaryHouseholdId: 'hh-1',
        households: [{ id: 'hh-1', name: 'Smith Family' }],
    }),
}));

const TEMPLATES = [
    {
        id: 't1',
        name: 'Weeknight Dinner',
        classification: 'Dinner',
        created_at: '2024-01-01T00:00:00Z',
        slots: [],
        user_id: 'user-123',
    },
    {
        id: 't2',
        name: 'Sunday Brunch',
        classification: 'Brunch',
        created_at: '2024-01-02T00:00:00Z',
        slots: [],
        user_id: 'user-123',
    },
];

const DISABLED_EXCLUSIONS = [
    { id: 'excl-1', household_id: 'hh-1', template_id: 't1' },
];

describe('TemplateList — disabled template indicators', () => {
    beforeAll(() => {
        global.IntersectionObserver = class IntersectionObserver {
            constructor() {}
            observe = vi.fn();
            unobserve() { return null; }
            disconnect = vi.fn();
            takeRecords() { return []; }
            root = null;
            rootMargin = '';
            thresholds = [];
        } as unknown as typeof IntersectionObserver;
    });

    beforeEach(() => {
        mockNavigate.mockClear();
        // Reset to active household mode by default
        mockActiveHouseholdId = 'hh-1';
    });

    it('shows "Disabled" badge on templates that are disabled for active household', async () => {
        server.use(
            http.get('*/meals/templates', () => {
                return HttpResponse.json(TEMPLATES, {
                    headers: { 'X-Total-Count': '2' },
                });
            }),
            http.get('*/households/:household_id/disabled-templates', () => {
                return HttpResponse.json(DISABLED_EXCLUSIONS);
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Weeknight Dinner')).toBeInTheDocument();
            expect(screen.getByText('Sunday Brunch')).toBeInTheDocument();
        });

        // t1 is disabled — should show "Disabled" badge
        await waitFor(() => {
            expect(screen.getByText('Disabled')).toBeInTheDocument();
        });

        // t2 is not disabled — no second "Disabled" badge
        const disabledBadges = screen.getAllByText('Disabled');
        expect(disabledBadges).toHaveLength(1);
    });

    it('shows no disabled indicators when in personal mode (no active household)', async () => {
        // Switch to personal mode
        mockActiveHouseholdId = null;

        server.use(
            http.get('*/meals/templates', () => {
                return HttpResponse.json(TEMPLATES, {
                    headers: { 'X-Total-Count': '2' },
                });
            }),
            http.get('*/households/:household_id/disabled-templates', () => {
                return HttpResponse.json(DISABLED_EXCLUSIONS);
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

        // In personal mode, no "Disabled" badge should appear
        expect(screen.queryByText('Disabled')).not.toBeInTheDocument();

        // In personal mode, no Disable/Enable buttons should appear
        expect(screen.queryByRole('button', { name: /^Disable$/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^Enable$/i })).not.toBeInTheDocument();
    });

    it('calls disable mutation when clicking "Disable" button on an enabled template', async () => {
        let postCalled = false;
        server.use(
            http.get('*/meals/templates', () => {
                return HttpResponse.json(TEMPLATES, {
                    headers: { 'X-Total-Count': '2' },
                });
            }),
            http.get('*/households/:household_id/disabled-templates', () => {
                // No templates disabled initially
                return HttpResponse.json([]);
            }),
            http.post('*/households/:household_id/disabled-templates', async ({ params, request }) => {
                const { household_id } = params;
                const body = await request.json() as { template_id: string };
                if (household_id === 'hh-1' && body.template_id === 't2') {
                    postCalled = true;
                }
                return HttpResponse.json(
                    { id: 'new-excl', household_id, template_id: body.template_id },
                    { status: 201 }
                );
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Sunday Brunch')).toBeInTheDocument();
        });

        // Both templates are enabled, so there should be "Disable" buttons visible
        await waitFor(() => {
            const disableButtons = screen.getAllByRole('button', { name: /^Disable$/i });
            expect(disableButtons.length).toBeGreaterThan(0);
        });

        const disableButtons = screen.getAllByRole('button', { name: /^Disable$/i });

        // Click "Disable" for Sunday Brunch (t2) — the second template row
        fireEvent.click(disableButtons[1]);

        await waitFor(() => {
            expect(postCalled).toBe(true);
        });
    });

    it('calls enable mutation when clicking "Enable" button on a disabled template', async () => {
        let deleteCalled = false;
        server.use(
            http.get('*/meals/templates', () => {
                return HttpResponse.json(TEMPLATES, {
                    headers: { 'X-Total-Count': '2' },
                });
            }),
            http.get('*/households/:household_id/disabled-templates', () => {
                // t1 is disabled
                return HttpResponse.json(DISABLED_EXCLUSIONS);
            }),
            http.delete('*/households/:household_id/disabled-templates/:template_id', ({ params }) => {
                const { household_id, template_id } = params;
                if (household_id === 'hh-1' && template_id === 't1') {
                    deleteCalled = true;
                }
                return new HttpResponse(null, { status: 204 });
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

        // t1 is disabled — should show "Enable" button
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /^Enable$/i })).toBeInTheDocument();
        });

        const enableButton = screen.getByRole('button', { name: /^Enable$/i });
        fireEvent.click(enableButton);

        await waitFor(() => {
            expect(deleteCalled).toBe(true);
        });
    });
});
