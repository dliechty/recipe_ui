import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleGrid, Box, Heading, Text, Spinner, Center, Container, HStack, Badge, Button, Spacer, Icon } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useRecipes } from '../../../hooks/useRecipes';
import ErrorAlert from '../../../components/common/ErrorAlert';

const RecipeList = () => {
    const navigate = useNavigate();
    const { data: recipes = [], isLoading: loading, error } = useRecipes();

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <ErrorAlert title="Failed to load recipes" description={error.message || "An unexpected error occurred."} />
            </Container>
        );
    }

    const handleRecipeClick = (id: string) => {
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
            <HStack mb={8}>
                <Heading color="fg.default">All Recipes</Heading>
                <Spacer />
                <Button
                    onClick={() => navigate('/recipes/new')}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                >
                    <Icon as={FaPlus} /> Add Recipe
                </Button>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
                {recipes.map((recipe) => (
                    <Box
                        key={recipe.core.id}
                        p={6}
                        borderWidth={1}
                        borderColor="border.default"
                        borderRadius="lg"
                        boxShadow="md"
                        bg="bg.surface"
                        _hover={{ boxShadow: 'lg', borderColor: 'vscode.accent', cursor: 'pointer' }}
                        transition="all 0.2s"
                        onClick={() => handleRecipeClick(recipe.core.id)}
                    >
                        <Heading size="md" mb={2} color="fg.default">{recipe.core.name}</Heading>
                        <Text color="fg.muted" mb={4}>{recipe.core.description}</Text>
                        <HStack gap={2} mb={2}>
                            {(recipe.times.total_time_minutes ?? 0) > 0 && (
                                <Badge colorPalette="green" variant="subtle">Total Time: {recipe.times.total_time_minutes}m</Badge>
                            )}
                            <Badge colorPalette="blue" variant="subtle">Yield: {recipe.core.yield_amount} {recipe.core.yield_unit}</Badge>
                        </HStack>
                        <HStack gap={2}>
                            {recipe.core.difficulty && (
                                <Badge colorPalette={recipe.core.difficulty === 'Easy' ? 'green' : recipe.core.difficulty === 'Medium' ? 'yellow' : 'red'}>
                                    {recipe.core.difficulty}
                                </Badge>
                            )}
                            {recipe.core.cuisine && (
                                <Badge colorPalette="purple">{recipe.core.cuisine}</Badge>
                            )}
                            {recipe.core.category && (
                                <Badge colorPalette="orange">{recipe.core.category}</Badge>
                            )}
                        </HStack>
                    </Box>
                ))}
            </SimpleGrid>
        </Container>
    );
};

export default RecipeList;