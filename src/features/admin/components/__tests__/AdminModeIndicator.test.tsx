import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import AdminModeIndicator from '../AdminModeIndicator';
import { MemoryRouter } from 'react-router-dom';

// Mock useAdminMode hook
interface MockAdminMode {
    adminModeActive: boolean;
    impersonatedUserId: string | null;
    setAdminMode: ReturnType<typeof vi.fn>;
    setImpersonatedUser: ReturnType<typeof vi.fn>;
    clearMode: ReturnType<typeof vi.fn>;
}

const defaultAdminMode: MockAdminMode = {
    adminModeActive: false,
    impersonatedUserId: null,
    setAdminMode: vi.fn(),
    setImpersonatedUser: vi.fn(),
    clearMode: vi.fn(),
};

let mockAdminMode: MockAdminMode = { ...defaultAdminMode };

vi.mock('../../../../context/AdminModeContext', () => ({
    useAdminMode: () => mockAdminMode,
}));

// Mock useAuth hook
interface MockUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
    is_active: boolean;
    is_first_login: boolean;
}

let mockUser: MockUser | null = null;

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: mockUser !== null,
        token: mockUser ? 'fake-token' : null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
    }),
}));

// Mock useUsers hook
const mockNonAdminUser = {
    id: 'user-1',
    email: 'alice@example.com',
    first_name: 'Alice',
    last_name: 'Smith',
    is_admin: false,
};

vi.mock('../../../../hooks/useUsers', () => ({
    useUsers: () => ({
        data: [mockNonAdminUser],
        isLoading: false,
    }),
}));

const adminUser: MockUser = {
    id: 'admin-1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    is_admin: true,
    is_active: true,
    is_first_login: false,
};

const regularUser: MockUser = {
    id: 'user-1',
    email: 'user@example.com',
    first_name: 'Regular',
    last_name: 'User',
    is_admin: false,
    is_active: true,
    is_first_login: false,
};

function renderIndicator() {
    return renderWithProviders(
        <MemoryRouter>
            <AdminModeIndicator />
        </MemoryRouter>
    );
}

describe('AdminModeIndicator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAdminMode = { ...defaultAdminMode };
        mockUser = null;
    });

    test('renders nothing for non-admin users', () => {
        mockUser = regularUser;
        mockAdminMode = { ...defaultAdminMode };
        const { container } = renderIndicator();
        // The component should render nothing (null) for non-admin users
        expect(container.firstChild).toBeNull();
    });

    test('renders nothing for admin in default mode (adminModeActive=false and impersonatedUserId=null)', () => {
        mockUser = adminUser;
        mockAdminMode = { ...defaultAdminMode, adminModeActive: false, impersonatedUserId: null };
        const { container } = renderIndicator();
        expect(container.firstChild).toBeNull();
    });

    test('renders amber "Admin Mode" badge when adminModeActive=true', async () => {
        mockUser = adminUser;
        mockAdminMode = { ...defaultAdminMode, adminModeActive: true, impersonatedUserId: null };
        renderIndicator();

        await waitFor(() => {
            expect(screen.getByText('Admin Mode')).toBeInTheDocument();
        });
    });

    test('renders cyan "Acting as: {name}" badge when impersonating', async () => {
        mockUser = adminUser;
        mockAdminMode = { ...defaultAdminMode, adminModeActive: false, impersonatedUserId: 'user-1' };
        renderIndicator();

        await waitFor(() => {
            expect(screen.getByText('Acting as: Alice Smith')).toBeInTheDocument();
        });
    });

    test('badge links to /admin?tab=operating-mode', async () => {
        mockUser = adminUser;
        mockAdminMode = { ...defaultAdminMode, adminModeActive: true };
        renderIndicator();

        await waitFor(() => {
            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '/admin?tab=operating-mode');
        });
    });
});
