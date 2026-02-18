import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAPI } from '../../client';
import type { UserPublic } from '../../client';
import { AdminModeContext } from '../AdminModeContext';
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

// Helper to wrap HeaderInjector with a controlled AdminModeContext value
function renderWithAdminMode(
    user: UserPublic | null,
    adminModeActive: boolean,
    impersonatedUserId: string | null,
) {
    const contextValue = {
        adminModeActive,
        impersonatedUserId,
        setAdminMode: vi.fn(),
        setImpersonatedUser: vi.fn(),
        clearMode: vi.fn(),
    };

    return render(
        <AdminModeContext.Provider value={contextValue}>
            <HeaderInjector user={user} />
        </AdminModeContext.Provider>
    );
}

describe('Header Injection (AuthContext reads AdminModeContext)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        OpenAPI.HEADERS = undefined;
    });

    afterEach(() => {
        OpenAPI.HEADERS = undefined;
        localStorage.clear();
    });

    it('when adminModeActive is true, OpenAPI.HEADERS includes X-Admin-Mode: true', async () => {
        renderWithAdminMode(adminUser, true, null);

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Admin-Mode']).toBe('true');
        expect(headers?.['X-Act-As-User']).toBeUndefined();
    });

    it('when impersonatedUserId is set, OpenAPI.HEADERS includes X-Act-As-User: <uuid>', async () => {
        renderWithAdminMode(adminUser, false, 'target-user-uuid');

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Act-As-User']).toBe('target-user-uuid');
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
    });

    it('when both adminModeActive and impersonatedUserId are set, only X-Act-As-User is included', async () => {
        renderWithAdminMode(adminUser, true, 'target-user-uuid');

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers).toBeDefined();
        expect(headers?.['X-Act-As-User']).toBe('target-user-uuid');
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
    });

    it('when in default mode, no custom headers are added', async () => {
        renderWithAdminMode(adminUser, false, null);

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
        expect(headers?.['X-Act-As-User']).toBeUndefined();
    });

    it('non-admin user never has custom headers added', async () => {
        // Even if admin mode context has active values, non-admin user means no headers
        renderWithAdminMode(regularUser, true, 'some-uuid');

        await act(async () => {});

        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
        expect(headers?.['X-Act-As-User']).toBeUndefined();
    });
});
