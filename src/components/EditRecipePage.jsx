import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Heading, Spinner, Center, Text } from '@chakra-ui/react';
import RecipeForm from './RecipeForm';
import { RecipesService } from '../client';

const EditRecipePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await RecipesService.readRecipeRecipesRecipeIdGet(Number(id));
                // Transform data for the form
                const formData = {
                    name: response.name,
                    description: response.description,
                    prep_time_minutes: response.prep_time_minutes,
                    cook_time_minutes: response.cook_time_minutes,
                    servings: response.servings,
                    source: response.source,
                    tags: response.tags.map(t => t.name),
                    ingredients: response.ingredients.map(i => ({
                        ingredient_name: i.ingredient.name,
                        quantity: i.quantity,
                        unit: i.unit,
                        notes: i.notes
                    })),
                    instructions: response.instructions.map(i => ({
                        step_number: i.step_number,
                        description: i.description
                    }))
                };
                setRecipe(formData);
            } catch (error) {
                console.error("Failed to fetch recipe:", error);
                alert("Failed to load recipe.");
            } finally {
                setIsFetching(false);
            }
        };

        if (id) {
            fetchRecipe();
        }
    }, [id]);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await RecipesService.updateRecipeRecipesRecipeIdPut(Number(id), formData);
            navigate(`/recipes/${id}`);
        } catch (error) {
            console.error("Failed to update recipe:", error);
            alert("Unable to update recipe.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    if (!recipe) {
        return (
            <Container maxW="container.md" py={8}>
                <Text>Recipe not found.</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" py={8}>
            <Heading mb={8} color="fg.default">Edit Recipe</Heading>
            <RecipeForm initialData={recipe} onSubmit={handleSubmit} isLoading={isLoading} />
        </Container>
    );
};

export default EditRecipePage;
