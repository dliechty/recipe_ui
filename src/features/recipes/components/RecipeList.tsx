import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Spinner, Center, Container, HStack, Badge, Button, Spacer, Icon, Table } from '@chakra-ui/react';
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
            <Box overflowX="auto" borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface">
                <Table.Root interactive minW="800px">
                    <Table.Header>
                        <Table.Row bg="bg.surface">
                            <Table.ColumnHeader color="fg.default">Name</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">Category</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">Cuisine</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">Difficulty</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">Total Time</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">Yield</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {recipes.map((recipe) => (
                            <Table.Row
                                key={recipe.core.id}
                                onClick={() => handleRecipeClick(recipe.core.id)}
                                cursor="pointer"
                                bg="bg.surface"
                                color="fg.default"
                                _hover={{ bg: "bg.muted" }}
                            >
                                <Table.Cell borderColor="border.default" fontWeight="medium">{recipe.core.name}</Table.Cell>
                                <Table.Cell borderColor="border.default">{recipe.core.category || '-'}</Table.Cell>
                                <Table.Cell borderColor="border.default">{recipe.core.cuisine || '-'}</Table.Cell>
                                <Table.Cell borderColor="border.default">
                                    {recipe.core.difficulty && (
                                        <Badge colorPalette={recipe.core.difficulty === 'Easy' ? 'green' : recipe.core.difficulty === 'Medium' ? 'yellow' : 'red'}>
                                            {recipe.core.difficulty}
                                        </Badge>
                                    )}
                                </Table.Cell>
                                <Table.Cell borderColor="border.default">
                                    {(recipe.times.total_time_minutes ?? 0) > 0 ? `${recipe.times.total_time_minutes}m` : '-'}
                                </Table.Cell>
                                <Table.Cell borderColor="border.default">{recipe.core.yield_amount} {recipe.core.yield_unit}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>
        </Container>
    );
};

export default RecipeList;