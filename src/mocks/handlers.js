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
                ingredients: [],
                instructions: [],
                tags: [{ id: 1, name: 'Italian' }, { id: 2, name: 'Pasta' }]
            },
            {
                id: 2,
                name: 'Chicken Curry',
                description: 'Spicy and delicious chicken curry.',
                prep_time_minutes: 20,
                cook_time_minutes: 45,
                servings: 6,
                ingredients: [],
                instructions: [],
                tags: []
            },
            {
                id: 3,
                name: 'Avocado Toast',
                description: 'Healthy breakfast option.',
                prep_time_minutes: 5,
                cook_time_minutes: 0,
                servings: 1,
                ingredients: [],
                instructions: [],
                tags: []
            },
        ]);
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
