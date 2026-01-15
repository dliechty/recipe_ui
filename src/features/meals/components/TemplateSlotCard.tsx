import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    HStack,
    VStack,
    Text,
    Badge,
    Icon,
    Spinner,
    Grid
} from '@chakra-ui/react';
import { FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaSearch, FaListUl, FaLink } from 'react-icons/fa';
import { MealTemplateSlot, MealTemplateSlotStrategy } from '../../../client';
import { useRecipe, useInfiniteRecipes, RecipeFilters } from '../../../hooks/useRecipes';
import { formatDuration, formatDietName } from '../../../utils/formatters';

interface TemplateSlotCardProps {
    slot: MealTemplateSlot;
    slotNumber: number;
    templateName: string;
    isExpanded: boolean;
    onToggle: () => void;
}

// Helper to convert search criteria to RecipeFilters
const searchCriteriaToFilters = (criteria: MealTemplateSlot['search_criteria']): RecipeFilters => {
    const filters: RecipeFilters = {};
    if (!criteria) return filters;

    for (const criterion of criteria) {
        const { field, operator, value } = criterion;

        if (field === 'cuisine') {
            if (operator === 'eq') filters.cuisine = [String(value)];
            else if (operator === 'in') filters.cuisine = String(value).split(',');
        } else if (field === 'category') {
            if (operator === 'eq') filters.category = [String(value)];
            else if (operator === 'in') filters.category = String(value).split(',');
        } else if (field === 'difficulty') {
            if (operator === 'eq') filters.difficulty = [String(value)];
            else if (operator === 'in') filters.difficulty = String(value).split(',');
        } else if (field === 'protein') {
            if (operator === 'eq') filters.protein = [String(value)];
            else if (operator === 'in') filters.protein = String(value).split(',');
        } else if (field === 'suitable_for_diet') {
            if (operator === 'eq') filters.suitable_for_diet = [String(value)];
            else if (operator === 'in') filters.suitable_for_diet = String(value).split(',');
        }
    }

    return filters;
};

// Format search criteria for display
const formatCriterion = (criterion: { field: string; operator: string; value: string | number }) => {
    const { field, operator, value } = criterion;
    const fieldDisplay = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');

    if (operator === 'eq') return `${fieldDisplay} = "${value}"`;
    if (operator === 'in') return `${fieldDisplay} in [${String(value).split(',').join(', ')}]`;
    if (operator === 'gt') return `${fieldDisplay} > ${value}`;
    if (operator === 'lt') return `${fieldDisplay} < ${value}`;
    return `${fieldDisplay} ${operator} ${value}`;
};

// Strategy icon and color mapping
const strategyConfig = {
    [MealTemplateSlotStrategy.DIRECT]: { icon: FaLink, color: 'blue', label: 'Direct' },
    [MealTemplateSlotStrategy.LIST]: { icon: FaListUl, color: 'purple', label: 'List' },
    [MealTemplateSlotStrategy.SEARCH]: { icon: FaSearch, color: 'orange', label: 'Search' },
};

