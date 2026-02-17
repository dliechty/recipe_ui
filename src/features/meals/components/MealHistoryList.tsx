import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Spinner, Center, Text, VStack, Badge, Table } from '@chakra-ui/react';
import { useInfiniteMeals } from '../../../hooks/useMeals';
import { useInfiniteRecipes } from '../../../hooks/useRecipes';
import { useAuth } from '../../../context/AuthContext';
import { MealStatus } from '../../../client';
import { UserDisplay } from '../../../components/common/UserDisplay';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { parseLocalDate } from '../../../utils/formatters';

const MealHistoryList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const filters = useMemo(() => ({
        status: [MealStatus.COOKED, MealStatus.CANCELLED],
        owner: user?.id ? [user.id] : [],
        sort: '-updated_at',
    }), [user?.id]);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteMeals(20, filters);

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

    const meals = useMemo(() => data?.pages.flatMap((page) => page.meals) || [], [data]);

    // Collect recipe IDs
    const recipeIds = useMemo(() => {
        const ids = new Set<string>();
        meals.forEach(meal => {
            meal.items?.forEach(item => {
                if (item.recipe_id) ids.add(item.recipe_id);
            });
        });
        return Array.from(ids);
    }, [meals]);

    const { data: recipesData } = useInfiniteRecipes(
        recipeIds.length || 1,
        { ids: recipeIds },
        { enabled: recipeIds.length > 0 }
    );

    const recipeMap = useMemo(() => {
        const map = new Map<string, string>();
        recipesData?.pages.flatMap(p => p.recipes).forEach(r => {
            map.set(r.core.id, r.core.name);
        });
        return map;
    }, [recipesData]);

    if (status === 'error') {
        return <ErrorAlert title="Failed to load meal history" description={error?.message || "An unexpected error occurred."} />;
    }

    return (
        <Box>
            <VStack align="stretch" gap={6}>
                <Box flex={1} overflowX="auto" borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface" mb={4}>
                    <Table.Root interactive minW="800px">
                        <Table.Header>
                            <Table.Row bg="bg.surface">
                                <Table.ColumnHeader color="fg.default">Name</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Recipes</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Status</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Classification</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Created By</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Date</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {meals.map((meal) => (
                                <Table.Row
                                    key={meal.id}
                                    onClick={() => navigate(`/meals/${meal.id}`)}
                                    cursor="pointer"
                                    bg="bg.surface"
                                    color="fg.default"
                                    _hover={{ bg: "bg.muted" }}
                                >
                                    <Table.Cell borderColor="border.default" fontWeight="medium">
                                        {meal.name || 'Untitled'}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <VStack align="start" gap={1}>
                                            {meal.items?.length > 0 ? (
                                                meal.items.map((item, idx) => (
                                                    <Text key={`${item.recipe_id}-${idx}`} fontSize="sm">
                                                        {recipeMap.get(item.recipe_id) || 'Loading...'}
                                                    </Text>
                                                ))
                                            ) : (
                                                <Text fontSize="sm" color="fg.muted">-</Text>
                                            )}
                                        </VStack>
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <Badge colorPalette={meal.status === 'Cooked' ? 'green' : 'red'}>
                                            {meal.status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">{meal.classification}</Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <UserDisplay userId={meal.user_id} />
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {meal.scheduled_date ? parseLocalDate(meal.scheduled_date).toLocaleDateString() : 'N/A'}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                            {meals.length === 0 && status === 'success' && (
                                <Table.Row bg="bg.surface">
                                    <Table.Cell colSpan={6} textAlign="center" color="fg.muted" borderColor="border.default">
                                        No meal history yet. Meals will appear here after being cooked or cancelled.
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>

                <Box ref={setSentinel} height="20px" bg="transparent" />

                {(status === 'pending' || isFetchingNextPage) && (
                    <Center p={4}>
                        <Spinner size="lg" color="vscode.accent" />
                    </Center>
                )}

                {!hasNextPage && status === 'success' && meals.length > 0 && (
                    <Center p={4}>
                        <Text color="fg.muted" fontSize="sm">No more history to load</Text>
                    </Center>
                )}
            </VStack>
        </Box>
    );
};

export default MealHistoryList;
