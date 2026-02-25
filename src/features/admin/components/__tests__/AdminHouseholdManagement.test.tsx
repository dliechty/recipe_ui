import { renderWithProviders, screen, fireEvent, waitFor } from '../../../../test-utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import AdminHouseholdManagement from '../AdminHouseholdManagement';
import { Household, HouseholdMember, UserPublic } from '../../../../client';

// ---------------------------------------------------------------------------
// Mock hooks
// ---------------------------------------------------------------------------

const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockRemoveMemberMutate = vi.fn();

interface MockHouseholdMembersMap {
    [householdId: string]: HouseholdMember[];
}

let mockHouseholds: Household[] = [];
let mockMembersMap: MockHouseholdMembersMap = {};

const mockUseHouseholds = vi.fn();

vi.mock('../../../../hooks/useHouseholds', () => ({
    useHouseholds: (options?: { adminMode?: boolean }) => {
        mockUseHouseholds(options);
        return { data: mockHouseholds, isLoading: false };
    },
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
    useRemoveHouseholdMember: () => ({
        mutate: mockRemoveMemberMutate,
        isPending: false,
    }),
}));

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'admin-user',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            is_admin: true,
            is_first_login: false,
        },
        token: 'admin-token',
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
    }),
}));

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const mockUserData: Record<string, UserPublic> = {
    'user-1': { id: 'user-1', email: 'alice@example.com', first_name: 'Alice', last_name: 'Smith' },
    'user-2': { id: 'user-2', email: 'bob@example.com', first_name: 'Bob', last_name: 'Johnson' },
};

