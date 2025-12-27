import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    Spinner,
    Center,
    VStack,
    HStack,
    Badge,
    Button,
    List,
    ListItem,
    Icon,
    Grid,
    GridItem,
    Spacer,
    Link
} from '@chakra-ui/react';
import { FaCheckCircle, FaEdit } from 'react-icons/fa';
import { useRecipe } from '../../../hooks/useRecipes';
import ErrorAlert from '../../../components/common/ErrorAlert';

const RecipeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: recipe, isLoading: loading, error } = useRecipe(id || '');

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <ErrorAlert title="Failed to load recipe" description={error.message || "An unexpected error occurred."} />
                <Button mt={4} onClick={() => navigate('/recipes')}>Back to Recipes</Button>
            </Container>
        );
    }

    if (loading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    if (!recipe) {
        return (
            <Container maxW="container.md" py={8}>
                <Text>Recipe not found.</Text>
                <Button
                    mt={4}
                    onClick={() => navigate('/recipes')}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                >
                    Back to Recipes
                </Button>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <HStack mb={6} className="no-print">
                <Spacer />
                <Button
                    onClick={() => navigate(`/recipes/${id}/edit`)}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                >
                    <Icon as={FaEdit} /> Edit Recipe
                </Button>
            </HStack>

            <Box bg="bg.surface" p={8} borderRadius="lg" boxShadow="md" borderWidth={1} borderColor="border.default" className="no-print-border">
                <Heading mb={2} color="fg.default">{recipe.core.name}</Heading>
                {recipe.core.description_short && (
                    <Text color="fg.muted" mb={4} fontStyle="italic">
                        {recipe.core.description_short}
                    </Text>
                )}

                {recipe.core.source && (
                    <Text color="fg.muted" mb={4} fontSize="sm">
                        Source: {recipe.core.source_url ? (
                            <Link href={recipe.core.source_url} target="_blank" rel="noopener noreferrer" color="blue.500" textDecoration="underline">
                                {recipe.core.source}
                            </Link>
                        ) : (
                            recipe.core.source
                        )}
                    </Text>
                )}

                <HStack gap={2} mb={6}>
                    {recipe.core.cuisine && <Badge colorScheme="purple">{recipe.core.cuisine}</Badge>}
                    {recipe.core.difficulty && (
                        <Badge colorScheme={recipe.core.difficulty === 'Easy' ? 'green' : recipe.core.difficulty === 'Medium' ? 'yellow' : 'red'}>
                            {recipe.core.difficulty}
                        </Badge>
                    )}
                </HStack>

                <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={8}>
                    <GridItem>
                        <VStack align="start" gap={4} mb={8}>
                            <Box>
                                <Grid templateColumns="auto 1fr" gap={2} rowGap={1}>
                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm">Total Time:</Text>
                                    <Text fontSize="sm">{recipe.times.total_time_minutes} min</Text>

                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm" pl={2}>Prep Time:</Text>
                                    <Text fontSize="sm">{recipe.times.prep_time_minutes} min</Text>

                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm" pl={2}>Active Time:</Text>
                                    <Text fontSize="sm">{recipe.times.active_time_minutes} min</Text>

                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm" pl={2}>Cooking Time:</Text>
                                    <Text fontSize="sm">{recipe.times.cook_time_minutes} min</Text>

                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm" mt={4}>Yield:</Text>
                                    <Text fontSize="sm" mt={4}>{recipe.core.yield_amount} {recipe.core.yield_unit}</Text>
                                </Grid>
                            </Box>
                        </VStack>
                    </GridItem>
                    <GridItem>
                        <Text color="fg.muted" mb={6}>{recipe.core.description_long || recipe.core.description_short}</Text>
                    </GridItem>
                </Grid>

                <Box as="hr" borderColor="border.default" mb={6} />

                <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={8}>
                    <GridItem>
                        <Heading size="md" mb={4} fontWeight="bold" color="fg.default">INGREDIENTS</Heading>
                        <VStack align="stretch" gap={4}>
                            {recipe.components.map((component, cIndex) => (
                                <Box key={cIndex}>
                                    {component.name && component.name !== 'Main' && (
                                        <Text fontWeight="bold" mb={2} color="fg.default">{component.name}</Text>
                                    )}
                                    <List.Root gap={3} mb={component.name ? 4 : 0}>
                                        {component.ingredients.map((ingredient, index) => (
                                            <List.Item key={index} display="flex" alignItems="center">
                                                <List.Indicator asChild>
                                                    <Icon as={FaCheckCircle} color="vscode.accent" mr={3} />
                                                </List.Indicator>
                                                <Text>
                                                    <Text as="span" fontWeight="bold">{ingredient.quantity} {ingredient.unit}</Text> {ingredient.item}
                                                </Text>
                                            </List.Item>
                                        ))}
                                    </List.Root>
                                </Box>
                            ))}
                        </VStack>
                    </GridItem>

                    <GridItem>
                        <Heading size="md" mb={4} fontWeight="bold" color="fg.default">INSTRUCTIONS</Heading>
                        <VStack align="stretch" gap={4}>
                            {(recipe.instructions || []).map((step) => (
                                <Box key={step.step_number} p={4} _light={{ bg: "gray.50" }} _dark={{ bg: 'vscode.inputBg', borderWidth: 1, borderColor: 'vscode.border' }} borderRadius="md">
                                    <Text fontWeight="bold" mb={1} color="vscode.accent">Step {step.step_number}</Text>
                                    <Text>{step.text}</Text>
                                </Box>
                            ))}
                        </VStack>
                    </GridItem>
                </Grid>
            </Box>
        </Container>
    );
};

export default RecipeDetails;
