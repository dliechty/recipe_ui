import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Heading, Spinner, Center, Text } from '@chakra-ui/react';
import RecipeForm from './RecipeForm';
import { useRecipe, useUpdateRecipe } from '../hooks/useRecipes';
import { RecipeCreate } from '../client';
import { toaster } from '../toaster';

const EditRecipePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: recipeData, isLoading: isFetching, error } = useRecipe(Number(id));
    const updateRecipeMutation = useUpdateRecipe();

    const handleSubmit = (formData: RecipeCreate) => {
        updateRecipeMutation.mutate({ id: Number(id), requestBody: formData }, {
            onSuccess: () => {
                toaster.create({
                    title: "Recipe updated",
                    type: "success",
                });
                navigate(`/recipes/${id}`);
            },
            onError: (error) => {
                console.error("Failed to update recipe:", error);
                toaster.create({
                    title: "Failed to update recipe",
                    description: error.message || "Unknown error",
                    type: "error",
                });
            }
        });
    };

    if (isFetching) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    if (error || !recipeData) {
        return (
            <Container maxW="container.md" py={8}>
                <Text>Recipe not found.</Text>
            </Container>
        );
    }

    // Transform data for the form
    const initialData: RecipeCreate = {
        name: recipeData.name,
        description: recipeData.description,
        prep_time_minutes: recipeData.prep_time_minutes,
        cook_time_minutes: recipeData.cook_time_minutes,
        servings: recipeData.servings,
        source: recipeData.source,
        tags: recipeData.tags?.map(t => t.name) || [],
        ingredients: recipeData.ingredients?.map(i => ({
            ingredient_name: i.ingredient.name,
            quantity: i.quantity,
            unit: i.unit,
            notes: i.notes
        })) || [],
        instructions: recipeData.instructions?.map(i => ({
            step_number: i.step_number,
            description: i.description
        })) || []
    };

    return (
        <Container maxW="container.lg" py={8}>
            <Heading mb={8} color="fg.default">Edit Recipe</Heading>
            <RecipeForm initialData={initialData} onSubmit={handleSubmit} isLoading={updateRecipeMutation.isPending} />
        </Container>
    );
};

export default EditRecipePage;
