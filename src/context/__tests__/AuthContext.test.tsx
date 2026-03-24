import React from 'react';
import { render, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { system } from '../../theme';

// Helper to build a fake JWT with a given payload
function fakeJwt(payload: Record<string, unknown>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.fake-signature`;
}

// Component that exposes auth state for testing
function AuthConsumer({ onRender }: { onRender: (auth: ReturnType<typeof useAuth>) => void }) {
    const auth = useAuth();
    onRender(auth);
    return <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>;
}

function renderWithProviders(ui: React.ReactElement) {
    return render(
        <ChakraProvider value={system}>
            <MemoryRouter>
                <AuthProvider>{ui}</AuthProvider>
            </MemoryRouter>
        </ChakraProvider>
    );
}

describe('AuthContext session persistence', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.restoreAllMocks();
    });

    it('restores token from localStorage when rememberMe is set', () => {
        const token = fakeJwt({ sub: 'user-1' });
        localStorage.setItem('token', token);
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('sessionExpiry', String(Date.now() + 1000 * 60 * 60));

        let captured: ReturnType<typeof useAuth> | null = null;
        renderWithProviders(<AuthConsumer onRender={(auth) => { captured = auth; }} />);

        expect(captured!.isAuthenticated).toBe(true);
        expect(captured!.token).toBe(token);
    });

    it('restores token from sessionStorage when rememberMe is false', () => {
        const token = fakeJwt({ sub: 'user-1' });
        sessionStorage.setItem('token', token);
        localStorage.setItem('rememberMe', 'false');

        let captured: ReturnType<typeof useAuth> | null = null;
        renderWithProviders(<AuthConsumer onRender={(auth) => { captured = auth; }} />);

        expect(captured!.isAuthenticated).toBe(true);
        expect(captured!.token).toBe(token);
    });

    it('clears expired session on load', () => {
        const token = fakeJwt({ sub: 'user-1' });
        localStorage.setItem('token', token);
        localStorage.setItem('rememberMe', 'true');
        // Expired 1 hour ago
        localStorage.setItem('sessionExpiry', String(Date.now() - 1000 * 60 * 60));

        let captured: ReturnType<typeof useAuth> | null = null;
        renderWithProviders(<AuthConsumer onRender={(auth) => { captured = auth; }} />);

        expect(captured!.isAuthenticated).toBe(false);
        expect(captured!.token).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('sessionExpiry')).toBeNull();
    });

    it('login with rememberMe=true stores in localStorage with expiry', () => {
        let captured: ReturnType<typeof useAuth> | null = null;
        renderWithProviders(<AuthConsumer onRender={(auth) => { captured = auth; }} />);

        const token = fakeJwt({ sub: 'user-1' });
        act(() => {
            captured!.login(token, true);
        });

        expect(localStorage.getItem('token')).toBe(token);
        expect(localStorage.getItem('rememberMe')).toBe('true');
        const expiry = Number(localStorage.getItem('sessionExpiry'));
        // Should be ~30 days from now (within a few seconds tolerance)
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        expect(expiry).toBeGreaterThan(Date.now() + thirtyDaysMs - 5000);
        expect(expiry).toBeLessThanOrEqual(Date.now() + thirtyDaysMs);
    });

    it('login with rememberMe=false stores in sessionStorage', () => {
        let captured: ReturnType<typeof useAuth> | null = null;
        renderWithProviders(<AuthConsumer onRender={(auth) => { captured = auth; }} />);

        const token = fakeJwt({ sub: 'user-1' });
        act(() => {
            captured!.login(token, false);
        });

        expect(sessionStorage.getItem('token')).toBe(token);
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('sessionExpiry')).toBeNull();
    });

    it('logout clears all storage', () => {
        const token = fakeJwt({ sub: 'user-1' });
        localStorage.setItem('token', token);
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('sessionExpiry', String(Date.now() + 1000 * 60 * 60));

        let captured: ReturnType<typeof useAuth> | null = null;
        renderWithProviders(<AuthConsumer onRender={(auth) => { captured = auth; }} />);

        act(() => {
            captured!.logout();
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('rememberMe')).toBeNull();
        expect(localStorage.getItem('sessionExpiry')).toBeNull();
        expect(sessionStorage.getItem('token')).toBeNull();
    });

    it('defaults rememberMe to true when not specified', () => {
        let captured: ReturnType<typeof useAuth> | null = null;
        renderWithProviders(<AuthConsumer onRender={(auth) => { captured = auth; }} />);

        const token = fakeJwt({ sub: 'user-1' });
        act(() => {
            captured!.login(token);
        });

        expect(localStorage.getItem('token')).toBe(token);
        expect(localStorage.getItem('rememberMe')).toBe('true');
    });
});
