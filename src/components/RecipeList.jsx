import React, { useState, useEffect } from 'react';
import { SimpleGrid, Box, Heading, Text, Spinner, Center, Container } from '@chakra-ui/react';
import { getRecipes } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await getRecipes(token);
                // The Recipe schema includes id, title, description, etc.
                setRecipes(response.data);
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [token]);

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
                        _hover={{ boxShadow: 'lg', borderColor: 'vscode.accent' }}
                        transition="all 0.2s"
                    >
                        <Heading size="md" mb={2} color="fg.default">{recipe.title}</Heading>
                        <Text color="fg.muted">{recipe.description}</Text>
                    </Box>
                ))}
            </SimpleGrid>
        </Container>
    );
};

export default RecipeList;