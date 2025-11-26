import React, { useState, useEffect } from 'react';
import { getRecipes } from '../services/api';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await getRecipes();
                // The Recipe schema includes id, title, description, etc.
                setRecipes(response.data);
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    if (loading) return <p>Loading recipes...</p>;

    return (
        <div>
            <h2>All Recipes</h2>
            <div className="recipe-grid">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="recipe-card">
                        <h3>{recipe.title}</h3>
                        <p>{recipe.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecipeList;