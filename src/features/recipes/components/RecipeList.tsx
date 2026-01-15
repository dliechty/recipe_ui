import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Spinner, Center, Container, HStack, Badge, Button, Icon, Table, Text, VStack, chakra, Stack } from '@chakra-ui/react';
import { FaPlus, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useInfiniteRecipes, RecipeFilters } from '../../../hooks/useRecipes';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { formatDuration } from '../../../utils/formatters';
import RecipeFiltersDisplay from './RecipeFilters';
import { filtersToSearchParams, searchParamsToFilters } from '../../../utils/recipeParams';

const RecipeList = () => {
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState<RecipeFilters>(() => {
        const fromUrl = searchParamsToFilters(searchParams);
        // If URL is empty (no params), apply default sort
        if (Array.from(searchParams.keys()).length === 0) {
            return { sort: 'name' };
        }
        // If we have params but no sort, we might want to default sort? 
        // Logic before was: if ids, just ids. If no ids, sort=name.
        // Let's preserve that logic: if no sort specified in URL, and we are not filtering by IDs (which usually implies specific order is irrelevant or handled by API?), default to name.
        // Actually, let's just trust the URL. If it's empty, default to name.
        if (!fromUrl.sort) {
            // If we just have filters but no sort, existing behavior was implied default sort by API? 
            // Previous code: if (ids) return { ids }; return { sort: 'name' };
            // So if I have ?category=Dessert, previous code would have ignored it? 
            // Wait, previous code ONLY looked at ids. It completely IGNORED other URL params!
            // So this new feature is enabling deep linking for ALL filters.

            // Ensure 'sort' is set if not present, to match UI state expectations (toggle needs a value)
            // But if we are filtering by IDs, maybe we don't want to enforce sort?
            if (!fromUrl.ids) {
                fromUrl.sort = 'name';
            }
        }
        return fromUrl;
    });

    // Update URL when filters change
    useEffect(() => {
        const params = filtersToSearchParams(filters);
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const [collapsedParents, setCollapsedParents] = useState<Set<string>>(new Set());

    const toggleParent = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedParents(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const currentSort = filters.sort || 'name';
    const isDesc = currentSort.startsWith('-');
    const sortField = isDesc ? currentSort.slice(1) : currentSort;
    const sortDirection = isDesc ? 'desc' : 'asc';

    const handleSortFieldChange = (newField: string) => {
        const newSort = sortDirection === 'desc' ? `-${newField}` : newField;
        setFilters(prev => ({ ...prev, sort: newSort }));
    };

    const handleSortDirectionChange = (newDirection: string) => {
        const prefix = newDirection === 'desc' ? '-' : '';
        const newSort = `${prefix}${sortField}`;
        setFilters(prev => ({ ...prev, sort: newSort }));
    };

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteRecipes(20, filters); // Load 20 recipes per page

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
            rootMargin: '200px', // Trigger earlier
            threshold: 0
        });

        observer.current.observe(sentinel);

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [sentinel, isFetchingNextPage, hasNextPage, fetchNextPage]);



    const handleRecipeClick = (id: string) => {
        navigate(`/recipes/${id}`, {
            state: { fromSearch: searchParams.toString() }
        });
    };

    const recipes = React.useMemo(() => data?.pages.flatMap((page) => page.recipes) || [], [data]);

    const groupedRecipes = React.useMemo(() => {
        const recipesMap = new Map(recipes.map(r => [r.core.id, r]));
        const visited = new Set<string>();
        const grouped: Array<{ recipe: typeof recipes[0], isVariant: boolean, hasVariants: boolean, isExpanded: boolean }> = [];

        // Roots are recipes that either have no parent OR their parent is not in the current list
        const roots = recipes.filter(r => !r.parent_recipe_id || !recipesMap.has(r.parent_recipe_id));

        roots.forEach(root => {
            if (visited.has(root.core.id)) return;
            visited.add(root.core.id);

            // Find variants for this root that are in the current list
            const variants = recipes.filter(r => r.parent_recipe_id === root.core.id);

            // Mark variants as visited so we don't process them again
            variants.forEach(v => visited.add(v.core.id));

            const isExpanded = !collapsedParents.has(root.core.id);

            grouped.push({
                recipe: root,
                isVariant: false,
                hasVariants: variants.length > 0,
                isExpanded
            });

            if (isExpanded) {
                variants.forEach(variant => {
                    grouped.push({
                        recipe: variant,
                        isVariant: true,
                        hasVariants: false,
                        isExpanded: true
                    });
                });
            }
        });

        return grouped;
    }, [recipes, collapsedParents]);

    if (status === 'error') {
        return (
            <Container maxW="container.xl" py={8}>
                <ErrorAlert title="Failed to load recipes" description={error?.message || "An unexpected error occurred."} />
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={8} gap={4}>
                <Button
                    onClick={() => navigate('/recipes/new')}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    alignSelf="flex-start"
                    size="xs"
                >
                    <Icon as={FaPlus} /> Add Recipe
                </Button>
                <Stack
                    direction="row"
                    gap={4}
                    align="center"
                >
                    <HStack gap={2}>
                        <Text fontSize="sm" color="fg.muted" whiteSpace="nowrap">Sort:</Text>
                        <Box minW="130px">
                            <chakra.select
                                value={sortField}
                                onChange={(e) => handleSortFieldChange((e.target as HTMLSelectElement).value)}
                                width="100%"
                                padding="6px"
                                borderRadius="4px"
                                bg="#3c3c3c"
                                borderColor="#454545"
                                borderWidth="1px"
                                fontSize="0.875rem"
                                color="#d4d4d4"
                                _hover={{ borderColor: '#007acc' }}
                                _focus={{ borderColor: '#007acc', boxShadow: '0 0 0 1px #007acc', outline: 'none' }}
                            >
                                <option value="name">Name</option>
                                <option value="category">Category</option>
                                <option value="cuisine">Cuisine</option>
                                <option value="difficulty">Difficulty</option>
                                <option value="total_time_minutes">Total Time</option>
                                <option value="yield_amount">Yield</option>
                            </chakra.select>
                        </Box>
                    </HStack>
                    <HStack gap={2}>
                        <Box minW="110px">
                            <chakra.select
                                value={sortDirection}
                                onChange={(e) => handleSortDirectionChange((e.target as HTMLSelectElement).value)}
                                width="100%"
                                padding="6px"
                                borderRadius="4px"
                                bg="#3c3c3c"
                                borderColor="#454545"
                                borderWidth="1px"
                                fontSize="0.875rem"
                                color="#d4d4d4"
                                _hover={{ borderColor: '#007acc' }}
                                _focus={{ borderColor: '#007acc', boxShadow: '0 0 0 1px #007acc', outline: 'none' }}
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </chakra.select>
                        </Box>
                    </HStack>
                </Stack>
            </Stack >

            <VStack align="stretch" gap={6}>
                <Box w="full">
                    <RecipeFiltersDisplay filters={filters} onFilterChange={setFilters} />
                </Box>



                <Box flex={1} overflowX="auto" borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface" mb={4}>
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
                            {groupedRecipes.map(({ recipe, isVariant, hasVariants, isExpanded }) => (
                                <Table.Row
                                    key={recipe.core.id}
                                    onClick={() => handleRecipeClick(recipe.core.id)}
                                    cursor="pointer"
                                    bg="bg.surface"
                                    color="fg.default"
                                    _hover={{ bg: "bg.muted" }}
                                >
                                    <Table.Cell borderColor="border.default" fontWeight="medium" style={{ paddingLeft: isVariant ? '2rem' : 0 }}>
                                        <HStack gap={2}>
                                            {hasVariants && (
                                                <Box
                                                    as="span"
                                                    onClick={(e) => toggleParent(recipe.core.id, e)}
                                                    cursor="pointer"
                                                    display="inline-flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    w="20px"
                                                    h="20px"
                                                    aria-label={isExpanded ? "Collapse" : "Expand"}
                                                    role="button"
                                                >
                                                    <Icon as={isExpanded ? FaChevronDown : FaChevronRight} boxSize={3} />
                                                </Box>
                                            )}
                                            {/* Align text for root recipes without variants to match those with the chevron */}
                                            {!hasVariants && !isVariant && <Box w="20px" />}
                                            {!hasVariants && isVariant && <Box w="5px" />} {/* Spacer for alignment */}
                                            <Text>{recipe.core.name}</Text>
                                        </HStack>
                                    </Table.Cell>
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
                            ))}
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

                {!hasNextPage && status === 'success' && recipes.length > 0 && (
                    <Center p={4}>
                        <Text color="fg.muted" fontSize="sm">No more recipes to load</Text>
                    </Center>
                )}
            </VStack>
        </Container >
    );
};

export default RecipeList;