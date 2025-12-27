import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import LoginPage from './LoginPage';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { describe, it, expect } from 'vitest';

import { system } from '../theme';

describe('LoginPage', () => {
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
            expect(localStorage.getItem('token')).toBe('fake-jwt-token');
            // We can't easily check actual URL change in MemoryRouter without inspecting history or checking for side effects
            // But checking token is enough to prove login succeeded.
            // A better test would use a real router or spy on useNavigate.
        });
    });
});
