import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
        localStorage.clear();
        sessionStorage.clear();
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

        // Verify token storage - "Remember me" is checked by default so token goes to localStorage
        await waitFor(() => {
            const token = localStorage.getItem('token');
            expect(token).not.toBeNull();
            expect(token).toContain('fake-signature');
            expect(localStorage.getItem('rememberMe')).toBe('true');
            expect(localStorage.getItem('sessionExpiry')).not.toBeNull();
            // Check navigation default
            expect(mockNavigate).toHaveBeenCalledWith('/meals', { replace: true });
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

    it('stores token in sessionStorage when Remember Me is unchecked', async () => {
        const user = userEvent.setup();

        render(
            <ChakraProvider value={system}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        );

        // Uncheck "Remember me"
        const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i, hidden: true });
        await act(async () => {
            await user.click(rememberCheckbox);
        });

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
            // Token should be in sessionStorage, not localStorage
            expect(sessionStorage.getItem('token')).not.toBeNull();
            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('sessionExpiry')).toBeNull();
            expect(mockNavigate).toHaveBeenCalledWith('/meals', { replace: true });
        });
    });

    it('shows Remember Me checkbox checked by default', () => {
        render(
            <ChakraProvider value={system}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        );

        const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i, hidden: true });
        expect(rememberCheckbox).toBeChecked();
    });
});
