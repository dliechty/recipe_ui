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
    Button
} from '@chakra-ui/react';
import {
    FaChevronDown,
    FaChevronUp,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { Recipe } from '../../../client';
import { formatDuration, formatDietName } from '../../../utils/formatters';

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
                    <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
                        {/* Left column: Times */}
                        <Box>
                            <HStack mb={1}>
                                <Text fontWeight="bold" fontSize="sm">Total:</Text>
                                <Text fontSize="sm">{formatDuration(recipe.times.total_time_minutes)}</Text>
                            </HStack>
                            <VStack align="start" pl={4} gap={0}>
                                {(recipe.times.prep_time_minutes ?? 0) > 0 && (
                                    <HStack>
                                        <Text fontSize="xs" color="fg.muted">Prep:</Text>
                                        <Text fontSize="xs">{formatDuration(recipe.times.prep_time_minutes)}</Text>
                                    </HStack>
                                )}
                                {(recipe.times.active_time_minutes ?? 0) > 0 && (
                                    <HStack>
                                        <Text fontSize="xs" color="fg.muted">Active:</Text>
                                        <Text fontSize="xs">{formatDuration(recipe.times.active_time_minutes)}</Text>
                                    </HStack>
                                )}
                                {(recipe.times.cook_time_minutes ?? 0) > 0 && (
                                    <HStack>
                                        <Text fontSize="xs" color="fg.muted">Cook:</Text>
                                        <Text fontSize="xs">{formatDuration(recipe.times.cook_time_minutes)}</Text>
                                    </HStack>
                                )}
                            </VStack>
                        </Box>

                        {/* Right column: Yield & Metadata */}
                        <Box>
                            <HStack mb={2}>
                                <Text fontWeight="bold" fontSize="sm">Yield:</Text>
                                <Text fontSize="sm">{recipe.core.yield_amount} {recipe.core.yield_unit}</Text>
                            </HStack>

                            {/* Tags */}
                            <HStack wrap="wrap" gap={2}>
                                {recipe.core.cuisine && (
                                    <Badge colorPalette="purple" size="xs">{recipe.core.cuisine}</Badge>
                                )}
                                {recipe.core.protein && (
                                    <Badge colorPalette="blue" size="xs">{recipe.core.protein}</Badge>
                                )}
                                {recipe.suitable_for_diet?.map(diet => (
                                    <Badge key={diet} colorPalette="teal" size="xs">{formatDietName(diet)}</Badge>
                                ))}
                            </HStack>
                        </Box>
                    </Grid>

                    <Button
                        size="xs"
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: "vscode.buttonHover" }}
                        onClick={handleViewRecipe}
                    >
                        <Icon as={FaExternalLinkAlt} mr={2} /> View Full Recipe
                    </Button>


                </Box>
            )}
        </Box>
    );
};

export default ExpandableRecipeCard;
