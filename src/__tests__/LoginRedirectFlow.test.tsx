import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppRoutes from '../AppRoutes';
import { AuthProvider } from '../context/AuthContext';
import { AuthenticationService } from '../client';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../theme';

// Mock AdminModeIndicator to avoid needing AdminModeProvider in these tests
vi.mock('../features/admin/components/AdminModeIndicator', () => ({
    default: () => null,
}));

// Mock HouseholdContext to avoid needing HouseholdProvider in these tests
vi.mock('../context/HouseholdContext', () => ({
    useHouseholdContext: () => ({
        activeHouseholdId: null,
        setActiveHousehold: vi.fn(),
        primaryHouseholdId: null,
        households: [],
    }),
}));

// Mock HouseholdDrawer to avoid needing HouseholdContext setup
vi.mock('../features/households/components/HouseholdDrawer', () => ({
    default: () => null,
}));

// Mock the lazy loaded components to identify them easily
vi.mock('../features/recipes/components/RecipeList', () => ({
    default: () => <div data-testid="recipe-list">Recipe List Page</div>
}));

vi.mock('../features/recipes/components/RecipeDetails', () => ({
    default: () => <div data-testid="recipe-details">Recipe Details Page</div>
}));

vi.mock('../features/meals/pages/MealsPage', async () => {
    const { Outlet } = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        default: () => <div data-testid="meals-page"><Outlet /></div>
    };
});

vi.mock('../features/meals/components/UpcomingMeals', () => ({
    default: () => <div data-testid="upcoming-meals">Upcoming Meals Page</div>
}));

vi.mock('../features/meals/components/MealList', () => ({
    default: () => <div data-testid="meal-list">Meal List Page</div>
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
        // Setup mocks
        vi.mocked(AuthenticationService.loginAuthTokenPost).mockResolvedValue({
            access_token: 'header.eyJzdWIiOiAiMSJ9.signature',
            token_type: 'bearer'
        });
        vi.mocked(AuthenticationService.getUserNameAuthUsersUserIdGet).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            is_admin: false,
            is_first_login: false
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

    it('redirects to meals by default if no prior location', async () => {
        // Setup mocks
        // Setup mocks
        vi.mocked(AuthenticationService.loginAuthTokenPost).mockResolvedValue({
            access_token: 'header.eyJzdWIiOiAiMSJ9.signature',
            token_type: 'bearer'
        });
        vi.mocked(AuthenticationService.getUserNameAuthUsersUserIdGet).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            is_admin: false,
            is_first_login: false
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

        // 3. Verify Redirection to Default (now /meals → UpcomingMeals)
        await waitFor(() => {
            const upcoming = screen.queryByTestId('upcoming-meals');
            expect(upcoming).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
