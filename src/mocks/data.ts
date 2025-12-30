
export const users = [
    {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        is_active: true,
        is_admin: false,
        is_first_login: false
    },
    {
        id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        email: "admin@example.com",
        first_name: "Admin",
        last_name: "User",
        is_active: true,
        is_admin: true,
        is_first_login: false
    }
];

export const recipes = [
    {
        core: {
            id: "1",
            name: 'Spaghetti Carbonara',
            description: 'The classic Italian pasta dish recipe.',
            yield_amount: 4,
            yield_unit: 'servings',
            difficulty: 'Hard',
            cuisine: 'Italian',
            category: 'Main Course',
            source: 'Grandma',
            source_url: 'https://www.example.com/spaghetti-carbonara',
            slug: 'spaghetti-carbonara',
            owner_id: "550e8400-e29b-41d4-a716-446655440000"
        },
        times: {
            prep_time_minutes: 15,
            cook_time_minutes: 15,
            active_time_minutes: 15,
            total_time_minutes: 30
        },
        nutrition: {
            calories: 600,
            serving_size: '1 plate'
        },
        components: [
            {
                name: 'Main',
                ingredients: [
                    { quantity: 400, unit: 'g', item: 'Spaghetti', notes: null },
                    { quantity: 4, unit: 'large', item: 'Eggs', notes: null },
                    { quantity: 100, unit: 'g', item: 'Pecorino Romano', notes: null },
                    { quantity: 150, unit: 'g', item: 'Guanciale', notes: null },
                    { quantity: 1, unit: 'tsp', item: 'Black Pepper', notes: null }
                ]
            }
        ],
        instructions: [
            { step_number: 1, text: 'Boil the pasta in salted water.' },
            { step_number: 2, text: 'Fry the guanciale until crisp.' },
            { step_number: 3, text: 'Mix eggs and cheese.' },
            { step_number: 4, text: 'Combine pasta, guanciale, and egg mixture off heat.' }
        ],
        audit: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: 1,
            parent_recipe_id: null
        }
    },
    {
        core: {
            id: "2",
            name: 'Chicken Curry',
            description: 'Spicy and delicious chicken curry.',
            yield_amount: 6,
            yield_unit: 'servings',
            difficulty: 'Medium',
            cuisine: 'Indian',
            category: 'Main Course',
            source: null,
            source_url: null,
            slug: 'chicken-curry',
            owner_id: "550e8400-e29b-41d4-a716-446655440000"
        },
        times: {
            prep_time_minutes: 20,
            cook_time_minutes: 45,
            active_time_minutes: 30,
            total_time_minutes: 65
        },
        nutrition: {
            calories: 500,
            serving_size: '1 bowl'
        },
        components: [
            {
                name: 'Main',
                ingredients: [
                    { quantity: 500, unit: 'g', item: 'Chicken Breast', notes: null },
                    { quantity: 400, unit: 'ml', item: 'Coconut Milk', notes: null },
                    { quantity: 3, unit: 'tbsp', item: 'Curry Powder', notes: null },
                    { quantity: 1, unit: 'large', item: 'Onion', notes: null }
                ]
            },
            {
                name: 'Rice',
                ingredients: [
                    { quantity: 1, unit: 'cup', item: 'Basmati Rice', notes: null },
                    { quantity: 2, unit: 'cups', item: 'Water', notes: null },
                    { quantity: 1, unit: 'tsp', item: 'Salt', notes: null }
                ]
            }
        ],
        instructions: [
            { step_number: 1, text: 'Sauté onions manually.' },
            { step_number: 2, text: 'Add chicken and brown.' },
            { step_number: 3, text: 'Add spices and coconut milk.' },
            { step_number: 4, text: 'Simmer until cooked.' }
        ],
        audit: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: 1,
            parent_recipe_id: null
        }
    },
    {
        core: {
            id: "3",
            name: 'Avocado Toast',
            description: 'Healthy breakfast option.',
            yield_amount: 1,
            yield_unit: 'serving',
            difficulty: 'Easy',
            cuisine: 'Modern',
            category: 'Breakfast',
            source: null,
            source_url: null,
            slug: 'avocado-toast',
            owner_id: "550e8400-e29b-41d4-a716-446655440000"
        },
        times: {
            prep_time_minutes: 5,
            cook_time_minutes: 0,
            active_time_minutes: 5,
            total_time_minutes: 5
        },
        nutrition: {
            calories: 250,
            serving_size: '1 slice'
        },
        components: [
            {
                name: 'Main',
                ingredients: [
                    { quantity: 2, unit: 'slices', item: 'Bread', notes: null },
                    { quantity: 1, unit: 'ripe', item: 'Avocado', notes: null },
                    { quantity: 1, unit: 'pinch', item: 'Salt', notes: null },
                    { quantity: 1, unit: 'pinch', item: 'Chili Flakes', notes: null }
                ]
            }
        ],
        instructions: [
            { step_number: 1, text: 'Toast the bread.' },
            { step_number: 2, text: 'Mash avocado and spread on toast.' },
            { step_number: 3, text: 'Sprinkle with salt and chili flakes.' }
        ],
        audit: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: 1,
            parent_recipe_id: null
        }
    },
];
