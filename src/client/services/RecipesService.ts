/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Comment } from '../models/Comment';
import type { CommentCreate } from '../models/CommentCreate';
import type { CommentUpdate } from '../models/CommentUpdate';
import type { Recipe } from '../models/Recipe';
import type { RecipeCreate } from '../models/RecipeCreate';
import type { UnitSystem } from '../models/UnitSystem';
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
     *
     * **Filtering:** Use bracket notation `field[operator]=value` for filters.
     *
     * Operators: `eq` (equals), `neq` (not equals), `gt`, `gte`, `lt`, `lte`, `in` (comma-separated list), `like` (case-insensitive substring), `all` (must match all values).
     *
     * Filter fields: `id`, `name`, `description`, `category`, `cuisine`, `difficulty`, `protein`, `yield_amount`, `calories`, `prep_time_minutes`, `cook_time_minutes`, `active_time_minutes`, `total_time_minutes`, `owner`, `ingredients`, `suitable_for_diet`.
     *
     * Examples:
     * - `?name[like]=chicken` - Recipes with 'chicken' in name
     * - `?difficulty[eq]=easy` - Easy recipes only
     * - `?calories[gte]=200&calories[lte]=500` - Calories between 200-500
     * - `?category[in]=breakfast,lunch` - Breakfast or lunch recipes
     * - `?ingredients[all]=flour,eggs` - Recipes containing both flour AND eggs
     *
     * **Sorting:** Use the `sort` parameter with comma-separated fields. Prefix with `-` for descending.
     *
     * Returns total count in `X-Total-Count` response header.
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (1-1000)
     * @param sort Comma-separated sort fields. Prefix with '-' for descending order. Valid fields: name, calories, total_time_minutes, difficulty, category, cuisine, prep_time_minutes, cook_time_minutes, active_time_minutes, yield_amount, protein, created_at, updated_at. Example: '-created_at,name'
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
     * The response includes a `unit_system` field indicating the predominant unit system
     * used in the recipe's ingredients (metric or imperial).
     *
     * Optionally provide a `scale` parameter to multiply all ingredient quantities.
     * For example, scale=2 doubles all quantities, scale=0.5 halves them.
     *
     * Optionally provide a `units` parameter to convert ingredient quantities:
     * - 'metric': Convert to metric units (ml, g, cm)
     * - 'imperial': Convert to imperial units (cups, oz, inches)
     * @param recipeId
     * @param scale Scale factor for ingredient quantities (must be > 0)
     * @param units Convert ingredient units to 'metric' (ml, g, cm) or 'imperial' (cups, oz, inches)
     * @returns Recipe Successful Response
     * @throws ApiError
     */
    public static readRecipeRecipesRecipeIdGet(
        recipeId: string,
        scale?: (number | null),
        units?: (UnitSystem | null),
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/recipes/{recipe_id}',
            path: {
                'recipe_id': recipeId,
            },
            query: {
                'scale': scale,
                'units': units,
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
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (1-1000)
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
