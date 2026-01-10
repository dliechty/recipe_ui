/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MealClassification } from './MealClassification';
import type { MealTemplateSlot } from './MealTemplateSlot';
export type MealTemplate = {
    name: string;
    classification?: (MealClassification | null);
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    slots: Array<MealTemplateSlot>;
};

