import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Spinner, Center, Container, HStack, Badge, Button, Spacer, Icon, Table } from '@chakra-ui/react';
import { FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRecipes } from '../../../hooks/useRecipes';
import ErrorAlert from '../../../components/common/ErrorAlert';

const RecipeList = () => {
    const navigate = useNavigate();
    const { data: recipes = [], isLoading: loading, error } = useRecipes();

    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(50);

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

    const totalPages = Math.ceil(recipes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRecipes = recipes.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

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
            <HStack justify="space-between" width="full" mb={4}>
                <HStack>
                    <Box as="span" color="fg.default" fontSize="sm">Rows per page:</Box>
                    <Box position="relative">
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid var(--chakra-colors-border-default)",
                                backgroundColor: "var(--chakra-colors-bg-surface)",
                                color: "var(--chakra-colors-fg-default)"
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </Box>
                </HStack>

                <HStack>
                    <Box as="span" color="fg.default" fontSize="sm" mr={2}>
                        Page {currentPage} of {Math.max(1, totalPages)}
                    </Box>
                    <HStack gap={1}>
                        <Button
                            size="sm"
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                            aria-label="Previous Page"
                        >
                            <Icon as={FaChevronLeft} />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                            aria-label="Next Page"
                        >
                            <Icon as={FaChevronRight} />
                        </Button>
                    </HStack>
                </HStack>
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
                        {currentRecipes.map((recipe) => (
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