const household1: Household = {
    id: 'hh1',
    name: 'Smith Family',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

const household2: Household = {
    id: 'hh2',
    name: 'Johnson Household',
    created_by: 'user-2',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
};

const member1hh1: HouseholdMember = {
    id: 'mem-1',
    user_id: 'user-1',
    user: mockUserData['user-1'],
    is_primary: false,
    joined_at: '2024-01-01T00:00:00Z',
};

const member2hh1: HouseholdMember = {
    id: 'mem-2',
    user_id: 'user-2',
    user: mockUserData['user-2'],
    is_primary: false,
    joined_at: '2024-01-02T00:00:00Z',
};

const member2hh2: HouseholdMember = {
    id: 'mem-3',
    user_id: 'user-2',
    user: mockUserData['user-2'],
    is_primary: false,
    joined_at: '2024-02-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderComponent() {
    return renderWithProviders(<AdminHouseholdManagement />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdminHouseholdManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockHouseholds = [household1, household2];
        mockMembersMap = {
            hh1: [member1hh1, member2hh1],
            hh2: [member2hh2],
        };
    });

    // -------------------------------------------------------------------------
    // Table rendering
    // -------------------------------------------------------------------------

    test('renders household table with all households', () => {
        renderComponent();

        expect(screen.getByTestId('household-row-hh1')).toBeInTheDocument();
        expect(screen.getByTestId('household-row-hh2')).toBeInTheDocument();

        // Household names
        expect(screen.getByText('Smith Family')).toBeInTheDocument();
        expect(screen.getByText('Johnson Household')).toBeInTheDocument();

        // Creator names (alice@example.com or Alice Smith for hh1, bob for hh2)
        expect(screen.getByText(/alice/i)).toBeInTheDocument();
        expect(screen.getByText(/bob/i)).toBeInTheDocument();

        // Member counts: hh1 has 2, hh2 has 1
        const row1 = screen.getByTestId('household-row-hh1');
        expect(row1).toHaveTextContent('2');
        const row2 = screen.getByTestId('household-row-hh2');
        expect(row2).toHaveTextContent('1');

        // Created dates should appear (Jan 2024 and Feb 2024)
        expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // View Members
    // -------------------------------------------------------------------------

    test('shows member list when "View Members" is clicked', async () => {
        renderComponent();

        const viewMembersBtn = screen.getByTestId('view-members-btn-hh1');
        fireEvent.click(viewMembersBtn);

        await waitFor(() => {
            expect(screen.getByTestId('member-list-hh1')).toBeInTheDocument();
        });

        const memberList = screen.getByTestId('member-list-hh1');
        // hh1 has Alice Smith and Bob Johnson
        expect(memberList).toHaveTextContent(/Alice/i);
        expect(memberList).toHaveTextContent(/Bob/i);

        // Remove buttons should be present
        expect(screen.getByTestId('remove-member-btn-hh1-user-1')).toBeInTheDocument();
        expect(screen.getByTestId('remove-member-btn-hh1-user-2')).toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Remove member
    // -------------------------------------------------------------------------

    test('removes a member when "Remove" is clicked', async () => {
        renderComponent();

        const viewMembersBtn = screen.getByTestId('view-members-btn-hh1');
        fireEvent.click(viewMembersBtn);

        await waitFor(() => {
            expect(screen.getByTestId('member-list-hh1')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('remove-member-btn-hh1-user-2'));

        expect(mockRemoveMemberMutate).toHaveBeenCalledWith({
            householdId: 'hh1',
            userId: 'user-2',
        });
    });

    // -------------------------------------------------------------------------
    // Rename (inline edit)
    // -------------------------------------------------------------------------

    test('inline rename edits household name and calls useUpdateHousehold', () => {
        renderComponent();

        const renameInput = screen.getByTestId('rename-input-hh1');
        fireEvent.change(renameInput, { target: { value: 'New Family Name' } });
        fireEvent.click(screen.getByTestId('rename-submit-btn-hh1'));

        expect(mockUpdateMutate).toHaveBeenCalledWith({
            id: 'hh1',
            requestBody: { name: 'New Family Name' },
        });
    });

    // -------------------------------------------------------------------------
    // Delete with confirmation
    // -------------------------------------------------------------------------

    test('shows delete confirmation dialog when "Delete" is clicked', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('delete-btn-hh1'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument();
        });
    });

    test('calls useDeleteHousehold when deletion is confirmed', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('delete-btn-hh1'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('delete-confirm-btn'));

        expect(mockDeleteMutate).toHaveBeenCalledWith('hh1');
    });

    test('does not call useDeleteHousehold when deletion is cancelled', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('delete-btn-hh1'));

        await waitFor(() => {
            expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('delete-cancel-btn'));

        expect(mockDeleteMutate).not.toHaveBeenCalled();
        expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument();
    });

    // -------------------------------------------------------------------------
    // Create Household
    // -------------------------------------------------------------------------

    test('"Create Household" button is present', () => {
        renderComponent();
        expect(screen.getByTestId('create-household-btn')).toBeInTheDocument();
    });

    test('opens create household dialog when "Create Household" is clicked', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('create-household-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('create-household-dialog')).toBeInTheDocument();
        });
    });

    test('submitting create dialog calls useCreateHousehold with the entered name', async () => {
        renderComponent();

        fireEvent.click(screen.getByTestId('create-household-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('create-household-dialog')).toBeInTheDocument();
        });

        const nameInput = screen.getByTestId('create-household-name-input');
        fireEvent.change(nameInput, { target: { value: 'Brand New Household' } });
        fireEvent.click(screen.getByTestId('create-household-submit-btn'));

        expect(mockCreateMutate).toHaveBeenCalledWith(
            { name: 'Brand New Household' },
            expect.any(Object)
        );
    });

    // -------------------------------------------------------------------------
    // Admin mode — fetches all households
    // -------------------------------------------------------------------------

    test('uses admin mode (displays households from all users)', () => {
        // Both households belong to different users; admin sees both
        renderComponent();

        expect(screen.getByTestId('household-row-hh1')).toBeInTheDocument();
        expect(screen.getByTestId('household-row-hh2')).toBeInTheDocument();

        // Verify useHouseholds was called with adminMode: true so all households are fetched
        expect(mockUseHouseholds).toHaveBeenCalledWith({ adminMode: true });
    });
});
