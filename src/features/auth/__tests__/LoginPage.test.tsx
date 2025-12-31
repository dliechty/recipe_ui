import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import LoginPage from '../components/LoginPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { system } from '../../../theme';

const mockNavigate = vi.fn();

// Mock useLocation to be dynamic
let mockLocationState = {};

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({
            state: mockLocationState
        }),
    };
});


describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocationState = {};
    });

    it('allows user to login', async () => {
        render(
            <ChakraProvider value={system}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        );

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
        });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // Verify token storage - using internal state update mechanism via AuthContext
        // We can check localStorage since AuthContext writes to it
        await waitFor(() => {
            const token = localStorage.getItem('token');
            expect(token).not.toBeNull();
            expect(token).toContain('fake-signature');
            // Check navigation default
            expect(mockNavigate).toHaveBeenCalledWith('/recipes', { replace: true });
        });
    });

    it('redirects to original location after successful login', async () => {
        // Setup the "from" state
        mockLocationState = { from: { pathname: '/recipes/123' } };

        render(
            <ChakraProvider value={system}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        );

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
        });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/recipes/123', { replace: true });
        });
    });
});
