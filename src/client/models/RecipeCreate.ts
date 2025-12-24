/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InstructionCreate } from './InstructionCreate';
import type { RecipeIngredientCreate } from './RecipeIngredientCreate';
export type RecipeCreate = {
    name: string;
    description?: (string | null);
    prep_time_minutes: number;
    cook_time_minutes: number;
    servings: number;
    source?: (string | null);
    ingredients: Array<RecipeIngredientCreate>;
    instructions: Array<InstructionCreate>;
    tags?: Array<string>;
};

