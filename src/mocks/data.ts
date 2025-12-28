
export const users = [
    {
        id: "1",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        is_active: true,
        is_admin: false
    },
    {
        id: "2",
        email: "chef@example.com",
        first_name: "Gordon",
        last_name: "Ramsay",
        is_active: true,
        is_admin: true
    }
];

export const recipes = [
    {
        core: {
            id: "1",
            name: 'Spaghetti Carbonara',
            description_short: 'A classic Italian pasta dish.',
            description_long: 'This is a longer description of the classic Italian pasta dish recipe.',
            yield_amount: 4,
            yield_unit: 'servings',
            difficulty: 'Medium',
            cuisine: 'Italian',
            category: 'Main Course',
            source: 'Grandma',
            source_url: 'https://www.example.com/spaghetti-carbonara',
            slug: 'spaghetti-carbonara',
            owner_id: "1"
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
            description_short: 'Spicy and delicious chicken curry.',
            description_long: null,
            yield_amount: 6,
            yield_unit: 'servings',
            difficulty: 'Medium',
            cuisine: 'Indian',
            category: 'Main Course',
            source: null,
            source_url: null,
            slug: 'chicken-curry',
            owner_id: "1"
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
            description_short: 'Healthy breakfast option.',
            description_long: null,
            yield_amount: 1,
            yield_unit: 'serving',
            difficulty: 'Easy',
            cuisine: 'Modern',
            category: 'Breakfast',
            source: null,
            source_url: null,
            slug: 'avocado-toast',
            owner_id: "1"
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
