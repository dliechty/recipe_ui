import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAPI } from '../../client';
import type { UserPublic } from '../../client';
import { AdminModeContext } from '../AdminModeContext';
import { HouseholdContext } from '../HouseholdContext';
import { HeaderInjector } from '../AuthContext';

const adminUser: UserPublic = {
    id: 'admin-id',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    is_admin: true,
    is_first_login: false,
};

const regularUser: UserPublic = {
    id: 'user-id',
    email: 'user@example.com',
    first_name: 'Regular',
    last_name: 'User',
    is_admin: false,
    is_first_login: false,
};

function makeAdminModeValue(adminModeActive: boolean, impersonatedUserId: string | null) {
    return {
        adminModeActive,
        impersonatedUserId,
        setAdminMode: vi.fn(),
        setImpersonatedUser: vi.fn(),
        clearMode: vi.fn(),
    };
}

function makeHouseholdValue(activeHouseholdId: string | null) {
    return {
        activeHouseholdId,
        setActiveHousehold: vi.fn(),
        primaryHouseholdId: null,
        households: [],
    };
}

// Helper to render HeaderInjector with controlled context values
function renderWithContexts(
    user: UserPublic | null,
    adminModeActive: boolean,
    impersonatedUserId: string | null,
    activeHouseholdId: string | null,
) {
    return render(
        <AdminModeContext.Provider value={makeAdminModeValue(adminModeActive, impersonatedUserId)}>
            <HouseholdContext.Provider value={makeHouseholdValue(activeHouseholdId)}>
                <HeaderInjector user={user} />
            </HouseholdContext.Provider>
        </AdminModeContext.Provider>
    );
}

