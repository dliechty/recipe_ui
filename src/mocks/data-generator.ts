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

    const recipes = [];

    for (let i = 1; i <= count; i++) {
        const idx = i - 1; // 0-based index for array access
        const protein = proteins[idx % proteins.length];
        const recipeName = recipeNames[idx % recipeNames.length];
        const cuisine = cuisines[idx % cuisines.length];
        const category = categories[idx % categories.length];
        const difficulty = difficulties[idx % difficulties.length];

        recipes.push({
            core: {
                id: `${i}`,
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
            audit: {
                created_at: new Date(Date.now() - (i * 86400000)).toISOString(),
                updated_at: new Date(Date.now() - (i * 86400000)).toISOString(),
                version: 1,
                parent_recipe_id: null
            }
        });
    }

    return recipes;
}
