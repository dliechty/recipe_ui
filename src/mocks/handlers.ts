import { http, HttpResponse } from 'msw';
import { recipes as initialRecipes, users } from './data';

// We'll use an in-memory store for the session to allow mutations (POST/PUT) during tests
const recipes = [...initialRecipes];
const usersStore = [...users];
const pendingRequests: any[] = [];

export const resetStore = () => {
    recipes.length = 0;
    recipes.push(...initialRecipes);
    usersStore.length = 0;
    usersStore.push(...users);
    pendingRequests.length = 0;
};

export const handlers = [
    // Intercept "GET /recipes/" requests...
    http.get('*/recipes/', ({ request }) => {
        const url = new URL(request.url);
        const skip = Number(url.searchParams.get('skip') || '0');
        const limit = Number(url.searchParams.get('limit') || '100');

        const paginatedRecipes = recipes.slice(skip, skip + limit);

        return HttpResponse.json(paginatedRecipes, {
            headers: {
                'X-Total-Count': recipes.length.toString(),
            },
        });
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
                owner_id: "550e8400-e29b-41d4-a716-446655440000",
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
    http.post('*/auth/token', async ({ request }) => { // Added request to destructuring
        let username = '';
        try {
            const formData = await request.clone().formData();
            username = formData.get('username') as string;
        } catch {
            // Fallback: the client might be sending Multipart body with UrlEncoded header (axios/openapi-codegen issue)
            const text = await request.text();
            // Try URLSearchParams first
            const params = new URLSearchParams(text);
            username = params.get('username') || '';

            if (!username) {
                // Try regex for multipart
                // Look for name="username" followed by value
                const match = text.match(/name="username"\s*[\r\n]+([^\r\n]+)/);
                if (match) {
                    username = match[1];
                }
            }
        }

        let userId = "550e8400-e29b-41d4-a716-446655440000";
        const user = usersStore.find(u => u.email === username);
        if (user) {
            userId = user.id;
        }

        // Create a JWT with a valid payload structure
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ sub: userId, name: user ? `${user.first_name} ${user.last_name}` : "Test User", iat: Date.now() / 1000 }));
        const signature = "fake-signature";
        const token = `${header}.${payload}.${signature}`;

        return HttpResponse.json({
            access_token: token,
            token_type: 'bearer',
        });
    }),

    // Intercept "POST /auth/request-account"
    http.post('*/auth/request-account', async ({ request }) => {
        const body = await request.json() as any;
        const { email } = body;

        if (usersStore.some(u => u.email === email)) {
            return HttpResponse.json({ detail: "Email already registered" }, { status: 400 });
        }

        const newRequest = {
            id: crypto.randomUUID(),
            email: body.email,
            first_name: body.first_name,
            last_name: body.last_name,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        pendingRequests.push(newRequest);
        return HttpResponse.json(newRequest, { status: 201 });
    }),

    // Intercept "GET /auth/pending-requests"
    http.get('*/auth/pending-requests', () => {
        return HttpResponse.json(pendingRequests);
    }),

    // Intercept "POST /auth/approve-request/:request_id"
    http.post('*/auth/approve-request/:request_id', async ({ params, request }) => {
        const { request_id } = params;
        const index = pendingRequests.findIndex(r => r.id === request_id);

        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const req = pendingRequests[index];
        await request.json(); // Consume body but ignore it

        const newUser = {
            id: crypto.randomUUID(),
            email: req.email,
            first_name: req.first_name,
            last_name: req.last_name,
            is_active: true,
            is_admin: false,
            is_first_login: true // Assuming default true for new users
        };

        usersStore.push(newUser);
        pendingRequests.splice(index, 1); // Remove from pending

        return HttpResponse.json(newUser);
    }),

    // Intercept "GET /auth/users"
    http.get('*/auth/users', () => {
        return HttpResponse.json(usersStore);
    }),

    // Intercept "GET /auth/users/:user_id"
    http.get('*/auth/users/:user_id', ({ params }) => {
        const { user_id } = params;
        const user = usersStore.find(u => u.id === user_id);

        if (!user) {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(user);
    }),

    // Intercept "DELETE /auth/users/:user_id"
    http.delete('*/auth/users/:user_id', ({ params }) => {
        const { user_id } = params;
        const index = usersStore.findIndex(u => u.id === user_id);

        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        usersStore.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
    }),

    // Intercept "POST /auth/users/:user_id/reset"
    http.post('*/auth/users/:user_id/reset', () => {
        return HttpResponse.json({ message: "Password reset" });
    }),

    // Intercept "POST /auth/change-password"
    http.post('*/auth/change-password', async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    const userId = payload.sub;
                    const user = usersStore.find(u => u.id === userId);
                    if (user) {
                        user.is_first_login = false;
                    }
                }
            } catch (e) {
                console.error("Error updating user status in mock", e);
            }
        }
        return HttpResponse.json({ message: "Password changed" });
    }),
];
