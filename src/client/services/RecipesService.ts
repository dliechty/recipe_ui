/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
     * Retrieve a list of all recipes.
     * @param skip
     * @param limit
     * @returns Recipe Successful Response
     * @throws ApiError
     */
    public static readRecipesRecipesGet(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<Array<Recipe>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/recipes/',
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
     * Read Recipe
     * Retrieve a single recipe by its ID.
     * @param recipeId
     * @returns Recipe Successful Response
     * @throws ApiError
     */
    public static readRecipeRecipesRecipeIdGet(
        recipeId: string,
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'GET',
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
}
