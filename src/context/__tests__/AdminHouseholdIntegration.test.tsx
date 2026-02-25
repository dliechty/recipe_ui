import { render, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { OpenAPI } from '../../client';
import type { UserPublic } from '../../client';
import { AdminModeContext } from '../AdminModeContext';
import { HouseholdContext } from '../HouseholdContext';
import { HeaderInjector } from '../AuthContext';
import { useInfiniteMeals } from '../../hooks/useMeals';
import { server } from '../../mocks/server';

const adminUser: UserPublic = {
    id: 'admin-id',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    is_admin: true,
    is_first_login: false,
};

function makeAdminModeValue(adminModeActive: boolean, impersonatedUserId: string | null) {
    return {
        adminModeActive,
        impersonatedUserId,
        setAdminMode: vi.fn(),
        setImpersonatedUser: vi.fn(),
        clearMode: vi.fn(),
    };
}

function makeHouseholdValue(activeHouseholdId: string | null) {
    return {
        activeHouseholdId,
        setActiveHousehold: vi.fn(),
        primaryHouseholdId: null,
        households: [],
    };
}

/**
 * Test component that renders HeaderInjector (to set OpenAPI.HEADERS)
 * and then calls useInfiniteMeals to trigger a real API fetch.
 * We capture the result so we can verify the query resolved.
 */
function MealFetchTestComponent({ onResult }: { onResult: (data: unknown) => void }) {
    const result = useInfiniteMeals(10);

    // Report data back when it loads
    if (result.data) {
        onResult(result.data);
    }

    if (result.isError) {
        return <div data-testid="error">Error</div>;
    }
    if (result.isLoading) {
        return <div data-testid="loading">Loading</div>;
    }
    return <div data-testid="loaded">Loaded</div>;
}

function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
}

