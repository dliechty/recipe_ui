/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComponentCreate } from './ComponentCreate';
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
};

