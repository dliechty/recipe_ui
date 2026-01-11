
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

import { generateMockRecipes } from './data-generator';

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
    {
        id: "m1",
        name: "Weeknight Dinner",
        status: "Planned",
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
                recipe_id: "1", // Spag Carbonara
                order: 1,
                recipe: {
                    id: "1",
                    name: "Spaghetti Carbonara"
                }
            }
        ]
    },
    {
        id: "m2",
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
                id: "mi2",
                meal_id: "m2",
                recipe_id: "2", // Chicken Curry
                order: 1,
                recipe: {
                    id: "2",
                    name: "Chicken Curry"
                }
            }
        ]
    }
];

export const mealTemplates = [
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
                strategy: "Simple", // Assuming "Simple" maps to "Direct" or similar? The enum has DIRECT, LIST, SEARCH. "Simple" isn't in enum. I should use "Direct". 
                recipe_id: "1" // Carbonara
            }
        ]
    }
];

