import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Heading, Box } from '@chakra-ui/react';
import RecipeForm from './RecipeForm';
import { useCreateRecipe } from '../hooks/useRecipes';

const AddRecipePage = () => {
    const navigate = useNavigate();
    const createRecipeMutation = useCreateRecipe();

    const handleSubmit = async (formData) => {
        createRecipeMutation.mutate(formData, {
            onSuccess: () => {
                navigate('/recipes');
            },
            onError: (error) => {
                console.error("Failed to create recipe:", error);
                alert("Unable to create recipe.");
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