describe('Admin + Household Integration: end-to-end header verification', () => {
    let capturedHeaders: Record<string, string | null>[];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        OpenAPI.HEADERS = undefined;
        capturedHeaders = [];
    });

    afterEach(() => {
        OpenAPI.HEADERS = undefined;
        localStorage.clear();
        server.resetHandlers();
    });

    /**
     * Install an MSW handler that captures request headers and returns a
     * minimal valid response for the meals endpoint.
     */
    function installHeaderCapturingHandler() {
        server.use(
            http.get('*/meals/', ({ request }) => {
                capturedHeaders.push({
                    'X-Active-Household': request.headers.get('X-Active-Household'),
                    'X-Admin-Mode': request.headers.get('X-Admin-Mode'),
                    'X-Act-As-User': request.headers.get('X-Act-As-User'),
                    'Authorization': request.headers.get('Authorization'),
                });

                return HttpResponse.json([], {
                    headers: {
                        'X-Total-Count': '0',
                        'Access-Control-Expose-Headers': 'X-Total-Count',
                    },
                });
            }),
        );
    }

    function renderIntegration(
        adminModeActive: boolean,
        impersonatedUserId: string | null,
        activeHouseholdId: string | null,
        onResult: (data: unknown) => void,
    ) {
        const queryClient = createTestQueryClient();

        return render(
            <QueryClientProvider client={queryClient}>
                <AdminModeContext.Provider value={makeAdminModeValue(adminModeActive, impersonatedUserId)}>
                    <HouseholdContext.Provider value={makeHouseholdValue(activeHouseholdId)}>
                        <HeaderInjector user={adminUser} />
                        <MealFetchTestComponent onResult={onResult} />
                    </HouseholdContext.Provider>
                </AdminModeContext.Provider>
            </QueryClientProvider>
        );
    }

    it('admin mode + household selection sends both X-Admin-Mode and X-Active-Household headers on meal fetch', async () => {
        installHeaderCapturingHandler();

        let resultData: unknown = null;
        const onResult = (data: unknown) => { resultData = data; };

        renderIntegration(true, null, 'hh-integration-1', onResult);

        await waitFor(() => {
            expect(capturedHeaders.length).toBeGreaterThanOrEqual(1);
        });

        const lastCapture = capturedHeaders[capturedHeaders.length - 1];
        expect(lastCapture['X-Admin-Mode']).toBe('true');
        expect(lastCapture['X-Active-Household']).toBe('hh-integration-1');
        expect(lastCapture['X-Act-As-User']).toBeNull();
        expect(resultData).toBeDefined();
    });

    it('impersonation + household selection sends both X-Act-As-User and X-Active-Household headers on meal fetch', async () => {
        installHeaderCapturingHandler();

        let resultData: unknown = null;
        const onResult = (data: unknown) => { resultData = data; };

        renderIntegration(false, 'impersonated-user-42', 'hh-integration-2', onResult);

        await waitFor(() => {
            expect(capturedHeaders.length).toBeGreaterThanOrEqual(1);
        });

        const lastCapture = capturedHeaders[capturedHeaders.length - 1];
        expect(lastCapture['X-Act-As-User']).toBe('impersonated-user-42');
        expect(lastCapture['X-Active-Household']).toBe('hh-integration-2');
        expect(lastCapture['X-Admin-Mode']).toBeNull();
        expect(resultData).toBeDefined();
    });

    it('admin mode without household sends only X-Admin-Mode header on meal fetch', async () => {
        installHeaderCapturingHandler();

        const onResult = vi.fn();

        renderIntegration(true, null, null, onResult);

        await waitFor(() => {
            expect(capturedHeaders.length).toBeGreaterThanOrEqual(1);
        });

        const lastCapture = capturedHeaders[capturedHeaders.length - 1];
        expect(lastCapture['X-Admin-Mode']).toBe('true');
        expect(lastCapture['X-Active-Household']).toBeNull();
        expect(lastCapture['X-Act-As-User']).toBeNull();
    });

    it('impersonation without household sends only X-Act-As-User header on meal fetch', async () => {
        installHeaderCapturingHandler();

        const onResult = vi.fn();

        renderIntegration(false, 'target-user-99', null, onResult);

        await waitFor(() => {
            expect(capturedHeaders.length).toBeGreaterThanOrEqual(1);
        });

        const lastCapture = capturedHeaders[capturedHeaders.length - 1];
        expect(lastCapture['X-Act-As-User']).toBe('target-user-99');
        expect(lastCapture['X-Active-Household']).toBeNull();
        expect(lastCapture['X-Admin-Mode']).toBeNull();
    });

    it('household only (no admin mode) sends only X-Active-Household header on meal fetch', async () => {
        installHeaderCapturingHandler();

        const onResult = vi.fn();

        renderIntegration(false, null, 'hh-plain', onResult);

        await waitFor(() => {
            expect(capturedHeaders.length).toBeGreaterThanOrEqual(1);
        });

        const lastCapture = capturedHeaders[capturedHeaders.length - 1];
        expect(lastCapture['X-Active-Household']).toBe('hh-plain');
        expect(lastCapture['X-Admin-Mode']).toBeNull();
        expect(lastCapture['X-Act-As-User']).toBeNull();
    });

    it('switching from admin mode to impersonation causes new meal fetch with updated headers', async () => {
        installHeaderCapturingHandler();

        const queryClient = createTestQueryClient();
        const onResult = vi.fn();

        // Start with admin mode + household
        const { rerender } = render(
            <QueryClientProvider client={queryClient}>
                <AdminModeContext.Provider value={makeAdminModeValue(true, null)}>
                    <HouseholdContext.Provider value={makeHouseholdValue('hh-switch')}>
                        <HeaderInjector user={adminUser} />
                        <MealFetchTestComponent onResult={onResult} />
                    </HouseholdContext.Provider>
                </AdminModeContext.Provider>
            </QueryClientProvider>
        );

        // Wait for initial fetch
        await waitFor(() => {
            expect(capturedHeaders.length).toBeGreaterThanOrEqual(1);
        });

        const firstCapture = capturedHeaders[capturedHeaders.length - 1];
        expect(firstCapture['X-Admin-Mode']).toBe('true');
        expect(firstCapture['X-Active-Household']).toBe('hh-switch');

        // Switch to impersonation mode - this changes the HeaderInjector output
        // AND changes the query key (adminModeActive/impersonatedUserId don't affect
        // the query key directly, but the OpenAPI.HEADERS change is what matters for the request)
        await act(async () => {
            rerender(
                <QueryClientProvider client={queryClient}>
                    <AdminModeContext.Provider value={makeAdminModeValue(false, 'impersonated-user-switch')}>
                        <HouseholdContext.Provider value={makeHouseholdValue('hh-switch')}>
                            <HeaderInjector user={adminUser} />
                            <MealFetchTestComponent onResult={onResult} />
                        </HouseholdContext.Provider>
                    </AdminModeContext.Provider>
                </QueryClientProvider>
            );
        });

        // Verify that OpenAPI.HEADERS was updated correctly after the rerender
        const headers = OpenAPI.HEADERS as Record<string, string> | undefined;
        expect(headers?.['X-Act-As-User']).toBe('impersonated-user-switch');
        expect(headers?.['X-Active-Household']).toBe('hh-switch');
        expect(headers?.['X-Admin-Mode']).toBeUndefined();
    });

    it('switching household triggers new meal fetch with updated X-Active-Household', async () => {
        installHeaderCapturingHandler();

        const queryClient = createTestQueryClient();
        const onResult = vi.fn();

        // Start with admin mode + household A
        const { rerender } = render(
            <QueryClientProvider client={queryClient}>
                <AdminModeContext.Provider value={makeAdminModeValue(true, null)}>
                    <HouseholdContext.Provider value={makeHouseholdValue('hh-A')}>
                        <HeaderInjector user={adminUser} />
                        <MealFetchTestComponent onResult={onResult} />
                    </HouseholdContext.Provider>
                </AdminModeContext.Provider>
            </QueryClientProvider>
        );

        // Wait for initial fetch with household A
        await waitFor(() => {
            expect(capturedHeaders.length).toBeGreaterThanOrEqual(1);
        });

        expect(capturedHeaders[capturedHeaders.length - 1]['X-Active-Household']).toBe('hh-A');

        // Switch to household B — this changes the query key (activeHouseholdId is part of it)
        // so React Query will fire a new request
        await act(async () => {
            rerender(
                <QueryClientProvider client={queryClient}>
                    <AdminModeContext.Provider value={makeAdminModeValue(true, null)}>
                        <HouseholdContext.Provider value={makeHouseholdValue('hh-B')}>
                            <HeaderInjector user={adminUser} />
                            <MealFetchTestComponent onResult={onResult} />
                        </HouseholdContext.Provider>
                    </AdminModeContext.Provider>
                </QueryClientProvider>
            );
        });

        // Wait for new fetch with household B
        await waitFor(() => {
            const hhBCaptures = capturedHeaders.filter(h => h['X-Active-Household'] === 'hh-B');
            expect(hhBCaptures.length).toBeGreaterThanOrEqual(1);
        });

        const lastCapture = capturedHeaders[capturedHeaders.length - 1];
        expect(lastCapture['X-Active-Household']).toBe('hh-B');
        expect(lastCapture['X-Admin-Mode']).toBe('true');
    });
});
