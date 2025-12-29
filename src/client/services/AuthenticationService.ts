/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApproveRequest } from '../models/ApproveRequest';
import type { Body_login_auth_token_post } from '../models/Body_login_auth_token_post';
import type { PasswordChange } from '../models/PasswordChange';
import type { Token } from '../models/Token';
import type { User } from '../models/User';
import type { UserPublic } from '../models/UserPublic';
import type { UserRequest } from '../models/UserRequest';
import type { UserRequestCreate } from '../models/UserRequestCreate';
import type { UserUpdate } from '../models/UserUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Get User Name
     * Get user public information (name) by ID.
     * @param userId
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static getUserNameAuthUsersUserIdGet(
        userId: string,
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User
     * Update user profile. Users can update themselves; Admins can update anyone.
     * @param userId
     * @param requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static updateUserAuthUsersUserIdPut(
        userId: string,
        requestBody: UserUpdate,
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/auth/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User
     * Delete a user account. Admin only.
     * @param userId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteUserAuthUsersUserIdDelete(
        userId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/auth/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Active Users
     * List all active users. Admin only.
     * @param skip
     * @param limit
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static listActiveUsersAuthUsersGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<UserPublic>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/users',
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
     * Login
     * Endpoint to log in a user and get an access token.
     * @param formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginAuthTokenPost(
        formData: Body_login_auth_token_post,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/token',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Request Account
     * Submit a request for a new user account.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static requestAccountAuthRequestAccountPost(
        requestBody: UserRequestCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/request-account',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Pending Requests
     * List all pending account requests. Admin only.
     * @returns UserRequest Successful Response
     * @throws ApiError
     */
    public static listPendingRequestsAuthPendingRequestsGet(): CancelablePromise<Array<UserRequest>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/pending-requests',
        });
    }
    /**
     * Approve Request
     * Approve a pending account request and create the user. Admin only.
     * @param requestId
     * @param requestBody
     * @returns User Successful Response
     * @throws ApiError
     */
    public static approveRequestAuthApproveRequestRequestIdPost(
        requestId: string,
        requestBody: ApproveRequest,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/approve-request/{request_id}',
            path: {
                'request_id': requestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Change Password
     * Change the current user's password.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static changePasswordAuthChangePasswordPost(
        requestBody: PasswordChange,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reset User
     * Reset a user's password and set is_first_login to True. Admin only.
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resetUserAuthUsersUserIdResetPost(
        userId: string,
        requestBody: ApproveRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/users/{user_id}/reset',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
