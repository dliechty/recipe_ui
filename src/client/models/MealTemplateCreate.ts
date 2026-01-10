/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MealClassification } from './MealClassification';
import type { MealTemplateSlotCreate } from './MealTemplateSlotCreate';
export type MealTemplateCreate = {
    name: string;
    classification?: (MealClassification | null);
    slots: Array<MealTemplateSlotCreate>;
};

