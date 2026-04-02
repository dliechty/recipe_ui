import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipesService, ApiError, OpenAPI } from '../client';
import { toaster } from '../toaster';

function getContextHeaders() {
    const headers = typeof OpenAPI.HEADERS !== 'function' ? OpenAPI.HEADERS : undefined;
    return {
        xAdminMode: headers?.['X-Admin-Mode'] as string | undefined,
        xActAsUser: headers?.['X-Act-As-User'] as string | undefined,
        xActiveHousehold: headers?.['X-Active-Household'] as string | undefined,
    };
}

export const useComments = (recipeId: string) => {
    return useQuery({
        queryKey: ['comments', recipeId],
        queryFn: () => {
            const { xAdminMode, xActAsUser, xActiveHousehold } = getContextHeaders();
            return RecipesService.readCommentsRecipesRecipeIdCommentsGet(recipeId, undefined, undefined, xAdminMode, xActAsUser, xActiveHousehold);
        },
        enabled: !!recipeId,
    });
};

export const useAddComment = (recipeId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { text: string }) => {
            const { xAdminMode, xActAsUser, xActiveHousehold } = getContextHeaders();
            return RecipesService.createCommentRecipesRecipeIdCommentsPost(recipeId, data, xAdminMode, xActAsUser, xActiveHousehold);
        },
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
        mutationFn: ({ commentId, data }: { commentId: string; data: { text: string } }) => {
            const { xAdminMode, xActAsUser, xActiveHousehold } = getContextHeaders();
            return RecipesService.updateCommentRecipesRecipeIdCommentsCommentIdPut(recipeId, commentId, data, xAdminMode, xActAsUser, xActiveHousehold);
        },
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
        mutationFn: (commentId: string) => {
            const { xAdminMode, xActAsUser, xActiveHousehold } = getContextHeaders();
            return RecipesService.deleteCommentRecipesRecipeIdCommentsCommentIdDelete(recipeId, commentId, xAdminMode, xActAsUser, xActiveHousehold);
        },
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
