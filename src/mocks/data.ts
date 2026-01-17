
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

import { generateMockRecipes, generateMockMeals, generateMockMealTemplates } from './data-generator';

// Generate 120 mock recipes for testing infinite scroll (updated)
export const recipes = generateMockRecipes(120);

export const comments = [
    {
        id: "c1",
        recipe_id: "1",
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        text: "This authentic Carbonara recipe is spot on! No cream, just eggs and cheese. Perfect.",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: "c2",
        recipe_id: "1",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        text: "I tried this last night. It was delicious but a bit salty. Maybe less Pecorino next time.",
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: "c3",
        recipe_id: "2",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        text: "Love the spices in this curry. I added some extra chili for heat.",
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 172800000).toISOString()
    }

];

export const meals = [
    // Dinner meals
    {
        id: "m1",
        name: "Weeknight Pasta Dinner",
        status: "Proposed",
        classification: "Dinner",
        date: new Date().toISOString().split('T')[0],
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        template_id: null,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
            {
                id: "mi1",
                meal_id: "m1",
                recipe_id: "1", // Chicken Pasta 1
                order: 1
            },
            {
                id: "mi1b",
                meal_id: "m1",
                recipe_id: "45", // Tofu Salad 45
                order: 2
            }
        ]
    },
    {
        id: "m2",
        name: "Italian Feast",
        status: "Scheduled",
        classification: "Dinner",
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 days from now
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        template_id: null,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
            {
                id: "mi2a",
                meal_id: "m2",
                recipe_id: "11", // Chicken Noodles 11
                order: 1
            },
            {
                id: "mi2b",
                meal_id: "m2",
                recipe_id: "21", // Chicken Pasta 21
                order: 2
            },
            {
                id: "mi2c",
                meal_id: "m2",
                recipe_id: "31", // Chicken Noodles 31
                order: 3
            }
        ]
    },
    {
        id: "m3",
        name: "Taco Tuesday",
        status: "Cooked",
        classification: "Dinner",
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // Admin user
        template_id: null,
        created_at: new Date(Date.now() - 345600000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        items: [
            {
                id: "mi3a",
                meal_id: "m3",
                recipe_id: "9", // Turkey Tacos 9
                order: 1
            },
            {
                id: "mi3b",
                meal_id: "m3",
                recipe_id: "19", // Turkey Tacos 19
                order: 2
            }
        ]
    },
    // Brunch meals
    {
        id: "m4",
        name: "Sunday Brunch",
        status: "Cooked",
        classification: "Brunch",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        template_id: null,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        items: [
            {
                id: "mi4a",
                meal_id: "m4",
                recipe_id: "2", // Beef Curry 2
                order: 1
            },
            {
                id: "mi4b",
                meal_id: "m4",
                recipe_id: "12", // Beef Rice Bowl 12
                order: 2
            }
        ]
    },
    {
        id: "m5",
        name: "Weekend Brunch Spread",
        status: "Proposed",
        classification: "Brunch",
        date: new Date(Date.now() + 518400000).toISOString().split('T')[0], // 6 days from now (next weekend)
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        template_id: "mt3", // Generated from template
        created_at: new Date(Date.now() - 43200000).toISOString(),
        updated_at: new Date(Date.now() - 43200000).toISOString(),
        items: [
            {
                id: "mi5a",
                meal_id: "m5",
                recipe_id: "5", // Tofu Salad 5
                slot_id: "mts3a",
                order: 1
            },
            {
                id: "mi5b",
                meal_id: "m5",
                recipe_id: "15", // Tofu Salad 15
                slot_id: "mts3b",
                order: 2
            }
        ]
    },
    // Breakfast meals
    {
        id: "m6",
        name: "Quick Breakfast",
        status: "Cooked",
        classification: "Breakfast",
        date: new Date(Date.now() - 43200000).toISOString().split('T')[0], // Yesterday
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        template_id: null,
        created_at: new Date(Date.now() - 129600000).toISOString(),
        updated_at: new Date(Date.now() - 43200000).toISOString(),
        items: [
            {
                id: "mi6a",
                meal_id: "m6",
                recipe_id: "41", // Chicken Pasta 41
                order: 1
            }
        ]
    },
    {
        id: "m7",
        name: "Power Breakfast",
        status: "Scheduled",
        classification: "Breakfast",
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        template_id: null,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
            {
                id: "mi7a",
                meal_id: "m7",
                recipe_id: "51", // Chicken Pasta 51
                order: 1
            },
            {
                id: "mi7b",
                meal_id: "m7",
                recipe_id: "61", // Chicken Pasta 61
                order: 2
            }
        ]
    },
    // Lunch meals
    {
        id: "m8",
        name: "Office Lunch",
        status: "Proposed",
        classification: "Lunch",
        date: new Date().toISOString().split('T')[0],
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        template_id: null,
        created_at: new Date(Date.now() - 21600000).toISOString(),
        updated_at: new Date(Date.now() - 21600000).toISOString(),
        items: [
            {
                id: "mi8a",
                meal_id: "m8",
                recipe_id: "22", // Beef Rice Bowl 22
                order: 1
            },
            {
                id: "mi8b",
                meal_id: "m8",
                recipe_id: "32", // Beef Rice Bowl 32
                order: 2
            },
            {
                id: "mi8c",
                meal_id: "m8",
                recipe_id: "42", // Beef Rice Bowl 42
                order: 3
            }
        ]
    },
    {
        id: "m9",
        name: "Light Lunch",
        status: "Cooked",
        classification: "Lunch",
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        template_id: null,
        created_at: new Date(Date.now() - 345600000).toISOString(),
        updated_at: new Date(Date.now() - 259200000).toISOString(),
        items: [
            {
                id: "mi9a",
                meal_id: "m9",
                recipe_id: "35", // Tofu Salad 35
                order: 1
            }
        ]
    },
    // Snack meals
    {
        id: "m10",
        name: "Afternoon Snack",
        status: "Proposed",
        classification: "Snack",
        date: new Date().toISOString().split('T')[0],
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        template_id: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        items: [
            {
                id: "mi10a",
                meal_id: "m10",
                recipe_id: "8", // Turkey Snack 8
                order: 1
            }
        ]
    },
    {
        id: "m11",
        name: "Movie Night Snacks",
        status: "Scheduled",
        classification: "Snack",
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days from now
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        template_id: null,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
            {
                id: "mi11a",
                meal_id: "m11",
                recipe_id: "18", // Turkey Snack 18
                order: 1
            },
            {
                id: "mi11b",
                meal_id: "m11",
                recipe_id: "28", // Turkey Snack 28
                order: 2
            },
            {
                id: "mi11c",
                meal_id: "m11",
                recipe_id: "38", // Turkey Snack 38
                order: 3
            },
            {
                id: "mi11d",
                meal_id: "m11",
                recipe_id: "48", // Turkey Snack 48
                order: 4
            }
        ]
    },
    // Multi-course dinner
    {
        id: "m12",
        name: "Dinner Party",
        status: "Scheduled",
        classification: "Dinner",
        date: new Date(Date.now() + 604800000).toISOString().split('T')[0], // 1 week from now
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        template_id: "mt4", // Generated from multi-slot template
        created_at: new Date(Date.now() - 432000000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
            {
                id: "mi12a",
                meal_id: "m12",
                recipe_id: "5", // Tofu Salad - Appetizer
                slot_id: "mts4a",
                order: 1
            },
            {
                id: "mi12b",
                meal_id: "m12",
                recipe_id: "3", // Pork Stir Fry - Main
                slot_id: "mts4b",
                order: 2
            },
            {
                id: "mi12c",
                meal_id: "m12",
                recipe_id: "7", // Lamb Sandwich - Side
                slot_id: "mts4c",
                order: 3
            },
            {
                id: "mi12d",
                meal_id: "m12",
                recipe_id: "4", // Fish Soup - Dessert
                slot_id: "mts4d",
                order: 4
            }
        ]
    },
    ...generateMockMeals(50)
];

