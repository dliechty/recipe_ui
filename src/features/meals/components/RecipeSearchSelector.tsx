import { useState, useRef, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Badge,
    Icon,
    Spinner,
    Center,
    Button,
    Grid
} from '@chakra-ui/react';
import { FaTimes, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { useInfiniteRecipes, RecipeFilters } from '../../../hooks/useRecipes';
import { useRecipeMeta } from '../../recipes/hooks/useRecipeMeta';
import RecipeMultiSelect from '../../recipes/components/RecipeMultiSelect';
import DebouncedInput from '../../../components/common/DebouncedInput';
import { formatDuration } from '../../../utils/formatters';
import { Recipe } from '../../../client';

interface RecipeSearchSelectorProps {
    selectedRecipeIds: string[];
    onChange: (recipeIds: string[]) => void;
}

const RecipeSearchSelector = ({ selectedRecipeIds, onChange }: RecipeSearchSelectorProps) => {
    // Local filters state
    const [filters, setFilters] = useState<RecipeFilters>({ sort: 'name' });

    // Metadata for filters
    const { data: categories } = useRecipeMeta('category');
    const { data: cuisines } = useRecipeMeta('cuisine');
    const { data: difficulties } = useRecipeMeta('difficulty');

    // Fetch recipes for search results
    const {
        data: searchData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending: isSearchPending
    } = useInfiniteRecipes(20, filters);

    // Fetch selected recipes details to display chips
    // Only fetch if we have IDs
    const {
        data: selectedData,
    } = useInfiniteRecipes(selectedRecipeIds.length || 1, { ids: selectedRecipeIds }, {
        enabled: selectedRecipeIds.length > 0
    });

    // Flatten selected recipes
    const selectedRecipes = selectedData?.pages.flatMap(p => p.recipes) || [];

    // Create a map for quick lookup of names
    const selectedRecipesMap = new Map(selectedRecipes.map(r => [r.core.id, r]));

    // Search results
    const searchResults = searchData?.pages.flatMap(p => p.recipes) || [];

    // Infinite scroll observer
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

    const handleToggleRecipe = (id: string) => {
        if (selectedRecipeIds.includes(id)) {
            onChange(selectedRecipeIds.filter(rid => rid !== id));
        } else {
            onChange([...selectedRecipeIds, id]);
        }
    };

    const handleRemoveSelected = (id: string) => {
        onChange(selectedRecipeIds.filter(rid => rid !== id));
    };

    const handleFilterChange = (key: keyof RecipeFilters, value: unknown) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ sort: 'name' });
    };

    const hasActiveFilters = Object.keys(filters).some(k => k !== 'sort' && !!filters[k as keyof RecipeFilters]);

    const inputStyles = {
        bg: "vscode.inputBg",
        borderColor: "border.default",
        color: "fg.default",
        _hover: { borderColor: 'vscode.accent' },
        _focus: { borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }
    };

    return (
        <VStack align="stretch" gap={4}>
            {/* Selected Recipes Chips */}
            {selectedRecipeIds.length > 0 && (
                <Box p={4} borderWidth={1} borderColor="border.default" borderRadius="md" bg="bg.surface">
                    <Text fontSize="xs" fontWeight="bold" mb={2} color="fg.muted">
                        Selected Recipes ({selectedRecipeIds.length})
                    </Text>
                    <HStack wrap="wrap" gap={2}>
                        {selectedRecipeIds.map(id => {
                            const recipe = selectedRecipesMap.get(id);
                            return (
                                <Badge
                                    key={id}
                                    variant="solid"
                                    colorPalette="blue"
                                    display="flex"
                                    alignItems="center"
                                    py={1}
                                    px={2}
                                    borderRadius="full"
                                >
                                    <Text mr={2} maxW="200px" truncate>
                                        {recipe ? recipe.core.name : 'Loading...'}
                                    </Text>
                                    <Box
                                        as="button"
                                        onClick={() => handleRemoveSelected(id)}
                                        display="inline-flex"
                                        alignItems="center"
                                        _hover={{ color: "red.200" }}
                                        cursor="pointer"
                                    >
                                        <Icon as={FaTimes} />
                                    </Box>
                                </Badge>
                            );
                        })}
                    </HStack>
                </Box>
            )}

            {/* Search & Filters */}
            <Box p={4} borderWidth={1} borderColor="border.default" borderRadius="md" bg="bg.surface">
                <VStack align="stretch" gap={3}>
                    <DebouncedInput
                        placeholder="Search recipes..."
                        value={filters.name || ''}
                        onChange={(val) => handleFilterChange('name', val)}
                        {...inputStyles}
                    />

                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                        <RecipeMultiSelect
                            label="Category"
                            placeholder="Categories"
                            options={(categories || []).map(c => ({ label: c, value: c }))}
                            value={filters.category || []}
                            onChange={(val) => handleFilterChange('category', val.length ? val : undefined)}
                        />
                        <RecipeMultiSelect
                            label="Cuisine"
                            placeholder="Cuisines"
                            options={(cuisines || []).map(c => ({ label: c, value: c }))}
                            value={filters.cuisine || []}
                            onChange={(val) => handleFilterChange('cuisine', val.length ? val : undefined)}
                        />
                        <RecipeMultiSelect
                            label="Difficulty"
                            placeholder="Difficulties"
                            options={(difficulties || []).map(c => ({ label: c, value: c }))}
                            value={filters.difficulty || []}
                            onChange={(val) => handleFilterChange('difficulty', val.length ? val : undefined)}
                        />
                    </Grid>

                    {hasActiveFilters && (
                        <Button
                            size="xs"
                            variant="ghost"
                            alignSelf="flex-start"
                            onClick={clearFilters}
                            color="fg.muted"
                        >
                            Clear Filters
                        </Button>
                    )}
                </VStack>
            </Box>

            {/* Results List */}
            <Box
                borderWidth={1}
                borderColor="border.default"
                borderRadius="md"
                bg="bg.surface"
                maxHeight="500px"
                overflowY="auto"
            >
                {isSearchPending && !searchResults.length ? (
                    <Center p={8}>
                        <Spinner color="vscode.accent" />
                    </Center>
                ) : (
                    <VStack align="stretch" gap={0}>
                        {searchResults.length === 0 ? (
                            <Center p={8} color="fg.muted">
                                No recipes found matching your search.
                            </Center>
                        ) : (
                            searchResults.map((recipe: Recipe) => {
                                const isSelected = selectedRecipeIds.includes(recipe.core.id);
                                return (
                                    <Box
                                        key={recipe.core.id}
                                        borderBottomWidth={1}
                                        borderColor="border.default"
                                        _last={{ borderBottomWidth: 0 }}
                                    >
                                        <HStack
                                            p={3}
                                            _hover={{ bg: "bg.muted" }}
                                            cursor="pointer"
                                            onClick={() => handleToggleRecipe(recipe.core.id)}
                                            justify="space-between"
                                        >
                                            <HStack gap={3}>
                                                <Icon
                                                    as={isSelected ? FaCheckSquare : FaRegSquare}
                                                    color={isSelected ? "vscode.accent" : "fg.muted"}
                                                    boxSize={5}
                                                />
                                                <VStack align="start" gap={0}>
                                                    <Text fontWeight="medium" color="fg.default">{recipe.core.name}</Text>
                                                    <HStack gap={2} mt={1}>
                                                        {recipe.core.category && <Badge size="sm" colorPalette="orange">{recipe.core.category}</Badge>}
                                                        {recipe.core.difficulty && (
                                                            <Badge size="sm" colorPalette={recipe.core.difficulty === 'Easy' ? 'green' : recipe.core.difficulty === 'Medium' ? 'yellow' : 'red'}>
                                                                {recipe.core.difficulty}
                                                            </Badge>
                                                        )}
                                                        {(recipe.times.total_time_minutes ?? 0) > 0 && (
                                                            <Text fontSize="xs" color="fg.muted">
                                                                {formatDuration(recipe.times.total_time_minutes)}
                                                            </Text>
                                                        )}
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                        </HStack>
                                    </Box>
                                );
                            })
                        )}
                        <Box ref={setSentinel} h="20px" />
                        {isFetchingNextPage && (
                            <Center p={2}>
                                <Spinner size="sm" color="vscode.accent" />
                            </Center>
                        )}
                    </VStack>
                )}
            </Box>

        </VStack>
    );
};

export default RecipeSearchSelector;
