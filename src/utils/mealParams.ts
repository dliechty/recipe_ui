import { MealStatus } from '../client/models/MealStatus';
import { MealClassification } from '../client/models/MealClassification';

export interface MealFilters {
    name?: string;
    status?: MealStatus[];
    classification?: MealClassification[];
    owner?: string[];
    date?: { gt?: string; lt?: string };
    recipe?: string[];
    sort?: string;
}

export interface TemplateFilters {
    name?: string;
    classification?: MealClassification[];
    owner?: string[];
    num_slots?: { gte?: number; lte?: number };
    recipe?: string[];
    sort?: string;
}

export const mealFiltersToSearchParams = (filters: MealFilters): URLSearchParams => {
    const params = new URLSearchParams();

    if (filters.name) params.set('name', filters.name);
    if (filters.sort) params.set('sort', filters.sort);

    // Arrays
    if (filters.status?.length) params.set('status', filters.status.join(','));
    if (filters.classification?.length) params.set('classification', filters.classification.join(','));
    if (filters.owner?.length) params.set('owner', filters.owner.join(','));
    if (filters.recipe?.length) params.set('recipe', filters.recipe.join(','));

    // Date Range
    if (filters.date) {
        if (filters.date.gt) params.set('date_gt', filters.date.gt);
        if (filters.date.lt) params.set('date_lt', filters.date.lt);
    }

    return params;
};

export const searchParamsToMealFilters = (params: URLSearchParams): MealFilters => {
    const filters: MealFilters = {};

    const name = params.get('name');
    if (name) filters.name = name;

    const sort = params.get('sort');
    if (sort) filters.sort = sort;

    // Arrays
    const status = params.get('status');
    if (status) filters.status = status.split(',') as MealStatus[];

    const classification = params.get('classification');
    if (classification) filters.classification = classification.split(',') as MealClassification[];

    const owner = params.get('owner');
    if (owner) filters.owner = owner.split(',');

    const recipe = params.get('recipe');
    if (recipe) filters.recipe = recipe.split(',');

    // Date Range
    const dateGt = params.get('date_gt');
    const dateLt = params.get('date_lt');

    if (dateGt || dateLt) {
        filters.date = {};
        if (dateGt) filters.date.gt = dateGt;
        if (dateLt) filters.date.lt = dateLt;
    }

    return filters;
};

export const templateFiltersToSearchParams = (filters: TemplateFilters): URLSearchParams => {
    const params = new URLSearchParams();

    if (filters.name) params.set('name', filters.name);
    if (filters.sort) params.set('sort', filters.sort);

    // Arrays
    if (filters.classification?.length) params.set('classification', filters.classification.join(','));
    if (filters.owner?.length) params.set('owner', filters.owner.join(','));
    if (filters.recipe?.length) params.set('recipe', filters.recipe.join(','));

    // Slot Count Range
    if (filters.num_slots) {
        if (filters.num_slots.gte !== undefined) params.set('num_slots_gte', filters.num_slots.gte.toString());
        if (filters.num_slots.lte !== undefined) params.set('num_slots_lte', filters.num_slots.lte.toString());
    }

    return params;
};

export const searchParamsToTemplateFilters = (params: URLSearchParams): TemplateFilters => {
    const filters: TemplateFilters = {};

    const name = params.get('name');
    if (name) filters.name = name;

    const sort = params.get('sort');
    if (sort) filters.sort = sort;

    // Arrays
    const classification = params.get('classification');
    if (classification) filters.classification = classification.split(',') as MealClassification[];

    const owner = params.get('owner');
    if (owner) filters.owner = owner.split(',');

    const recipe = params.get('recipe');
    if (recipe) filters.recipe = recipe.split(',');

    // Slot Count Range
    const slotsGte = params.get('num_slots_gte');
    const slotsLte = params.get('num_slots_lte');

    if (slotsGte || slotsLte) {
        filters.num_slots = {};
        if (slotsGte) filters.num_slots.gte = Number(slotsGte);
        if (slotsLte) filters.num_slots.lte = Number(slotsLte);
    }

    return filters;
};
