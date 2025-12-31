import React, { useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Spinner, Center, Container, HStack, Badge, Button, Spacer, Icon, Table, Text } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useInfiniteRecipes } from '../../../hooks/useRecipes';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { formatDuration } from '../../../utils/formatters';

const RecipeList = () => {
    const navigate = useNavigate();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteRecipes(20); // Load 20 recipes per page

    const observer = useRef<IntersectionObserver | null>(null);
    const lastRecipeElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        }, {
            root: null, // Explicitly observe against viewport
            rootMargin: '400px', // Trigger 400px before reaching element (very aggressive)
            threshold: 0 // Trigger as soon as any part is about to be visible
        });
        if (node) {
            observer.current.observe(node);
        }
    }, [isFetchingNextPage, fetchNextPage, hasNextPage]);



    const handleRecipeClick = (id: string) => {
        navigate(`/recipes/${id}`);
    };

    if (status === 'error') {
        return (
            <Container maxW="container.xl" py={8}>
                <ErrorAlert title="Failed to load recipes" description={error?.message || "An unexpected error occurred."} />
            </Container>
        );
    }

    const recipes = data?.pages.flatMap((page) => page.recipes) || [];

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

            <Box overflowX="auto" borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface" mb={4}>
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
                        {recipes.map((recipe, index) => {
                            const isLastElement = recipes.length === index + 1;
                            return (
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
                                        {(recipe.times.total_time_minutes ?? 0) > 0 ? formatDuration(recipe.times.total_time_minutes) : '-'}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">{recipe.core.yield_amount} {recipe.core.yield_unit}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table.Root>
            </Box>

            {/* Sentinel for IntersectionObserver */}
            <Box ref={lastRecipeElementRef} height="20px" bg="transparent" />

            {(status === 'pending' || isFetchingNextPage) && (
                <Center p={4}>
                    <Spinner size="lg" color="vscode.accent" />
                </Center>
            )}

            {!hasNextPage && status === 'success' && recipes.length > 0 && (
                <Center p={4}>
                    <Text color="fg.muted" fontSize="sm">No more recipes to load</Text>
                </Center>
            )}
        </Container>
    );
};

export default RecipeList;