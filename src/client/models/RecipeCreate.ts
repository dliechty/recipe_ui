/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComponentCreate } from './ComponentCreate';
import type { DietType } from './DietType';
import type { InstructionCreate } from './InstructionCreate';
import type { RecipeAudit } from './RecipeAudit';
import type { RecipeCoreCreate } from './RecipeCoreCreate';
import type { RecipeNutrition } from './RecipeNutrition';
import type { RecipeTimes } from './RecipeTimes';
export type RecipeCreate = {
    core: RecipeCoreCreate;
    times: RecipeTimes;
    nutrition: RecipeNutrition;
    audit?: (RecipeAudit | null);
    components: Array<ComponentCreate>;
    instructions: Array<InstructionCreate>;
    suitable_for_diet?: Array<DietType>;
    parent_recipe_id?: (string | null);
};

