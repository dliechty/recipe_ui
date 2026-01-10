import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppRoutes from '../AppRoutes';
import { AuthProvider } from '../context/AuthContext';
import { AuthenticationService } from '../client';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../theme';

// Mock the lazy loaded components to identify them easily
vi.mock('../features/recipes/components/RecipeList', () => ({
    default: () => <div data-testid="recipe-list">Recipe List Page</div>
}));

vi.mock('../features/recipes/components/RecipeDetails', () => ({
    default: () => <div data-testid="recipe-details">Recipe Details Page</div>
}));

// Mock the Auth Service
vi.mock('../client', async () => {
    return {
        AuthenticationService: {
            loginAuthTokenPost: vi.fn(),
            getUserNameAuthUsersUserIdGet: vi.fn(),
        },
        OpenAPI: {
            TOKEN: undefined
        }
    };
});

describe('Login Redirect Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('redirects to original protected route after login', async () => {
        // Setup mocks
        (AuthenticationService.loginAuthTokenPost as any).mockResolvedValue({
            access_token: 'header.eyJzdWIiOiAiMSJ9.signature'
        });
        (AuthenticationService.getUserNameAuthUsersUserIdGet as any).mockResolvedValue({
            id: 1,
            email: 'test@example.com'
        });

        render(
            <ChakraProvider value={system}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/recipes/1']}>
                        <AppRoutes />
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        );

        // 1. Should be redirected to login page because we start at /recipes/1 unauthenticated
        expect(await screen.findByRole('button', { name: /login/i })).toBeInTheDocument();
        // Check "Recipe Details" is NOT visible
        expect(screen.queryByText('Recipe Details')).not.toBeInTheDocument();

        // 2. Perform Login
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // 3. Verify Redirection
        await waitFor(() => {
            const details = screen.queryByTestId('recipe-details');
            expect(details).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('redirects to recipes by default if no prior location', async () => {
        // Setup mocks
        (AuthenticationService.loginAuthTokenPost as any).mockResolvedValue({
            access_token: 'header.eyJzdWIiOiAiMSJ9.signature'
        });
        (AuthenticationService.getUserNameAuthUsersUserIdGet as any).mockResolvedValue({
            id: 1,
            email: 'test@example.com'
        });

        render(
            <ChakraProvider value={system}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/']}>
                        <AppRoutes />
                    </MemoryRouter>
                </AuthProvider>
            </ChakraProvider>
        );

        // 1. Should be at login page
        expect(await screen.findByRole('button', { name: /login/i })).toBeInTheDocument();

        // 2. Perform Login
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // 3. Verify Redirection to Default
        await waitFor(() => {
            const list = screen.queryByTestId('recipe-list');
            expect(list).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
