import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Heading } from '@chakra-ui/react';
import RecipeForm from '../components/RecipeForm';
import { useCreateRecipe } from '../../../hooks/useRecipes';
import { RecipeCreate } from '../../../client';
import { toaster } from '../../../toaster';

const AddRecipePage = () => {
    const navigate = useNavigate();
    const createRecipeMutation = useCreateRecipe();

    const handleSubmit = async (formData: RecipeCreate) => {
        createRecipeMutation.mutate(formData, {
            onSuccess: () => {
                toaster.create({
                    title: "Recipe created",
                    type: "success",
                });
                navigate('/recipes');
            },
            onError: (error) => {
                console.error("Failed to create recipe:", error);
                toaster.create({
                    title: "Failed to create recipe",
                    description: error.message || "Unknown error",
                    type: "error",
                });
            }
        });
    };

    return (
        <Container maxW="container.lg" py={8}>
            <Heading mb={8} color="fg.default">Add New Recipe</Heading>
            <RecipeForm onSubmit={handleSubmit} isLoading={createRecipeMutation.isPending} />
        </Container>
    );
};

export default AddRecipePage;
