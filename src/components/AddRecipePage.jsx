import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Heading, Box } from '@chakra-ui/react';
import RecipeForm from './RecipeForm';
import { RecipesService } from '../client';

const AddRecipePage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await RecipesService.createRecipeRecipesPost(formData);
            // navigate will happen after
            navigate('/recipes');
        } catch (error) {
            console.error("Failed to create recipe:", error);
            alert("Unable to create recipe.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.lg" py={8}>
            <Heading mb={8} color="fg.default">Add New Recipe</Heading>
            <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />
        </Container>
    );
};

export default AddRecipePage;
