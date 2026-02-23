import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HouseholdProvider, useHouseholdContext } from '../HouseholdContext';
import { AdminModeContext } from '../AdminModeContext';

// Mock useAuth so we can control the user returned
const mockUseAuth = vi.fn();

vi.mock('../AuthContext', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock HouseholdsService
const mockListHouseholds = vi.fn();
const mockListMembers = vi.fn();

vi.mock('../../client', () => ({
    HouseholdsService: {
        listHouseholdsHouseholdsGet: () => mockListHouseholds(),
        listMembersHouseholdsHouseholdIdMembersGet: () => mockListMembers(),
    },
    OpenAPI: {
        HEADERS: undefined,
        TOKEN: undefined,
        BASE: 'http://localhost:8000',
    },
}));

const STORAGE_KEY = 'active_household_id';

// Helper component to expose context values
function TestConsumer() {
    const {
        activeHouseholdId,
        setActiveHousehold,
        primaryHouseholdId,
        households,
    } = useHouseholdContext();

    return (
        <div>
            <span data-testid="activeHouseholdId">{activeHouseholdId ?? 'null'}</span>
            <span data-testid="primaryHouseholdId">{primaryHouseholdId ?? 'null'}</span>
            <span data-testid="householdCount">{households.length}</span>
            <button onClick={() => setActiveHousehold('hh2')}>setActive-hh2</button>
            <button onClick={() => setActiveHousehold(null)}>clearActive</button>
        </div>
    );
}

const mockHouseholds = [
    { id: 'hh1', name: 'Smith Family', created_by: 'user-1', created_at: '', updated_at: '' },
    { id: 'hh2', name: 'Johnson Household', created_by: 'user-2', created_at: '', updated_at: '' },
];

function makeAdminModeValue(impersonatedUserId: string | null = null) {
    return {
        adminModeActive: false,
        impersonatedUserId,
        setAdminMode: vi.fn(),
        setImpersonatedUser: vi.fn(),
        clearMode: vi.fn(),
    };
}

function renderWithHousehold(impersonatedUserId: string | null = null) {
    return render(
        <AdminModeContext.Provider value={makeAdminModeValue(impersonatedUserId)}>
            <HouseholdProvider>
                <TestConsumer />
            </HouseholdProvider>
        </AdminModeContext.Provider>
    );
}

describe('HouseholdContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Default: no user
        mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false });

        // Default: households service returns empty
        mockListHouseholds.mockResolvedValue([]);
        mockListMembers.mockResolvedValue([]);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('default state when no user: activeHouseholdId is null, households is empty', async () => {
        renderWithHousehold();

        await waitFor(() => {
            expect(screen.getByTestId('activeHouseholdId').textContent).toBe('null');
            expect(screen.getByTestId('primaryHouseholdId').textContent).toBe('null');
            expect(screen.getByTestId('householdCount').textContent).toBe('0');
        });
    });

    it('setActiveHousehold(id) updates activeHouseholdId and persists to localStorage', async () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'user-1', is_admin: false },
            isAuthenticated: true,
        });
        mockListHouseholds.mockResolvedValue(mockHouseholds);
        mockListMembers.mockResolvedValue([
            { id: 'm1', user_id: 'user-1', user: { id: 'user-1' }, is_primary: false, joined_at: '' },
        ]);

        renderWithHousehold();

        await waitFor(() => {
            expect(screen.getByTestId('householdCount').textContent).toBe('2');
        });

        act(() => {
            screen.getByText('setActive-hh2').click();
        });

        expect(screen.getByTestId('activeHouseholdId').textContent).toBe('hh2');
        expect(localStorage.getItem(STORAGE_KEY)).toBe('hh2');
    });

    it('setActiveHousehold(null) clears activeHouseholdId and removes from localStorage', async () => {
        localStorage.setItem(STORAGE_KEY, 'hh1');

        mockUseAuth.mockReturnValue({
            user: { id: 'user-1', is_admin: false },
            isAuthenticated: true,
        });
        mockListHouseholds.mockResolvedValue(mockHouseholds);
        mockListMembers.mockResolvedValue([
            { id: 'm1', user_id: 'user-1', user: { id: 'user-1' }, is_primary: false, joined_at: '' },
        ]);

        renderWithHousehold();

        await waitFor(() => {
            expect(screen.getByTestId('householdCount').textContent).toBe('2');
        });

        act(() => {
            screen.getByText('clearActive').click();
        });

        expect(screen.getByTestId('activeHouseholdId').textContent).toBe('null');
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('persists activeHouseholdId from localStorage on initialization', async () => {
        localStorage.setItem(STORAGE_KEY, 'hh2');

        mockUseAuth.mockReturnValue({
            user: { id: 'user-1', is_admin: false },
            isAuthenticated: true,
        });
        mockListHouseholds.mockResolvedValue(mockHouseholds);
        mockListMembers.mockResolvedValue([
            { id: 'm1', user_id: 'user-1', user: { id: 'user-1' }, is_primary: false, joined_at: '' },
        ]);

        renderWithHousehold();

        // Should restore from localStorage and keep hh2 since it's valid
        await waitFor(() => {
            expect(screen.getByTestId('activeHouseholdId').textContent).toBe('hh2');
        });
    });

    it('auto-activates primary household on initialization when no stored value', async () => {
        // No stored value
        mockUseAuth.mockReturnValue({
            user: { id: 'user-1', is_admin: false },
            isAuthenticated: true,
        });
        mockListHouseholds.mockResolvedValue(mockHouseholds);

        // Make user-1 the primary member of hh1
        mockListMembers.mockImplementation(() => {
            return Promise.resolve([
                { id: 'm1', user_id: 'user-1', user: { id: 'user-1' }, is_primary: true, joined_at: '' },
            ]);
        });

        renderWithHousehold();

        await waitFor(() => {
            expect(screen.getByTestId('activeHouseholdId').textContent).toBe('hh1');
            expect(screen.getByTestId('primaryHouseholdId').textContent).toBe('hh1');
        });
    });

    it('clears active household on logout (user transitions from non-null to null)', async () => {
        localStorage.setItem(STORAGE_KEY, 'hh1');

        mockUseAuth.mockReturnValue({
            user: { id: 'user-1', is_admin: false },
            isAuthenticated: true,
        });
        mockListHouseholds.mockResolvedValue(mockHouseholds);
        mockListMembers.mockResolvedValue([
            { id: 'm1', user_id: 'user-1', user: { id: 'user-1' }, is_primary: true, joined_at: '' },
        ]);

        const { rerender } = render(
            <AdminModeContext.Provider value={makeAdminModeValue(null)}>
                <HouseholdProvider>
                    <TestConsumer />
                </HouseholdProvider>
            </AdminModeContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('householdCount').textContent).toBe('2');
        });

        // Simulate logout - user becomes null
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
        });

        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(null)}>
                <HouseholdProvider>
                    <TestConsumer />
                </HouseholdProvider>
            </AdminModeContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('activeHouseholdId').textContent).toBe('null');
            expect(screen.getByTestId('householdCount').textContent).toBe('0');
        });

        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('clears active household when impersonation changes', async () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'admin-id', is_admin: true },
            isAuthenticated: true,
        });
        mockListHouseholds.mockResolvedValue(mockHouseholds);
        mockListMembers.mockResolvedValue([
            { id: 'm1', user_id: 'admin-id', user: { id: 'admin-id' }, is_primary: true, joined_at: '' },
        ]);

        const { rerender } = render(
            <AdminModeContext.Provider value={makeAdminModeValue(null)}>
                <HouseholdProvider>
                    <TestConsumer />
                </HouseholdProvider>
            </AdminModeContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('householdCount').textContent).toBe('2');
        });

        // Start impersonating a different user — different households
        mockListHouseholds.mockResolvedValue([]);
        mockListMembers.mockResolvedValue([]);

        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue('other-user-id')}>
                <HouseholdProvider>
                    <TestConsumer />
                </HouseholdProvider>
            </AdminModeContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('activeHouseholdId').textContent).toBe('null');
        });
    });

    it('useHouseholdContext throws when used outside provider', () => {
        // Suppress the expected React error boundary output
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        function BadComponent() {
            useHouseholdContext();
            return null;
        }

        expect(() => render(<BadComponent />)).toThrow(
            'useHouseholdContext must be used within a HouseholdProvider'
        );

        consoleSpy.mockRestore();
    });
});
