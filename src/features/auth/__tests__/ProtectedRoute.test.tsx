import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
// import { useAuth } from '../../../context/AuthContext';
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

    it('passes location state when redirecting to login', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null });

        // We can't easily check the state passed to Navigate with screen.getByText
        // So we'll render a dummy login page that displays the location state
        const DummyLogin = () => {
            const location = useLocation();
            return (
                <div>
                    <h1>Login Page</h1>
                    <span data-testid="redirect-from">{location.state?.from?.pathname}</span>
                </div>
            );
        };

        render(
            <MemoryRouter initialEntries={['/protected/resource']}>
                <Routes>
                    <Route path="/" element={<DummyLogin />} />
                    <Route
                        path="/protected/resource"
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
        expect(screen.getByTestId('redirect-from')).toHaveTextContent('/protected/resource');
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
                    <Route path="/meals" element={<div>Meals Page</div>} />
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

        expect(screen.getByText('Meals Page')).toBeInTheDocument();
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
