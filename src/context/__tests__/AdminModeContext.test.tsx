import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdminModeProvider, useAdminMode } from '../AdminModeContext';

// Mock useAuth so we can control the user returned
const mockUseAuth = vi.fn();

vi.mock('../AuthContext', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Helper component to expose context values
function TestConsumer() {
    const {
        adminModeActive,
        impersonatedUserId,
        setAdminMode,
        setImpersonatedUser,
        clearMode,
    } = useAdminMode();

    return (
        <div>
            <span data-testid="adminModeActive">{String(adminModeActive)}</span>
            <span data-testid="impersonatedUserId">{impersonatedUserId ?? 'null'}</span>
            <button onClick={() => setAdminMode(true)}>setAdminModeTrue</button>
            <button onClick={() => setAdminMode(false)}>setAdminModeFalse</button>
            <button onClick={() => setImpersonatedUser('test-uuid-1234')}>setImpersonated</button>
            <button onClick={() => clearMode()}>clearMode</button>
        </div>
    );
}

function renderWithAdminMode() {
    return render(
        <AdminModeProvider>
            <TestConsumer />
        </AdminModeProvider>
    );
}

describe('AdminModeContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('default state is { adminModeActive: false, impersonatedUserId: null }', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'admin-id', is_admin: true },
            isAuthenticated: true,
        });

        renderWithAdminMode();

        expect(screen.getByTestId('adminModeActive').textContent).toBe('false');
        expect(screen.getByTestId('impersonatedUserId').textContent).toBe('null');
    });

    it('setAdminMode(true) sets adminModeActive and persists to localStorage', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'admin-id', is_admin: true },
            isAuthenticated: true,
        });

        renderWithAdminMode();

        act(() => {
            screen.getByText('setAdminModeTrue').click();
        });

        expect(screen.getByTestId('adminModeActive').textContent).toBe('true');
        expect(localStorage.getItem('admin_mode_active')).toBe('true');
    });

    it('setImpersonatedUser(uuid) sets impersonatedUserId, clears adminMode, and persists to localStorage', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'admin-id', is_admin: true },
            isAuthenticated: true,
        });

        renderWithAdminMode();

        // First enable admin mode
        act(() => {
            screen.getByText('setAdminModeTrue').click();
        });

        expect(screen.getByTestId('adminModeActive').textContent).toBe('true');

        // Now set impersonated user - should clear adminMode
        act(() => {
            screen.getByText('setImpersonated').click();
        });

        expect(screen.getByTestId('impersonatedUserId').textContent).toBe('test-uuid-1234');
        expect(screen.getByTestId('adminModeActive').textContent).toBe('false');
        expect(localStorage.getItem('impersonated_user_id')).toBe('test-uuid-1234');
        expect(localStorage.getItem('admin_mode_active')).toBe('false');
    });

    it('clearMode() resets both flags and clears localStorage', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'admin-id', is_admin: true },
            isAuthenticated: true,
        });

        // Pre-populate localStorage
        localStorage.setItem('admin_mode_active', 'true');
        localStorage.setItem('impersonated_user_id', 'some-uuid');

        renderWithAdminMode();

        act(() => {
            screen.getByText('clearMode').click();
        });

        expect(screen.getByTestId('adminModeActive').textContent).toBe('false');
        expect(screen.getByTestId('impersonatedUserId').textContent).toBe('null');
        expect(localStorage.getItem('admin_mode_active')).toBeNull();
        expect(localStorage.getItem('impersonated_user_id')).toBeNull();
    });

    it('non-admin user cannot activate admin mode', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'user-id', is_admin: false },
            isAuthenticated: true,
        });

        renderWithAdminMode();

        act(() => {
            screen.getByText('setAdminModeTrue').click();
        });

        // Admin mode should NOT be set since user is not admin
        expect(screen.getByTestId('adminModeActive').textContent).toBe('false');
        expect(localStorage.getItem('admin_mode_active')).toBeNull();
    });

    it('non-admin user cannot set impersonated user', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'user-id', is_admin: false },
            isAuthenticated: true,
        });

        renderWithAdminMode();

        act(() => {
            screen.getByText('setImpersonated').click();
        });

        expect(screen.getByTestId('impersonatedUserId').textContent).toBe('null');
        expect(localStorage.getItem('impersonated_user_id')).toBeNull();
    });

    it('clears admin mode state when user becomes null (logout)', () => {
        // Start as admin with active mode
        mockUseAuth.mockReturnValue({
            user: { id: 'admin-id', is_admin: true },
            isAuthenticated: true,
        });

        localStorage.setItem('admin_mode_active', 'true');
        localStorage.setItem('impersonated_user_id', 'some-uuid');

        const { rerender } = render(
            <AdminModeProvider>
                <TestConsumer />
            </AdminModeProvider>
        );

        // Simulate logout - user becomes null
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
        });

        rerender(
            <AdminModeProvider>
                <TestConsumer />
            </AdminModeProvider>
        );

        expect(screen.getByTestId('adminModeActive').textContent).toBe('false');
        expect(screen.getByTestId('impersonatedUserId').textContent).toBe('null');
    });
});
