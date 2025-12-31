import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { RecipesService, Recipe, RecipeCreate, OpenAPI } from '../client';
import axios from 'axios';

interface RecipesResponse {
    recipes: Recipe[];
    totalCount: number;
}

export const useInfiniteRecipes = (limit: number = 50) => {
    return useInfiniteQuery<RecipesResponse>({
        queryKey: ['recipes', 'infinite', limit],
        queryFn: async ({ pageParam = 1 }) => {
            const page = pageParam as number;
            // Calculate skip based on page and limit
            const skip = (page - 1) * limit;

            // Construct URL manually to bypass service wrapper and get headers
            const url = `${OpenAPI.BASE}/recipes/?skip=${skip}&limit=${limit}`;

            // Get token if available (similar to core/request.ts logic but simplified for hook)
            const token = typeof OpenAPI.TOKEN === 'function'
                ? await OpenAPI.TOKEN({ method: 'GET', url: '/recipes/' })
                : OpenAPI.TOKEN;

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(url, { headers });

            const totalCount = Number(response.headers['x-total-count'] || 0);

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
