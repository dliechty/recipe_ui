import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../test-utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AccountHouseholdSection from '../AccountHouseholdSection';
import { Household, HouseholdMember, UserPublic } from '../../../../client';

// ---------------------------------------------------------------------------
// Mock hooks
// ---------------------------------------------------------------------------

const mockSetPrimaryMutate = vi.fn();
const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockJoinMutate = vi.fn();
const mockLeaveMutate = vi.fn();
const mockRemoveMemberMutate = vi.fn();

interface MockHouseholdMembersMap {
    [householdId: string]: HouseholdMember[];
}

let mockHouseholds: Household[] = [];
let mockMembersMap: MockHouseholdMembersMap = {};
let mockPrimaryHouseholdId: string | null = null;
let mockCurrentUserId = 'user-1';

vi.mock('../../../../hooks/useHouseholds', () => ({
    useHouseholds: () => ({
        data: mockHouseholds,
        isLoading: false,
    }),
    useHouseholdMembers: (id: string) => ({
        data: mockMembersMap[id] ?? [],
        isLoading: false,
    }),
    useCreateHousehold: () => ({
        mutate: mockCreateMutate,
        isPending: false,
    }),
    useUpdateHousehold: () => ({
        mutate: mockUpdateMutate,
        isPending: false,
    }),
    useDeleteHousehold: () => ({
        mutate: mockDeleteMutate,
        isPending: false,
    }),
    useJoinHousehold: () => ({
        mutate: mockJoinMutate,
        isPending: false,
    }),
    useLeaveHousehold: () => ({
        mutate: mockLeaveMutate,
        isPending: false,
    }),
    useRemoveHouseholdMember: () => ({
        mutate: mockRemoveMemberMutate,
        isPending: false,
    }),
    useSetPrimaryHousehold: () => ({
        mutate: mockSetPrimaryMutate,
        isPending: false,
    }),
}));

vi.mock('../../../../context/HouseholdContext', () => ({
    useHouseholdContext: () => ({
        activeHouseholdId: null,
        setActiveHousehold: vi.fn(),
        primaryHouseholdId: mockPrimaryHouseholdId,
        households: mockHouseholds,
    }),
}));

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: mockCurrentUserId,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            is_admin: false,
            is_first_login: false,
        },
        token: 'test-token',
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
    }),
}));

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const user1: UserPublic = {
    id: 'user-1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
};

const user2: UserPublic = {
    id: 'user-2',
    email: 'other@example.com',
    first_name: 'Other',
    last_name: 'Member',
};

