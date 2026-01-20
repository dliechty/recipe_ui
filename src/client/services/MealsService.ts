/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Meal } from '../models/Meal';
import type { MealCreate } from '../models/MealCreate';
import type { MealScheduleRequest } from '../models/MealScheduleRequest';
import type { MealTemplate } from '../models/MealTemplate';
import type { MealTemplateCreate } from '../models/MealTemplateCreate';
import type { MealTemplateUpdate } from '../models/MealTemplateUpdate';
import type { MealUpdate } from '../models/MealUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MealsService {
    /**
     * Create Meal Template
     * @param requestBody
     * @returns MealTemplate Successful Response
     * @throws ApiError
     */
    public static createMealTemplateMealsTemplatesPost(
        requestBody: MealTemplateCreate,
    ): CancelablePromise<MealTemplate> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meals/templates',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Meal Templates
     * Retrieve a list of meal templates with optional filtering and sorting.
     *
     * **Filtering:** Use bracket notation `field[operator]=value` for filters.
     *
     * Operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `like`.
     *
     * Filter fields: `id`, `name`, `classification`, `created_at`, `updated_at`, `num_slots` (or `slots`), `recipe_id`, `owner` (or `created_by`).
     *
     * Examples:
     * - `?name[like]=weekly` - Templates with 'weekly' in name
     * - `?classification[eq]=dinner` - Dinner templates only
     * - `?num_slots[gte]=3` - Templates with 3+ slots
     * - `?recipe_id[eq]=<uuid>` - Templates containing specific recipe
     * - `?recipe_id[in]=<uuid1>,<uuid2>` - Templates containing any of the specified recipes
     *
     * **Sorting:** Use the `sort` parameter with comma-separated fields. Prefix with `-` for descending.
     *
     * Returns total count in `X-Total-Count` response header.
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (1-1000)
     * @param sort Comma-separated sort fields. Prefix with '-' for descending order. Valid fields: name, classification, created_at, updated_at. Example: 'name,-created_at'
     * @returns MealTemplate Successful Response
     * @throws ApiError
     */
    public static getMealTemplatesMealsTemplatesGet(
        skip?: number,
        limit: number = 100,
        sort?: string,
    ): CancelablePromise<Array<MealTemplate>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meals/templates',
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
     * Get Meal Template
     * @param templateId
     * @returns MealTemplate Successful Response
     * @throws ApiError
     */
    public static getMealTemplateMealsTemplatesTemplateIdGet(
        templateId: string,
    ): CancelablePromise<MealTemplate> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meals/templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Meal Template
     * @param templateId
     * @param requestBody
     * @returns MealTemplate Successful Response
     * @throws ApiError
     */
    public static updateMealTemplateMealsTemplatesTemplateIdPut(
        templateId: string,
        requestBody: MealTemplateUpdate,
    ): CancelablePromise<MealTemplate> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/meals/templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Meal Template
     * @param templateId
     * @returns void
     * @throws ApiError
     */
    public static deleteMealTemplateMealsTemplatesTemplateIdDelete(
        templateId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/meals/templates/{template_id}',
            path: {
                'template_id': templateId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Meal
     * @param templateId
     * @param requestBody
     * @returns Meal Successful Response
     * @throws ApiError
     */
    public static generateMealMealsGeneratePost(
        templateId: string,
        requestBody?: (MealScheduleRequest | null),
    ): CancelablePromise<Meal> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meals/generate',
            query: {
                'template_id': templateId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Meal
     * @param requestBody
     * @returns Meal Successful Response
     * @throws ApiError
     */
    public static createMealMealsPost(
        requestBody: MealCreate,
    ): CancelablePromise<Meal> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/meals/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Meals
     * Retrieve a list of meals with optional filtering and sorting.
     *
     * **Filtering:** Use bracket notation `field[operator]=value` for filters.
     *
     * Operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `like`.
     *
     * Filter fields: `id`, `name`, `status`, `classification`, `date`, `created_at`, `updated_at`, `recipe_id`, `owner` (or `created_by`).
     *
     * Examples:
     * - `?name[like]=weekly` - Meals with 'weekly' in name
     * - `?status[eq]=scheduled` - Scheduled meals only
     * - `?date[gte]=2024-01-01&date[lte]=2024-01-31` - Meals in January 2024
     * - `?recipe_id[eq]=<uuid>` - Meals containing specific recipe
     * - `?recipe_id[in]=<uuid1>,<uuid2>` - Meals containing any of the specified recipes
     * - `?classification[in]=breakfast,lunch` - Breakfast or lunch meals
     *
     * **Sorting:** Use the `sort` parameter with comma-separated fields. Prefix with `-` for descending.
     *
     * Returns total count in `X-Total-Count` response header.
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return (1-1000)
     * @param sort Comma-separated sort fields. Prefix with '-' for descending order. Valid fields: date, classification, status, created_at, updated_at, name. Default: date descending with unscheduled (null) dates first. Example: '-date,name'
     * @returns Meal Successful Response
     * @throws ApiError
     */
    public static getMealsMealsGet(
        skip?: number,
        limit: number = 100,
        sort?: string,
    ): CancelablePromise<Array<Meal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meals/',
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
     * Get Meal
     * @param mealId
     * @returns Meal Successful Response
     * @throws ApiError
     */
    public static getMealMealsMealIdGet(
        mealId: string,
    ): CancelablePromise<Meal> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/meals/{meal_id}',
            path: {
                'meal_id': mealId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Meal
     * @param mealId
     * @param requestBody
     * @returns Meal Successful Response
     * @throws ApiError
     */
    public static updateMealMealsMealIdPut(
        mealId: string,
        requestBody: MealUpdate,
    ): CancelablePromise<Meal> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/meals/{meal_id}',
            path: {
                'meal_id': mealId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Meal
     * @param mealId
     * @returns void
     * @throws ApiError
     */
    public static deleteMealMealsMealIdDelete(
        mealId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/meals/{meal_id}',
            path: {
                'meal_id': mealId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
