/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Component } from './Component';
import type { DietType } from './DietType';
import type { Instruction } from './Instruction';
import type { RecipeAudit } from './RecipeAudit';
import type { RecipeCore } from './RecipeCore';
import type { RecipeNutrition } from './RecipeNutrition';
import type { RecipeTimes } from './RecipeTimes';
export type Recipe = {
    core: RecipeCore;
    times: RecipeTimes;
    components: Array<Component>;
    instructions: Array<Instruction>;
    nutrition: RecipeNutrition;
    suitable_for_diet: Array<DietType>;
    variant_recipe_ids: Array<string>;
    parent_recipe_id?: (string | null);
    audit: RecipeAudit;
};

