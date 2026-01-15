/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Comment } from '../models/Comment';
import type { CommentCreate } from '../models/CommentCreate';
import type { CommentUpdate } from '../models/CommentUpdate';
import type { Recipe } from '../models/Recipe';
import type { RecipeCreate } from '../models/RecipeCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RecipesService {
    /**
     * Create Recipe
     * Create a new recipe for the currently authenticated user.
     * @param requestBody
     * @returns Recipe Successful Response
     * @throws ApiError
     */
    public static createRecipeRecipesPost(
        requestBody: RecipeCreate,
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/recipes/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Recipes
     * Retrieve a list of all recipes with optional filtering and sorting.
     * Filters: field[eq]=value, field[gt]=value, etc.
     * Sort: sort=field1,-field2
     * @param skip
     * @param limit
     * @param sort
     * @returns Recipe Successful Response
     * @throws ApiError
     */
    public static readRecipesRecipesGet(
        skip?: number,
        limit: number = 100,
        sort?: string,
    ): CancelablePromise<Array<Recipe>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/recipes/',
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
     * Get Meta Values
     * Retrieve unique values for a specific field for metadata usage.
     * @param field
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getMetaValuesRecipesMetaFieldGet(
        field: string,
    ): CancelablePromise<Array<any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/recipes/meta/{field}',
            path: {
                'field': field,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Recipe
     * Retrieve a single recipe by its ID.
     *
     * Optionally provide a `scale` parameter to multiply all ingredient quantities.
     * For example, scale=2 doubles all quantities, scale=0.5 halves them.
     * @param recipeId
     * @param scale Scale factor for ingredient quantities (must be > 0)
     * @returns Recipe Successful Response
     * @throws ApiError
     */
    public static readRecipeRecipesRecipeIdGet(
        recipeId: string,
        scale?: (number | null),
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/recipes/{recipe_id}',
            path: {
                'recipe_id': recipeId,
            },
            query: {
                'scale': scale,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Recipe
     * Update a recipe. Only the owner of the recipe can perform this action.
     * @param recipeId
     * @param requestBody
     * @returns Recipe Successful Response
     * @throws ApiError
     */
    public static updateRecipeRecipesRecipeIdPut(
        recipeId: string,
        requestBody: RecipeCreate,
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/recipes/{recipe_id}',
            path: {
                'recipe_id': recipeId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Recipe
     * Delete a recipe. Only the owner of the recipe can perform this action.
     * @param recipeId
     * @returns Recipe Successful Response
     * @throws ApiError
     */
    public static deleteRecipeRecipesRecipeIdDelete(
        recipeId: string,
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/recipes/{recipe_id}',
            path: {
                'recipe_id': recipeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Comment
     * Add a comment to a recipe.
     * @param recipeId
     * @param requestBody
     * @returns Comment Successful Response
     * @throws ApiError
     */
    public static createCommentRecipesRecipeIdCommentsPost(
        recipeId: string,
        requestBody: CommentCreate,
    ): CancelablePromise<Comment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/recipes/{recipe_id}/comments',
            path: {
                'recipe_id': recipeId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Comments
     * Get comments for a recipe.
     * @param recipeId
     * @param skip
     * @param limit
     * @returns Comment Successful Response
     * @throws ApiError
     */
    public static readCommentsRecipesRecipeIdCommentsGet(
        recipeId: string,
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<Comment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/recipes/{recipe_id}/comments',
            path: {
                'recipe_id': recipeId,
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
     * Update Comment
     * Update a comment. Only the author of the comment or an admin can update it.
     * @param recipeId
     * @param commentId
     * @param requestBody
     * @returns Comment Successful Response
     * @throws ApiError
     */
    public static updateCommentRecipesRecipeIdCommentsCommentIdPut(
        recipeId: string,
        commentId: string,
        requestBody: CommentUpdate,
    ): CancelablePromise<Comment> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/recipes/{recipe_id}/comments/{comment_id}',
            path: {
                'recipe_id': recipeId,
                'comment_id': commentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Comment
     * Delete a comment. Only the author of the comment or an admin can delete it.
     * @param recipeId
     * @param commentId
     * @returns void
     * @throws ApiError
     */
    public static deleteCommentRecipesRecipeIdCommentsCommentIdDelete(
        recipeId: string,
        commentId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/recipes/{recipe_id}/comments/{comment_id}',
            path: {
                'recipe_id': recipeId,
                'comment_id': commentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
