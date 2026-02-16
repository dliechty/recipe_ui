import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore } from '../handlers';

const API_BASE = 'http://localhost:8000';

describe('MSW Meal Handlers', () => {
    beforeEach(() => {
        resetStore();
    });

    describe('GET /meals/ sort by queue_position', () => {
        it('returns meals sorted by queue_position ascending', async () => {
            // Create meals with known queue_position values (out of order)
            await fetch(`${API_BASE}/meals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Meal C', queue_position: 30, items: [] }),
            });
            await fetch(`${API_BASE}/meals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Meal A', queue_position: 10, items: [] }),
            });
            await fetch(`${API_BASE}/meals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Meal B', queue_position: 20, items: [] }),
            });

            const res = await fetch(`${API_BASE}/meals/?sort=queue_position&name[like]=Meal`);
            expect(res.ok).toBe(true);

            const meals = await res.json();
            // Filter to only our test meals (there are seed meals too)
            const testMeals = meals.filter((m: { name: string }) =>
                ['Meal A', 'Meal B', 'Meal C'].includes(m.name)
            );

            expect(testMeals).toHaveLength(3);
            expect(testMeals[0].name).toBe('Meal A');
            expect(testMeals[1].name).toBe('Meal B');
            expect(testMeals[2].name).toBe('Meal C');
        });

        it('returns meals sorted by queue_position descending', async () => {
            await fetch(`${API_BASE}/meals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Meal X', queue_position: 5, items: [] }),
            });
            await fetch(`${API_BASE}/meals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Meal Y', queue_position: 15, items: [] }),
            });

            const res = await fetch(`${API_BASE}/meals/?sort=-queue_position&name[like]=Meal`);
            expect(res.ok).toBe(true);

            const meals = await res.json();
            const testMeals = meals.filter((m: { name: string }) =>
                ['Meal X', 'Meal Y'].includes(m.name)
            );

            expect(testMeals).toHaveLength(2);
            expect(testMeals[0].name).toBe('Meal Y');
            expect(testMeals[1].name).toBe('Meal X');
        });

        it('reflects updated queue_position after PUT', async () => {
            // Create two meals
            const res1 = await fetch(`${API_BASE}/meals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'First', queue_position: 1, items: [] }),
            });
            const meal1 = await res1.json();

            const res2 = await fetch(`${API_BASE}/meals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Second', queue_position: 2, items: [] }),
            });
            const meal2 = await res2.json();

            // Swap their positions via PUT
            await fetch(`${API_BASE}/meals/${meal1.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queue_position: 2 }),
            });
            await fetch(`${API_BASE}/meals/${meal2.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queue_position: 1 }),
            });

            // Re-fetch sorted by queue_position ascending
            const res = await fetch(`${API_BASE}/meals/?sort=queue_position`);
            const meals = await res.json();

            const firstIdx = meals.findIndex((m: { id: string }) => m.id === meal1.id);
            const secondIdx = meals.findIndex((m: { id: string }) => m.id === meal2.id);

            // "Second" (now queue_position=1) should come before "First" (now queue_position=2)
            expect(secondIdx).toBeLessThan(firstIdx);
            expect(meals[secondIdx].queue_position).toBe(1);
            expect(meals[firstIdx].queue_position).toBe(2);
        });
    });

    describe('POST /meals/generate batch cycling', () => {
        it('generates exactly the requested count even when count exceeds template count', async () => {
            // Reset store to have a clean state, then check template count
            const templatesRes = await fetch(`${API_BASE}/meals/templates`);
            const templates = await templatesRes.json();
            const templateCount = templates.length;

            // Request more meals than available templates
            const requestedCount = templateCount + 5;
            const res = await fetch(`${API_BASE}/meals/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: requestedCount }),
            });

            expect(res.status).toBe(201);
            const generatedMeals = await res.json();
            expect(generatedMeals).toHaveLength(requestedCount);
        });

        it('generates exactly the requested count when count equals template count', async () => {
            const templatesRes = await fetch(`${API_BASE}/meals/templates`);
            const templates = await templatesRes.json();
            const templateCount = templates.length;

            const res = await fetch(`${API_BASE}/meals/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: templateCount }),
            });

            expect(res.status).toBe(201);
            const generatedMeals = await res.json();
            expect(generatedMeals).toHaveLength(templateCount);
        });

        it('generates exactly the requested count when count is less than template count', async () => {
            const res = await fetch(`${API_BASE}/meals/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 3 }),
            });

            expect(res.status).toBe(201);
            const generatedMeals = await res.json();
            expect(generatedMeals).toHaveLength(3);
        });

        it('assigns scheduled_dates to generated meals when provided', async () => {
            const dates = ['2026-03-01', '2026-03-02', '2026-03-03'];
            const res = await fetch(`${API_BASE}/meals/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 3, scheduled_dates: dates }),
            });

            expect(res.status).toBe(201);
            const generatedMeals = await res.json();
            expect(generatedMeals).toHaveLength(3);
            expect(generatedMeals[0].scheduled_date).toBe('2026-03-01');
            expect(generatedMeals[1].scheduled_date).toBe('2026-03-02');
            expect(generatedMeals[2].scheduled_date).toBe('2026-03-03');
        });

        it('adds generated meals to the meals store', async () => {
            const beforeRes = await fetch(`${API_BASE}/meals/`);
            const beforeMeals = await beforeRes.json();
            const countBefore = beforeMeals.length;

            await fetch(`${API_BASE}/meals/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 2 }),
            });

            const afterRes = await fetch(`${API_BASE}/meals/`);
            const afterMeals = await afterRes.json();
            expect(afterMeals.length).toBe(countBefore + 2);
        });
    });
});
