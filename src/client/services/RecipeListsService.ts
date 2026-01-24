/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RecipeList } from '../models/RecipeList';
import type { RecipeListAddRecipe } from '../models/RecipeListAddRecipe';
import type { RecipeListCreate } from '../models/RecipeListCreate';
import type { RecipeListItem } from '../models/RecipeListItem';
import type { RecipeListUpdate } from '../models/RecipeListUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RecipeListsService {
    /**
     * Create Recipe List
     * Create a new recipe list for the current user.
     * @param requestBody
     * @returns RecipeList Successful Response
     * @throws ApiError
     */
    public static createRecipeListListsPost(
        requestBody: RecipeListCreate,
    ): CancelablePromise<RecipeList> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/lists/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Recipe Lists
     * Retrieve recipe lists with optional filtering and sorting.
     *
     * Regular users can only see their own lists. Admins can see all lists.
     *
     * **Filtering:** Use bracket notation `field[operator]=value` for filters.
     *
     * Operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `like`.
     *
     * Filter fields: `id`, `name`, `created_at`, `updated_at`, `recipe_id`.
     *
     * Examples:
     * - `?name[like]=favorites` - Lists with 'favorites' in name
     * - `?recipe_id[eq]=<recipe_uuid>` - Lists containing a specific recipe
     *
     * **Sorting:** Use the `sort` parameter with comma-separated fields. Prefix with `-` for descending.
     *
     * Returns total count in `X-Total-Count` response header.
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (1-1000)
     * @param sort Comma-separated sort fields. Prefix with '-' for descending order. Valid fields: name, created_at, updated_at. Example: 'name,-created_at'
     * @returns RecipeList Successful Response
     * @throws ApiError
     */
    public static getRecipeListsListsGet(
        skip?: number,
        limit: number = 100,
        sort?: string,
    ): CancelablePromise<Array<RecipeList>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/lists/',
            query: {
                'skip': skip,
                'limit': limit,
                'sort': sort,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Recipe List
     * Retrieve a specific recipe list by ID.
     * Only the owner or an admin can view the list.
     * @param listId
     * @returns RecipeList Successful Response
     * @throws ApiError
     */
    public static getRecipeListListsListIdGet(
        listId: string,
    ): CancelablePromise<RecipeList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/lists/{list_id}',
            path: {
                'list_id': listId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Recipe List
     * Update a recipe list's name and/or description.
     * Only the owner can update their list.
     * @param listId
     * @param requestBody
     * @returns RecipeList Successful Response
     * @throws ApiError
     */
    public static updateRecipeListListsListIdPut(
        listId: string,
        requestBody: RecipeListUpdate,
    ): CancelablePromise<RecipeList> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/lists/{list_id}',
            path: {
                'list_id': listId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Recipe List
     * Delete a recipe list.
     * Only the owner can delete their list.
     * @param listId
     * @returns void
     * @throws ApiError
     */
    public static deleteRecipeListListsListIdDelete(
        listId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/lists/{list_id}',
            path: {
                'list_id': listId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Recipe To List
     * Add a recipe to a recipe list.
     * Only the owner can add recipes to their list.
     * @param listId
     * @param requestBody
     * @returns RecipeListItem Successful Response
     * @throws ApiError
     */
    public static addRecipeToListListsListIdRecipesPost(
        listId: string,
        requestBody: RecipeListAddRecipe,
    ): CancelablePromise<RecipeListItem> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/lists/{list_id}/recipes',
            path: {
                'list_id': listId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Recipe From List
     * Remove a recipe from a recipe list.
     * Only the owner can remove recipes from their list.
     * @param listId
     * @param recipeId
     * @returns void
     * @throws ApiError
     */
    public static removeRecipeFromListListsListIdRecipesRecipeIdDelete(
        listId: string,
        recipeId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/lists/{list_id}/recipes/{recipe_id}',
            path: {
                'list_id': listId,
                'recipe_id': recipeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
