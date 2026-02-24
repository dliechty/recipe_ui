
import { renderWithProviders, screen } from '../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountPage from '../AccountPage';
import * as AuthContext from '../../../context/AuthContext';

// Mock dependencies
vi.mock('../../../../client');
vi.mock('../../../../toaster', () => ({
    toaster: {
        create: vi.fn(),
    },
}));

// Mock household hooks (needed by AccountHouseholdSection rendered inside AccountPage)
vi.mock('../../../hooks/useHouseholds', () => ({
    useHouseholds: () => ({ data: [], isLoading: false }),
    useHouseholdMembers: () => ({ data: [], isLoading: false }),
    useCreateHousehold: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateHousehold: () => ({ mutate: vi.fn(), isPending: false }),
    useDeleteHousehold: () => ({ mutate: vi.fn(), isPending: false }),
    useJoinHousehold: () => ({ mutate: vi.fn(), isPending: false }),
    useLeaveHousehold: () => ({ mutate: vi.fn(), isPending: false }),
    useRemoveHouseholdMember: () => ({ mutate: vi.fn(), isPending: false }),
    useSetPrimaryHousehold: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../../../context/HouseholdContext', () => ({
    useHouseholdContext: () => ({
        activeHouseholdId: null,
        setActiveHousehold: vi.fn(),
        primaryHouseholdId: null,
        households: [],
    }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('AccountPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('displays "Administrator" when user is an admin', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: {
                id: '123',
                email: 'admin@example.com',
                first_name: 'Admin',
                last_name: 'User',
                is_admin: true,
                is_first_login: false
            },
            token: 'valid-token',
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderWithProviders(
            <MemoryRouter>
                <AccountPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Account Type')).toBeInTheDocument();
        expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('displays "User" when user is not an admin', () => {
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            user: {
                id: '456',
                email: 'user@example.com',
                first_name: 'Regular',
                last_name: 'User',
                is_admin: false,
                is_first_login: false
            },
            token: 'valid-token',
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        renderWithProviders(
            <MemoryRouter>
                <AccountPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Account Type')).toBeInTheDocument();
        expect(screen.getByText('User')).toBeInTheDocument();
    });
});
