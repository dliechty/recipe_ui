interface ComputeCanEditParams {
    currentUserId: string | undefined | null;
    resourceOwnerId: string | undefined | null;
    isAdmin: boolean | undefined;
    adminModeActive: boolean;
    impersonatedUserId: string | null;
}

/**
 * Determines whether the current user can edit a resource.
 *
 * Logic (from spec FR-3):
 * - If impersonatedUserId is set, check whether the impersonated user owns the resource.
 * - Else if admin mode is active, grant full access.
 * - Otherwise, check whether the current user owns the resource.
 *
 * Impersonation always takes precedence over admin mode.
 */
export function computeCanEdit({
    currentUserId,
    resourceOwnerId,
    isAdmin,
    adminModeActive,
    impersonatedUserId,
}: ComputeCanEditParams): boolean {
    if (isAdmin && impersonatedUserId !== null) {
        return resourceOwnerId === impersonatedUserId;
    }

    if (isAdmin && adminModeActive) {
        return true;
    }

    return !!(currentUserId && resourceOwnerId && currentUserId === resourceOwnerId);
}
