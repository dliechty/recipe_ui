import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Spinner, Center, Container, Button, Icon, Table, VStack, Badge, Text } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useInfiniteMeals } from '../../../hooks/useMeals';
import { useInfiniteRecipes } from '../../../hooks/useRecipes';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { UserDisplay } from '../../../components/common/UserDisplay';
import MealFilters from './MealFilters';
import { mealFiltersToSearchParams, searchParamsToMealFilters } from '../../../utils/mealParams';
import { themeColors } from '../../../utils/styles';

const MealList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Parse filters from URL
    const filters = useMemo(() => {
        const parsed = searchParamsToMealFilters(searchParams);
        // Default sort if not present
        if (!parsed.sort) {
            parsed.sort = '-date';
        }
        return parsed;
    }, [searchParams]);

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

    const handleMealClick = (id: string) => {
        navigate(`/meals/${id}`);
    };

    const handleFilterChange = (newFilters: typeof filters) => {
        setSearchParams(mealFiltersToSearchParams(newFilters));
    };

    const currentSort = filters.sort || '-date';
    const isDesc = currentSort.startsWith('-');
    const sortField = isDesc ? currentSort.slice(1) : currentSort;
    const sortDirection = isDesc ? 'desc' : 'asc';

    const handleSortFieldChange = (newField: string) => {
        const newSort = sortDirection === 'desc' ? `-${newField}` : newField;
        handleFilterChange({ ...filters, sort: newSort });
    };

    const handleSortDirectionChange = (newDirection: string) => {
        const prefix = newDirection === 'desc' ? '-' : '';
        const newSort = `${prefix}${sortField}`;
        handleFilterChange({ ...filters, sort: newSort });
    };

    const meals = React.useMemo(() => data?.pages.flatMap((page) => page.meals) || [], [data]);

    // Collect all recipe IDs to fetch names
    const recipeIds = useMemo(() => {
        const ids = new Set<string>();
        meals.forEach(meal => {
            meal.items?.forEach(item => {
                if (item.recipe_id) ids.add(item.recipe_id);
            });
        });
        return Array.from(ids);
    }, [meals]);

    // Fetch recipes to get names
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
        return (
            <Container maxW="container.xl" py={0} px={0}>
                <ErrorAlert title="Failed to load meals" description={error?.message || "An unexpected error occurred."} />
            </Container>
        );
    }

    return (
        <Box>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
                <Button
                    onClick={() => navigate('/meals/new')}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    size="xs"
                >
                    <Icon as={FaPlus} mr={2} /> Add Meal
                </Button>

                <Box display="flex" gap={4} alignItems="center" flexWrap="wrap">
                    <Box display="flex" gap={2} alignItems="center">
                        <Text fontSize="sm" color="fg.muted" whiteSpace="nowrap">Sort:</Text>
                        <Box minW="130px">
                            <select
                                value={sortField}
                                onChange={(e) => handleSortFieldChange(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "6px",
                                    borderRadius: "4px",
                                    backgroundColor: themeColors.inputBg,
                                    borderColor: themeColors.border,
                                    borderWidth: "1px",
                                    fontSize: "0.875rem",
                                    color: themeColors.text,
                                    outline: "none"
                                }}
                            >
                                <option value="date">Scheduled Date</option>
                                <option value="created_at">Created Date</option>
                                <option value="name">Name</option>
                            </select>
                        </Box>
                    </Box>
                    <Box minW="110px">
                        <select
                            value={sortDirection}
                            onChange={(e) => handleSortDirectionChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "6px",
                                borderRadius: "4px",
                                backgroundColor: themeColors.inputBg,
                                borderColor: themeColors.border,
                                borderWidth: "1px",
                                fontSize: "0.875rem",
                                color: themeColors.text,
                                outline: "none"
                            }}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </Box>
                </Box>
            </Box>

            <Box mb={6}>
                <MealFilters filters={filters} onFilterChange={handleFilterChange} />
            </Box>

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
                                        <Badge colorPalette={meal.status === 'Cooked' ? 'green' : meal.status === 'Cancelled' ? 'red' : 'gray'}>
                                            {meal.status}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">{meal.classification}</Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <UserDisplay userId={meal.user_id} />
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {meal.scheduled_date ? new Date(meal.scheduled_date).toLocaleDateString() : 'N/A'}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                            {meals.length === 0 && status === 'success' && (
                                <Table.Row bg="bg.surface">
                                    <Table.Cell colSpan={6} textAlign="center" color="fg.muted" borderColor="border.default">
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

                {!hasNextPage && status === 'success' && meals.length > 0 && (
                    <Center p={4}>
                        <Text color="fg.muted" fontSize="sm">No more meals to load</Text>
                    </Center>
                )}
            </VStack>
        </Box>
    );
};

export default MealList;
