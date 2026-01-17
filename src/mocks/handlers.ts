import { http, HttpResponse } from 'msw';
import { recipes as initialRecipes, users, comments as initialComments, meals as initialMeals, mealTemplates as initialMealTemplates } from './data';
import { Recipe, RecipeCreate, Comment, CommentCreate, CommentUpdate, Meal, MealCreate, MealUpdate, MealStatus, MealTemplate, MealTemplateCreate, MealTemplateUpdate, Component, RecipeIngredient } from '../client';

// We'll use an in-memory store for the session to allow mutations (POST/PUT) during tests
const recipes: Recipe[] = [...initialRecipes] as unknown as Recipe[];
const usersStore = [...users];
const pendingRequests: { id: string; email: string; first_name: string; last_name: string; status: string; created_at: string }[] = [];
// Store comments without user object, enrich on retrieval
type StoredComment = Omit<Comment, 'user'>;
const commentsStore: StoredComment[] = [...initialComments] as unknown as StoredComment[];
const mealsStore: Meal[] = [...initialMeals] as unknown as Meal[];
const mealTemplateStore: MealTemplate[] = [...initialMealTemplates] as unknown as MealTemplate[];



export const resetStore = () => {
    recipes.length = 0;
    recipes.push(...initialRecipes as unknown as Recipe[]);
    usersStore.length = 0;
    usersStore.push(...users);
    pendingRequests.length = 0;
    commentsStore.length = 0;
    commentsStore.push(...initialComments);
    mealsStore.length = 0;
    mealsStore.push(...initialMeals as unknown as Meal[]);
    mealTemplateStore.length = 0;
    mealTemplateStore.push(...initialMealTemplates as unknown as MealTemplate[]);


};