// Sub-component for Direct strategy slot
const DirectSlotContent = ({ slot, templateName, isExpanded }: { slot: MealTemplateSlot; templateName: string; isExpanded: boolean }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: recipe, isLoading } = useRecipe(slot.recipe_id || '');

    const handleViewRecipe = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (recipe) {
            navigate(`/recipes/${recipe.core.id}`, {
                state: {
                    breadcrumbs: [
                        { label: 'Templates', url: '/meals/templates' },
                        { label: templateName, url: location.pathname + location.search }
                    ]
                }
            });
        }
    };

    if (isLoading) {
        return <Spinner size="sm" color="vscode.accent" />;
    }

    if (!recipe) {
        return <Text fontSize="sm" color="fg.muted">Recipe not found</Text>;
    }

    return (
        <Box
            p={3}
            borderWidth={1}
            borderColor="border.default"
            borderRadius="md"
            bg="bg.canvas"
            _hover={{ bg: 'vscode.inputBg', cursor: 'pointer' }}
            onClick={handleViewRecipe}
            transition="background-color 0.2s"
        >
            <VStack align="stretch" gap={2}>
                <HStack justify="space-between" align="center">
                    <VStack align="start" gap={1}>
                        <Text fontWeight="medium" color="fg.default">{recipe.core.name}</Text>
                        <HStack gap={2} wrap="wrap">
                            {recipe.core.category && <Badge colorPalette="orange" size="sm">{recipe.core.category}</Badge>}
                            {recipe.core.cuisine && <Badge colorPalette="purple" size="sm">{recipe.core.cuisine}</Badge>}
                            {recipe.core.difficulty && (
                                <Badge
                                    colorPalette={recipe.core.difficulty === 'Easy' ? 'green' : recipe.core.difficulty === 'Medium' ? 'yellow' : 'red'}
                                    size="sm"
                                >
                                    {recipe.core.difficulty}
                                </Badge>
                            )}
                            {recipe.core.protein && <Badge colorPalette="blue" size="sm">{recipe.core.protein}</Badge>}
                        </HStack>
                    </VStack>
                    <Icon as={FaExternalLinkAlt} color="fg.muted" boxSize={3} />
                </HStack>

                {/* Expanded view - more metadata */}
                {isExpanded && (
                    <Box pt={2} borderTopWidth={1} borderColor="border.default">
                         <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                            <VStack align="start" gap={2}>
                                {recipe.core.description && (
                                    <Text fontSize="sm" color="fg.muted" lineClamp={3}>{recipe.core.description}</Text>
                                )}
                                <VStack align="start" gap={1}>
                                     {(recipe.times.total_time_minutes ?? 0) > 0 && (
                                         <HStack>
                                            <Text fontSize="xs" fontWeight="bold" color="fg.muted">Total Time:</Text>
                                            <Text fontSize="xs" color="fg.default">{formatDuration(recipe.times.total_time_minutes)}</Text>
                                         </HStack>
                                     )}
                                     {(recipe.times.prep_time_minutes ?? 0) > 0 && (
                                         <HStack>
                                            <Text fontSize="xs" fontWeight="bold" color="fg.muted">Prep:</Text>
                                            <Text fontSize="xs" color="fg.default">{formatDuration(recipe.times.prep_time_minutes)}</Text>
                                         </HStack>
                                     )}
                                     {(recipe.times.cook_time_minutes ?? 0) > 0 && (
                                         <HStack>
                                            <Text fontSize="xs" fontWeight="bold" color="fg.muted">Cook:</Text>
                                            <Text fontSize="xs" color="fg.default">{formatDuration(recipe.times.cook_time_minutes)}</Text>
                                         </HStack>
                                     )}
                                </VStack>
                            </VStack>
                            <VStack align="start" gap={2}>
                                {recipe.core.yield_amount && (
                                    <HStack>
                                        <Text fontSize="xs" fontWeight="bold" color="fg.muted">Yields:</Text>
                                        <Text fontSize="xs" color="fg.default">{recipe.core.yield_amount} {recipe.core.yield_unit}</Text>
                                    </HStack>
                                )}
                                <Box>
                                    <Text fontSize="xs" fontWeight="bold" color="fg.muted" mb={1}>Dietary Info:</Text>
                                    <HStack wrap="wrap" gap={1}>
                                        {recipe.suitable_for_diet?.map(diet => (
                                            <Badge key={diet} colorPalette="teal" size="xs">{formatDietName(diet)}</Badge>
                                        ))}
                                        {(!recipe.suitable_for_diet || recipe.suitable_for_diet.length === 0) && (
                                            <Text fontSize="xs" color="fg.muted" fontStyle="italic">None specified</Text>
                                        )}
                                    </HStack>
                                </Box>
                            </VStack>
                        </Grid>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

// Sub-component for List strategy slot
const ListSlotContent = ({ slot, templateName, isExpanded }: { slot: MealTemplateSlot; templateName: string; isExpanded: boolean }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const recipeIds = slot.recipe_ids || [];

    const { data: recipesData, isLoading } = useInfiniteRecipes(
        recipeIds.length || 1,
        { ids: recipeIds },
        { enabled: recipeIds.length > 0 }
    );
    const recipes = recipesData?.pages.flatMap(p => p.recipes) || [];

    const handleViewRecipe = (e: React.MouseEvent, recipeId: string) => {
        e.stopPropagation();
        navigate(`/recipes/${recipeId}`, {
            state: {
                breadcrumbs: [
                    { label: 'Templates', url: '/meals/templates' },
                    { label: templateName, url: location.pathname + location.search }
                ]
            }
        });
    };

    if (isLoading) {
        return <Spinner size="sm" color="vscode.accent" />;
    }

    return (
        <VStack align="stretch" gap={2}>
            {/* Collapsed view - count */}
            <HStack>
                <Text fontWeight="medium" color="fg.default">
                    {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in list
                </Text>
            </HStack>

            {/* Expanded view - recipe list */}
            {isExpanded && recipes.length > 0 && (
                <Box pt={3} borderTopWidth={1} borderColor="border.default">
                    <VStack align="stretch" gap={2}>
                        {recipes.map((recipe) => (
                            <Box
                                key={recipe.core.id}
                                p={3}
                                borderWidth={1}
                                borderColor="border.default"
                                borderRadius="md"
                                bg="bg.canvas"
                                _hover={{ bg: 'vscode.inputBg', cursor: 'pointer' }}
                                onClick={(e) => handleViewRecipe(e, recipe.core.id)}
                                transition="background-color 0.2s"
                            >
                                <HStack justify="space-between" align="center">
                                    <VStack align="start" gap={1}>
                                        <Text fontWeight="medium" fontSize="sm" color="fg.default">
                                            {recipe.core.name}
                                        </Text>
                                        <HStack gap={2} wrap="wrap">
                                            {recipe.core.category && <Badge colorPalette="orange" size="xs">{recipe.core.category}</Badge>}
                                            {recipe.core.difficulty && (
                                                <Badge
                                                    colorPalette={recipe.core.difficulty === 'Easy' ? 'green' : recipe.core.difficulty === 'Medium' ? 'yellow' : 'red'}
                                                    size="xs"
                                                >
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
                                    <Icon as={FaExternalLinkAlt} color="fg.muted" boxSize={3} />
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            )}
        </VStack>
    );
};

// Sub-component for Search strategy slot
const SearchSlotContent = ({ slot, templateName, isExpanded }: { slot: MealTemplateSlot; templateName: string; isExpanded: boolean }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const criteria = slot.search_criteria || [];
    const filters = searchCriteriaToFilters(criteria);

    const { data: recipesData, isLoading } = useInfiniteRecipes(
        20, // Limit to 20 results for display
        filters,
        { enabled: criteria.length > 0 }
    );
    const recipes = recipesData?.pages.flatMap(p => p.recipes) || [];
    const totalCount = recipesData?.pages[0]?.totalCount || 0;

    const handleViewRecipe = (e: React.MouseEvent, recipeId: string) => {
        e.stopPropagation();
        navigate(`/recipes/${recipeId}`, {
            state: {
                breadcrumbs: [
                    { label: 'Templates', url: '/meals/templates' },
                    { label: templateName, url: location.pathname }
                ]
            }
        });
    };

    return (
        <VStack align="stretch" gap={2}>
            {/* Collapsed view - criteria and count */}
            <VStack align="start" gap={2}>
                <HStack wrap="wrap" gap={2}>
                    {criteria.map((criterion, idx) => (
                        <Badge key={idx} colorPalette="cyan" size="sm">
                            {formatCriterion(criterion)}
                        </Badge>
                    ))}
                    {criteria.length === 0 && (
                         <Text fontSize="sm" color="fg.muted" fontStyle="italic">No criteria (matches all)</Text>
                    )}
                </HStack>
                <Text fontSize="sm" color="fg.muted">
                    {isLoading ? (
                        <Spinner size="xs" mr={2} />
                    ) : (
                        `${totalCount} matching recipe${totalCount !== 1 ? 's' : ''}`
                    )}
                </Text>
            </VStack>

            {/* Expanded view - scrollable results */}
            {isExpanded && !isLoading && recipes.length > 0 && (
                <Box pt={3} borderTopWidth={1} borderColor="border.default">
                    <Box
                        maxH="300px"
                        overflowY="auto"
                        pr={2}
                        css={{
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-track': { background: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { background: '#4a4a4a', borderRadius: '3px' },
                        }}
                    >
                        <VStack align="stretch" gap={2}>
                            {recipes.map((recipe) => (
                                <Box
                                    key={recipe.core.id}
                                    p={3}
                                    borderWidth={1}
                                    borderColor="border.default"
                                    borderRadius="md"
                                    bg="bg.canvas"
                                    _hover={{ bg: 'vscode.inputBg', cursor: 'pointer' }}
                                    onClick={(e) => handleViewRecipe(e, recipe.core.id)}
                                    transition="background-color 0.2s"
                                >
                                    <HStack justify="space-between" align="center">
                                        <VStack align="start" gap={1}>
                                            <Text fontWeight="medium" fontSize="sm" color="fg.default">
                                                {recipe.core.name}
                                            </Text>
                                            <HStack gap={2} wrap="wrap">
                                                {recipe.core.category && <Badge colorPalette="orange" size="xs">{recipe.core.category}</Badge>}
                                                {recipe.core.cuisine && <Badge colorPalette="purple" size="xs">{recipe.core.cuisine}</Badge>}
                                                {(recipe.times.total_time_minutes ?? 0) > 0 && (
                                                    <Text fontSize="xs" color="fg.muted">
                                                        {formatDuration(recipe.times.total_time_minutes)}
                                                    </Text>
                                                )}
                                            </HStack>
                                        </VStack>
                                        <Icon as={FaExternalLinkAlt} color="fg.muted" boxSize={3} />
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    </Box>
                    {totalCount > recipes.length && (
                        <Text fontSize="xs" color="fg.muted" mt={2} textAlign="center">
                            Showing {recipes.length} of {totalCount} matching recipes
                        </Text>
                    )}
                </Box>
            )}

            {isExpanded && !isLoading && recipes.length === 0 && (
                <Box pt={3} borderTopWidth={1} borderColor="border.default">
                    <Text fontSize="sm" color="fg.muted">No recipes match the search criteria.</Text>
                </Box>
            )}
        </VStack>
    );
};

const TemplateSlotCard = ({ slot, slotNumber, templateName, isExpanded, onToggle }: TemplateSlotCardProps) => {
    const config = strategyConfig[slot.strategy] || strategyConfig[MealTemplateSlotStrategy.DIRECT];

    const renderContent = () => {
        switch (slot.strategy) {
            case MealTemplateSlotStrategy.DIRECT:
                return <DirectSlotContent slot={slot} templateName={templateName} isExpanded={isExpanded} />;
            case MealTemplateSlotStrategy.LIST:
                return <ListSlotContent slot={slot} templateName={templateName} isExpanded={isExpanded} />;
            case MealTemplateSlotStrategy.SEARCH:
                return <SearchSlotContent slot={slot} templateName={templateName} isExpanded={isExpanded} />;
            default:
                return <Text color="fg.muted">Unknown strategy</Text>;
        }
    };

    return (
        <Box
            borderWidth={1}
            borderColor="border.default"
            borderRadius="md"
            overflow="hidden"
            bg="bg.surface"
        >
            {/* Header - Clickable to toggle */}
            <Box
                px={4}
                py={3}
                cursor="pointer"
                onClick={onToggle}
                _hover={{ bg: 'vscode.inputBg' }}
                transition="background-color 0.2s"
                borderBottomWidth={1}
                borderColor="border.default"
            >
                <HStack justify="space-between" align="center">
                    <HStack gap={3}>
                        <Box
                            w={8}
                            h={8}
                            borderRadius="md"
                            bg={`${config.color}.800`}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            opacity={0.8}
                        >
                            <Icon as={config.icon} color={`${config.color}.200`} boxSize={4} />
                        </Box>
                        <VStack align="start" gap={0}>
                            <Text fontWeight="medium" fontSize="sm" color="fg.default">
                                Slot {slotNumber}
                            </Text>
                            <Badge colorPalette={config.color} size="xs">
                                {config.label}
                            </Badge>
                        </VStack>
                    </HStack>
                    <Icon as={isExpanded ? FaChevronUp : FaChevronDown} color="fg.muted" />
                </HStack>
            </Box>

            {/* Content */}
            <Box p={4}>
                {renderContent()}
            </Box>
        </Box>
    );
};

export default TemplateSlotCard;
