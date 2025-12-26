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
    GridItem
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { RecipesService } from '../client';
import { useAuth } from '../context/AuthContext';

const RecipeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await RecipesService.readRecipeRecipesRecipeIdGet(Number(id));
                setRecipe(response);
            } catch (error) {
                console.error("Failed to fetch recipe:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token && id) {
            fetchRecipe();
        }
    }, [token, id]);

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
                <Button mt={4} onClick={() => navigate('/recipes')}>Back to Recipes</Button>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <Button mb={6} onClick={() => navigate('/recipes')} variant="ghost">
                &larr; Back to Recipes
            </Button>

            <Box bg="bg.surface" p={8} borderRadius="lg" boxShadow="md" borderWidth={1} borderColor="border.default">
                <Heading mb={2} color="fg.default">{recipe.name}</Heading>

                <HStack spacing={2} mb={6}>
                    {recipe.tags.map((tag) => (
                        <Badge key={tag.id} colorScheme="purple">{tag.name}</Badge>
                    ))}
                </HStack>

                <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={8}>
                    <GridItem>
                        <VStack align="start" spacing={4} mb={8}>
                            <Box>
                                <Grid templateColumns="auto 1fr" gap={2} rowGap={1}>
                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm">Total Time:</Text>
                                    <Text fontSize="sm">{recipe.prep_time_minutes + recipe.cook_time_minutes} min</Text>

                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm" pl={2}>Active Time:</Text>
                                    <Text fontSize="sm">{recipe.prep_time_minutes} min</Text>

                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm" pl={2}>Cooking Time:</Text>
                                    <Text fontSize="sm">{recipe.cook_time_minutes} min</Text>

                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm" mt={4}>Yield:</Text>
                                    <Text fontSize="sm" mt={4}>{recipe.servings} servings</Text>
                                </Grid>
                            </Box>
                        </VStack>
                    </GridItem>
                    <GridItem>
                        <Text color="fg.muted" mb={6}>{recipe.description}</Text>
                    </GridItem>
                </Grid>

                <Box as="hr" borderColor="border.default" mb={6} />

                <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={8}>
                    <GridItem>
                        <Heading size="md" mb={4} fontWeight="bold" color="fg.default">INGREDIENTS</Heading>
                        <List.Root spacing={3} mb={8} pt={4}>
                            {recipe.ingredients.map((ingredient, index) => (
                                <ListItem key={index} display="flex" alignItems="center">
                                    <Icon as={FaCheckCircle} color="vscode.accent" mr={3} />
                                    <Text>
                                        <Text as="span" fontWeight="bold">{ingredient.amount} {ingredient.unit}</Text> {ingredient.name}
                                    </Text>
                                </ListItem>
                            ))}
                        </List.Root>
                    </GridItem>

                    <GridItem>
                        <Heading size="md" mb={4} fontWeight="bold" color="fg.default">INSTRUCTIONS</Heading>
                        <VStack align="stretch" spacing={4}>
                            {recipe.instructions.map((step) => (
                                <Box key={step.step_number} p={4} _light={{ bg: "gray.50" }} _dark={{ bg: 'vscode.inputBg', borderWidth: 1, borderColor: 'vscode.border' }} borderRadius="md">
                                    <Text fontWeight="bold" mb={1} color="vscode.accent">Step {step.step_number}</Text>
                                    <Text>{step.description}</Text>
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
