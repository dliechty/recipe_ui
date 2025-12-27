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
        const recipe = recipes.find(r => r.core.id === id);

        if (!recipe) {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(recipe);
    }),

    // Intercept "POST /recipes/" requests...
    http.post('*/recipes/', async ({ request }) => {
        const newRecipe = await request.json() as any;
        const createdRecipe = {
            core: {
                ...newRecipe.core,
                id: crypto.randomUUID(), // Generate UUID
                owner_id: "1",
                slug: newRecipe.core.name.toLowerCase().replace(/\s+/g, '-')
            },
            times: newRecipe.times,
            nutrition: newRecipe.nutrition,
            components: newRecipe.components.map((comp: any) => ({
                name: comp.name,
                ingredients: comp.ingredients.map((ing: any) => ({
                    quantity: ing.quantity,
                    unit: ing.unit,
                    item: ing.ingredient_name || ing.item, // Handle potential client request diff
                    notes: ing.notes
                }))
            })),
            instructions: newRecipe.instructions.map((inst: any) => ({
                step_number: inst.step_number,
                text: inst.text || inst.description // Handle potential client request diff
            })),
            audit: {
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version: 1,
                parent_recipe_id: null
            }
        };

        recipes.push(createdRecipe);

        return HttpResponse.json(createdRecipe, { status: 201 });
    }),

    // Intercept "PUT /recipes/:id" requests...
    http.put('*/recipes/:id', async ({ request, params }) => {
        const { id } = params;
        const updatedData = await request.json() as any;

        const index = recipes.findIndex(r => r.core.id === id);
        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const updatedRecipe = {
            ...recipes[index],
            core: {
                ...recipes[index].core,
                ...updatedData.core,
                id: String(id), // ensure ID mapping
            },
            times: updatedData.times,
            nutrition: updatedData.nutrition,
            components: updatedData.components.map((comp: any) => ({
                name: comp.name,
                ingredients: comp.ingredients.map((ing: any) => ({
                    quantity: ing.quantity,
                    unit: ing.unit,
                    item: ing.ingredient_name || ing.item,
                    notes: ing.notes
                }))
            })),
            instructions: updatedData.instructions.map((inst: any) => ({
                step_number: inst.step_number,
                text: inst.text || inst.description
            })),
            audit: {
                ...recipes[index].audit,
                updated_at: new Date().toISOString(),
                version: (recipes[index].audit?.version || 0) + 1
            }
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
