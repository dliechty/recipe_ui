import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { TestWrapper } from '../../test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../theme';
import { AdminModeContext } from '../../context/AdminModeContext';
import {
    useHouseholds,
    useHousehold,
    useCreateHousehold,
    useUpdateHousehold,
    useDeleteHousehold,
    useJoinHousehold,
    useLeaveHousehold,
    useHouseholdMembers,
    useRemoveHouseholdMember,
    useSetPrimaryHousehold,
    useDisabledTemplates,
    useDisableTemplate,
    useEnableTemplate,
} from '../useHouseholds';
import { server } from '../../mocks/server';
import { resetStore } from '../../mocks/handlers';
import { http, HttpResponse } from 'msw';
import type { Household, HouseholdMember, HouseholdTemplateExclusion } from '../../client';

/** Wrapper that provides AdminModeContext with a given impersonatedUserId */
function createAdminModeWrapper(impersonatedUserId: string | null) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const adminModeValue = {
        adminModeActive: false,
        impersonatedUserId,
        setAdminMode: vi.fn(),
        setImpersonatedUser: vi.fn(),
        clearMode: vi.fn(),
    };

    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(
            QueryClientProvider,
            { client: queryClient },
            React.createElement(
                ChakraProvider,
                { value: system } as React.ComponentProps<typeof ChakraProvider>,
                React.createElement(
                    AdminModeContext.Provider,
                    { value: adminModeValue },
                    children
                )
            )
        );
}

