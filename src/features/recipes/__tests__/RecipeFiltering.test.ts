import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { OpenAPI, Recipe } from '../../../client';

describe('Recipe Filtering Integration', () => {
    const baseURL = OpenAPI.BASE;

    it('should filter recipes by name (LIKE)', async () => {
        const response = await axios.get(`${baseURL}/recipes/?name[like]=Chicken`);
        expect(response.status).toBe(200);
        expect(response.data.length).toBeGreaterThan(0);
        response.data.forEach((r: Recipe) => {
            expect(r.core.name.toLowerCase()).toContain('chicken');
        });
    });

    it('should filter recipes by category (Exact)', async () => {
        const response = await axios.get(`${baseURL}/recipes/?category[in]=Dinner`);
        expect(response.status).toBe(200);
        response.data.forEach((r: Recipe) => {
            expect(r.core.category).toBe('Dinner');
        });
    });

    it('should filter recipes by calories (GT)', async () => {
        const response = await axios.get(`${baseURL}/recipes/?calories[gt]=500`);
        expect(response.status).toBe(200);
        response.data.forEach((r: Recipe) => {
            expect((r.nutrition?.calories || 0)).toBeGreaterThan(500);
        });
    });

    it('should filter recipes by ingredients (LIKE)', async () => {
        const response = await axios.get(`${baseURL}/recipes/?ingredients[like]=Salt`);
        expect(response.status).toBe(200);
        response.data.forEach((r: Recipe) => {
            const ingredients = r.components.flatMap((c) => c.ingredients.map((i) => i.item.toLowerCase()));
            expect(ingredients.some((i: string) => i.includes('salt'))).toBe(true);
        });
    });

    it('should sort recipes by name ascending', async () => {
        const response = await axios.get(`${baseURL}/recipes/?sort=name`);
        const names = response.data.map((r: Recipe) => r.core.name);
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
        expect(names).toEqual(sortedNames);
    });

    it('should sort recipes by total time descending', async () => {
        const response = await axios.get(`${baseURL}/recipes/?sort=-total_time_minutes`);
        const times = response.data.map((r: Recipe) => r.times.total_time_minutes);
        const sortedTimes = [...times].sort((a, b) => (b || 0) - (a || 0));
        expect(times).toEqual(sortedTimes);
    });
});
