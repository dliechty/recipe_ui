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
            const filters: MealFilters = { name: 'Sunday Lunch', sort: '-scheduled_date' };
            const params = mealFiltersToSearchParams(filters);
            expect(params.get('name')).toBe('Sunday Lunch');
            expect(params.get('sort')).toBe('-scheduled_date');
        });

        it('should convert array fields', () => {
            const filters: MealFilters = {
                status: [MealStatus.QUEUED, MealStatus.COOKED],
                classification: [MealClassification.LUNCH]
            };
            const params = mealFiltersToSearchParams(filters);
            expect(params.get('status')).toBe('Queued,Cooked');
            expect(params.get('classification')).toBe('Lunch');
        });

        it('should convert scheduled date range', () => {
            const filters: MealFilters = {
                scheduled_date: { gt: '2024-01-01', lt: '2024-02-01' }
            };
            const params = mealFiltersToSearchParams(filters);
            expect(params.get('scheduled_date_gt')).toBe('2024-01-01');
            expect(params.get('scheduled_date_lt')).toBe('2024-02-01');
        });

        it('should convert is_shopped filter', () => {
            const filters: MealFilters = { is_shopped: false };
            const params = mealFiltersToSearchParams(filters);
            expect(params.get('is_shopped')).toBe('false');
        });
    });

    describe('searchParamsToMealFilters', () => {
        it('should parse simple fields', () => {
            const params = new URLSearchParams('name=Dinner&sort=scheduled_date');
            const filters = searchParamsToMealFilters(params);
            expect(filters.name).toBe('Dinner');
            expect(filters.sort).toBe('scheduled_date');
        });

        it('should parse array fields', () => {
            const params = new URLSearchParams('status=Queued,Cancelled&classification=Dinner');
            const filters = searchParamsToMealFilters(params);
            expect(filters.status).toEqual([MealStatus.QUEUED, MealStatus.CANCELLED]);
            expect(filters.classification).toEqual([MealClassification.DINNER]);
        });

        it('should parse scheduled date range', () => {
            const params = new URLSearchParams('scheduled_date_gt=2024-03-01&scheduled_date_lt=2024-03-31');
            const filters = searchParamsToMealFilters(params);
            expect(filters.scheduled_date).toEqual({ gt: '2024-03-01', lt: '2024-03-31' });
        });

        it('should parse is_shopped', () => {
            const params = new URLSearchParams('is_shopped=true');
            const filters = searchParamsToMealFilters(params);
            expect(filters.is_shopped).toBe(true);
        });
    });

    describe('templateFiltersToSearchParams', () => {
        it('should convert num_slots range', () => {
            const filters: TemplateFilters = {
                num_slots: { gte: 2, lte: 5 }
            };
            const params = templateFiltersToSearchParams(filters);
            expect(params.get('num_slots_gte')).toBe('2');
            expect(params.get('num_slots_lte')).toBe('5');
        });
    });

    describe('searchParamsToTemplateFilters', () => {
        it('should parse num_slots range', () => {
            const params = new URLSearchParams('num_slots_gte=1&num_slots_lte=10');
            const filters = searchParamsToTemplateFilters(params);
            expect(filters.num_slots).toEqual({ gte: 1, lte: 10 });
        });
    });
});
