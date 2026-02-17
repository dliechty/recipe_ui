/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateFilter } from './TemplateFilter';
/**
 * Request to generate multiple meals from user's templates.
 */
export type MealGenerateRequest = {
    count: number;
    scheduled_dates?: (Array<string> | null);
    template_filter?: (Array<TemplateFilter> | null);
};

