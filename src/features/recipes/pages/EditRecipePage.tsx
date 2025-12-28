import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Heading, Spinner, Center, Text } from '@chakra-ui/react';
import RecipeForm from '../components/RecipeForm';
import { useRecipe, useUpdateRecipe } from '../../../hooks/useRecipes';
import { RecipeCreate } from '../../../client';
import { toaster } from '../../../toaster';

const EditRecipePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: recipeData, isLoading: isFetching, error } = useRecipe(id || '');
    const updateRecipeMutation = useUpdateRecipe();

    const handleSubmit = (formData: RecipeCreate) => {
        updateRecipeMutation.mutate({ id: id || '', requestBody: formData }, {
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
    // Transform data for the form
    const initialData: RecipeCreate = {
        core: {
            name: recipeData.core.name,
            description: recipeData.core.description,
            source: recipeData.core.source,
            yield_amount: recipeData.core.yield_amount,
            yield_unit: recipeData.core.yield_unit,
            difficulty: recipeData.core.difficulty,
            cuisine: recipeData.core.cuisine,
            category: recipeData.core.category,
            source_url: recipeData.core.source_url,
            slug: recipeData.core.slug
        },
        times: recipeData.times,
        nutrition: recipeData.nutrition,
        components: recipeData.components.map(comp => ({
            name: comp.name,
            ingredients: comp.ingredients.map(i => ({
                ingredient_name: i.item,
                quantity: i.quantity,
                unit: i.unit,
                notes: i.notes
            }))
        })),
        instructions: recipeData.instructions.map(i => ({
            step_number: i.step_number,
            text: i.text
        }))
    };

    return (
        <Container maxW="container.lg" py={8}>
            <Heading mb={8} color="fg.default">Edit Recipe</Heading>
            <RecipeForm initialData={initialData} onSubmit={handleSubmit} isLoading={updateRecipeMutation.isPending} />
        </Container>
    );
};

export default EditRecipePage;
