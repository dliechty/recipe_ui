/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MealClassification } from './MealClassification';
import type { MealItemBase } from './MealItemBase';
import type { MealStatus } from './MealStatus';
export type MealCreate = {
    name?: (string | null);
    status?: MealStatus;
    classification?: (MealClassification | null);
    scheduled_date?: (string | null);
    is_shopped?: boolean;
    queue_position?: (number | null);
    template_id?: (string | null);
    items?: Array<MealItemBase>;
};

