/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserPublic } from './UserPublic';
export type HouseholdMember = {
    id: string;
    user_id: string;
    user: UserPublic;
    is_primary: boolean;
    joined_at: string;
};