export const mealTemplates = [
    // DIRECT strategy - Single fixed recipe
    {
        id: "mt1",
        name: "Quick Pasta Dinner",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        classification: "Dinner",
        created_at: new Date(Date.now() - 864000000).toISOString(),
        updated_at: new Date(Date.now() - 864000000).toISOString(),
        slots: [
            {
                id: "mts1",
                template_id: "mt1",
                strategy: "Direct",
                recipe_id: "1" // Chicken Pasta 1
            }
        ]
    },
    // LIST strategy - Multiple recipe options to choose from
    {
        id: "mt2",
        name: "Taco Night Options",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        classification: "Dinner",
        created_at: new Date(Date.now() - 604800000).toISOString(),
        updated_at: new Date(Date.now() - 259200000).toISOString(),
        slots: [
            {
                id: "mts2a",
                template_id: "mt2",
                strategy: "List",
                recipe_ids: ["9", "19", "29", "39", "49"] // Various Taco recipes
            }
        ]
    },
    // SEARCH strategy - Criteria-based recipe matching
    {
        id: "mt3",
        name: "Healthy Vegetarian Brunch",
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        classification: "Brunch",
        created_at: new Date(Date.now() - 432000000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        slots: [
            {
                id: "mts3a",
                template_id: "mt3",
                strategy: "Search",
                search_criteria: [
                    { field: "protein", operator: "eq", value: "Tofu" },
                    { field: "difficulty", operator: "eq", value: "Easy" }
                ]
            },
            {
                id: "mts3b",
                template_id: "mt3",
                strategy: "Search",
                search_criteria: [
                    { field: "protein", operator: "eq", value: "Vegetable" },
                    { field: "category", operator: "eq", value: "Salad" }
                ]
            }
        ]
    },
    // Multi-slot template - Full dinner party with courses
    {
        id: "mt4",
        name: "Dinner Party (4 Courses)",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        classification: "Dinner",
        created_at: new Date(Date.now() - 1209600000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        slots: [
            {
                id: "mts4a",
                template_id: "mt4",
                strategy: "Search",
                search_criteria: [
                    { field: "category", operator: "eq", value: "Appetizer" }
                ]
            },
            {
                id: "mts4b",
                template_id: "mt4",
                strategy: "List",
                recipe_ids: ["3", "13", "23", "33", "43"] // Main course options (Stir Fry recipes)
            },
            {
                id: "mts4c",
                template_id: "mt4",
                strategy: "Search",
                search_criteria: [
                    { field: "category", operator: "eq", value: "Side Dish" }
                ]
            },
            {
                id: "mts4d",
                template_id: "mt4",
                strategy: "Search",
                search_criteria: [
                    { field: "category", operator: "eq", value: "Dessert" }
                ]
            }
        ]
    },
    // Asian cuisine template with SEARCH
    {
        id: "mt5",
        name: "Asian Fusion Dinner",
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        classification: "Dinner",
        created_at: new Date(Date.now() - 518400000).toISOString(),
        updated_at: new Date(Date.now() - 345600000).toISOString(),
        slots: [
            {
                id: "mts5a",
                template_id: "mt5",
                strategy: "Search",
                search_criteria: [
                    { field: "cuisine", operator: "in", value: "Chinese,Japanese,Thai" }
                ]
            },
            {
                id: "mts5b",
                template_id: "mt5",
                strategy: "Search",
                search_criteria: [
                    { field: "cuisine", operator: "eq", value: "Japanese" },
                    { field: "category", operator: "eq", value: "Soup" }
                ]
            }
        ]
    },
    // Quick lunch template with LIST
    {
        id: "mt6",
        name: "Quick Work Lunch",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        classification: "Lunch",
        created_at: new Date(Date.now() - 259200000).toISOString(),
        updated_at: new Date(Date.now() - 129600000).toISOString(),
        slots: [
            {
                id: "mts6a",
                template_id: "mt6",
                strategy: "List",
                recipe_ids: ["5", "15", "25", "35", "45", "55"] // Salad recipes
            }
        ]
    },
    // Breakfast template with DIRECT
    {
        id: "mt7",
        name: "Classic Breakfast",
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        classification: "Breakfast",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        slots: [
            {
                id: "mts7a",
                template_id: "mt7",
                strategy: "Direct",
                recipe_id: "41" // Chicken Pasta 41 (Breakfast category)
            },
            {
                id: "mts7b",
                template_id: "mt7",
                strategy: "Direct",
                recipe_id: "51" // Chicken Pasta 51 (Breakfast category)
            }
        ]
    },
    // Mixed strategy template
    {
        id: "mt8",
        name: "Family Sunday Dinner",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        classification: "Dinner",
        created_at: new Date(Date.now() - 691200000).toISOString(),
        updated_at: new Date(Date.now() - 432000000).toISOString(),
        slots: [
            {
                id: "mts8a",
                template_id: "mt8",
                strategy: "Direct",
                recipe_id: "14" // Fixed roast recipe
            },
            {
                id: "mts8b",
                template_id: "mt8",
                strategy: "List",
                recipe_ids: ["7", "17", "27", "37"] // Side dish options
            },
            {
                id: "mts8c",
                template_id: "mt8",
                strategy: "Search",
                search_criteria: [
                    { field: "category", operator: "eq", value: "Dessert" },
                    { field: "difficulty", operator: "eq", value: "Easy" }
                ]
            }
        ]
    },
    // Snack template
    {
        id: "mt9",
        name: "Party Snacks",
        user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        classification: "Snack",
        created_at: new Date(Date.now() - 345600000).toISOString(),
        updated_at: new Date(Date.now() - 259200000).toISOString(),
        slots: [
            {
                id: "mts9a",
                template_id: "mt9",
                strategy: "Search",
                search_criteria: [
                    { field: "category", operator: "eq", value: "Snack" }
                ]
            },
            {
                id: "mts9b",
                template_id: "mt9",
                strategy: "Search",
                search_criteria: [
                    { field: "category", operator: "eq", value: "Appetizer" },
                    { field: "difficulty", operator: "eq", value: "Easy" }
                ]
            },
            {
                id: "mts9c",
                template_id: "mt9",
                strategy: "List",
                recipe_ids: ["8", "18", "28", "38", "48", "58", "68"] // Various snack options
            }
        ]
    },
    // Mediterranean theme
    {
        id: "mt10",
        name: "Mediterranean Feast",
        user_id: "550e8400-e29b-41d4-a716-446655440000",
        classification: "Dinner",
        created_at: new Date(Date.now() - 777600000).toISOString(),
        updated_at: new Date(Date.now() - 518400000).toISOString(),
        slots: [
            {
                id: "mts10a",
                template_id: "mt10",
                strategy: "Search",
                search_criteria: [
                    { field: "cuisine", operator: "in", value: "Greek,Spanish,Italian" },
                    { field: "category", operator: "eq", value: "Appetizer" }
                ]
            },
            {
                id: "mts10b",
                template_id: "mt10",
                strategy: "Search",
                search_criteria: [
                    { field: "cuisine", operator: "eq", value: "Greek" },
                    { field: "protein", operator: "eq", value: "Lamb" }
                ]
            },
            {
                id: "mts10c",
                template_id: "mt10",
                strategy: "Search",
                search_criteria: [
                    { field: "cuisine", operator: "eq", value: "Italian" },
                    { field: "category", operator: "eq", value: "Dessert" }
                ]
            }
        ]
    },
    ...generateMockMealTemplates(50)
];

