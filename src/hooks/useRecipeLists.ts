import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipeListsService, RecipeList, RecipeListCreate, RecipeListUpdate, RecipeListAddRecipe, RecipeListItem } from '../client';

// Hook to get all recipe lists for the current user
export const useRecipeLists = (options?: { enabled?: boolean }) => {
    return useQuery<RecipeList[]>({
        enabled: options?.enabled,
        queryKey: ['recipeLists'],
        queryFn: () => RecipeListsService.getRecipeListsListsGet(0, 1000, '-created_at'),
    });
};

// Hook to get a specific recipe list by ID
export const useRecipeList = (listId: string) => {
    return useQuery<RecipeList>({
        queryKey: ['recipeLists', listId],
        queryFn: () => RecipeListsService.getRecipeListListsListIdGet(listId),
        enabled: !!listId,
    });
};

// Hook to create a new recipe list
export const useCreateRecipeList = () => {
    const queryClient = useQueryClient();
    return useMutation<RecipeList, Error, RecipeListCreate>({
        mutationFn: (requestBody) => RecipeListsService.createRecipeListListsPost(requestBody),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipeLists'] });
        },
    });
};

// Hook to update a recipe list
export const useUpdateRecipeList = () => {
    const queryClient = useQueryClient();
    return useMutation<RecipeList, Error, { listId: string; requestBody: RecipeListUpdate }>({
        mutationFn: ({ listId, requestBody }) => RecipeListsService.updateRecipeListListsListIdPut(listId, requestBody),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recipeLists'] });
            queryClient.invalidateQueries({ queryKey: ['recipeLists', variables.listId] });
        },
    });
};

// Hook to delete a recipe list
export const useDeleteRecipeList = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (listId) => RecipeListsService.deleteRecipeListListsListIdDelete(listId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipeLists'] });
        },
    });
};

// Hook to add a recipe to a list
export const useAddRecipeToList = () => {
    const queryClient = useQueryClient();
    return useMutation<RecipeListItem, Error, { listId: string; requestBody: RecipeListAddRecipe }>({
        mutationFn: ({ listId, requestBody }) => RecipeListsService.addRecipeToListListsListIdRecipesPost(listId, requestBody),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recipeLists'] });
            queryClient.invalidateQueries({ queryKey: ['recipeLists', variables.listId] });
        },
    });
};

// Hook to remove a recipe from a list
export const useRemoveRecipeFromList = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { listId: string; recipeId: string }>({
        mutationFn: ({ listId, recipeId }) => RecipeListsService.removeRecipeFromListListsListIdRecipesRecipeIdDelete(listId, recipeId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recipeLists'] });
            queryClient.invalidateQueries({ queryKey: ['recipeLists', variables.listId] });
        },
    });
};
