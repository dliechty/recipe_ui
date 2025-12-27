import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleGrid, Box, Heading, Text, Spinner, Center, Container, HStack, Badge, Button, Spacer, Icon } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useRecipes } from '../hooks/useRecipes';
import ErrorAlert from './ErrorAlert';

const RecipeList = () => {
    const { data: recipes = [], isLoading: loading, error } = useRecipes();

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <ErrorAlert title="Failed to load recipes" description={error.message || "An unexpected error occurred."} />
            </Container>
        );
    }

    const navigate = useNavigate();

    const handleRecipeClick = (id: number) => {
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
                        <HStack gap={2} mb={2}>
                            <Badge colorScheme="green" variant="subtle">Active: {recipe.prep_time_minutes}m</Badge>
                            <Badge colorScheme="orange" variant="subtle">Cook: {recipe.cook_time_minutes}m</Badge>
                            <Badge colorScheme="blue" variant="subtle">Yield: {recipe.servings} servings</Badge>
                        </HStack>
                        <HStack gap={2}>
                            {(recipe.tags || []).map((tag) => (
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