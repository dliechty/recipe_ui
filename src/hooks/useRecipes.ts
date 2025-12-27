import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipesService, Recipe, RecipeCreate } from '../client';

export const useRecipes = () => {
    return useQuery<Recipe[]>({
        queryKey: ['recipes'],
        queryFn: () => RecipesService.readRecipesRecipesGet(),
    });
};

export const useRecipe = (id: number) => {
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
    return useMutation<Recipe, Error, { id: number, requestBody: RecipeCreate }>({
        mutationFn: ({ id, requestBody }) => RecipesService.updateRecipeRecipesRecipeIdPut(id, requestBody),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
            queryClient.invalidateQueries({ queryKey: ['recipes', variables.id] });
        },
    });
};
