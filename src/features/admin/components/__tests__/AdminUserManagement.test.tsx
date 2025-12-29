import React from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../../../../test-utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import AdminUserManagement from '../AdminUserManagement';
import { AuthenticationService } from '../../../../client';
import { toaster } from '../../../../toaster';

// Mock AuthenticationService
vi.mock('../../../../client', () => ({
    AuthenticationService: {
        listActiveUsersAuthUsersGet: vi.fn(),
        updateUserAuthUsersUserIdPut: vi.fn(),
        deleteUserAuthUsersUserIdDelete: vi.fn(),
        resetUserAuthUsersUserIdResetPost: vi.fn(),
    },
}));

// Mock toaster
vi.mock('../../../../toaster', () => ({
    toaster: {
        create: vi.fn(),
    },
}));

// Mock window.confirm and prompt
const mockConfirm = vi.fn();
const mockPrompt = vi.fn();
window.confirm = mockConfirm;
window.prompt = mockPrompt;

const mockUsers = [
    {
        id: '1',
        email: 'user1@example.com',
        first_name: 'User',
        last_name: 'One',
        is_admin: false,
    },
    {
        id: '2',
        email: 'user2@example.com',
        first_name: 'User',
        last_name: 'Two',
        is_admin: true,
    },
];

describe('AdminUserManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (AuthenticationService.listActiveUsersAuthUsersGet as any).mockResolvedValue(mockUsers);
    });

    test('renders user list correctly', async () => {
        renderWithProviders(<AdminUserManagement />);

        await waitFor(() => {
            expect(screen.getByText('user1@example.com')).toBeInTheDocument();
            expect(screen.getByText('user2@example.com')).toBeInTheDocument();
        });


        // Wait, split into columns: "First Name" and "Last Name".
        // The cell content will be "User" and "One" separately.
        expect(screen.getAllByText('User')).toHaveLength(2);
        expect(screen.getByText('One')).toBeInTheDocument();
        expect(screen.getByText('Two')).toBeInTheDocument();
    });

    test('enters edit mode when edit button is clicked', async () => {
        renderWithProviders(<AdminUserManagement />);

        await waitFor(() => expect(screen.getByText('user1@example.com')).toBeInTheDocument());

        const editButtons = screen.getAllByLabelText('Edit User');
        fireEvent.click(editButtons[0]);

        // Inputs should appear
        expect(screen.getByDisplayValue('user1@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('One')).toBeInTheDocument();

        // Save and Cancel buttons should appear
        expect(screen.getByLabelText('Save')).toBeInTheDocument();
        expect(screen.getByLabelText('Cancel')).toBeInTheDocument();
    });

    test('updates form data on input change', async () => {
        renderWithProviders(<AdminUserManagement />);

        await waitFor(() => expect(screen.getByText('user1@example.com')).toBeInTheDocument());

        fireEvent.click(screen.getAllByLabelText('Edit User')[0]);

        const firstNameInput = screen.getByDisplayValue('User');
        fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

        expect(firstNameInput).toHaveValue('Updated');
    });

    test('calls update API on save', async () => {
        (AuthenticationService.updateUserAuthUsersUserIdPut as any).mockResolvedValue({});

        renderWithProviders(<AdminUserManagement />);

        await waitFor(() => expect(screen.getByText('user1@example.com')).toBeInTheDocument());

        fireEvent.click(screen.getAllByLabelText('Edit User')[0]);

        const firstNameInput = screen.getByDisplayValue('User');
        fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

        fireEvent.click(screen.getByLabelText('Save'));

        await waitFor(() => {
            expect(AuthenticationService.updateUserAuthUsersUserIdPut).toHaveBeenCalledWith('1', expect.objectContaining({
                first_name: 'Updated',
            }));
            expect(toaster.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'User updated', type: 'success' }));
        });

        // Should fetch users again
        expect(AuthenticationService.listActiveUsersAuthUsersGet).toHaveBeenCalledTimes(2);
    });

    test('reverts changes on cancel', async () => {
        renderWithProviders(<AdminUserManagement />);

        await waitFor(() => expect(screen.getByText('user1@example.com')).toBeInTheDocument());

        fireEvent.click(screen.getAllByLabelText('Edit User')[0]);

        const firstNameInput = screen.getByDisplayValue('User');
        fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

        fireEvent.click(screen.getByLabelText('Cancel'));

        // Should return to text display
        expect(screen.queryByDisplayValue('Updated')).not.toBeInTheDocument();
        expect(screen.getAllByText('User')[0]).toBeInTheDocument();
    });

    test('handles delete user', async () => {
        (AuthenticationService.deleteUserAuthUsersUserIdDelete as any).mockResolvedValue({});
        mockConfirm.mockReturnValue(true);

        renderWithProviders(<AdminUserManagement />);
        await waitFor(() => expect(screen.getByText('user1@example.com')).toBeInTheDocument());

        const deleteButtons = screen.getAllByLabelText('Delete User');
        fireEvent.click(deleteButtons[0]);

        expect(mockConfirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(AuthenticationService.deleteUserAuthUsersUserIdDelete).toHaveBeenCalledWith('1');
            expect(toaster.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'User deleted', type: 'success' }));
        });
    });

    test('handles reset password', async () => {
        (AuthenticationService.resetUserAuthUsersUserIdResetPost as any).mockResolvedValue({});
        mockPrompt.mockReturnValue('newpass');

        renderWithProviders(<AdminUserManagement />);
        await waitFor(() => expect(screen.getByText('user1@example.com')).toBeInTheDocument());

        const resetButtons = screen.getAllByLabelText('Reset Password');
        fireEvent.click(resetButtons[0]);

        expect(mockPrompt).toHaveBeenCalled();
        await waitFor(() => {
            expect(AuthenticationService.resetUserAuthUsersUserIdResetPost).toHaveBeenCalledWith('1', { initial_password: 'newpass' });
            expect(toaster.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'User reset', type: 'success' }));
        });
    });
});
