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
});
