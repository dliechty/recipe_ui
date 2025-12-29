import { renderWithProviders, screen, fireEvent, waitFor } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RequestAccountPage from '../RequestAccountPage';
import { AuthenticationService } from '../../../../client';
import { toaster } from '../../../../toaster';

// Mock dependencies
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

describe('RequestAccountPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form correctly', () => {
        renderWithProviders(
            <MemoryRouter>
                <RequestAccountPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Request Account')).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit Request/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Back to Login/i })).toBeInTheDocument();
    });

    it('submits the form successfully', async () => {
        (AuthenticationService.requestAccountAuthRequestAccountPost as any).mockResolvedValue({});

        renderWithProviders(
            <MemoryRouter>
                <RequestAccountPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

        fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

        await waitFor(() => {
            expect(AuthenticationService.requestAccountAuthRequestAccountPost).toHaveBeenCalledWith({
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
            });
        });

        expect(toaster.create).toHaveBeenCalledWith(expect.objectContaining({
            title: "Request Submitted",
            type: "success",
        }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('displays error message on failure', async () => {
        const error = {
            body: {
                detail: 'Email already registered'
            }
        };
        (AuthenticationService.requestAccountAuthRequestAccountPost as any).mockRejectedValue(error);

        renderWithProviders(
            <MemoryRouter>
                <RequestAccountPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

        fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

        await waitFor(() => {
            expect(screen.getByText('Email already registered')).toBeInTheDocument();
        });
    });
});
