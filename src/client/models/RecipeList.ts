/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RecipeListItem } from './RecipeListItem';
export type RecipeList = {
    name: string;
    description?: (string | null);
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    items?: Array<RecipeListItem>;
};