export const handlers = [
    // Intercept "GET /recipes/" requests...
    http.get('*/recipes/', ({ request }) => {
        const url = new URL(request.url);
        const skip = Number(url.searchParams.get('skip') || '0');
        const limit = Number(url.searchParams.get('limit') || '100');
        const sort = url.searchParams.get('sort');

        // Extract filters
        // Extract filters (LHS Syntax)
        const nameLike = url.searchParams.get('name[like]');

        const categories = url.searchParams.get('category[in]')?.split(',').filter(Boolean) || [];
        const cuisines = url.searchParams.get('cuisine[in]')?.split(',').filter(Boolean) || [];
        const difficulties = url.searchParams.get('difficulty[in]')?.split(',').filter(Boolean) || [];
        const owners = url.searchParams.get('owner[in]')?.split(',').filter(Boolean) || [];
        const proteins = url.searchParams.get('protein[in]')?.split(',').filter(Boolean) || [];
        const diets = url.searchParams.get('suitable_for_diet[in]')?.split(',').filter(Boolean) || [];
        const ids = url.searchParams.get('id[in]')?.split(',').filter(Boolean) || [];

        const yieldGt = url.searchParams.get('yield_amount[gt]');
        const yieldLt = url.searchParams.get('yield_amount[lt]');

        const caloriesGt = url.searchParams.get('calories[gt]');
        const caloriesLt = url.searchParams.get('calories[lt]');

        const totalTimeGt = url.searchParams.get('total_time_minutes[gt]');
        const totalTimeLt = url.searchParams.get('total_time_minutes[lt]');

        const prepTimeGt = url.searchParams.get('prep_time_minutes[gt]');
        const prepTimeLt = url.searchParams.get('prep_time_minutes[lt]');

        const cookTimeGt = url.searchParams.get('cook_time_minutes[gt]');
        const cookTimeLt = url.searchParams.get('cook_time_minutes[lt]');

        const activeTimeGt = url.searchParams.get('active_time_minutes[gt]');
        const activeTimeLt = url.searchParams.get('active_time_minutes[lt]');

        const ingredientsLike = url.searchParams.get('ingredients[like]');

        let filteredRecipes = [...recipes];

        // Apply filters
        if (nameLike) {
            const lowerName = nameLike.toLowerCase();
            filteredRecipes = filteredRecipes.filter(r => r.core.name.toLowerCase().includes(lowerName));
        }
        if (categories.length > 0) {
            filteredRecipes = filteredRecipes.filter(r => r.core.category && categories.includes(r.core.category));
        }
        if (cuisines.length > 0) {
            filteredRecipes = filteredRecipes.filter(r => r.core.cuisine && cuisines.includes(r.core.cuisine));
        }
        if (difficulties.length > 0) {
            filteredRecipes = filteredRecipes.filter(r => r.core.difficulty && difficulties.includes(r.core.difficulty));
        }
        if (owners.length > 0) {
            filteredRecipes = filteredRecipes.filter(r => r.core.owner_id && owners.includes(r.core.owner_id));
        }
        if (proteins.length > 0) {
            filteredRecipes = filteredRecipes.filter(r => r.core.protein && proteins.includes(r.core.protein));
        }
        if (ids.length > 0) {
            filteredRecipes = filteredRecipes.filter(r => ids.includes(r.core.id));
        }

        if (yieldGt) {
            filteredRecipes = filteredRecipes.filter(r => (r.core.yield_amount || 0) > Number(yieldGt));
        }
        if (yieldLt) {
            filteredRecipes = filteredRecipes.filter(r => (r.core.yield_amount || 0) < Number(yieldLt));
        }

        if (caloriesGt) {
            filteredRecipes = filteredRecipes.filter(r => (r.nutrition?.calories || 0) > Number(caloriesGt));
        }
        if (caloriesLt) {
            filteredRecipes = filteredRecipes.filter(r => (r.nutrition?.calories || 0) < Number(caloriesLt));
        }

        if (totalTimeGt) {
            filteredRecipes = filteredRecipes.filter(r => (r.times?.total_time_minutes || 0) > Number(totalTimeGt));
        }
        if (totalTimeLt) {
            filteredRecipes = filteredRecipes.filter(r => (r.times?.total_time_minutes || 0) < Number(totalTimeLt));
        }
        if (prepTimeGt) {
            filteredRecipes = filteredRecipes.filter(r => (r.times?.prep_time_minutes || 0) > Number(prepTimeGt));
        }
        if (prepTimeLt) {
            filteredRecipes = filteredRecipes.filter(r => (r.times?.prep_time_minutes || 0) < Number(prepTimeLt));
        }
        if (cookTimeGt) {
            filteredRecipes = filteredRecipes.filter(r => (r.times?.cook_time_minutes || 0) > Number(cookTimeGt));
        }
        if (cookTimeLt) {
            filteredRecipes = filteredRecipes.filter(r => (r.times?.cook_time_minutes || 0) < Number(cookTimeLt));
        }
        if (activeTimeGt) {
            filteredRecipes = filteredRecipes.filter(r => ((r.times?.prep_time_minutes || 0) + (r.times?.cook_time_minutes || 0)) > Number(activeTimeGt));
        }
        if (activeTimeLt) {
            filteredRecipes = filteredRecipes.filter(r => ((r.times?.prep_time_minutes || 0) + (r.times?.cook_time_minutes || 0)) < Number(activeTimeLt));
        }

        if (ingredientsLike) {
            const query = ingredientsLike.toLowerCase();
            filteredRecipes = filteredRecipes.filter(r => {
                const recipeIngredients = r.components.flatMap((c) => c.ingredients.map((i) => i.item.toLowerCase()));
                return recipeIngredients.some(ri => ri.includes(query));
            });
        }

        if (diets.length > 0) {
            filteredRecipes = filteredRecipes.filter(r => {
                // OR Logic: Recipe must contain AT LEAST ONE of the selected diets
                return r.suitable_for_diet?.some(d => diets.includes(d));
            });
        }

        // Apply Sorting
        if (sort) {
            const fields = sort.split(',');
            filteredRecipes.sort((a, b) => {
                for (const field of fields) {
                    const desc = field.startsWith('-');
                    const key = desc ? field.substring(1) : field;

                    let valA: string | number = 0;
                    let valB: string | number = 0;

                    if (key === 'name') {
                        valA = a.core.name.toLowerCase();
                        valB = b.core.name.toLowerCase();
                    } else if (key === 'created_at') {
                        valA = a.audit.created_at ? new Date(a.audit.created_at).getTime() : 0;
                        valB = b.audit.created_at ? new Date(b.audit.created_at).getTime() : 0;
                    } else if (key === 'total_time_minutes') {
                        valA = a.times.total_time_minutes || 0;
                        valB = b.times.total_time_minutes || 0;
                    } else if (key === 'calories') {
                        valA = a.nutrition.calories || 0;
                        valB = b.nutrition.calories || 0;
                    } else {
                        continue;
                    }

                    if (valA < valB) return desc ? 1 : -1;
                    if (valA > valB) return desc ? -1 : 1;
                }
                return 0;
            });
        }

        const paginatedRecipes = filteredRecipes.slice(skip, skip + limit);

        return HttpResponse.json(paginatedRecipes, {
            headers: {
                'X-Total-Count': filteredRecipes.length.toString(),
                'Access-Control-Expose-Headers': 'X-Total-Count'
            },
        });
    }),

    // Intercept "GET /recipes/meta/:field" requests...
    http.get('*/recipes/meta/:field', ({ params }) => {
        const { field } = params;
        let values: (string | { id: string; name: string })[] = [];

        if (field === 'category') {
            values = [...new Set(recipes.map(r => r.core.category).filter(Boolean) as string[])];
        } else if (field === 'cuisine') {
            values = [...new Set(recipes.map(r => r.core.cuisine).filter(Boolean) as string[])];
        } else if (field === 'difficulty') {
            values = [...new Set(recipes.map(r => r.core.difficulty).filter(Boolean) as string[])];
        } else if (field === 'owner') {
            // Return list of objects { id: ID, name: Name } as per spec
            values = usersStore.map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}` }));
        } else if (field === 'suitable_for_diet') {
            values = [...new Set(recipes.flatMap(r => r.suitable_for_diet || []))];
        } else if (field === 'protein') {
            values = [...new Set(recipes.map(r => r.core.protein).filter(Boolean) as string[])];
        }

        return HttpResponse.json(values);
    }),

    // Intercept "GET /recipes/:id" requests...
    http.get('*/recipes/:id', ({ params, request }) => {
        const { id } = params;
        const url = new URL(request.url);
        const scaleParam = url.searchParams.get('scale');
        const scale = scaleParam ? Number(scaleParam) : 1;

        const recipe = recipes.find(r => r.core.id === id);

        if (!recipe) {
            return new HttpResponse(null, { status: 404 });
        }

        if (scale !== 1) {
            // Clone and scale
            const scaledRecipe = JSON.parse(JSON.stringify(recipe)); // Deep clone

            // Scale ingredients
            scaledRecipe.components.forEach((comp: Component) => {
                comp.ingredients.forEach((ing: RecipeIngredient) => {
                    if (ing.quantity) {
                        ing.quantity = ing.quantity * scale;
                    }
                });
            });

            // Scale Yield
            if (scaledRecipe.core.yield_amount) {
                scaledRecipe.core.yield_amount = scaledRecipe.core.yield_amount * scale;
            }

            return HttpResponse.json(scaledRecipe);
        }

        return HttpResponse.json(recipe);
    }),

    // Intercept "POST /recipes/" requests...
    http.post('*/recipes/', async ({ request }) => {
        const newRecipe = await request.json() as RecipeCreate;
        const createdRecipe: Recipe = {
            core: {
                ...newRecipe.core,
                id: crypto.randomUUID(), // Generate UUID
                owner_id: "550e8400-e29b-41d4-a716-446655440000",
                slug: newRecipe.core.name.toLowerCase().replace(/\s+/g, '-')
            },
            times: newRecipe.times,
            nutrition: newRecipe.nutrition,
            suitable_for_diet: newRecipe.suitable_for_diet || [],
            components: newRecipe.components.map((comp) => ({
                name: comp.name,
                ingredients: comp.ingredients.map((ing) => ({
                    quantity: ing.quantity,
                    unit: ing.unit,
                    item: ing.ingredient_name || (ing as unknown as { item: string }).item, // Handle potential client request diff
                    notes: ing.notes
                }))
            })),
            instructions: newRecipe.instructions.map((inst) => ({
                step_number: inst.step_number,
                text: inst.text || (inst as unknown as { description: string }).description // Handle potential client request diff
            })),
            audit: {
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version: 1
            },
            parent_recipe_id: null,
            variant_recipe_ids: []
        };

        recipes.push(createdRecipe);

        return HttpResponse.json(createdRecipe, { status: 201 });
    }),

    // Intercept "PUT /recipes/:id" requests...
    http.put('*/recipes/:id', async ({ request, params }) => {
        const { id } = params;
        const updatedData = await request.json() as RecipeCreate;

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
            suitable_for_diet: updatedData.suitable_for_diet || [],
            components: updatedData.components.map((comp) => ({
                name: comp.name,
                ingredients: comp.ingredients.map((ing) => ({
                    quantity: ing.quantity,
                    unit: ing.unit,
                    item: ing.ingredient_name || (ing as unknown as { item: string }).item,
                    notes: ing.notes
                }))
            })),
            instructions: updatedData.instructions.map((inst) => ({
                step_number: inst.step_number,
                text: inst.text || (inst as unknown as { description: string }).description
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
        const body = await request.json() as { email: string; first_name: string; last_name: string };
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

    // --- COMMENTS ---

    // GET /recipes/:recipe_id/comments
    http.get('*/recipes/:recipe_id/comments', ({ params }) => {
        const { recipe_id } = params;
        const comments = commentsStore.filter(c => c.recipe_id === recipe_id);

        // Enrich comments with user data
        const enrichedComments = comments.map(c => {
            const user = usersStore.find(u => u.id === c.user_id);
            return {
                ...c,
                user: user ? {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    is_active: user.is_active,
                    is_admin: user.is_admin
                } : null
            };
        });

        // Sort by created_at desc
        enrichedComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return HttpResponse.json(enrichedComments);
    }),

    // POST /recipes/:recipe_id/comments
    http.post('*/recipes/:recipe_id/comments', async ({ request, params }) => {
        const { recipe_id } = params;
        const body = await request.json() as CommentCreate;
        const authHeader = request.headers.get('Authorization');

        let userId = "550e8400-e29b-41d4-a716-446655440000"; // default mock user

        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    if (payload.sub) userId = payload.sub;
                }
            } catch {
                // ignore
            }
        }

        const newComment: StoredComment = {
            id: crypto.randomUUID(),
            recipe_id: String(recipe_id),
            user_id: userId,
            text: body.text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        commentsStore.push(newComment);

        // Return enriched comment
        const user = usersStore.find(u => u.id === userId);
        const enrichedComment = {
            ...newComment,
            user: user ? {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_active: user.is_active,
                is_admin: user.is_admin
            } : null
        };

        return HttpResponse.json(enrichedComment, { status: 201 });
    }),


    // PUT /recipes/:recipe_id/comments/:comment_id
    http.put('*/recipes/:recipe_id/comments/:comment_id', async ({ request, params }) => {
        const { comment_id } = params;
        const body = await request.json() as CommentUpdate;

        const index = commentsStore.findIndex(c => c.id === comment_id);
        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const updatedComment = {
            ...commentsStore[index],
            text: body.text,
            updated_at: new Date().toISOString()
        };

        commentsStore[index] = updatedComment;

        // Enrich
        const user = usersStore.find(u => u.id === updatedComment.user_id);
        const enrichedComment = {
            ...updatedComment,
            user: user ? {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_active: user.is_active,
                is_admin: user.is_admin
            } : null
        };

        return HttpResponse.json(enrichedComment);

    }),

    // DELETE /recipes/:recipe_id/comments/:comment_id
    http.delete('*/recipes/:recipe_id/comments/:comment_id', ({ params }) => {
        const { comment_id } = params;
        const index = commentsStore.findIndex(c => c.id === comment_id);

        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        commentsStore.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
    }),

    // --- MEAL TEMPLATES ---

    // GET /meals/templates
    http.get('*/meals/templates', ({ request }) => {
        const url = new URL(request.url);
        const skip = Number(url.searchParams.get('skip') || '0');
        const limit = Number(url.searchParams.get('limit') || '100');
        const sort = url.searchParams.get('sort');

        let sorted = [...mealTemplateStore];
        if (sort === 'name') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === '-name') {
            sorted.sort((a, b) => b.name.localeCompare(a.name));
        }

        const paginated = sorted.slice(skip, skip + limit);

        return HttpResponse.json(paginated, {
            headers: {
                'X-Total-Count': mealTemplateStore.length.toString(),
                'Access-Control-Expose-Headers': 'X-Total-Count'
            },
        });
    }),

    // GET /meals/templates/:id
    http.get('*/meals/templates/:id', ({ params }) => {
        const { id } = params;
        const template = mealTemplateStore.find(t => t.id === id);

        if (!template) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(template);
    }),

    // POST /meals/templates
    http.post('*/meals/templates', async ({ request }) => {
        const body = await request.json() as MealTemplateCreate;
        const newTemplate: MealTemplate = {
            id: crypto.randomUUID(),
            name: body.name,
            classification: body.classification || null,
            user_id: "550e8400-e29b-41d4-a716-446655440000",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            slots: body.slots ? body.slots.map(s => ({
                id: crypto.randomUUID(),
                template_id: "temp",
                strategy: s.strategy,
                recipe_id: s.recipe_id, // Map other fields if needed
            })) : []
        };
        newTemplate.slots.forEach(s => s.template_id = newTemplate.id);

        mealTemplateStore.push(newTemplate);
        return HttpResponse.json(newTemplate, { status: 201 });
    }),

    // PUT /meals/templates/:id
    http.put('*/meals/templates/:id', async ({ request, params }) => {
        const { id } = params;
        const body = await request.json() as MealTemplateUpdate;

        const index = mealTemplateStore.findIndex(t => t.id === id);
        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const updatedTemplate = {
            ...mealTemplateStore[index],
            ...body,
            name: body.name || mealTemplateStore[index].name,
            updated_at: new Date().toISOString()
        };
        // TODO: Handle slot updates properly if needed, similar to Meal items

        mealTemplateStore[index] = updatedTemplate;
        return HttpResponse.json(updatedTemplate);
    }),

    // DELETE /meals/templates/:id
    http.delete('*/meals/templates/:id', ({ params }) => {
        const { id } = params;
        const index = mealTemplateStore.findIndex(t => t.id === id);

        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }
        mealTemplateStore.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
    }),

    // POST /meals/generate - Generate a meal from a template
    http.post('*/meals/generate', ({ request }) => {
        const url = new URL(request.url);
        const templateId = url.searchParams.get('template_id');

        if (!templateId) {
            return HttpResponse.json(
                { detail: 'template_id is required' },
                { status: 422 }
            );
        }

        const template = mealTemplateStore.find(t => t.id === templateId);

        if (!template) {
            return HttpResponse.json(
                { detail: 'Template not found' },
                { status: 404 }
            );
        }

        // Generate meal items from template slots
        const items: Meal['items'] = [];

        for (const slot of template.slots) {
            let recipeId: string | undefined;

            if (slot.strategy === 'Direct' && slot.recipe_id) {
                // Direct strategy: use the specified recipe
                recipeId = slot.recipe_id;
            } else if (slot.strategy === 'List' && slot.recipe_ids && slot.recipe_ids.length > 0) {
                // List strategy: pick a random recipe from the list
                const randomIndex = Math.floor(Math.random() * slot.recipe_ids.length);
                recipeId = slot.recipe_ids[randomIndex];
            } else if (slot.strategy === 'Search') {
                // Search strategy: pick a random recipe from the store
                // In a real implementation, this would apply search criteria
                if (recipes.length > 0) {
                    const randomIndex = Math.floor(Math.random() * recipes.length);
                    recipeId = recipes[randomIndex].core.id;
                }
            }

            if (recipeId) {
                items.push({
                    id: crypto.randomUUID(),
                    meal_id: "temp", // Will be set after meal creation
                    recipe_id: recipeId,
                    slot_id: slot.id
                });
            }
        }

        const newMeal: Meal = {
            id: crypto.randomUUID(),
            user_id: "550e8400-e29b-41d4-a716-446655440000",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: template.name,
            status: MealStatus.PROPOSED,
            classification: template.classification,
            date: null,
            template_id: template.id,
            items: items
        };

        // Fix meal_id on items
        newMeal.items.forEach(item => item.meal_id = newMeal.id);

        mealsStore.push(newMeal);
        return HttpResponse.json(newMeal, { status: 201 });
    }),

    // --- MEALS ---

    // GET /meals/
    http.get('*/meals/', ({ request }) => {
        const url = new URL(request.url);
        const skip = Number(url.searchParams.get('skip') || '0');
        const limit = Number(url.searchParams.get('limit') || '100');
        const sort = url.searchParams.get('sort');

        const sortedMeals = [...mealsStore];
        if (sort === '-created_at') {
            sortedMeals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sort === 'created_at') {
            sortedMeals.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }

        const paginatedMeals = sortedMeals.slice(skip, skip + limit);

        return HttpResponse.json(paginatedMeals, {
            headers: {
                'X-Total-Count': mealsStore.length.toString(),
                'Access-Control-Expose-Headers': 'X-Total-Count'
            },
        });
    }),

    // GET /meals/:id
    http.get('*/meals/:id', ({ params }) => {
        const { id } = params;
        const meal = mealsStore.find(m => m.id === id);

        if (!meal) {
            return new HttpResponse(null, { status: 404 });
        }

        return HttpResponse.json(meal);
    }),

    // POST /meals/
    http.post('*/meals/', async ({ request }) => {
        const body = await request.json() as MealCreate;
        const newMeal: Meal = {
            id: crypto.randomUUID(),
            user_id: "550e8400-e29b-41d4-a716-446655440000", // Default user
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: body.name || null,
            status: body.status === null ? undefined : body.status || MealStatus.PROPOSED,
            classification: body.classification || null,
            date: body.date || null,
            template_id: body.template_id || null, // Assuming template_id is used but not in Create body usually? Check MealCreate.
            items: (body.items || []).map(item => ({
                id: crypto.randomUUID(),
                meal_id: "temp", // assigned below
                recipe_id: item.recipe_id,
                // TODO: fetch recipe details if we want to enrich them like we did in data.ts for mock visuals
            }))
        };
        // Fix meal_id and ensure items are fully structured if needed
        newMeal.items.forEach(i => i.meal_id = newMeal.id);

        mealsStore.push(newMeal);
        return HttpResponse.json(newMeal, { status: 201 });
    }),

    // PUT /meals/:id
    http.put('*/meals/:id', async ({ request, params }) => {
        const { id } = params;
        const body = await request.json() as MealUpdate;

        const index = mealsStore.findIndex(m => m.id === id);
        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const { items, ...restBody } = body;

        const updatedMeal: Meal = {
            ...mealsStore[index],
            ...restBody, // simple merge for top level fields
            status: body.status || mealsStore[index].status || MealStatus.PROPOSED,
            updated_at: new Date().toISOString(),
            items: items
                ? items.map(i => ({
                    id: crypto.randomUUID(),
                    meal_id: id as string,
                    recipe_id: i.recipe_id,
                    slot_id: null
                }))
                : (items === null ? [] : mealsStore[index].items)
        };

        mealsStore[index] = updatedMeal;
        return HttpResponse.json(updatedMeal);
    }),

    // DELETE /meals/:id
    http.delete('*/meals/:id', ({ params }) => {
        const { id } = params;
        const index = mealsStore.findIndex(m => m.id === id);

        if (index === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        mealsStore.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
    }),


];

