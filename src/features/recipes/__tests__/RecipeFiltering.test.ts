import { describe, it, expect } from 'vitest';
import axios from 'axios';
import { OpenAPI } from '../../../client';

describe('Recipe Filtering Integration', () => {
    const baseURL = OpenAPI.BASE;

    it('should filter recipes by name (LIKE)', async () => {
        const response = await axios.get(`${baseURL}/recipes/?name[like]=Chicken`);
        expect(response.status).toBe(200);
        expect(response.data.length).toBeGreaterThan(0);
        response.data.forEach((r: any) => {
            expect(r.core.name.toLowerCase()).toContain('chicken');
        });
    });

    it('should filter recipes by category (Exact)', async () => {
        const response = await axios.get(`${baseURL}/recipes/?category[in]=Dinner`);
        expect(response.status).toBe(200);
        response.data.forEach((r: any) => {
            expect(r.core.category).toBe('Dinner');
        });
    });

    it('should filter recipes by calories (GT)', async () => {
        const response = await axios.get(`${baseURL}/recipes/?calories[gt]=500`);
        expect(response.status).toBe(200);
        response.data.forEach((r: any) => {
            expect(r.nutrition.calories).toBeGreaterThan(500);
        });
    });

    it('should filter recipes by ingredients (Has All)', async () => {
        // Find a recipe with specific ingredients first, or assume mock data has something common like "Salt"
        const response = await axios.get(`${baseURL}/recipes/?ingredients[all]=Salt,Pepper`);
        expect(response.status).toBe(200);
        response.data.forEach((r: any) => {
            const ingredients = r.components.flatMap((c: any) => c.ingredients.map((i: any) => i.item.toLowerCase()));
            expect(ingredients.some((i: string) => i.includes('salt'))).toBe(true);
            expect(ingredients.some((i: string) => i.includes('pepper'))).toBe(true);
        });
    });

    it('should sort recipes by name ascending', async () => {
        const response = await axios.get(`${baseURL}/recipes/?sort=name`);
        const names = response.data.map((r: any) => r.core.name);
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
        expect(names).toEqual(sortedNames);
    });

    it('should sort recipes by total time descending', async () => {
        const response = await axios.get(`${baseURL}/recipes/?sort=-total_time_minutes`);
        const times = response.data.map((r: any) => r.times.total_time_minutes);
        const sortedTimes = [...times].sort((a, b) => b - a);
        expect(times).toEqual(sortedTimes);
    });
});
