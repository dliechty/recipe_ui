import { renderWithProviders, screen, fireEvent, waitFor } from '../../../../test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPendingRequests from '../AdminPendingRequests';
import { AuthenticationService } from '../../../../client';
import { toaster } from '../../../../toaster';

vi.mock('../../../../client');
vi.mock('../../../../toaster', () => ({
    toaster: {
        create: vi.fn(),
    },
}));

describe('AdminPendingRequests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders no requests message when empty', async () => {
        vi.mocked(AuthenticationService.listPendingRequestsAuthPendingRequestsGet).mockResolvedValue([]);

        renderWithProviders(<AdminPendingRequests />);

        await waitFor(() => {
            expect(screen.getByText('No pending requests.')).toBeInTheDocument();
        });
    });

    it('renders list of pending requests', async () => {
        const requests = [
            { id: '1', email: 'test1@example.com', first_name: 'Test', last_name: 'One', created_at: '2023-01-01T00:00:00Z', status: 'pending' },
            { id: '2', email: 'test2@example.com', first_name: 'Test', last_name: 'Two', created_at: '2023-01-02T00:00:00Z', status: 'pending' },
        ];
        vi.mocked(AuthenticationService.listPendingRequestsAuthPendingRequestsGet).mockResolvedValue(requests);

        renderWithProviders(<AdminPendingRequests />);

        await waitFor(() => {
            expect(screen.getByText('test1@example.com')).toBeInTheDocument();
            expect(screen.getByText('test2@example.com')).toBeInTheDocument();
        });
    });

    it('approves a request', async () => {
        const requests = [
            { id: '1', email: 'test1@example.com', first_name: 'Test', last_name: 'One', created_at: '2023-01-01T00:00:00Z', status: 'pending' },
        ];
        vi.mocked(AuthenticationService.listPendingRequestsAuthPendingRequestsGet).mockResolvedValue(requests);
        vi.mocked(AuthenticationService.approveRequestAuthApproveRequestRequestIdPost).mockResolvedValue({
            id: '1',
            email: 'test1@example.com',
            first_name: 'Test',
            last_name: 'One',
            is_active: true,
            is_admin: false,
            is_first_login: true
        });

        renderWithProviders(<AdminPendingRequests />);

        await waitFor(() => {
            expect(screen.getByText('test1@example.com')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

        expect(screen.getByText('Approve Request for test1@example.com')).toBeInTheDocument();

        const passwordInput = screen.getByPlaceholderText('Enter initial password');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() => {
            expect(AuthenticationService.approveRequestAuthApproveRequestRequestIdPost).toHaveBeenCalledWith('1', {
                initial_password: 'password123'
            });
        });

        expect(toaster.create).toHaveBeenCalledWith(expect.objectContaining({
            title: "Request Approved",
            type: "success",
        }));
    });
});
