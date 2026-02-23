import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HouseholdDrawer from '../HouseholdDrawer';
import { Household } from '../../../../client';

// ---------------------------------------------------------------------------
// Mock hooks
// ---------------------------------------------------------------------------

const mockSetActiveHousehold = vi.fn();
const mockSetPrimaryMutate = vi.fn();
const mockCreateMutate = vi.fn();

interface MockHouseholdContext {
    activeHouseholdId: string | null;
    setActiveHousehold: typeof mockSetActiveHousehold;
    primaryHouseholdId: string | null;
    households: Household[];
}

let mockHouseholdCtx: MockHouseholdContext = {
    activeHouseholdId: null,
    setActiveHousehold: mockSetActiveHousehold,
    primaryHouseholdId: null,
    households: [],
};

vi.mock('../../../../context/HouseholdContext', () => ({
    useHouseholdContext: () => mockHouseholdCtx,
}));

vi.mock('../../../../hooks/useHouseholds', () => ({
    useHouseholds: () => ({
        data: mockHouseholdCtx.households,
        isLoading: false,
    }),
    useSetPrimaryHousehold: () => ({
        mutate: mockSetPrimaryMutate,
        isPending: false,
    }),
    useCreateHousehold: () => ({
        mutate: mockCreateMutate,
        isPending: false,
    }),
}));

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const household1: Household = {
    id: 'hh-1',
    name: 'Smith Family',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

const household2: Household = {
    id: 'hh-2',
    name: 'Weekend House',
    created_by: 'user-1',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderDrawer(isOpen = true, onClose = vi.fn()) {
    return renderWithProviders(
        <MemoryRouter>
            <HouseholdDrawer isOpen={isOpen} onClose={onClose} />
        </MemoryRouter>
    );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HouseholdDrawer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockHouseholdCtx = {
            activeHouseholdId: null,
            setActiveHousehold: mockSetActiveHousehold,
            primaryHouseholdId: null,
            households: [household1, household2],
        };
    });

    test('drawer is visible when isOpen is true', async () => {
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    test('drawer is not visible when isOpen is false', () => {
        renderDrawer(false);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('lists user households', async () => {
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByText('Smith Family')).toBeInTheDocument();
            expect(screen.getByText('Weekend House')).toBeInTheDocument();
        });
    });

    test('active household is visually highlighted', async () => {
        mockHouseholdCtx = {
            ...mockHouseholdCtx,
            activeHouseholdId: 'hh-1',
        };
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getAllByText('Smith Family').length).toBeGreaterThan(0);
        });
        // The active household row should have aria-current or data-active attribute
        const activeRow = screen.getByTestId('household-row-hh-1');
        expect(activeRow).toHaveAttribute('data-active', 'true');
    });

    test('"Personal" option is shown', async () => {
        renderDrawer(true);
        await waitFor(() => {
            // "Personal" appears in the list AND in the active indicator when no household is active
            expect(screen.getAllByText('Personal').length).toBeGreaterThan(0);
        });
    });

    test('clicking "Personal" switches to no household', async () => {
        mockHouseholdCtx = {
            ...mockHouseholdCtx,
            activeHouseholdId: 'hh-1',
        };
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByText('Personal')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('personal-option'));
        expect(mockSetActiveHousehold).toHaveBeenCalledWith(null);
    });

    test('clicking a household switches active household', async () => {
        mockHouseholdCtx = {
            ...mockHouseholdCtx,
            activeHouseholdId: null,
        };
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByText('Smith Family')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('switch-btn-hh-1'));
        expect(mockSetActiveHousehold).toHaveBeenCalledWith('hh-1');
    });

    test('"Set as Primary" toggle calls useSetPrimaryHousehold with household id when toggling on', async () => {
        mockHouseholdCtx = {
            ...mockHouseholdCtx,
            activeHouseholdId: 'hh-1',
            primaryHouseholdId: null,
        };
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByTestId('primary-toggle-hh-1')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('primary-toggle-hh-1'));
        expect(mockSetPrimaryMutate).toHaveBeenCalledWith({ household_id: 'hh-1' });
    });

    test('"Set as Primary" toggle calls useSetPrimaryHousehold with null when toggling off (already primary)', async () => {
        mockHouseholdCtx = {
            ...mockHouseholdCtx,
            activeHouseholdId: 'hh-1',
            primaryHouseholdId: 'hh-1',
        };
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByTestId('primary-toggle-hh-1')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('primary-toggle-hh-1'));
        expect(mockSetPrimaryMutate).toHaveBeenCalledWith({ household_id: null });
    });

    test('"Create Household" button is present', async () => {
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Create Household/i })).toBeInTheDocument();
        });
    });

    test('"Create Household" button opens create dialog', async () => {
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Create Household/i })).toBeInTheDocument();
        });
        fireEvent.click(screen.getByRole('button', { name: /Create Household/i }));
        await waitFor(() => {
            expect(screen.getByTestId('create-household-dialog')).toBeInTheDocument();
        });
    });

    test('"Manage Households" link navigates to Account page', async () => {
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByRole('link', { name: /Manage Households/i })).toBeInTheDocument();
        });
        const link = screen.getByRole('link', { name: /Manage Households/i });
        expect(link).toHaveAttribute('href', '/account');
    });

    test('shows active household indicator at top', async () => {
        mockHouseholdCtx = {
            ...mockHouseholdCtx,
            activeHouseholdId: 'hh-1',
        };
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByTestId('active-household-indicator')).toBeInTheDocument();
            expect(screen.getByTestId('active-household-indicator')).toHaveTextContent('Smith Family');
        });
    });

    test('shows "Personal" in active indicator when no household is active', async () => {
        mockHouseholdCtx = {
            ...mockHouseholdCtx,
            activeHouseholdId: null,
        };
        renderDrawer(true);
        await waitFor(() => {
            expect(screen.getByTestId('active-household-indicator')).toBeInTheDocument();
            expect(screen.getByTestId('active-household-indicator')).toHaveTextContent('Personal');
        });
    });
});
