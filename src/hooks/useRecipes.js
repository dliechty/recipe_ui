import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipesService } from '../client';

export const useRecipes = () => {
    return useQuery({
        queryKey: ['recipes'],
        queryFn: RecipesService.readRecipesRecipesGet,
    });
};

export const useRecipe = (id) => {
    return useQuery({
        queryKey: ['recipes', id],
        queryFn: () => RecipesService.readRecipeRecipesRecipeIdGet(id),
        enabled: !!id,
    });
};

export const useCreateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: RecipesService.createRecipeRecipesPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
        },
    });
};

export const useUpdateRecipe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, requestBody }) => RecipesService.updateRecipeRecipesRecipeIdPut(id, requestBody),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
            queryClient.invalidateQueries({ queryKey: ['recipes', variables.id] });
        },
    });
};
