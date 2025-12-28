/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DifficultyLevel } from './DifficultyLevel';
export type RecipeCore = {
    name: string;
    slug?: (string | null);
    description?: (string | null);
    yield_amount?: (number | null);
    yield_unit?: (string | null);
    difficulty?: (DifficultyLevel | null);
    cuisine?: (string | null);
    category?: (string | null);
    source?: (string | null);
    source_url?: (string | null);
    id: string;
    owner_id: string;
};

