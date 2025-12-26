import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleGrid, Box, Heading, Text, Spinner, Center, Container, HStack, Badge } from '@chakra-ui/react';
import { RecipesService } from '../client';
import { useAuth } from '../context/AuthContext';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await RecipesService.readRecipesRecipesGet();
                setRecipes(response);
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [token]);

    const navigate = useNavigate();

    const handleRecipeClick = (id) => {
        navigate(`/recipes/${id}`);
    };

    if (loading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <Heading mb={8} color="fg.default">All Recipes</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {recipes.map((recipe) => (
                    <Box
                        key={recipe.id}
                        p={6}
                        borderWidth={1}
                        borderColor="border.default"
                        borderRadius="lg"
                        boxShadow="md"
                        bg="bg.surface"
                        _hover={{ boxShadow: 'lg', borderColor: 'vscode.accent', cursor: 'pointer' }}
                        transition="all 0.2s"
                        onClick={() => handleRecipeClick(recipe.id)}
                    >
                        <Heading size="md" mb={2} color="fg.default">{recipe.name}</Heading>
                        <Text color="fg.muted" mb={4}>{recipe.description}</Text>
                        <HStack spacing={2} mb={2}>
                            <Badge colorScheme="green" variant="subtle">Active: {recipe.prep_time_minutes}m</Badge>
                            <Badge colorScheme="orange" variant="subtle">Cook: {recipe.cook_time_minutes}m</Badge>
                            <Badge colorScheme="blue" variant="subtle">Yield: {recipe.servings} servings</Badge>
                        </HStack>
                        <HStack spacing={2}>
                            {recipe.tags.map((tag) => (
                                <Badge key={tag.id} colorScheme="purple">{tag.name}</Badge>
                            ))}
                        </HStack>
                    </Box>
                ))}
            </SimpleGrid>
        </Container>
    );
};

export default RecipeList;