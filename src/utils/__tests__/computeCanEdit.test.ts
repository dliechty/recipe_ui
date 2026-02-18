import { describe, it, expect } from 'vitest';
import { computeCanEdit } from '../computeCanEdit';

describe('computeCanEdit', () => {
    const ownerId = 'user-owner';
    const otherId = 'user-other';
    const adminId = 'user-admin';
    const impersonatedId = 'user-impersonated';

    it('returns true when user is owner in default mode', () => {
        expect(computeCanEdit({
            currentUserId: ownerId,
            resourceOwnerId: ownerId,
            isAdmin: false,
            adminModeActive: false,
            impersonatedUserId: null,
        })).toBe(true);
    });

    it('returns false when non-owner, non-admin in default mode', () => {
        expect(computeCanEdit({
            currentUserId: otherId,
            resourceOwnerId: ownerId,
            isAdmin: false,
            adminModeActive: false,
            impersonatedUserId: null,
        })).toBe(false);
    });

    it('returns false when admin in default mode viewing another user resource', () => {
        expect(computeCanEdit({
            currentUserId: adminId,
            resourceOwnerId: ownerId,
            isAdmin: true,
            adminModeActive: false,
            impersonatedUserId: null,
        })).toBe(false);
    });

    it('returns true when admin in admin mode viewing another user resource', () => {
        expect(computeCanEdit({
            currentUserId: adminId,
            resourceOwnerId: ownerId,
            isAdmin: true,
            adminModeActive: true,
            impersonatedUserId: null,
        })).toBe(true);
    });

    it('returns true when admin impersonating the owner of the resource', () => {
        expect(computeCanEdit({
            currentUserId: adminId,
            resourceOwnerId: impersonatedId,
            isAdmin: true,
            adminModeActive: false,
            impersonatedUserId: impersonatedId,
        })).toBe(true);
    });

    it('returns false when admin impersonating a non-owner of the resource', () => {
        expect(computeCanEdit({
            currentUserId: adminId,
            resourceOwnerId: ownerId,
            isAdmin: true,
            adminModeActive: false,
            impersonatedUserId: impersonatedId,
        })).toBe(false);
    });

    it('impersonation takes precedence over admin mode when both are set', () => {
        // When impersonating the owner, should return true even if adminMode is also set
        expect(computeCanEdit({
            currentUserId: adminId,
            resourceOwnerId: impersonatedId,
            isAdmin: true,
            adminModeActive: true,
            impersonatedUserId: impersonatedId,
        })).toBe(true);

        // When impersonating a non-owner, should return false even if adminMode is also set
        expect(computeCanEdit({
            currentUserId: adminId,
            resourceOwnerId: ownerId,
            isAdmin: true,
            adminModeActive: true,
            impersonatedUserId: impersonatedId,
        })).toBe(false);
    });
});
