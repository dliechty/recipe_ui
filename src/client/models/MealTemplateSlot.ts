/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MealTemplateSlotStrategy } from './MealTemplateSlotStrategy';
import type { RecipeCore } from './RecipeCore';
import type { SearchCriterion } from './SearchCriterion';
export type MealTemplateSlot = {
    strategy: MealTemplateSlotStrategy;
    recipe_id?: (string | null);
    recipe_ids?: (Array<string> | null);
    search_criteria?: (Array<SearchCriterion> | null);
    id: string;
    template_id: string;
    recipes?: Array<RecipeCore>;
};

