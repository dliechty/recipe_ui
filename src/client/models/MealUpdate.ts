/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MealClassification } from './MealClassification';
import type { MealItemBase } from './MealItemBase';
import type { MealStatus } from './MealStatus';
export type MealUpdate = {
    name?: (string | null);
    status?: (MealStatus | null);
    classification?: (MealClassification | null);
    scheduled_date?: (string | null);
    is_shopped?: (boolean | null);
    queue_position?: (number | null);
    items?: (Array<MealItemBase> | null);
};

