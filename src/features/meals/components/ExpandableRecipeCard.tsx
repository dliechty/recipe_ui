import React, { useState, useEffect } from 'react';
import {
    Box,
    HStack,
    Heading,
    Badge,
    Text,
    Icon,
    Grid,
    VStack,
    List,
    Button
} from '@chakra-ui/react';
import {
    FaChevronDown,
    FaChevronUp,
    FaCheckCircle,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { Recipe } from '../../../client';
import { formatQuantity, formatDuration, formatDietName } from '../../../utils/formatters';

interface ExpandableRecipeCardProps {
    recipe: Recipe;
    mealName: string;
    defaultExpanded?: boolean;
}

const ExpandableRecipeCard = ({ recipe, mealName, defaultExpanded = false }: ExpandableRecipeCardProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setIsExpanded(defaultExpanded);
    }, [defaultExpanded]);

    const toggle = () => setIsExpanded(!isExpanded);

    const handleViewRecipe = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/recipes/${recipe.core.id}`, {
            state: {
                breadcrumbs: [
                    { label: 'Meals', url: '/meals' },
                    { label: mealName, url: location.pathname }
                ]
            }
        });
    };

    return (
        <Box
            borderWidth={1}
            borderColor="border.default"
            borderRadius="md"
            overflow="hidden"
            bg="bg.surface"
        >
            {/* Header / Summary - Clickable to toggle */}
            <Box
                p={4}
                cursor="pointer"
                onClick={toggle}
                _hover={{ bg: 'bg.muted' }}
                transition="background-color 0.2s"
            >
                <HStack justify="space-between" align="center">
                    <VStack align="start" gap={2}>
                        <Heading size="sm" color="fg.default">{recipe.core.name}</Heading>
                        <HStack gap={2} wrap="wrap">
                            {recipe.core.category && <Badge colorPalette="orange" size="sm">{recipe.core.category}</Badge>}
                            {recipe.core.difficulty && (
                                <Badge colorPalette={recipe.core.difficulty === 'Easy' ? 'green' : recipe.core.difficulty === 'Medium' ? 'yellow' : 'red'} size="sm">
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
                    <Icon as={isExpanded ? FaChevronUp : FaChevronDown} color="fg.muted" />
                </HStack>
            </Box>

            {/* Expanded Content */}
            {isExpanded && (
                <Box p={4} borderTopWidth={1} borderColor="border.default">
                    {/* Metadata Grid */}
                    <Grid templateColumns="auto 1fr" gap={2} rowGap={1} mb={4}>
                        {recipe.core.cuisine && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Cuisine:</Text>
                                <Badge colorPalette="purple" alignSelf="flex-start">{recipe.core.cuisine}</Badge>
                            </>
                        )}
                        {recipe.core.protein && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Protein:</Text>
                                <Badge colorPalette="blue" alignSelf="flex-start">{recipe.core.protein}</Badge>
                            </>
                        )}
                        {(recipe.suitable_for_diet || []).length > 0 && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Diet:</Text>
                                <HStack wrap="wrap" gap={1}>
                                    {recipe.suitable_for_diet?.map(diet => (
                                        <Badge key={diet} colorPalette="teal">{formatDietName(diet)}</Badge>
                                    ))}
                                </HStack>
                            </>
                        )}

                        {(recipe.times.prep_time_minutes ?? 0) > 0 && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Prep:</Text>
                                <Text fontSize="sm">{formatDuration(recipe.times.prep_time_minutes)}</Text>
                            </>
                        )}
                        {(recipe.times.active_time_minutes ?? 0) > 0 && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Active:</Text>
                                <Text fontSize="sm">{formatDuration(recipe.times.active_time_minutes)}</Text>
                            </>
                        )}
                        {(recipe.times.cook_time_minutes ?? 0) > 0 && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Cook:</Text>
                                <Text fontSize="sm">{formatDuration(recipe.times.cook_time_minutes)}</Text>
                            </>
                        )}

                        <Text fontWeight="bold" color="fg.muted" fontSize="sm">Yield:</Text>
                        <Text fontSize="sm">{recipe.core.yield_amount} {recipe.core.yield_unit}</Text>

                        {(recipe.nutrition?.calories ?? 0) > 0 && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Calories:</Text>
                                <Text fontSize="sm">{recipe.nutrition?.calories} kcal</Text>
                            </>
                        )}
                    </Grid>

                    <Button
                        size="xs"
                        variant="ghost"
                        color="vscode.interactive"
                        _hover={{ color: "vscode.interactiveHover", bg: "vscode.list.hoverBackground" }}
                        onClick={handleViewRecipe}
                        mb={4}
                    >
                        <Icon as={FaExternalLinkAlt} mr={2} /> View Full Recipe
                    </Button>

                    <Heading size="xs" mb={2} color="fg.default">Ingredients</Heading>
                    <VStack align="stretch" gap={3}>
                        {recipe.components.map((component, cIndex) => (
                            <Box key={cIndex}>
                                {component.name && component.name !== 'Main' && (
                                    <Text fontWeight="bold" fontSize="xs" mb={1} color="fg.muted">{component.name}</Text>
                                )}
                                <List.Root gap={1}>
                                    {component.ingredients.map((ingredient, index) => {
                                        const isToTaste = ingredient.quantity === 0 && ingredient.unit.toLowerCase() === 'to taste';
                                        return (
                                            <List.Item key={index} display="flex" alignItems="center">
                                                <List.Indicator asChild>
                                                    <Box as="span" mr={2}>
                                                        <Icon as={FaCheckCircle} color="vscode.accent" boxSize={3} />
                                                    </Box>
                                                </List.Indicator>
                                                <Text fontSize="sm">
                                                    {isToTaste ? (
                                                        <>
                                                            <Text as="span" fontWeight="bold">{ingredient.item}</Text> {ingredient.unit}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Text as="span" fontWeight="bold">{formatQuantity(ingredient.quantity)} {ingredient.unit}</Text> {ingredient.item}
                                                        </>
                                                    )}
                                                </Text>
                                            </List.Item>
                                        );
                                    })}
                                </List.Root>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            )}
        </Box>
    );
};

export default ExpandableRecipeCard;
