import { useQuery } from '@tanstack/react-query';
import { RecipesService } from '../../../client';

export const useRecipeMeta = (field: string) => {
    return useQuery({
        queryKey: ['recipes', 'meta', field],
        queryFn: () => RecipesService.getMetaValuesRecipesMetaFieldGet(field),
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });
};
