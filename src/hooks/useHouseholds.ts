import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import {
    HouseholdsService,
    Household,
    HouseholdCreate,
    HouseholdUpdate,
    HouseholdMember,
    HouseholdTemplateExclusion,
    HouseholdTemplateExclusionCreate,
    PrimaryHouseholdUpdate,
} from '../client';
import { AdminModeContext } from '../context/AdminModeContext';

// ---------------------------------------------------------------------------
// CRUD hooks
// ---------------------------------------------------------------------------

/** List the current user's households (or all households in admin-impersonation mode).
 *  Pass `{ adminMode: true }` to explicitly send X-Admin-Mode: true (e.g. from the admin dashboard). */
export const useHouseholds = (options?: { adminMode?: boolean }) => {
    const adminModeCtx = useContext(AdminModeContext);
    const impersonatedUserId = adminModeCtx?.impersonatedUserId ?? null;
    const xAdminMode = options?.adminMode ? 'true' : undefined;

    return useQuery<Household[]>({
        queryKey: ['households', impersonatedUserId, options?.adminMode ?? false],
        queryFn: () => HouseholdsService.listHouseholdsHouseholdsGet(undefined, 100, xAdminMode),
    });
};

/** Get a single household's details by id. */
export const useHousehold = (id: string) => {
    const adminModeCtx = useContext(AdminModeContext);
    const impersonatedUserId = adminModeCtx?.impersonatedUserId ?? null;

    return useQuery<Household>({
        queryKey: ['households', id, impersonatedUserId],
        queryFn: () => HouseholdsService.getHouseholdHouseholdsHouseholdIdGet(id),
        enabled: !!id,
    });
};

/** Create a new household. */
export const useCreateHousehold = () => {
    const queryClient = useQueryClient();
    return useMutation<Household, Error, HouseholdCreate>({
        mutationFn: (requestBody) => HouseholdsService.createHouseholdHouseholdsPost(requestBody),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['households'] });
        },
    });
};

/** Rename / update a household. */
export const useUpdateHousehold = () => {
    const queryClient = useQueryClient();
    return useMutation<Household, Error, { id: string; requestBody: HouseholdUpdate }>({
        mutationFn: ({ id, requestBody }) =>
            HouseholdsService.updateHouseholdHouseholdsHouseholdIdPatch(id, requestBody),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['households'] });
            queryClient.invalidateQueries({ queryKey: ['households', variables.id] });
        },
    });
};

/** Delete a household. */
export const useDeleteHousehold = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => HouseholdsService.deleteHouseholdHouseholdsHouseholdIdDelete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['households'] });
        },
    });
};

// ---------------------------------------------------------------------------
// Membership hooks
// ---------------------------------------------------------------------------

/** Join a household (current user becomes a member). */
export const useJoinHousehold = () => {
    const queryClient = useQueryClient();
    return useMutation<HouseholdMember, Error, string>({
        mutationFn: (householdId) =>
            HouseholdsService.joinHouseholdHouseholdsHouseholdIdJoinPost(householdId),
        onSuccess: (_data, householdId) => {
            queryClient.invalidateQueries({ queryKey: ['households'] });
            queryClient.invalidateQueries({ queryKey: ['household-members', householdId] });
        },
    });
};

/** Leave a household (current user is removed as a member). */
export const useLeaveHousehold = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (householdId) =>
            HouseholdsService.leaveHouseholdHouseholdsHouseholdIdLeaveDelete(householdId),
        onSuccess: (_data, householdId) => {
            queryClient.invalidateQueries({ queryKey: ['households'] });
            queryClient.invalidateQueries({ queryKey: ['household-members', householdId] });
        },
    });
};

/** List members of a household. */
export const useHouseholdMembers = (id: string) => {
    const adminModeCtx = useContext(AdminModeContext);
    const impersonatedUserId = adminModeCtx?.impersonatedUserId ?? null;

    return useQuery<HouseholdMember[]>({
        queryKey: ['household-members', id, impersonatedUserId],
        queryFn: () => HouseholdsService.listMembersHouseholdsHouseholdIdMembersGet(id),
        enabled: !!id,
    });
};

/** Remove a specific member from a household. */
export const useRemoveHouseholdMember = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { householdId: string; userId: string }>({
        mutationFn: ({ householdId, userId }) =>
            HouseholdsService.removeMemberHouseholdsHouseholdIdMembersUserIdDelete(householdId, userId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['households'] });
            queryClient.invalidateQueries({ queryKey: ['household-members', variables.householdId] });
        },
    });
};

/** Set or clear the current user's primary household. */
export const useSetPrimaryHousehold = () => {
    const queryClient = useQueryClient();
    return useMutation<unknown, Error, PrimaryHouseholdUpdate>({
        mutationFn: (requestBody) =>
            HouseholdsService.setPrimaryHouseholdUsersMePrimaryHouseholdPatch(requestBody),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['households'] });
            queryClient.invalidateQueries({ queryKey: ['household-members'] });
        },
    });
};

// ---------------------------------------------------------------------------
// Disabled template hooks
// ---------------------------------------------------------------------------

/** List disabled templates for a household. */
export const useDisabledTemplates = (householdId: string) => {
    const adminModeCtx = useContext(AdminModeContext);
    const impersonatedUserId = adminModeCtx?.impersonatedUserId ?? null;

    return useQuery<HouseholdTemplateExclusion[]>({
        queryKey: ['household-disabled-templates', householdId, impersonatedUserId],
        queryFn: () =>
            HouseholdsService.listDisabledTemplatesHouseholdsHouseholdIdDisabledTemplatesGet(householdId),
        enabled: !!householdId,
    });
};

/** Disable a template for a household. */
export const useDisableTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation<
        HouseholdTemplateExclusion,
        Error,
        { householdId: string; requestBody: HouseholdTemplateExclusionCreate }
    >({
        mutationFn: ({ householdId, requestBody }) =>
            HouseholdsService.disableTemplateHouseholdsHouseholdIdDisabledTemplatesPost(
                householdId,
                requestBody
            ),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['household-disabled-templates', variables.householdId],
            });
        },
    });
};

/** Re-enable (un-disable) a template for a household. */
export const useEnableTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { householdId: string; templateId: string }>({
        mutationFn: ({ householdId, templateId }) =>
            HouseholdsService.enableTemplateHouseholdsHouseholdIdDisabledTemplatesTemplateIdDelete(
                householdId,
                templateId
            ),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['household-disabled-templates', variables.householdId],
            });
        },
    });
};
