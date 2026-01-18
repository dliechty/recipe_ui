// Helper script to generate mock recipe data
export function generateMockRecipes(count: number) {
    const cuisines = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'French', 'Thai', 'Greek', 'Spanish', 'American'];
    const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Appetizer', 'Main Course', 'Side Dish', 'Snack', 'Soup', 'Salad'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const recipeNames = [
        'Pasta', 'Curry', 'Stir Fry', 'Soup', 'Salad', 'Pizza', 'Burger', 'Sandwich', 'Tacos', 'Burrito',
        'Noodles', 'Rice Bowl', 'Casserole', 'Roast', 'Grilled', 'Baked', 'Fried', 'Steamed', 'Braised', 'Sautéed'
    ];
    const proteins = ['Chicken', 'Beef', 'Pork', 'Fish', 'Tofu', 'Shrimp', 'Lamb', 'Turkey', 'Vegetable', 'Mushroom'];
    const diets = ['vegan', 'vegetarian', 'gluten-free', 'low-carb', 'halal', 'kosher'];

    const recipes = [];

    for (let i = 1; i <= count; i++) {
        const idx = i - 1; // 0-based index for array access
        const protein = proteins[idx % proteins.length];
        const recipeName = recipeNames[idx % recipeNames.length];
        const cuisine = cuisines[idx % cuisines.length];
        const category = categories[idx % categories.length];
        const difficulty = difficulties[idx % difficulties.length];

        // Main Recipe
        const mainRecipeId = `${i}`;
        const variantRecipeId = `${i}-v`;

        const mainRecipe = {
            core: {
                id: mainRecipeId,
                name: `${protein} ${recipeName} ${i}`,
                description: `Delicious ${protein.toLowerCase()} ${recipeName.toLowerCase()} recipe number ${i}.`,
                yield_amount: (i % 6) + 1,
                yield_unit: 'servings',
                difficulty,
                cuisine,
                category,
                source: i % 3 === 0 ? 'Family Recipe' : null,
                source_url: i % 5 === 0 ? `https://example.com/recipe-${i}` : null,
                slug: `${protein.toLowerCase()}-${recipeName.toLowerCase()}-${i}`,
                protein: protein,
                owner_id: "550e8400-e29b-41d4-a716-446655440000"
            },
            times: {
                prep_time_minutes: (i % 30) + 5,
                cook_time_minutes: (i % 60) + 10,
                active_time_minutes: (i % 45) + 5,
                total_time_minutes: ((i % 30) + 5) + ((i % 60) + 10)
            },
            nutrition: {
                calories: (i % 500) + 200,
                serving_size: '1 plate'
            },
            components: [
                {
                    name: 'Main',
                    ingredients: [
                        { quantity: (i % 5) + 1, unit: 'cups', item: `Ingredient ${i}-1`, notes: null },
                        { quantity: (i % 3) + 1, unit: 'tbsp', item: `Ingredient ${i}-2`, notes: null },
                        { quantity: 1, unit: 'tsp', item: `Ingredient ${i}-3`, notes: null }
                    ]
                }
            ],
            instructions: [
                { step_number: 1, text: `Prepare the ${protein.toLowerCase()}.` },
                { step_number: 2, text: `Cook according to recipe ${i}.` },
                { step_number: 3, text: 'Season and serve.' }
            ],
            suitable_for_diet: (i === 1 || i % 4 !== 0) ? [diets[i % diets.length]] : [],
            audit: {
                created_at: new Date(Date.now() - (i * 86400000)).toISOString(),
                updated_at: new Date(Date.now() - (i * 86400000)).toISOString(),
                version: 1,
            },
            parent_recipe_id: null,
            variant_recipe_ids: i % 2 !== 0 ? [variantRecipeId] : []
        };

        recipes.push(mainRecipe);

        // Variant Recipe
        if (i % 2 !== 0) {
            recipes.push({
                ...mainRecipe, // Copy main fields
                core: {
                    ...mainRecipe.core,
                    id: variantRecipeId,
                    name: `${protein} ${recipeName} ${i} (Spicy Variant)`,
                    description: `A spicy variation of the ${protein.toLowerCase()} ${recipeName.toLowerCase()}.`,
                    slug: `${protein.toLowerCase()}-${recipeName.toLowerCase()}-${i}-variant`
                },
                parent_recipe_id: mainRecipeId,
                variant_recipe_ids: [],
                components: [
                    {
                        name: 'Main',
                        ingredients: [
                            ...mainRecipe.components[0].ingredients,
                            { quantity: 1, unit: 'pinch', item: 'Chili Flakes', notes: 'For extra heat' }
                        ]
                    }
                ]
            });
        }
    }

    return recipes;
}

export function generateMockMeals(count: number) {
    const statuses = ['Draft', 'Scheduled', 'Cooked'];
    const classifications = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Brunch'];
    const meals = [];

    for (let i = 1; i <= count; i++) {
        const idx = i - 1;
        const status = statuses[idx % statuses.length];
        const classification = classifications[idx % classifications.length];
        const dateOffset = idx - (count / 2); // Spread dates around today
        const date = new Date(Date.now() + (dateOffset * 86400000)).toISOString().split('T')[0];

        meals.push({
            id: `mock-meal-${i}`,
            name: `${classification} Meal ${i}`,
            status: status,
            classification: classification,
            date: date,
            user_id: "550e8400-e29b-41d4-a716-446655440000",
            template_id: null,
            created_at: new Date(Date.now() - (i * 3600000)).toISOString(),
            updated_at: new Date(Date.now() - (i * 3600000)).toISOString(),
            items: [
                {
                    id: `mock-meal-item-${i}-1`,
                    meal_id: `mock-meal-${i}`,
                    recipe_id: `${(i % 50) + 1}`, // Assuming we have at least 50 mock recipes
                    order: 1
                }
            ]
        });
    }

    return meals;
}

export function generateMockMealTemplates(count: number) {
    const classifications = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Brunch'];
    const strategies = ['Direct', 'List', 'Search'];
    const templates = [];

    for (let i = 1; i <= count; i++) {
        const idx = i - 1;
        const classification = classifications[idx % classifications.length];
        const strategy = strategies[idx % strategies.length];

        const slots = [];
        if (strategy === 'Direct') {
            slots.push({
                id: `mock-slot-${i}-1`,
                template_id: `mock-template-${i}`,
                strategy: 'Direct',
                recipe_id: `${(i % 50) + 1}`
            });
        } else if (strategy === 'List') {
            slots.push({
                id: `mock-slot-${i}-1`,
                template_id: `mock-template-${i}`,
                strategy: 'List',
                recipe_ids: [`${(i % 50) + 1}`, `${((i + 1) % 50) + 1}`]
            });
        } else {
             slots.push({
                id: `mock-slot-${i}-1`,
                template_id: `mock-template-${i}`,
                strategy: 'Search',
                search_criteria: [
                    { field: "category", operator: "eq", value: "Main Course" }
                ]
            });
        }

        templates.push({
            id: `mock-template-${i}`,
            name: `${classification} Template ${i}`,
            user_id: "550e8400-e29b-41d4-a716-446655440000",
            classification: classification,
            created_at: new Date(Date.now() - (i * 86400000)).toISOString(),
            updated_at: new Date(Date.now() - (i * 86400000)).toISOString(),
            slots: slots
        });
    }

    return templates;
}
