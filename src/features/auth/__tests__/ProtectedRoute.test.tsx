import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../../../context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock useAuth correctly
const mockUseAuth = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if no token', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/" element={<div>Login Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children if token exists', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'test@example.com', is_admin: false, is_first_login: false }
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to change-password if is_first_login is true', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'test@example.com', is_admin: false, is_first_login: true }
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/change-password" element={<div>Change Password Page</div>} />
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Change Password Page')).toBeInTheDocument();
    });

    it('redirects non-admin user when requireAdmin is true', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', is_admin: false, is_first_login: false }
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/recipes" element={<div>Recipes Page</div>} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Recipes Page')).toBeInTheDocument();
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('renders admin content when user is admin and requireAdmin is true', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '2', email: 'admin@example.com', is_admin: true, is_first_login: false }
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
});
