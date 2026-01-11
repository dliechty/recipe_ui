import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Spinner, Center, Container, Button, Icon, Table, VStack, Badge } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useInfiniteMeals } from '../../../hooks/useMeals';
import ErrorAlert from '../../../components/common/ErrorAlert';

const MealList = () => {
    const navigate = useNavigate();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteMeals(20);

    const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (!sentinel) return;
        if (isFetchingNextPage || !hasNextPage) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        }, {
            root: null,
            rootMargin: '200px',
            threshold: 0
        });

        observer.current.observe(sentinel);

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [sentinel, isFetchingNextPage, hasNextPage, fetchNextPage]);

    const handleMealClick = (id: string) => {
        navigate(`/meals/${id}`);
    };

    if (status === 'error') {
        return (
            <Container maxW="container.xl" py={0} px={0}>
                <ErrorAlert title="Failed to load meals" description={error?.message || "An unexpected error occurred."} />
            </Container>
        );
    }

    const meals = data?.pages.flatMap((page) => page.meals) || [];

    return (
        <Container maxW="container.xl" py={0} px={0}>
            <Box mb={4}>
                <Button
                    onClick={() => navigate('/meals/new')}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    alignSelf="flex-start"
                    size="xs"
                >
                    <Icon as={FaPlus} mr={2} /> Add Meal
                </Button>
            </Box>

            <VStack align="stretch" gap={6}>
                <Box flex={1} overflowX="auto" borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface" mb={4}>
                    <Table.Root interactive minW="800px">
                        <Table.Header>
                            <Table.Row bg="bg.surface">
                                <Table.ColumnHeader color="fg.default">Name</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Status</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Classification</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Recipes</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Created At</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {meals.map((meal) => (
                                <Table.Row
                                    key={meal.id}
                                    onClick={() => handleMealClick(meal.id)}
                                    cursor="pointer"
                                    bg="bg.surface"
                                    color="fg.default"
                                    _hover={{ bg: "bg.muted" }}
                                >
                                    <Table.Cell borderColor="border.default" fontWeight="medium">
                                        {meal.name || 'Untitled'}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <Badge colorPalette={meal.status === 'Cooked' ? 'green' : meal.status === 'Scheduled' ? 'blue' : 'gray'}>
                                            {meal.status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">{meal.classification}</Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {/* Use items length since the model uses 'items' array of MealItem */}
                                        {meal.items?.length || 0} recipes
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {new Date(meal.created_at).toLocaleDateString()}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                            {meals.length === 0 && status === 'success' && (
                                <Table.Row bg="bg.surface">
                                    <Table.Cell colSpan={4} textAlign="center" color="fg.muted" borderColor="border.default">
                                        No meals found. Create one to get started!
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>

                {/* Sentinel for IntersectionObserver */}
                <Box ref={setSentinel} height="20px" bg="transparent" />

                {(status === 'pending' || isFetchingNextPage) && (
                    <Center p={4}>
                        <Spinner size="lg" color="vscode.accent" />
                    </Center>
                )}
            </VStack>
        </Container>
    );
};

export default MealList;
