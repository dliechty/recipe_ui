import { filtersToSearchParams, searchParamsToFilters } from '../recipeParams';
import { RecipeFilters } from '../../hooks/useRecipes';
import { describe, it, expect } from 'vitest';

describe('recipeParams', () => {
    describe('filtersToSearchParams', () => {
        it('should convert simple fields', () => {
            const filters: RecipeFilters = { name: 'pasta', sort: '-name' };
            const params = filtersToSearchParams(filters);
            expect(params.get('name')).toBe('pasta');
            expect(params.get('sort')).toBe('-name');
        });

        it('should convert array fields', () => {
            const filters: RecipeFilters = {
                category: ['Dessert', 'Breakfast'],
                cuisine: ['Italian']
            };
            const params = filtersToSearchParams(filters);
            expect(params.get('category')).toBe('Dessert,Breakfast');
            expect(params.get('cuisine')).toBe('Italian');
        });

        it('should convert range fields', () => {
            const filters: RecipeFilters = {
                calories: { gt: 100, lt: 500 },
                total_time: { gt: 30 }
            };
            const params = filtersToSearchParams(filters);
            expect(params.get('calories_gt')).toBe('100');
            expect(params.get('calories_lt')).toBe('500');
            expect(params.get('total_time_gt')).toBe('30');
            expect(params.get('total_time_lt')).toBeNull();
        });

        it('should convert nested object fields', () => {
            const filters: RecipeFilters = {
                ingredients: { like: 'garlic' }
            };
            const params = filtersToSearchParams(filters);
            expect(params.get('ingredients_like')).toBe('garlic');
        });
    });

    describe('searchParamsToFilters', () => {
        it('should parse simple fields', () => {
            const params = new URLSearchParams('name=soup&sort=time');
            const filters = searchParamsToFilters(params);
            expect(filters.name).toBe('soup');
            expect(filters.sort).toBe('time');
        });

        it('should parse array fields', () => {
            const params = new URLSearchParams('category=Lunch,Dinner&ids=1,2,3');
            const filters = searchParamsToFilters(params);
            expect(filters.category).toEqual(['Lunch', 'Dinner']);
            expect(filters.ids).toEqual(['1', '2', '3']);
        });

        it('should parse range fields', () => {
            const params = new URLSearchParams('calories_gt=200&calories_lt=800&yield_gt=4');
            const filters = searchParamsToFilters(params);
            expect(filters.calories).toEqual({ gt: 200, lt: 800 });
            expect(filters.yield).toEqual({ gt: 4 });
        });

        it('should parse nested object fields', () => {
            const params = new URLSearchParams('ingredients_like=onion');
            const filters = searchParamsToFilters(params);
            expect(filters.ingredients).toEqual({ like: 'onion' });
        });
    });

    it('should round-trip correctly', () => {
        const filters: RecipeFilters = {
            name: 'Chicken',
            category: ['Main Course'],
            calories: { gt: 300 },
            ingredients: { like: 'salt' }
        };
        const params = filtersToSearchParams(filters);
        const parsed = searchParamsToFilters(params);
        expect(parsed).toEqual(filters);
    });
});
