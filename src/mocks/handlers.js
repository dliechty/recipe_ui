import { http, HttpResponse } from 'msw';

export const handlers = [
    // Intercept "GET /recipes/" requests...
    http.get('http://localhost:8000/recipes/', () => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json([
            {
                id: 1,
                name: 'Spaghetti Carbonara',
                description: 'A classic Italian pasta dish.',
                prep_time_minutes: 15,
                cook_time_minutes: 15,
                servings: 4,
                ingredients: [
                    { id: 1, ingredient: { id: 1, name: 'Spaghetti' }, quantity: '400', unit: 'g' },
                    { id: 2, ingredient: { id: 2, name: 'Eggs' }, quantity: '4', unit: 'large' },
                    { id: 3, ingredient: { id: 3, name: 'Pecorino Romano' }, quantity: '100', unit: 'g' },
                    { id: 4, ingredient: { id: 4, name: 'Guanciale' }, quantity: '150', unit: 'g' },
                    { id: 5, ingredient: { id: 5, name: 'Black Pepper' }, quantity: '1', unit: 'tsp' }
                ],
                instructions: [
                    { step_number: 1, description: 'Boil the pasta in salted water.' },
                    { step_number: 2, description: 'Fry the guanciale until crisp.' },
                    { step_number: 3, description: 'Mix eggs and cheese.' },
                    { step_number: 4, description: 'Combine pasta, guanciale, and egg mixture off heat.' }
                ],
                tags: [{ id: 1, name: 'Italian' }, { id: 2, name: 'Pasta' }],
                owner_id: 1
            },
            {
                id: 2,
                name: 'Chicken Curry',
                description: 'Spicy and delicious chicken curry.',
                prep_time_minutes: 20,
                cook_time_minutes: 45,
                servings: 6,
                ingredients: [
                    { id: 6, ingredient: { id: 6, name: 'Chicken Breast' }, quantity: '500', unit: 'g' },
                    { id: 7, ingredient: { id: 7, name: 'Coconut Milk' }, quantity: '400', unit: 'ml' },
                    { id: 8, ingredient: { id: 8, name: 'Curry Powder' }, quantity: '3', unit: 'tbsp' },
                    { id: 9, ingredient: { id: 9, name: 'Onion' }, quantity: '1', unit: 'large' }
                ],
                instructions: [
                    { step_number: 1, description: 'Sauté onions manually.' },
                    { step_number: 2, description: 'Add chicken and brown.' },
                    { step_number: 3, description: 'Add spices and coconut milk.' },
                    { step_number: 4, description: 'Simmer until cooked.' }
                ],
                tags: [],
                owner_id: 1
            },
            {
                id: 3,
                name: 'Avocado Toast',
                description: 'Healthy breakfast option.',
                prep_time_minutes: 5,
                cook_time_minutes: 0,
                servings: 1,
                ingredients: [
                    { id: 10, ingredient: { id: 10, name: 'Bread' }, quantity: '2', unit: 'slices' },
                    { id: 11, ingredient: { id: 11, name: 'Avocado' }, quantity: '1', unit: 'ripe' },
                    { id: 12, ingredient: { id: 12, name: 'Salt' }, quantity: '1', unit: 'pinch' },
                    { id: 13, ingredient: { id: 13, name: 'Chili Flakes' }, quantity: '1', unit: 'pinch' }
                ],
                instructions: [
                    { step_number: 1, description: 'Toast the bread.' },
                    { step_number: 2, description: 'Mash avocado and spread on toast.' },
                    { step_number: 3, description: 'Sprinkle with salt and chili flakes.' }
                ],
                tags: [],
                owner_id: 1
            },
        ]);
    }),

    // Intercept "GET /recipes/:id" requests...
    http.get('http://localhost:8000/recipes/:id', ({ params }) => {
        const { id } = params;
        const recipes = [
            {
                id: 1,
                name: 'Spaghetti Carbonara',
                description: 'A classic Italian pasta dish.',
                prep_time_minutes: 15,
                cook_time_minutes: 15,
                servings: 4,
                ingredients: [
                    { id: 1, ingredient: { id: 1, name: 'Spaghetti' }, quantity: '400', unit: 'g' },
                    { id: 2, ingredient: { id: 2, name: 'Eggs' }, quantity: '4', unit: 'large' },
                    { id: 3, ingredient: { id: 3, name: 'Pecorino Romano' }, quantity: '100', unit: 'g' },
                    { id: 4, ingredient: { id: 4, name: 'Guanciale' }, quantity: '150', unit: 'g' },
                    { id: 5, ingredient: { id: 5, name: 'Black Pepper' }, quantity: '1', unit: 'tsp' }
                ],
                instructions: [
                    { step_number: 1, description: 'Boil the pasta in salted water.' },
                    { step_number: 2, description: 'Fry the guanciale until crisp.' },
                    { step_number: 3, description: 'Mix eggs and cheese.' },
                    { step_number: 4, description: 'Combine pasta, guanciale, and egg mixture off heat.' }
                ],
                tags: [{ id: 1, name: 'Italian' }, { id: 2, name: 'Pasta' }],
                owner_id: 1
            },
            {
                id: 2,
                name: 'Chicken Curry',
                description: 'Spicy and delicious chicken curry.',
                prep_time_minutes: 20,
                cook_time_minutes: 45,
                servings: 6,
                ingredients: [
                    { id: 6, ingredient: { id: 6, name: 'Chicken Breast' }, quantity: '500', unit: 'g' },
                    { id: 7, ingredient: { id: 7, name: 'Coconut Milk' }, quantity: '400', unit: 'ml' },
                    { id: 8, ingredient: { id: 8, name: 'Curry Powder' }, quantity: '3', unit: 'tbsp' },
                    { id: 9, ingredient: { id: 9, name: 'Onion' }, quantity: '1', unit: 'large' }
                ],
                instructions: [
                    { step_number: 1, description: 'Sauté onions manually.' },
                    { step_number: 2, description: 'Add chicken and brown.' },
                    { step_number: 3, description: 'Add spices and coconut milk.' },
                    { step_number: 4, description: 'Simmer until cooked.' }
                ],
                tags: [],
                owner_id: 1
            },
            {
                id: 3,
                name: 'Avocado Toast',
                description: 'Healthy breakfast option.',
                prep_time_minutes: 5,
                cook_time_minutes: 0,
                servings: 1,
                ingredients: [
                    { id: 10, ingredient: { id: 10, name: 'Bread' }, quantity: '2', unit: 'slices' },
                    { id: 11, ingredient: { id: 11, name: 'Avocado' }, quantity: '1', unit: 'ripe' },
                    { id: 12, ingredient: { id: 12, name: 'Salt' }, quantity: '1', unit: 'pinch' },
                    { id: 13, ingredient: { id: 13, name: 'Chili Flakes' }, quantity: '1', unit: 'pinch' }
                ],
                instructions: [
                    { step_number: 1, description: 'Toast the bread.' },
                    { step_number: 2, description: 'Mash avocado and spread on toast.' },
                    { step_number: 3, description: 'Sprinkle with salt and chili flakes.' }
                ],
                tags: [],
                owner_id: 1
            },
        ];

        const recipe = recipes.find(r => r.id === Number(id));

        if (!recipe) {
            // Fallback to searching the full list from the first handler if we wanted DRY, but here just return 404
            if (Number(id) === 1) return HttpResponse.json(recipes[0]);
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(recipe);
    }),

    // Intercept "POST /recipes/" requests...
    http.post('http://localhost:8000/recipes/', async ({ request }) => {
        const newRecipe = await request.json();
        return HttpResponse.json({
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
        });
    }),

    // Intercept "PUT /recipes/:id" requests...
    http.put('http://localhost:8000/recipes/:id', async ({ request, params }) => {
        const { id } = params;
        const updatedRecipe = await request.json();
        return HttpResponse.json({
            ...updatedRecipe,
            id: Number(id),
            owner_id: 1,
            ingredients: updatedRecipe.ingredients.map((ing, i) => ({
                id: i + 1,
                ingredient: { id: i + 1, name: ing.ingredient_name },
                quantity: ing.quantity,
                unit: ing.unit,
                notes: ing.notes
            })),
            instructions: updatedRecipe.instructions.map((inst, i) => ({
                id: i + 1,
                step_number: inst.step_number,
                description: inst.description
            }))
        });
    }),

    // Intercept "POST /auth/token" requests...
    http.post('http://localhost:8000/auth/token', async () => {
        // Simulate a successful login
        return HttpResponse.json({
            access_token: 'fake-jwt-token',
            token_type: 'bearer',
        });
    }),
];
