import { useQuery } from '@tanstack/react-query';
import { RecipesService, OpenAPI } from '../../../client';

function getContextHeaders() {
    const headers = typeof OpenAPI.HEADERS !== 'function' ? OpenAPI.HEADERS : undefined;
    return {
        xAdminMode: headers?.['X-Admin-Mode'] as string | undefined,
        xActAsUser: headers?.['X-Act-As-User'] as string | undefined,
        xActiveHousehold: headers?.['X-Active-Household'] as string | undefined,
    };
}

export const useRecipeMeta = (field: string) => {
    return useQuery({
        queryKey: ['recipes', 'meta', field],
        queryFn: () => {
            const { xAdminMode, xActAsUser, xActiveHousehold } = getContextHeaders();
            return RecipesService.getMetaValuesRecipesMetaFieldGet(field, xAdminMode, xActAsUser, xActiveHousehold);
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });
};
