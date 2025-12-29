import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../theme';

// Mock useAuth
const mockUseAuth = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

const renderWithProvider = (ui: React.ReactNode) => {
    return render(
        <ChakraProvider value={system}>
            {ui}
        </ChakraProvider>
    );
};


// Mock child components to isolate Layout test if needed, but Layout mainly renders children and nav
// For this test we want to check the nav items which are part of Layout.
// NavLink requires Router context.

describe('Layout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders admin link for admin user', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'admin@example.com', is_admin: true },
            logout: vi.fn(),
        });

        renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Recipes')).toBeInTheDocument();
    });

    it('does not render admin link for non-admin user', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '2', email: 'user@example.com', is_admin: false },
            logout: vi.fn(),
        });

        renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        expect(screen.queryByText('Admin')).not.toBeInTheDocument();
        expect(screen.getByText('Recipes')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '2', email: 'user@example.com', is_admin: false },
            logout: vi.fn(),
        });

        renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
});
