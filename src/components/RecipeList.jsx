import React, { useState, useEffect } from 'react';
import { SimpleGrid, Box, Heading, Text, Spinner, Center, Container } from '@chakra-ui/react';
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

    if (loading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <Heading mb={8}>All Recipes</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {recipes.map((recipe) => (
                    <Box
                        key={recipe.id}
                        p={6}
                        borderWidth={1}
                        borderRadius="lg"
                        boxShadow="md"
                        _hover={{ boxShadow: 'lg' }}
                        transition="all 0.2s"
                    >
                        <Heading size="md" mb={2}>{recipe.title}</Heading>
                        <Text color="gray.600">{recipe.description}</Text>
                    </Box>
                ))}
            </SimpleGrid>
        </Container>
    );
};

export default RecipeList;