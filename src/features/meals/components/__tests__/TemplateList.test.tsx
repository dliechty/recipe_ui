import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter } from 'react-router-dom';
import TemplateList from '../TemplateList';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: () => ({ token: 'mock-token' }),
}));

describe('TemplateList', () => {
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    beforeAll(() => {
        // Mock IntersectionObserver
        global.IntersectionObserver = class IntersectionObserver {
            constructor() { }
            observe = observeMock;
            unobserve() { return null; }
            disconnect = disconnectMock;
            takeRecords() { return []; }
            root = null;
            rootMargin = '';
            thresholds = [];
        } as unknown as typeof IntersectionObserver;
    });

    it('renders templates from API', async () => {
        server.use(
            http.get('*/meals/templates', () => {
                const mockData = [
                    {
                        id: 't1',
                        name: 'Weeknight Dinner',
                        classification: 'Dinner',
                        created_at: '2024-01-01T00:00:00Z',
                        slots: []
                    }
                ];
                return HttpResponse.json(mockData, {
                    headers: { 'X-Total-Count': '1' }
                });
            })
        );

        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Weeknight Dinner')).toBeInTheDocument();
        });
    });

    it('shows add template button', async () => {
        renderWithProviders(
            <MemoryRouter>
                <TemplateList />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /Add Template/i })).toBeInTheDocument();
    });
});