const household1: Household = {
    id: 'hh-1',
    name: 'Smith Family',
    created_by: 'user-1', // current user is creator
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

const household2: Household = {
    id: 'hh-2',
    name: 'Weekend House',
    created_by: 'user-2', // current user is NOT the creator
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
};

const member1: HouseholdMember = {
    id: 'mem-1',
    user_id: 'user-1',
    user: user1,
    is_primary: false,
    joined_at: '2024-01-01T00:00:00Z',
};

const member2: HouseholdMember = {
    id: 'mem-2',
    user_id: 'user-2',
    user: user2,
    is_primary: false,
    joined_at: '2024-01-02T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderSection() {
    return renderWithProviders(
        <MemoryRouter>
            <AccountHouseholdSection />
        </MemoryRouter>
    );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AccountHouseholdSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCurrentUserId = 'user-1';
        mockHouseholds = [household1, household2];
        mockMembersMap = {
            'hh-1': [member1, member2],
            'hh-2': [member1, member2],
        };
        mockPrimaryHouseholdId = null;
    });

    // -------------------------------------------------------------------------
    // Basic rendering
    // -------------------------------------------------------------------------

    test('renders "My Households" section heading', () => {
        renderSection();
        expect(screen.getByText('My Households')).toBeInTheDocument();
    });

    test('lists household names', () => {
        renderSection();
        expect(screen.getByText('Smith Family')).toBeInTheDocument();
        expect(screen.getByText('Weekend House')).toBeInTheDocument();
    });

    test('displays member count for each household', () => {
        renderSection();
        // hh-1 has 2 members, hh-2 has 2 members
        const memberCounts = screen.getAllByText(/2 member/i);
        expect(memberCounts.length).toBeGreaterThanOrEqual(2);
    });

    test('displays "Creator" role badge for households user created', () => {
        renderSection();
        expect(screen.getByTestId('role-badge-hh-1')).toHaveTextContent('Creator');
    });

    test('displays "Member" role badge for households user did not create', () => {
        renderSection();
        expect(screen.getByTestId('role-badge-hh-2')).toHaveTextContent('Member');
    });

    test('displays "Primary" badge when household is primary', () => {
        mockPrimaryHouseholdId = 'hh-1';
        renderSection();
        expect(screen.getByTestId('primary-badge-hh-1')).toBeInTheDocument();
    });

    test('does not display "Primary" badge when household is not primary', () => {
        mockPrimaryHouseholdId = null;
        renderSection();
        expect(screen.queryByTestId('primary-badge-hh-1')).not.toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Set / Unset Primary
    // -------------------------------------------------------------------------

    test('"Set as Primary" button calls useSetPrimaryHousehold with household id', () => {
        mockPrimaryHouseholdId = null;
        renderSection();
        const setPrimaryBtn = screen.getByTestId('set-primary-btn-hh-1');
        fireEvent.click(setPrimaryBtn);
        expect(mockSetPrimaryMutate).toHaveBeenCalledWith({ household_id: 'hh-1' });
    });

    test('"Unset as Primary" button calls useSetPrimaryHousehold with null when already primary', () => {
        mockPrimaryHouseholdId = 'hh-1';
        renderSection();
        const unsetPrimaryBtn = screen.getByTestId('set-primary-btn-hh-1');
        fireEvent.click(unsetPrimaryBtn);
        expect(mockSetPrimaryMutate).toHaveBeenCalledWith({ household_id: null });
    });

    test('"Set as Primary" button shows "Unset Primary" text when household is primary', () => {
        mockPrimaryHouseholdId = 'hh-1';
        renderSection();
        expect(screen.getByTestId('set-primary-btn-hh-1')).toHaveTextContent(/Unset Primary/i);
    });

    test('"Set as Primary" button shows "Set Primary" text when household is not primary', () => {
        mockPrimaryHouseholdId = null;
        renderSection();
        expect(screen.getByTestId('set-primary-btn-hh-1')).toHaveTextContent(/Set Primary/i);
    });

    // -------------------------------------------------------------------------
    // Leave with confirmation
    // -------------------------------------------------------------------------

    test('"Leave" button is present for each household', () => {
        renderSection();
        expect(screen.getByTestId('leave-btn-hh-1')).toBeInTheDocument();
        expect(screen.getByTestId('leave-btn-hh-2')).toBeInTheDocument();
    });

    test('clicking "Leave" shows confirmation dialog', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('leave-btn-hh-1'));
        await waitFor(() => {
            expect(screen.getByTestId('leave-confirm-dialog')).toBeInTheDocument();
        });
    });

    test('confirming "Leave" calls useLeaveHousehold with household id', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('leave-btn-hh-1'));
        await waitFor(() => {
            expect(screen.getByTestId('leave-confirm-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('leave-confirm-btn'));
        expect(mockLeaveMutate).toHaveBeenCalledWith('hh-1');
    });

    test('cancelling "Leave" dialog does not call useLeaveHousehold', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('leave-btn-hh-1'));
        await waitFor(() => {
            expect(screen.getByTestId('leave-confirm-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('leave-cancel-btn'));
        expect(mockLeaveMutate).not.toHaveBeenCalled();
        expect(screen.queryByTestId('leave-confirm-dialog')).not.toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Rename (creator only)
    // -------------------------------------------------------------------------

    test('"Rename" input is visible for households user created', () => {
        renderSection();
        expect(screen.getByTestId('rename-input-hh-1')).toBeInTheDocument();
    });

    test('"Rename" input is NOT visible for households user did not create', () => {
        renderSection();
        expect(screen.queryByTestId('rename-input-hh-2')).not.toBeInTheDocument();
    });

    test('submitting rename calls useUpdateHousehold with new name', async () => {
        renderSection();
        const renameInput = screen.getByTestId('rename-input-hh-1');
        fireEvent.change(renameInput, { target: { value: 'New Name' } });
        fireEvent.click(screen.getByTestId('rename-submit-btn-hh-1'));
        expect(mockUpdateMutate).toHaveBeenCalledWith({
            id: 'hh-1',
            requestBody: { name: 'New Name' },
        });
    });

    // -------------------------------------------------------------------------
    // Delete (creator only) with confirmation
    // -------------------------------------------------------------------------

    test('"Delete" button is visible for households user created', () => {
        renderSection();
        expect(screen.getByTestId('delete-btn-hh-1')).toBeInTheDocument();
    });

    test('"Delete" button is NOT visible for households user did not create', () => {
        renderSection();
        expect(screen.queryByTestId('delete-btn-hh-2')).not.toBeInTheDocument();
    });

    test('clicking "Delete" shows confirmation dialog', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('delete-btn-hh-1'));
        await waitFor(() => {
            expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument();
        });
    });

    test('confirming "Delete" calls useDeleteHousehold with household id', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('delete-btn-hh-1'));
        await waitFor(() => {
            expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('delete-confirm-btn'));
        expect(mockDeleteMutate).toHaveBeenCalledWith('hh-1');
    });

    test('cancelling "Delete" dialog does not call useDeleteHousehold', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('delete-btn-hh-1'));
        await waitFor(() => {
            expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('delete-cancel-btn'));
        expect(mockDeleteMutate).not.toHaveBeenCalled();
        expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Manage Members expansion
    // -------------------------------------------------------------------------

    test('"Manage Members" button is present for each household', () => {
        renderSection();
        expect(screen.getByTestId('manage-members-btn-hh-1')).toBeInTheDocument();
        expect(screen.getByTestId('manage-members-btn-hh-2')).toBeInTheDocument();
    });

    test('clicking "Manage Members" expands member list', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('manage-members-btn-hh-1'));
        await waitFor(() => {
            expect(screen.getByTestId('member-list-hh-1')).toBeInTheDocument();
        });
    });

    test('member list shows member names or emails', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('manage-members-btn-hh-1'));
        await waitFor(() => {
            const memberList = screen.getByTestId('member-list-hh-1');
            expect(memberList).toBeInTheDocument();
            // Members are user1 and user2
            expect(memberList).toHaveTextContent('Other');
        });
    });

    test('creator can remove a member from the expanded list', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('manage-members-btn-hh-1'));
        await waitFor(() => {
            expect(screen.getByTestId('member-list-hh-1')).toBeInTheDocument();
        });
        // Remove user-2 from hh-1
        fireEvent.click(screen.getByTestId('remove-member-btn-hh-1-user-2'));
        expect(mockRemoveMemberMutate).toHaveBeenCalledWith({
            householdId: 'hh-1',
            userId: 'user-2',
        });
    });

    test('non-creator does not see remove buttons in member list', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('manage-members-btn-hh-2'));
        await waitFor(() => {
            expect(screen.getByTestId('member-list-hh-2')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('remove-member-btn-hh-2-user-1')).not.toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Create Household
    // -------------------------------------------------------------------------

    test('"Create Household" button is present', () => {
        renderSection();
        expect(screen.getByTestId('create-household-btn')).toBeInTheDocument();
    });

    test('clicking "Create Household" opens create dialog', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('create-household-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('create-household-dialog')).toBeInTheDocument();
        });
    });

    test('submitting create dialog calls useCreateHousehold with name', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('create-household-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('create-household-dialog')).toBeInTheDocument();
        });
        const nameInput = screen.getByTestId('create-household-name-input');
        fireEvent.change(nameInput, { target: { value: 'New Household' } });
        fireEvent.click(screen.getByTestId('create-household-submit-btn'));
        expect(mockCreateMutate).toHaveBeenCalledWith(
            { name: 'New Household' },
            expect.any(Object)
        );
    });

    test('cancelling create dialog closes it without creating', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('create-household-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('create-household-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('create-household-cancel-btn'));
        expect(screen.queryByTestId('create-household-dialog')).not.toBeInTheDocument();
        expect(mockCreateMutate).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // Join Household
    // -------------------------------------------------------------------------

    test('"Join Household" button is present', () => {
        renderSection();
        expect(screen.getByTestId('join-household-btn')).toBeInTheDocument();
    });

    test('clicking "Join Household" opens join dialog', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('join-household-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('join-household-dialog')).toBeInTheDocument();
        });
    });

    test('submitting join dialog calls useJoinHousehold with household id', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('join-household-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('join-household-dialog')).toBeInTheDocument();
        });
        const idInput = screen.getByTestId('join-household-id-input');
        fireEvent.change(idInput, { target: { value: 'hh-99' } });
        fireEvent.click(screen.getByTestId('join-household-submit-btn'));
        expect(mockJoinMutate).toHaveBeenCalledWith('hh-99', expect.any(Object));
    });

    test('cancelling join dialog closes it without joining', async () => {
        renderSection();
        fireEvent.click(screen.getByTestId('join-household-btn'));
        await waitFor(() => {
            expect(screen.getByTestId('join-household-dialog')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByTestId('join-household-cancel-btn'));
        expect(screen.queryByTestId('join-household-dialog')).not.toBeInTheDocument();
        expect(mockJoinMutate).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // Empty state
    // -------------------------------------------------------------------------

    test('shows empty state message when no households', () => {
        mockHouseholds = [];
        renderSection();
        expect(screen.getByTestId('no-households-message')).toBeInTheDocument();
    });
});
