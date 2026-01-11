import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipesService, ApiError } from '../client';
import { toaster } from '../toaster';

export const useComments = (recipeId: string) => {
    return useQuery({
        queryKey: ['comments', recipeId],
        queryFn: () => RecipesService.readCommentsRecipesRecipeIdCommentsGet(recipeId),
        enabled: !!recipeId,
    });
};

export const useAddComment = (recipeId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { text: string }) =>
            RecipesService.createCommentRecipesRecipeIdCommentsPost(recipeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', recipeId] });
            toaster.create({
                title: 'Comment added',
                type: 'success',
            });
        },
        onError: (error: ApiError) => {
            toaster.create({
                title: 'Failed to add comment',
                description: error.body?.detail || error.message || 'Unknown error',
                type: 'error',
            });
        }
    });
};

export const useUpdateComment = (recipeId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, data }: { commentId: string; data: { text: string } }) =>
            RecipesService.updateCommentRecipesRecipeIdCommentsCommentIdPut(recipeId, commentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', recipeId] });
            toaster.create({
                title: 'Comment updated',
                type: 'success',
            });
        },
        onError: (error: ApiError) => {
            toaster.create({
                title: 'Failed to update comment',
                description: error.body?.detail || error.message || 'Unknown error',
                type: 'error',
            });
        }
    });
};

export const useDeleteComment = (recipeId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) =>
            RecipesService.deleteCommentRecipesRecipeIdCommentsCommentIdDelete(recipeId, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', recipeId] });
            toaster.create({
                title: 'Comment deleted',
                type: 'success',
            });
        },
        onError: (error: ApiError) => {
            toaster.create({
                title: 'Failed to delete comment',
                description: error.body?.detail || error.message || 'Unknown error',
                type: 'error',
            });
        }
    });
};
