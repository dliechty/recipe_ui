/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Recipe } from '../models/Recipe';
import type { RecipeCreate } from '../models/RecipeCreate';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Register a new user
     * @param requestBody
     * @returns User User registered successfully
     * @throws ApiError
     */
    public static registerUser(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/users/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Login to get access token
     * @param formData
     * @returns any Successful login
     * @throws ApiError
     */
    public static login(
        formData: {
            username: string;
            password: string;
        },
    ): CancelablePromise<{
        access_token?: string;
        token_type?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/token',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * Get all recipes
     * @returns Recipe List of recipes
     * @throws ApiError
     */
    public static getRecipes(): CancelablePromise<Array<Recipe>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/recipes/',
        });
    }
    /**
     * Create a new recipe
     * @param requestBody
     * @returns Recipe Recipe created
     * @throws ApiError
     */
    public static createRecipe(
        requestBody: RecipeCreate,
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/recipes/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get a specific recipe
     * @param id
     * @returns Recipe Recipe details
     * @throws ApiError
     */
    public static getRecipeById(
        id: number,
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/recipes/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update a recipe
     * @param id
     * @param requestBody
     * @returns Recipe Recipe updated
     * @throws ApiError
     */
    public static updateRecipe(
        id: number,
        requestBody: RecipeCreate,
    ): CancelablePromise<Recipe> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/recipes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a recipe
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteRecipe(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/recipes/{id}',
            path: {
                'id': id,
            },
        });
    }
}
