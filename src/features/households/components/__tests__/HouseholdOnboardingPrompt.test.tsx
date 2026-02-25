import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HouseholdOnboardingPrompt from '../HouseholdOnboardingPrompt';
import { Household } from '../../../../client';

// ---------------------------------------------------------------------------
// Mock hooks
// ---------------------------------------------------------------------------

const mockCreateMutate = vi.fn();
const mockJoinMutate = vi.fn();

let mockHouseholds: Household[] = [];

vi.mock('../../../../context/HouseholdContext', () => ({
    useHouseholdContext: () => ({
        activeHouseholdId: null,
        setActiveHousehold: vi.fn(),
        primaryHouseholdId: null,
        households: mockHouseholds,
    }),
}));

vi.mock('../../../../hooks/useHouseholds', () => ({
    useCreateHousehold: () => ({
        mutate: mockCreateMutate,
        isPending: false,
    }),
    useJoinHousehold: () => ({
        mutate: mockJoinMutate,
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

const STORAGE_KEY = 'household_onboarding_dismissed';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderPrompt() {
    return renderWithProviders(
        <MemoryRouter>
            <HouseholdOnboardingPrompt />
        </MemoryRouter>
    );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HouseholdOnboardingPrompt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockHouseholds = [];
        localStorage.removeItem(STORAGE_KEY);
    });

    // -------------------------------------------------------------------------
    // Visibility
    // -------------------------------------------------------------------------

    test('prompt appears for users with no households', () => {
        mockHouseholds = [];
        renderPrompt();
        expect(screen.getByTestId('household-onboarding-prompt')).toBeInTheDocument();
        expect(screen.getByText(/create a household/i)).toBeInTheDocument();
        expect(screen.getByText(/join a household/i)).toBeInTheDocument();
    });

    test('prompt does not appear for users already in a household', () => {
        mockHouseholds = [household1];
        renderPrompt();
        expect(screen.queryByTestId('household-onboarding-prompt')).not.toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Create action
    // -------------------------------------------------------------------------

    test('"Create a Household" opens create dialog', async () => {
        mockHouseholds = [];
        renderPrompt();
        fireEvent.click(screen.getByTestId('onboarding-create-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('onboarding-create-dialog')).toBeInTheDocument();
        });
    });

    test('submitting create dialog calls useCreateHousehold', async () => {
        mockHouseholds = [];
        renderPrompt();
        fireEvent.click(screen.getByTestId('onboarding-create-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('onboarding-create-dialog')).toBeInTheDocument();
        });
        const nameInput = screen.getByTestId('onboarding-create-name-input');
        fireEvent.change(nameInput, { target: { value: 'My Household' } });
        fireEvent.click(screen.getByTestId('onboarding-create-submit-btn'));
        expect(mockCreateMutate).toHaveBeenCalledWith(
            { name: 'My Household' },
            expect.any(Object)
        );
    });

    // -------------------------------------------------------------------------
    // Join action
    // -------------------------------------------------------------------------

    test('"Join a Household" opens join dialog', async () => {
        mockHouseholds = [];
        renderPrompt();
        fireEvent.click(screen.getByTestId('onboarding-join-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('onboarding-join-dialog')).toBeInTheDocument();
        });
    });

    test('submitting join dialog calls useJoinHousehold', async () => {
        mockHouseholds = [];
        renderPrompt();
        fireEvent.click(screen.getByTestId('onboarding-join-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('onboarding-join-dialog')).toBeInTheDocument();
        });
        const idInput = screen.getByTestId('onboarding-join-id-input');
        fireEvent.change(idInput, { target: { value: 'hh-99' } });
        fireEvent.click(screen.getByTestId('onboarding-join-submit-btn'));
        expect(mockJoinMutate).toHaveBeenCalledWith('hh-99', expect.any(Object));
    });

    // -------------------------------------------------------------------------
    // Dismiss action
    // -------------------------------------------------------------------------

    test('"Maybe Later" dismisses the prompt and persists in localStorage', async () => {
        mockHouseholds = [];
        renderPrompt();
        expect(screen.getByTestId('household-onboarding-prompt')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('onboarding-dismiss-btn'));

        await waitFor(() => {
            expect(screen.queryByTestId('household-onboarding-prompt')).not.toBeInTheDocument();
        });
        expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    test('prompt does not reappear after dismissal', () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        mockHouseholds = [];
        renderPrompt();
        expect(screen.queryByTestId('household-onboarding-prompt')).not.toBeInTheDocument();
    });
});
