import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { MealsService, Meal, MealCreate, MealUpdate, MealTemplate, MealTemplateCreate, MealTemplateUpdate, OpenAPI } from '../client';
import axios from 'axios';

interface MealsResponse {
    meals: Meal[];
    totalCount: number;
}

export const useInfiniteMeals = (limit: number = 20) => {
    return useInfiniteQuery<MealsResponse>({
        queryKey: ['meals', 'infinite', limit],
        queryFn: async ({ pageParam = 1 }) => {
            const page = pageParam as number;
            const skip = (page - 1) * limit;

            const params = new URLSearchParams();
            params.append('skip', skip.toString());
            params.append('limit', limit.toString());

            const url = `${OpenAPI.BASE}/meals/?${params.toString()}`;

            // Get token if available
            const token = typeof OpenAPI.TOKEN === 'function'
                ? await OpenAPI.TOKEN({ method: 'GET', url: '/meals/' })
                : OpenAPI.TOKEN;

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(url, { headers });
            const totalCount = Number(response.headers['x-total-count'] || response.headers['X-Total-Count'] || 0);

            return {
                meals: response.data,
                totalCount
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.flatMap(p => p.meals).length;
            if (loadedCount < lastPage.totalCount) {
                return allPages.length + 1;
            }
            return undefined;
        },
    });
};

export const useMeal = (id: string) => {
    return useQuery<Meal>({
        queryKey: ['meals', id],
        queryFn: () => MealsService.getMealMealsMealIdGet(id),
        enabled: !!id,
    });
};

export const useCreateMeal = () => {
    const queryClient = useQueryClient();
    return useMutation<Meal, Error, MealCreate>({
        mutationFn: (requestBody) => MealsService.createMealMealsPost(requestBody),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
};

export const useUpdateMeal = () => {
    const queryClient = useQueryClient();
    return useMutation<Meal, Error, { id: string, requestBody: MealUpdate }>({
        mutationFn: ({ id, requestBody }) => MealsService.updateMealMealsMealIdPut(id, requestBody),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
            queryClient.invalidateQueries({ queryKey: ['meals', variables.id] });
        },
    });
};

export const useDeleteMeal = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => MealsService.deleteMealMealsMealIdDelete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
};

interface TemplatesResponse {
    templates: MealTemplate[];
    totalCount: number;
}

export const useInfiniteMealTemplates = (limit: number = 20) => {
    return useInfiniteQuery<TemplatesResponse>({
        queryKey: ['meal-templates', 'infinite', limit],
        queryFn: async ({ pageParam = 1 }) => {
            const page = pageParam as number;
            const skip = (page - 1) * limit;

            const params = new URLSearchParams();
            params.append('skip', skip.toString());
            params.append('limit', limit.toString());

            const url = `${OpenAPI.BASE}/meals/templates?${params.toString()}`;

            // Get token if available
            const token = typeof OpenAPI.TOKEN === 'function'
                ? await OpenAPI.TOKEN({ method: 'GET', url: '/meals/templates' })
                : OpenAPI.TOKEN;

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.get(url, { headers });
            const totalCount = Number(response.headers['x-total-count'] || response.headers['X-Total-Count'] || 0);

            return {
                templates: response.data,
                totalCount
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loadedCount = allPages.flatMap(p => p.templates).length;
            if (loadedCount < lastPage.totalCount) {
                return allPages.length + 1;
            }
            return undefined;
        },
    });
};

export const useMealTemplate = (id: string) => {
    return useQuery<MealTemplate>({
        queryKey: ['meal-templates', id],
        queryFn: () => MealsService.getMealTemplateMealsTemplatesTemplateIdGet(id),
        enabled: !!id,
    });
};

export const useCreateMealTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation<MealTemplate, Error, MealTemplateCreate>({
        mutationFn: (requestBody) => MealsService.createMealTemplateMealsTemplatesPost(requestBody),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
        },
    });
};

export const useUpdateMealTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation<MealTemplate, Error, { id: string, requestBody: MealTemplateUpdate }>({
        mutationFn: ({ id, requestBody }) => MealsService.updateMealTemplateMealsTemplatesTemplateIdPut(id, requestBody),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
            queryClient.invalidateQueries({ queryKey: ['meal-templates', variables.id] });
        },
    });
};

export const useDeleteMealTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => MealsService.deleteMealTemplateMealsTemplatesTemplateIdDelete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
        },
    });
};

export const useGenerateMeal = () => {
    const queryClient = useQueryClient();
    return useMutation<Meal, Error, string>({
        mutationFn: (templateId) => MealsService.generateMealMealsGeneratePost(templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
};
