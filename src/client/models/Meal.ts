/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MealClassification } from './MealClassification';
import type { MealItem } from './MealItem';
import type { MealStatus } from './MealStatus';
export type Meal = {
    name?: (string | null);
    status?: MealStatus;
    classification?: (MealClassification | null);
    scheduled_date?: (string | null);
    is_shopped?: boolean;
    queue_position?: (number | null);
    id: string;
    user_id: string;
    template_id?: (string | null);
    household_id?: (string | null);
    created_at: string;
    updated_at: string;
    items: Array<MealItem>;
};

