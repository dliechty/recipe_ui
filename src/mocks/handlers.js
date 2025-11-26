import { http, HttpResponse } from 'msw';

export const handlers = [
    // Intercept "GET /recipes/" requests...
    http.get('http://localhost:8000/recipes/', () => {
        // ...and respond to them using this JSON response.
        return HttpResponse.json([
            {
                id: 1,
                title: 'Spaghetti Carbonara',
                description: 'A classic Italian pasta dish.',
            },
            {
                id: 2,
                title: 'Chicken Curry',
                description: 'Spicy and delicious chicken curry.',
            },
            {
                id: 3,
                title: 'Avocado Toast',
                description: 'Healthy breakfast option.',
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
