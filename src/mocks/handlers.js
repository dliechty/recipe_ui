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
                    { name: 'Spaghetti', amount: 400, unit: 'g' },
                    { name: 'Eggs', amount: 4, unit: 'large' },
                    { name: 'Pecorino Romano', amount: 100, unit: 'g' },
                    { name: 'Guanciale', amount: 150, unit: 'g' },
                    { name: 'Black Pepper', amount: 1, unit: 'tsp' }
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
                    { name: 'Chicken Breast', amount: 500, unit: 'g' },
                    { name: 'Coconut Milk', amount: 400, unit: 'ml' },
                    { name: 'Curry Powder', amount: 3, unit: 'tbsp' },
                    { name: 'Onion', amount: 1, unit: 'large' }
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
                    { name: 'Bread', amount: 2, unit: 'slices' },
                    { name: 'Avocado', amount: 1, unit: 'ripe' },
                    { name: 'Salt', amount: 1, unit: 'pinch' },
                    { name: 'Chili Flakes', amount: 1, unit: 'pinch' }
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
                    { name: 'Spaghetti', amount: 400, unit: 'g' },
                    { name: 'Eggs', amount: 4, unit: 'large' },
                    { name: 'Pecorino Romano', amount: 100, unit: 'g' },
                    { name: 'Guanciale', amount: 150, unit: 'g' },
                    { name: 'Black Pepper', amount: 1, unit: 'tsp' }
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
                    { name: 'Chicken Breast', amount: 500, unit: 'g' },
                    { name: 'Coconut Milk', amount: 400, unit: 'ml' },
                    { name: 'Curry Powder', amount: 3, unit: 'tbsp' },
                    { name: 'Onion', amount: 1, unit: 'large' }
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
                    { name: 'Bread', amount: 2, unit: 'slices' },
                    { name: 'Avocado', amount: 1, unit: 'ripe' },
                    { name: 'Salt', amount: 1, unit: 'pinch' },
                    { name: 'Chili Flakes', amount: 1, unit: 'pinch' }
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
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(recipe);
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
