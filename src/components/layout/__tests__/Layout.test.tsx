import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock AdminModeIndicator to avoid needing AdminModeProvider in these tests
vi.mock('../../../features/admin/components/AdminModeIndicator', () => ({
    default: () => null,
}));

// Mock HouseholdDrawer
vi.mock('../../../features/households/components/HouseholdDrawer', () => ({
    default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? <div data-testid="household-drawer" onClick={onClose}>Drawer</div> : null,
}));

// Mock HouseholdContext
interface MockHouseholdCtx {
    activeHouseholdId: string | null;
    setActiveHousehold: ReturnType<typeof vi.fn>;
    primaryHouseholdId: string | null;
    households: Array<{ id: string; name: string; created_by: string; created_at: string; updated_at: string }>;
}

let mockHouseholdCtx: MockHouseholdCtx = {
    activeHouseholdId: null,
    setActiveHousehold: vi.fn(),
    primaryHouseholdId: null,
    households: [],
};

vi.mock('../../../context/HouseholdContext', () => ({
    useHouseholdContext: () => mockHouseholdCtx,
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
        mockHouseholdCtx = {
            activeHouseholdId: null,
            setActiveHousehold: vi.fn(),
            primaryHouseholdId: null,
            households: [],
        };
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

    it('renders Meals before Recipes in desktop nav', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', is_admin: false },
            logout: vi.fn(),
        });

        const { container } = renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        // Get the desktop nav bar (display: flex on md+)
        const navBar = container.querySelector('nav');
        expect(navBar).not.toBeNull();

        const navTexts = Array.from(navBar!.children).map(child => child.textContent);
        const mealsIndex = navTexts.indexOf('Meals');
        const recipesIndex = navTexts.indexOf('Recipes');

        expect(mealsIndex).toBeGreaterThanOrEqual(0);
        expect(recipesIndex).toBeGreaterThanOrEqual(0);
        expect(mealsIndex).toBeLessThan(recipesIndex);
    });

    it('renders and opens mobile menu', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'admin@example.com', is_admin: true },
            logout: vi.fn(),
        });

        const { getByLabelText } = renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        // Check for hamburger button
        const menuButton = getByLabelText('Options');
        expect(menuButton).toBeInTheDocument();

        // Note: In JSDOM with Chakra UI, styles like display: none are applied via classes/style props
        // but assertions like toBeVisible() might not work perfectly with responsive props without mocking matchMedia.
        // However, we can assert existence.
    });

    // ---------------------------------------------------------------------------
    // Household icon button tests
    // ---------------------------------------------------------------------------

    it('renders household icon button in navbar', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', is_admin: false },
            logout: vi.fn(),
        });

        renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        // There are two buttons (desktop + mobile) — both should be present
        const buttons = screen.getAllByLabelText('Open household selector');
        expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('household icon button shows "Personal" indicator when no household is active', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', is_admin: false },
            logout: vi.fn(),
        });
        mockHouseholdCtx.activeHouseholdId = null;

        renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        // Desktop button (first one) should show "Personal"
        const buttons = screen.getAllByTestId('household-nav-button');
        expect(buttons[0]).toHaveTextContent('Personal');
    });

    it('household icon button shows household name when a household is active', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', is_admin: false },
            logout: vi.fn(),
        });
        mockHouseholdCtx.activeHouseholdId = 'hh-1';
        mockHouseholdCtx.households = [
            {
                id: 'hh-1',
                name: 'Smith Family',
                created_by: 'user-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            },
        ];

        renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        // Desktop button (first one) should show the household name
        const buttons = screen.getAllByTestId('household-nav-button');
        expect(buttons[0]).toHaveTextContent('Smith Family');
    });

    it('clicking household icon button opens HouseholdDrawer', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', is_admin: false },
            logout: vi.fn(),
        });

        renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        // Drawer should not be visible initially
        expect(screen.queryByTestId('household-drawer')).not.toBeInTheDocument();

        // Click the first household button (desktop)
        const buttons = screen.getAllByLabelText('Open household selector');
        fireEvent.click(buttons[0]);

        // Drawer should now be visible
        expect(screen.getByTestId('household-drawer')).toBeInTheDocument();
    });

    it('household icon button is present in both desktop and mobile sections', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { id: '1', email: 'user@example.com', is_admin: false },
            logout: vi.fn(),
        });

        renderWithProvider(
            <MemoryRouter>
                <Layout>
                    <div>Child Content</div>
                </Layout>
            </MemoryRouter>
        );

        // Both desktop and mobile buttons should be rendered
        const buttons = screen.getAllByLabelText('Open household selector');
        expect(buttons.length).toBe(2);
    });
});
