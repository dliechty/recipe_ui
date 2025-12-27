import { http, HttpResponse } from 'msw';
import { recipes as initialRecipes } from './data';

// We'll use an in-memory store for the session to allow mutations (POST/PUT) during tests
let recipes = [...initialRecipes];

export const handlers = [
    // Intercept "GET /recipes/" requests...
    http.get('*/recipes/', () => {
        return HttpResponse.json(recipes);
    }),

    // Intercept "GET /recipes/:id" requests...
    http.get('*/recipes/:id', ({ params }) => {
        const { id } = params;
        const recipe = recipes.find(r => r.id === Number(id));

        if (!recipe) {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(recipe);
    }),

    // Intercept "POST /recipes/" requests...
    http.post('*/recipes/', async ({ request }) => {
        const newRecipe = await request.json() as any;
        const createdRecipe = {
            ...newRecipe,
            id: Math.floor(Math.random() * 1000) + 4, // Generate random ID
            owner_id: 1,
            ingredients: newRecipe.ingredients.map((ing, i) => ({
                id: i + 1,
                ingredient: { id: i + 1, name: ing.ingredient_name },
                quantity: ing.quantity,
                unit: ing.unit,
                notes: ing.notes
            })),
            instructions: newRecipe.instructions.map((inst, i) => ({
                id: i + 1,
                step_number: inst.step_number,
                description: inst.description
            }))
        };

        recipes.push(createdRecipe);

        return HttpResponse.json(createdRecipe, { status: 201 });
    }),

    // Intercept "PUT /recipes/:id" requests...
    http.put('*/recipes/:id', async ({ request, params }) => {
        const { id } = params;
        const updatedData = await request.json() as any;

        const index = recipes.findIndex(r => r.id === Number(id));
        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const updatedRecipe = {
            ...recipes[index], // keep existing fields like owner_id if not present
            ...updatedData,
            id: Number(id),
            owner_id: 1,
            ingredients: updatedData.ingredients.map((ing, i) => ({
                id: i + 1,
                // reuse existing ingredient id if plausible, or generate new
                ingredient: { id: i + 1, name: ing.ingredient_name },
                quantity: ing.quantity,
                unit: ing.unit,
                notes: ing.notes
            })),
            instructions: updatedData.instructions.map((inst, i) => ({
                id: i + 1,
                step_number: inst.step_number,
                description: inst.description
            }))
        };

        recipes[index] = updatedRecipe;

        return HttpResponse.json(updatedRecipe);
    }),

    // Intercept "POST /auth/token" requests...
    http.post('*/auth/token', async () => {
        // Simulate a successful login
        return HttpResponse.json({
            access_token: 'fake-jwt-token',
            token_type: 'bearer',
        });
    }),
];
