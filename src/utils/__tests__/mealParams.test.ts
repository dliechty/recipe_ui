import { 
    mealFiltersToSearchParams, 
    searchParamsToMealFilters,
    templateFiltersToSearchParams,
    searchParamsToTemplateFilters,
    MealFilters,
    TemplateFilters 
} from '../mealParams';
import { MealStatus } from '../../client/models/MealStatus';
import { MealClassification } from '../../client/models/MealClassification';
import { describe, it, expect } from 'vitest';

describe('mealParams', () => {
    describe('mealFiltersToSearchParams', () => {
        it('should convert simple fields', () => {
            const filters: MealFilters = { name: 'Sunday Lunch', sort: '-date' };
            const params = mealFiltersToSearchParams(filters);
            expect(params.get('name')).toBe('Sunday Lunch');
            expect(params.get('sort')).toBe('-date');
        });

        it('should convert array fields', () => {
            const filters: MealFilters = {
                status: [MealStatus.SCHEDULED, MealStatus.COOKED],
                classification: [MealClassification.LUNCH]
            };
            const params = mealFiltersToSearchParams(filters);
            expect(params.get('status')).toBe('Scheduled,Cooked');
            expect(params.get('classification')).toBe('Lunch');
        });

        it('should convert date range', () => {
            const filters: MealFilters = {
                date: { gt: '2024-01-01', lt: '2024-02-01' }
            };
            const params = mealFiltersToSearchParams(filters);
            expect(params.get('date_gt')).toBe('2024-01-01');
            expect(params.get('date_lt')).toBe('2024-02-01');
        });
    });

    describe('searchParamsToMealFilters', () => {
        it('should parse simple fields', () => {
            const params = new URLSearchParams('name=Dinner&sort=date');
            const filters = searchParamsToMealFilters(params);
            expect(filters.name).toBe('Dinner');
            expect(filters.sort).toBe('date');
        });

        it('should parse array fields', () => {
            const params = new URLSearchParams('status=Draft,Scheduled&classification=Dinner');
            const filters = searchParamsToMealFilters(params);
            expect(filters.status).toEqual([MealStatus.DRAFT, MealStatus.SCHEDULED]);
            expect(filters.classification).toEqual([MealClassification.DINNER]);
        });

        it('should parse date range', () => {
            const params = new URLSearchParams('date_gt=2024-03-01&date_lt=2024-03-31');
            const filters = searchParamsToMealFilters(params);
            expect(filters.date).toEqual({ gt: '2024-03-01', lt: '2024-03-31' });
        });
    });

    describe('templateFiltersToSearchParams', () => {
        it('should convert num_slots range', () => {
            const filters: TemplateFilters = {
                num_slots: { gt: 2, lt: 5 }
            };
            const params = templateFiltersToSearchParams(filters);
            expect(params.get('num_slots_gt')).toBe('2');
            expect(params.get('num_slots_lt')).toBe('5');
        });
    });

    describe('searchParamsToTemplateFilters', () => {
        it('should parse num_slots range', () => {
            const params = new URLSearchParams('num_slots_gt=1&num_slots_lt=10');
            const filters = searchParamsToTemplateFilters(params);
            expect(filters.num_slots).toEqual({ gt: 1, lt: 10 });
        });
    });
});
