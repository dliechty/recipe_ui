import { renderWithProviders, screen, fireEvent, waitFor } from '../../../../test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChangePasswordPage from '../ChangePasswordPage';
import { AuthenticationService } from '../../../../client';
import { toaster } from '../../../../toaster';

vi.mock('../../../../client');
vi.mock('../../../../toaster', () => ({
    toaster: {
        create: vi.fn(),
    },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ChangePasswordPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates password mismatch', async () => {
        renderWithProviders(<ChangePasswordPage />);

        fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpass' } });
        fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'newpass' } });
        fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'mismatch' } });

        fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

        expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
        expect(AuthenticationService.changePasswordAuthChangePasswordPost).not.toHaveBeenCalled();
    });

    it('submits change password successfully', async () => {
        (AuthenticationService.changePasswordAuthChangePasswordPost as any).mockResolvedValue({});

        renderWithProviders(<ChangePasswordPage />);

        fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'oldpass' } });
        fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'newpass' } });
        fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'newpass' } });

        fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

        await waitFor(() => {
            expect(AuthenticationService.changePasswordAuthChangePasswordPost).toHaveBeenCalledWith({
                old_password: 'oldpass',
                new_password: 'newpass'
            });
        });

        expect(toaster.create).toHaveBeenCalledWith(expect.objectContaining({
            title: "Password Changed",
            type: "success",
        }));
        expect(mockNavigate).toHaveBeenCalledWith('/recipes');
    });
});
