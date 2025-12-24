/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Instruction } from './Instruction';
import type { RecipeIngredient } from './RecipeIngredient';
import type { Tag } from './Tag';
export type Recipe = {
    name: string;
    description?: (string | null);
    prep_time_minutes: number;
    cook_time_minutes: number;
    servings: number;
    source?: (string | null);
    id: number;
    owner_id: number;
    ingredients?: Array<RecipeIngredient>;
    instructions?: Array<Instruction>;
    tags?: Array<Tag>;
};

