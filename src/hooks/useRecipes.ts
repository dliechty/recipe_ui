import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { RecipesService, Recipe, RecipeCreate, OpenAPI } from '../client';
import axios from 'axios';

interface RecipesResponse {
    recipes: Recipe[];
    totalCount: number;
}

// Define Filter Interface
export interface RecipeFilters {
    name?: string;
    category?: string[];
    cuisine?: string[];
    difficulty?: string[];
    owner?: string[];
    calories?: { gt?: number; lt?: number };
    total_time?: { gt?: number; lt?: number };
    prep_time?: { gt?: number; lt?: number };
    active_time?: { gt?: number; lt?: number };
    cook_time?: { gt?: number; lt?: number };
    ingredients?: { has_all?: string[]; has_any?: string[]; exclude?: string[] };
    protein?: string[];
    yield?: { gt?: number; lt?: number };
    suitable_for_diet?: string[];
    sort?: string;
}

export const useInfiniteRecipes = (limit: number = 50, filters: RecipeFilters = {}) => {
    return useInfiniteQuery<RecipesResponse>({
        queryKey: ['recipes', 'infinite', limit, filters],
        queryFn: async ({ pageParam = 1 }) => {
            const page = pageParam as number;
            // Calculate skip based on page and limit
            const skip = (page - 1) * limit;

            // Construct URL manually to bypass service wrapper and get headers
            // Construct URL manually to bypass service wrapper and get headers
            const params = new URLSearchParams();
            params.append('skip', skip.toString());
            params.append('limit', limit.toString());

            if (filters.name) params.append('name[like]', filters.name);

            if (filters.category?.length) params.append('category[in]', filters.category.join(','));
            if (filters.cuisine?.length) params.append('cuisine[in]', filters.cuisine.join(','));
            if (filters.difficulty?.length) params.append('difficulty[in]', filters.difficulty.join(','));
            if (filters.owner?.length) params.append('owner[in]', filters.owner.join(','));

            if (filters.calories?.gt) params.append('calories[gt]', filters.calories.gt.toString());
            if (filters.calories?.lt) params.append('calories[lt]', filters.calories.lt.toString());

            if (filters.total_time?.gt) params.append('total_time_minutes[gt]', filters.total_time.gt.toString());
            if (filters.total_time?.lt) params.append('total_time_minutes[lt]', filters.total_time.lt.toString());

            if (filters.prep_time?.gt) params.append('prep_time_minutes[gt]', filters.prep_time.gt.toString());
            if (filters.prep_time?.lt) params.append('prep_time_minutes[lt]', filters.prep_time.lt.toString());

            if (filters.active_time?.gt) params.append('active_time_minutes[gt]', filters.active_time.gt.toString());
            if (filters.active_time?.lt) params.append('active_time_minutes[lt]', filters.active_time.lt.toString());

            if (filters.cook_time?.gt) params.append('cook_time_minutes[gt]', filters.cook_time.gt.toString());
            if (filters.cook_time?.lt) params.append('cook_time_minutes[lt]', filters.cook_time.lt.toString());

            if (filters.ingredients?.has_all?.length) {
                params.append('ingredients[all]', filters.ingredients.has_all.join(','));
            }
            // Temporarily ignore has_any/exclude as they are not standard LHS for now or specified as such
            // Or handle exclude if needed later.

            if (filters.protein?.length) params.append('protein[in]', filters.protein.join(','));

            if (filters.yield?.gt) params.append('yield_amount[gt]', filters.yield.gt.toString());
            if (filters.yield?.lt) params.append('yield_amount[lt]', filters.yield.lt.toString());

            if (filters.suitable_for_diet?.length) params.append('suitable_for_diet[in]', filters.suitable_for_diet.join(','));

            if (filters.sort) params.append('sort', filters.sort);

            const url = `${OpenAPI.BASE}/recipes/?${params.toString()}`;

            // Get token if available (similar to core/request.ts logic but simplified for hook)
            const token = typeof OpenAPI.TOKEN === 'function'
                ? await OpenAPI.TOKEN({ method: 'GET', url: '/recipes/' })
                : OpenAPI.TOKEN;

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(url, { headers });

            const totalCount = Number(response.headers['x-total-count'] || response.headers['X-Total-Count'] || 0);

            return {
                recipes: response.data,
                totalCount
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.flatMap(p => p.recipes).length;
            if (loadedCount < lastPage.totalCount) {
                return allPages.length + 1;
            }
            return undefined;
        },
    });
};

export const useRecipe = (id: string) => {
    return useQuery<Recipe>({
        queryKey: ['recipes', id],
        queryFn: () => RecipesService.readRecipeRecipesRecipeIdGet(id),
        enabled: !!id,
    });
};

export const useCreateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation<Recipe, Error, RecipeCreate>({
        mutationFn: (requestBody) => RecipesService.createRecipeRecipesPost(requestBody),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
        },
    });
};

export const useUpdateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation<Recipe, Error, { id: string, requestBody: RecipeCreate }>({
        mutationFn: ({ id, requestBody }) => RecipesService.updateRecipeRecipesRecipeIdPut(id, requestBody),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
            queryClient.invalidateQueries({ queryKey: ['recipes', variables.id] });
        },
    });
};
