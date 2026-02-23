/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Household } from '../models/Household';
import type { HouseholdCreate } from '../models/HouseholdCreate';
import type { HouseholdMember } from '../models/HouseholdMember';
import type { HouseholdTemplateExclusion } from '../models/HouseholdTemplateExclusion';
import type { HouseholdTemplateExclusionCreate } from '../models/HouseholdTemplateExclusionCreate';
import type { HouseholdUpdate } from '../models/HouseholdUpdate';
import type { PrimaryHouseholdUpdate } from '../models/PrimaryHouseholdUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HouseholdsService {
    /**
     * Create Household
     * @param requestBody
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns Household Successful Response
     * @throws ApiError
     */
    public static createHouseholdHouseholdsPost(
        requestBody: HouseholdCreate,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<Household> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/households',
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Households
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (1-1000)
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns Household Successful Response
     * @throws ApiError
     */
    public static listHouseholdsHouseholdsGet(
        skip?: number,
        limit: number = 100,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<Array<Household>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/households',
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Household
     * @param householdId
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns Household Successful Response
     * @throws ApiError
     */
    public static getHouseholdHouseholdsHouseholdIdGet(
        householdId: string,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<Household> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/households/{household_id}',
            path: {
                'household_id': householdId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Household
     * @param householdId
     * @param requestBody
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns Household Successful Response
     * @throws ApiError
     */
    public static updateHouseholdHouseholdsHouseholdIdPatch(
        householdId: string,
        requestBody: HouseholdUpdate,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<Household> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/households/{household_id}',
            path: {
                'household_id': householdId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Household
     * @param householdId
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns void
     * @throws ApiError
     */
    public static deleteHouseholdHouseholdsHouseholdIdDelete(
        householdId: string,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/households/{household_id}',
            path: {
                'household_id': householdId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Join Household
     * @param householdId
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns HouseholdMember Successful Response
     * @throws ApiError
     */
    public static joinHouseholdHouseholdsHouseholdIdJoinPost(
        householdId: string,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<HouseholdMember> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/households/{household_id}/join',
            path: {
                'household_id': householdId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Leave Household
     * @param householdId
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns void
     * @throws ApiError
     */
    public static leaveHouseholdHouseholdsHouseholdIdLeaveDelete(
        householdId: string,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/households/{household_id}/leave',
            path: {
                'household_id': householdId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Members
     * @param householdId
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns HouseholdMember Successful Response
     * @throws ApiError
     */
    public static listMembersHouseholdsHouseholdIdMembersGet(
        householdId: string,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<Array<HouseholdMember>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/households/{household_id}/members',
            path: {
                'household_id': householdId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Member
     * @param householdId
     * @param userId
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns void
     * @throws ApiError
     */
    public static removeMemberHouseholdsHouseholdIdMembersUserIdDelete(
        householdId: string,
        userId: string,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/households/{household_id}/members/{user_id}',
            path: {
                'household_id': householdId,
                'user_id': userId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Disabled Templates
     * @param householdId
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns HouseholdTemplateExclusion Successful Response
     * @throws ApiError
     */
    public static listDisabledTemplatesHouseholdsHouseholdIdDisabledTemplatesGet(
        householdId: string,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<Array<HouseholdTemplateExclusion>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/households/{household_id}/disabled-templates',
            path: {
                'household_id': householdId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Disable Template
     * @param householdId
     * @param requestBody
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns HouseholdTemplateExclusion Successful Response
     * @throws ApiError
     */
    public static disableTemplateHouseholdsHouseholdIdDisabledTemplatesPost(
        householdId: string,
        requestBody: HouseholdTemplateExclusionCreate,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<HouseholdTemplateExclusion> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/households/{household_id}/disabled-templates',
            path: {
                'household_id': householdId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Enable Template
     * @param householdId
     * @param templateId
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns void
     * @throws ApiError
     */
    public static enableTemplateHouseholdsHouseholdIdDisabledTemplatesTemplateIdDelete(
        householdId: string,
        templateId: string,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/households/{household_id}/disabled-templates/{template_id}',
            path: {
                'household_id': householdId,
                'template_id': templateId,
            },
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Set Primary Household
     * @param requestBody
     * @param xAdminMode
     * @param xActAsUser
     * @param xActiveHousehold
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setPrimaryHouseholdUsersMePrimaryHouseholdPatch(
        requestBody: PrimaryHouseholdUpdate,
        xAdminMode?: (string | null),
        xActAsUser?: (string | null),
        xActiveHousehold?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/users/me/primary-household',
            headers: {
                'X-Admin-Mode': xAdminMode,
                'X-Act-As-User': xActAsUser,
                'X-Active-Household': xActiveHousehold,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
