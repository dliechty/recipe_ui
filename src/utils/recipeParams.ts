import { RecipeFilters } from '../hooks/useRecipes';

export const filtersToSearchParams = (filters: RecipeFilters): URLSearchParams => {
    const params = new URLSearchParams();

    if (filters.name) params.set('name', filters.name);
    if (filters.sort) params.set('sort', filters.sort);

    // Arrays - join with commas
    const arrayFields: (keyof RecipeFilters)[] = [
        'category', 'cuisine', 'difficulty', 'owner',
        'protein', 'suitable_for_diet', 'ids'
    ];

    arrayFields.forEach(field => {
        const val = filters[field];
        if (Array.isArray(val) && val.length > 0) {
            params.set(field, val.join(','));
        }
    });

    // Nested Ranges
    const rangeFields: (keyof RecipeFilters)[] = [
        'calories', 'total_time', 'prep_time',
        'active_time', 'cook_time', 'yield'
    ];

    rangeFields.forEach(field => {
        const val = filters[field] as { gt?: number; lt?: number } | undefined;
        if (val) {
            if (val.gt !== undefined) params.set(`${field}_gt`, val.gt.toString());
            if (val.lt !== undefined) params.set(`${field}_lt`, val.lt.toString());
        }
    });

    // Nested Objects
    if (filters.ingredients?.like) {
        params.set('ingredients_like', filters.ingredients.like);
    }

    return params;
};

export const searchParamsToFilters = (params: URLSearchParams): RecipeFilters => {
    const filters: RecipeFilters = {};

    const name = params.get('name');
    if (name) filters.name = name;

    const sort = params.get('sort');
    if (sort) filters.sort = sort;

    // Arrays
    const arrayFields: (keyof RecipeFilters)[] = [
        'category', 'cuisine', 'difficulty', 'owner',
        'protein', 'suitable_for_diet', 'ids'
    ];

    arrayFields.forEach(field => {
        const val = params.get(field);
        if (val) {
            (filters[field] as any) = val.split(',');
        }
    });

    // Nested Ranges
    const rangeFields: (keyof RecipeFilters)[] = [
        'calories', 'total_time', 'prep_time',
        'active_time', 'cook_time', 'yield'
    ];

    rangeFields.forEach(field => {
        const gt = params.get(`${field}_gt`);
        const lt = params.get(`${field}_lt`);

        if (gt || lt) {
            (filters[field] as any) = {};
            // we know field points to a range object in filters
            if (gt) (filters[field] as any).gt = Number(gt);
            if (lt) (filters[field] as any).lt = Number(lt);
        }
    });

    // Ingredients
    const ingredientsLike = params.get('ingredients_like');
    if (ingredientsLike) {
        filters.ingredients = { like: ingredientsLike };
    }

    return filters;
};
