import axios from 'axios';

// The base URL for your FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

// Create an axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
});

// --- Authentication Functions ---

// Register a new user
// Corresponds to POST /auth/users/ in api/auth.py
export const registerUser = (email, password) => {
    return api.post('/auth/users/', {
        email,
        password,
    });
};

// Login to get an access token
// Corresponds to POST /auth/token in api/auth.py
export const login = (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    return api.post('/auth/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
};


// --- Recipe Functions ---

// Get all recipes
// Corresponds to GET /recipes/ in api/recipes.py
export const getRecipes = (token) => {
    return api.get('/recipes/', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// Get a single recipe by ID
// Corresponds to GET /recipes/{recipe_id} in api/recipes.py
export const getRecipeById = (id, token) => {
    return api.get(`/recipes/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// Create a new recipe (requires token)
// Corresponds to POST /recipes/ in api/recipes.py
export const createRecipe = (recipeData, token) => {
    return api.post('/recipes/', recipeData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// Update a recipe (requires token)
// Corresponds to PUT /recipes/{recipe_id} in api/recipes.py
export const updateRecipe = (id, recipeData, token) => {
    return api.put(`/recipes/${id}`, recipeData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// Delete a recipe (requires token)
// Corresponds to DELETE /recipes/{recipe_id} in api/recipes.py
export const deleteRecipe = (id, token) => {
    return api.delete(`/recipes/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export default api;