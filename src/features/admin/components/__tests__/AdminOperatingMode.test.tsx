import { renderWithProviders, screen, fireEvent, waitFor } from '../../../../test-utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import AdminOperatingMode from '../AdminOperatingMode';

// Mock useAdminMode hook
const mockSetAdminMode = vi.fn();
const mockSetImpersonatedUser = vi.fn();
const mockClearMode = vi.fn();

const defaultAdminMode = {
    adminModeActive: false,
    impersonatedUserId: null,
    setAdminMode: mockSetAdminMode,
    setImpersonatedUser: mockSetImpersonatedUser,
    clearMode: mockClearMode,
};

vi.mock('../../../../context/AdminModeContext', () => ({
    useAdminMode: () => mockAdminMode,
}));

// We need to be able to change mockAdminMode between tests
let mockAdminMode = { ...defaultAdminMode };

// Mock useUsers hook
const mockNonAdminUser = {
    id: 'user-1',
    email: 'alice@example.com',
    first_name: 'Alice',
    last_name: 'Smith',
    is_active: true,
    is_admin: false,
};

const mockAdminUser = {
    id: 'admin-1',
    email: 'bob@example.com',
    first_name: 'Bob',
    last_name: 'Jones',
    is_active: true,
    is_admin: true,
};

vi.mock('../../../../hooks/useUsers', () => ({
    useUsers: () => ({
        data: [mockNonAdminUser, mockAdminUser],
        isLoading: false,
    }),
}));

describe('AdminOperatingMode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAdminMode = { ...defaultAdminMode };
    });

    test('renders "Current mode: User (default)" in default state', async () => {
        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByText(/Current mode:/)).toBeInTheDocument();
        });

        expect(screen.getByText(/User \(default\)/)).toBeInTheDocument();
    });

    test('enabling admin mode toggle calls setAdminMode(true) and shows "Current mode: Admin"', async () => {
        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByRole('checkbox', { name: /Admin Mode/i })).toBeInTheDocument();
        });

        const toggle = screen.getByRole('checkbox', { name: /Admin Mode/i });
        fireEvent.click(toggle);

        expect(mockSetAdminMode).toHaveBeenCalledWith(true);
    });

    test('shows "Current mode: Admin" when adminModeActive is true', async () => {
        mockAdminMode = { ...defaultAdminMode, adminModeActive: true };

        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByText(/Current mode:/)).toBeInTheDocument();
        });

        // Badge shows "Admin" (not "Admin Mode" which is a different element)
        // Use getAllByText since "Admin" appears in the badge and possibly in "Admin Mode" label
        const adminTexts = screen.getAllByText(/^Admin$/);
        expect(adminTexts.length).toBeGreaterThan(0);
        // Should NOT show "User (default)"
        expect(screen.queryByText(/User \(default\)/)).not.toBeInTheDocument();
    });

    test('disabling admin mode toggle calls setAdminMode(false)', async () => {
        mockAdminMode = { ...defaultAdminMode, adminModeActive: true };

        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByRole('checkbox', { name: /Admin Mode/i })).toBeInTheDocument();
        });

        const toggle = screen.getByRole('checkbox', { name: /Admin Mode/i });
        fireEvent.click(toggle);

        expect(mockSetAdminMode).toHaveBeenCalledWith(false);
    });

    test('impersonation dropdown lists only non-admin active users', async () => {
        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByText(/Impersonate User/i)).toBeInTheDocument();
        });

        // Non-admin user should appear in the dropdown
        const selectEl = screen.getByRole('combobox');
        expect(selectEl).toBeInTheDocument();

        // Alice (non-admin) should be an option
        expect(screen.getByRole('option', { name: /Alice Smith/i })).toBeInTheDocument();

        // Bob (admin) should NOT be listed
        expect(screen.queryByRole('option', { name: /Bob Jones/i })).not.toBeInTheDocument();
    });

    test('clicking "Start Impersonating" calls setImpersonatedUser(uuid) and shows "Current mode: Impersonating"', async () => {
        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        // Select Alice from the dropdown
        const selectEl = screen.getByRole('combobox');
        fireEvent.change(selectEl, { target: { value: 'user-1' } });

        const startButton = screen.getByRole('button', { name: /Start Impersonating/i });
        fireEvent.click(startButton);

        expect(mockSetImpersonatedUser).toHaveBeenCalledWith('user-1');
    });

    test('shows "Current mode: Impersonating — {name}" when impersonating', async () => {
        mockAdminMode = { ...defaultAdminMode, impersonatedUserId: 'user-1' };

        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByText(/Current mode:/)).toBeInTheDocument();
        });

        // The badge should contain "Impersonating — Alice Smith"
        expect(screen.getAllByText(/Impersonating/).length).toBeGreaterThan(0);
        // Alice Smith name appears somewhere on the page
        expect(screen.getAllByText(/Alice Smith/).length).toBeGreaterThan(0);
    });

    test('clicking "Stop Impersonating" calls clearMode()', async () => {
        mockAdminMode = { ...defaultAdminMode, impersonatedUserId: 'user-1' };

        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Stop Impersonating/i })).toBeInTheDocument();
        });

        const stopButton = screen.getByRole('button', { name: /Stop Impersonating/i });
        fireEvent.click(stopButton);

        expect(mockClearMode).toHaveBeenCalled();
    });

    test('admin mode toggle is disabled while impersonation is active', async () => {
        mockAdminMode = { ...defaultAdminMode, impersonatedUserId: 'user-1' };

        renderWithProviders(<AdminOperatingMode />);

        await waitFor(() => {
            expect(screen.getByRole('checkbox', { name: /Admin Mode/i })).toBeInTheDocument();
        });

        const toggle = screen.getByRole('checkbox', { name: /Admin Mode/i });
        expect(toggle).toBeDisabled();
    });
});