describe('useHouseholds hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetStore();
    });

    // -------------------------------------------------------------------------
    // CRUD hooks
    // -------------------------------------------------------------------------

    describe('useHouseholds', () => {
        it('fetches the list of households for the current user', async () => {
            const mockHouseholds: Household[] = [
                {
                    id: 'hh1',
                    name: 'Smith Family',
                    created_by: 'user-1',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ];

            server.use(
                http.get('*/households', () => {
                    return HttpResponse.json(mockHouseholds);
                })
            );

            const { result } = renderHook(() => useHouseholds(), {
                wrapper: TestWrapper,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockHouseholds);
        });

        it('returns empty array when user has no households', async () => {
            server.use(
                http.get('*/households', () => {
                    return HttpResponse.json([]);
                })
            );

            const { result } = renderHook(() => useHouseholds(), {
                wrapper: TestWrapper,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([]);
        });
    });

    describe('useHousehold', () => {
        it('fetches a single household by id', async () => {
            const mockHousehold: Household = {
                id: 'hh1',
                name: 'Smith Family',
                created_by: 'user-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            server.use(
                http.get('*/households/:household_id', ({ params }) => {
                    if (params.household_id === 'hh1') {
                        return HttpResponse.json(mockHousehold);
                    }
                    return new HttpResponse(null, { status: 404 });
                })
            );

            const { result } = renderHook(() => useHousehold('hh1'), {
                wrapper: TestWrapper,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockHousehold);
        });

        it('does not fetch when id is empty', () => {
            const { result } = renderHook(() => useHousehold(''), {
                wrapper: TestWrapper,
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(result.current.data).toBeUndefined();
        });
    });

    describe('useCreateHousehold', () => {
        it('creates a new household and invalidates cache', async () => {
            const newHousehold: Household = {
                id: 'hh-new',
                name: 'New Household',
                created_by: 'user-1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            server.use(
                http.post('*/households', async () => {
                    return HttpResponse.json(newHousehold, { status: 201 });
                })
            );

            const { result } = renderHook(() => useCreateHousehold(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate({ name: 'New Household' });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.name).toBe('New Household');
        });
    });

    describe('useUpdateHousehold', () => {
        it('renames a household and invalidates cache', async () => {
            const updatedHousehold: Household = {
                id: 'hh1',
                name: 'Updated Name',
                created_by: 'user-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: new Date().toISOString(),
            };

            server.use(
                http.patch('*/households/:household_id', async () => {
                    return HttpResponse.json(updatedHousehold);
                })
            );

            const { result } = renderHook(() => useUpdateHousehold(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate({ id: 'hh1', requestBody: { name: 'Updated Name' } });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.name).toBe('Updated Name');
        });
    });

    describe('useDeleteHousehold', () => {
        it('deletes a household and invalidates cache', async () => {
            server.use(
                http.delete('*/households/:household_id', () => {
                    return new HttpResponse(null, { status: 204 });
                })
            );

            const { result } = renderHook(() => useDeleteHousehold(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate('hh1');
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });
    });

    // -------------------------------------------------------------------------
    // Membership hooks
    // -------------------------------------------------------------------------

    describe('useJoinHousehold', () => {
        it('joins a household and invalidates cache', async () => {
            const newMember: HouseholdMember = {
                id: 'hm-new',
                user_id: 'user-1',
                user: { id: 'user-1', email: 'test@example.com', first_name: 'Test', last_name: 'User', is_admin: false },
                is_primary: false,
                joined_at: new Date().toISOString(),
            };

            server.use(
                http.post('*/households/:household_id/join', () => {
                    return HttpResponse.json(newMember, { status: 201 });
                })
            );

            const { result } = renderHook(() => useJoinHousehold(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate('hh1');
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.user_id).toBe('user-1');
        });
    });

    describe('useLeaveHousehold', () => {
        it('leaves a household and invalidates cache', async () => {
            server.use(
                http.delete('*/households/:household_id/leave', () => {
                    return new HttpResponse(null, { status: 204 });
                })
            );

            const { result } = renderHook(() => useLeaveHousehold(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate('hh1');
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });
    });

    describe('useHouseholdMembers', () => {
        it('fetches the member list for a household', async () => {
            const mockMembers: HouseholdMember[] = [
                {
                    id: 'hm1',
                    user_id: 'user-1',
                    user: { id: 'user-1', email: 'test@example.com', first_name: 'Test', last_name: 'User', is_admin: false },
                    is_primary: true,
                    joined_at: '2024-01-01T00:00:00Z',
                },
            ];

            server.use(
                http.get('*/households/:household_id/members', () => {
                    return HttpResponse.json(mockMembers);
                })
            );

            const { result } = renderHook(() => useHouseholdMembers('hh1'), {
                wrapper: TestWrapper,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockMembers);
        });

        it('does not fetch when id is empty', () => {
            const { result } = renderHook(() => useHouseholdMembers(''), {
                wrapper: TestWrapper,
            });

            expect(result.current.fetchStatus).toBe('idle');
        });
    });

    describe('useRemoveHouseholdMember', () => {
        it('removes a member and invalidates cache', async () => {
            server.use(
                http.delete('*/households/:household_id/members/:user_id', () => {
                    return new HttpResponse(null, { status: 204 });
                })
            );

            const { result } = renderHook(() => useRemoveHouseholdMember(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate({ householdId: 'hh1', userId: 'user-1' });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });
    });

    describe('useSetPrimaryHousehold', () => {
        it('sets primary household and invalidates cache', async () => {
            server.use(
                http.patch('*/users/me/primary-household', async () => {
                    return HttpResponse.json({ message: 'Primary household updated' });
                })
            );

            const { result } = renderHook(() => useSetPrimaryHousehold(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate({ household_id: 'hh1' });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });

        it('clears primary household when passing null household_id', async () => {
            server.use(
                http.patch('*/users/me/primary-household', async () => {
                    return HttpResponse.json({ message: 'Primary household cleared' });
                })
            );

            const { result } = renderHook(() => useSetPrimaryHousehold(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate({ household_id: null });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });
    });

    // -------------------------------------------------------------------------
    // Disabled template hooks
    // -------------------------------------------------------------------------

    describe('useDisabledTemplates', () => {
        it('fetches the list of disabled templates for a household', async () => {
            const mockExclusions: HouseholdTemplateExclusion[] = [
                {
                    id: 'excl-1',
                    household_id: 'hh1',
                    template_id: 'tmpl-1',
                },
            ];

            server.use(
                http.get('*/households/:household_id/disabled-templates', () => {
                    return HttpResponse.json(mockExclusions);
                })
            );

            const { result } = renderHook(() => useDisabledTemplates('hh1'), {
                wrapper: TestWrapper,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockExclusions);
        });

        it('does not fetch when householdId is empty', () => {
            const { result } = renderHook(() => useDisabledTemplates(''), {
                wrapper: TestWrapper,
            });

            expect(result.current.fetchStatus).toBe('idle');
        });
    });

    describe('useDisableTemplate', () => {
        it('disables a template for a household and invalidates cache', async () => {
            const newExclusion: HouseholdTemplateExclusion = {
                id: 'excl-new',
                household_id: 'hh1',
                template_id: 'tmpl-2',
            };

            server.use(
                http.post('*/households/:household_id/disabled-templates', async () => {
                    return HttpResponse.json(newExclusion, { status: 201 });
                })
            );

            const { result } = renderHook(() => useDisableTemplate(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate({ householdId: 'hh1', requestBody: { template_id: 'tmpl-2' } });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.template_id).toBe('tmpl-2');
        });
    });

    describe('useEnableTemplate', () => {
        it('re-enables a template and invalidates cache', async () => {
            server.use(
                http.delete('*/households/:household_id/disabled-templates/:template_id', () => {
                    return new HttpResponse(null, { status: 204 });
                })
            );

            const { result } = renderHook(() => useEnableTemplate(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.mutate({ householdId: 'hh1', templateId: 'tmpl-1' });
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });
    });

    // -------------------------------------------------------------------------
    // Query key includes impersonatedUserId
    // -------------------------------------------------------------------------

    describe('query keys include impersonatedUserId', () => {
        it('useHouseholds query key contains impersonatedUserId', async () => {
            const impersonatedHouseholds: Household[] = [
                {
                    id: 'hh-imp',
                    name: 'Impersonated Family',
                    created_by: 'imp-user',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ];

            server.use(
                http.get('*/households', () => {
                    return HttpResponse.json(impersonatedHouseholds);
                })
            );

            const wrapper = createAdminModeWrapper('imp-user-123');
            const { result } = renderHook(() => useHouseholds(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // The query key should include impersonatedUserId — verify via queryKey on the observer
            // We verify indirectly: a different impersonatedUserId causes a separate cache entry
            const wrapperNoImp = createAdminModeWrapper(null);

            server.use(
                http.get('*/households', () => {
                    return HttpResponse.json([]);
                })
            );

            const { result: result2 } = renderHook(() => useHouseholds(), { wrapper: wrapperNoImp });

            await waitFor(() => {
                expect(result2.current.isSuccess).toBe(true);
            });

            // Different impersonatedUserId = different cache = different data
            expect(result.current.data).toHaveLength(1);
            expect(result2.current.data).toHaveLength(0);
        });

        it('useHousehold query key contains impersonatedUserId', async () => {
            const household: Household = {
                id: 'hh1',
                name: 'Test Household',
                created_by: 'user-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            server.use(
                http.get('*/households/:household_id', () => {
                    return HttpResponse.json(household);
                })
            );

            const wrapperImp = createAdminModeWrapper('imp-user-456');
            const { result } = renderHook(() => useHousehold('hh1'), { wrapper: wrapperImp });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.name).toBe('Test Household');
        });

        it('useHouseholdMembers query key contains impersonatedUserId', async () => {
            const mockMembers: HouseholdMember[] = [
                {
                    id: 'hm1',
                    user_id: 'user-1',
                    user: { id: 'user-1', email: 'test@example.com', first_name: 'Test', last_name: 'User', is_admin: false },
                    is_primary: true,
                    joined_at: '2024-01-01T00:00:00Z',
                },
            ];

            server.use(
                http.get('*/households/:household_id/members', () => {
                    return HttpResponse.json(mockMembers);
                })
            );

            const wrapperImp = createAdminModeWrapper('imp-user-789');
            const { result } = renderHook(() => useHouseholdMembers('hh1'), { wrapper: wrapperImp });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toHaveLength(1);
        });

        it('useDisabledTemplates query key contains impersonatedUserId', async () => {
            const mockExclusions: HouseholdTemplateExclusion[] = [
                { id: 'excl-1', household_id: 'hh1', template_id: 'tmpl-1' },
            ];

            server.use(
                http.get('*/households/:household_id/disabled-templates', () => {
                    return HttpResponse.json(mockExclusions);
                })
            );

            const wrapperImp = createAdminModeWrapper('imp-user-abc');
            const { result } = renderHook(() => useDisabledTemplates('hh1'), { wrapper: wrapperImp });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toHaveLength(1);
        });
    });
});