describe('Header Injection with Household support', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        OpenAPI.HEADERS = undefined;
    });

    afterEach(() => {
        OpenAPI.HEADERS = undefined;
        localStorage.clear();
    });

    // --- X-Active-Household header ---

    it('sets X-Active-Household header when activeHouseholdId is set (regular user)', async () => {
        renderWithContexts(regularUser, false, null, 'hh-123');

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Active-Household']).toBe('hh-123');
    });

    it('omits X-Active-Household header when activeHouseholdId is null', async () => {
        renderWithContexts(regularUser, false, null, null);

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Active-Household']).toBeUndefined();
    });

    it('sets OpenAPI.HEADERS to undefined when no household and no admin headers', async () => {
        renderWithContexts(regularUser, false, null, null);

        await act(async () => {});

        expect(OpenAPI.HEADERS).toBeUndefined();
    });

    // --- Header merging: X-Active-Household + admin headers ---

    it('merges X-Active-Household with X-Admin-Mode when admin mode is active', async () => {
        renderWithContexts(adminUser, true, null, 'hh-456');

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Active-Household']).toBe('hh-456');
        expect(headers?.['X-Admin-Mode']).toBe('true');
        expect(headers?.['X-Act-As-User']).toBeUndefined();
    });

    it('merges X-Active-Household with X-Act-As-User when impersonating', async () => {
        renderWithContexts(adminUser, false, 'target-user-uuid', 'hh-789');

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Active-Household']).toBe('hh-789');
        expect(headers?.['X-Act-As-User']).toBe('target-user-uuid');
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
    });

    it('admin mode only (no household) — no X-Active-Household header', async () => {
        renderWithContexts(adminUser, true, null, null);

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Admin-Mode']).toBe('true');
        expect(headers?.['X-Active-Household']).toBeUndefined();
    });

    it('impersonation only (no household) — no X-Active-Household header', async () => {
        renderWithContexts(adminUser, false, 'target-user-uuid', null);

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Act-As-User']).toBe('target-user-uuid');
        expect(headers?.['X-Active-Household']).toBeUndefined();
    });

    // --- Existing tests still pass ---

    it('when adminModeActive is true, OpenAPI.HEADERS includes X-Admin-Mode: true', async () => {
        renderWithContexts(adminUser, true, null, null);

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Admin-Mode']).toBe('true');
        expect(headers?.['X-Act-As-User']).toBeUndefined();
    });

    it('when impersonatedUserId is set, OpenAPI.HEADERS includes X-Act-As-User: <uuid>', async () => {
        renderWithContexts(adminUser, false, 'target-user-uuid', null);

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Act-As-User']).toBe('target-user-uuid');
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
    });

    it('non-admin user with no household never has admin headers added', async () => {
        renderWithContexts(regularUser, true, 'some-uuid', null);

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
        expect(headers?.['X-Act-As-User']).toBeUndefined();
    });

    // --- Dynamic mode switching tests ---

    it('switching from admin mode to impersonation updates headers correctly', async () => {
        const { rerender } = render(
            <AdminModeContext.Provider value={makeAdminModeValue(true, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-100')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        // Verify admin mode + household headers
        let headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Admin-Mode']).toBe('true');
        expect(headers?.['X-Active-Household']).toBe('hh-100');
        expect(headers?.['X-Act-As-User']).toBeUndefined();

        // Switch to impersonation mode
        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(false, 'impersonated-user-1')}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-100')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Act-As-User']).toBe('impersonated-user-1');
        expect(headers?.['X-Active-Household']).toBe('hh-100');
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
    });

    it('switching from impersonation to default mode clears admin headers but keeps household', async () => {
        const { rerender } = render(
            <AdminModeContext.Provider value={makeAdminModeValue(false, 'impersonated-user-1')}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-200')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        let headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Act-As-User']).toBe('impersonated-user-1');
        expect(headers?.['X-Active-Household']).toBe('hh-200');

        // Switch to default mode (no admin, no impersonation)
        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(false, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-200')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Active-Household']).toBe('hh-200');
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
        expect(headers?.['X-Act-As-User']).toBeUndefined();
    });

    it('switching from default mode to admin mode adds X-Admin-Mode header', async () => {
        const { rerender } = render(
            <AdminModeContext.Provider value={makeAdminModeValue(false, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-300')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        let headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Active-Household']).toBe('hh-300');
        expect(headers?.['X-Admin-Mode']).toBeUndefined();

        // Switch to admin mode
        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(true, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-300')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Admin-Mode']).toBe('true');
        expect(headers?.['X-Active-Household']).toBe('hh-300');
    });

    it('switching household while in admin mode updates only X-Active-Household', async () => {
        const { rerender } = render(
            <AdminModeContext.Provider value={makeAdminModeValue(true, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-old')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        let headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Admin-Mode']).toBe('true');
        expect(headers?.['X-Active-Household']).toBe('hh-old');

        // Switch household
        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(true, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-new')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Admin-Mode']).toBe('true');
        expect(headers?.['X-Active-Household']).toBe('hh-new');
    });

    it('clearing household while impersonating removes only X-Active-Household', async () => {
        const { rerender } = render(
            <AdminModeContext.Provider value={makeAdminModeValue(false, 'user-abc')}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-999')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        let headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Act-As-User']).toBe('user-abc');
        expect(headers?.['X-Active-Household']).toBe('hh-999');

        // Clear household
        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(false, 'user-abc')}>
                <HouseholdContext.Provider value={makeHouseholdValue(null)}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});

        headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Act-As-User']).toBe('user-abc');
        expect(headers?.['X-Active-Household']).toBeUndefined();
    });

    it('full cycle: default -> admin -> impersonation -> default preserves correct headers', async () => {
        // Start in default mode with a household
        const { rerender } = render(
            <AdminModeContext.Provider value={makeAdminModeValue(false, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-cycle')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );

        await act(async () => {});
        let headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toEqual({ 'X-Active-Household': 'hh-cycle' });

        // Switch to admin mode
        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(true, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-cycle')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );
        await act(async () => {});
        headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toEqual({ 'X-Admin-Mode': 'true', 'X-Active-Household': 'hh-cycle' });

        // Switch to impersonation
        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(false, 'target-user')}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-cycle')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );
        await act(async () => {});
        headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toEqual({ 'X-Act-As-User': 'target-user', 'X-Active-Household': 'hh-cycle' });

        // Switch back to default
        rerender(
            <AdminModeContext.Provider value={makeAdminModeValue(false, null)}>
                <HouseholdContext.Provider value={makeHouseholdValue('hh-cycle')}>
                    <HeaderInjector user={adminUser} />
                </HouseholdContext.Provider>
            </AdminModeContext.Provider>
        );
        await act(async () => {});
        headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toEqual({ 'X-Active-Household': 'hh-cycle' });
    });
});
