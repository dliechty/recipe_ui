import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../test-utils';
import { useRecipeLists, useCreateRecipeList, useAddRecipeToList, useRemoveRecipeFromList } from '../useRecipeLists';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { RecipeList } from '../../client';

describe('useRecipeLists hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useRecipeLists', () => {
        it('fetches recipe lists successfully', async () => {
            const mockLists: RecipeList[] = [
                {
                    id: 'list-1',
                    user_id: 'user-1',
                    name: 'Favorites',
                    description: null,
                    items: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ];

            server.use(
                http.get('*/lists/', () => {
                    return HttpResponse.json(mockLists);
                })
            );

            const { result } = renderHook(() => useRecipeLists(), {
                wrapper: TestWrapper,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockLists);
        });

        it('handles empty lists', async () => {
            server.use(
                http.get('*/lists/', () => {
                    return HttpResponse.json([]);
                })
            );

            const { result } = renderHook(() => useRecipeLists(), {
                wrapper: TestWrapper,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([]);
        });
    });

    describe('useCreateRecipeList', () => {
        it('creates a new recipe list', async () => {
            const newList = {
                name: 'New List',
                description: 'Test description',
            };

            server.use(
                http.post('*/lists/', async ({ request }) => {
                    const body = await request.json() as { name: string; description?: string };
                    return HttpResponse.json({
                        id: 'list-new',
                        user_id: 'user-1',
                        name: body.name,
                        description: body.description || null,
                        items: [],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });
                })
            );

            const { result } = renderHook(() => useCreateRecipeList(), {
                wrapper: TestWrapper,
            });

            result.current.mutate(newList);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.name).toBe('New List');
        });
    });

    describe('useAddRecipeToList', () => {
        it('adds a recipe to a list', async () => {
            server.use(
                http.post('*/lists/:list_id/recipes', ({ params }) => {
                    return HttpResponse.json({
                        id: 'item-new',
                        recipe_list_id: params.list_id,
                        recipe_id: 'recipe-1',
                        added_at: new Date().toISOString(),
                    });
                })
            );

            const { result } = renderHook(() => useAddRecipeToList(), {
                wrapper: TestWrapper,
            });

            result.current.mutate({
                listId: 'list-1',
                requestBody: { recipe_id: 'recipe-1' },
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });
    });

    describe('useRemoveRecipeFromList', () => {
        it('removes a recipe from a list', async () => {
            server.use(
                http.delete('*/lists/:list_id/recipes/:recipe_id', () => {
                    return new HttpResponse(null, { status: 204 });
                })
            );

            const { result } = renderHook(() => useRemoveRecipeFromList(), {
                wrapper: TestWrapper,
            });

            result.current.mutate({
                listId: 'list-1',
                recipeId: 'recipe-1',
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });
    });
});
