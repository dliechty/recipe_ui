import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { describe, it, expect, vi } from 'vitest';

describe('LoginPage', () => {
    it('allows user to login', async () => {
        // Mock window.location.href
        const locationMock = { href: 'http://localhost:3000/' };
        Object.defineProperty(window, 'location', {
            value: locationMock,
            writable: true,
        });

        render(<LoginPage />);

        // Fill in the form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
        });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // Verify redirection (or token storage)
        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('fake-jwt-token');
            expect(window.location.href).toBe('/');
        });
    });
});
