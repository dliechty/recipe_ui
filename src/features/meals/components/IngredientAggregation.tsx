import { useState } from 'react';
import { Box, HStack, Heading, Badge, Text, List, Icon, Button, VStack } from '@chakra-ui/react';
import { FaChevronDown, FaChevronUp, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { Recipe } from '../../../client';
import { formatQuantity } from '../../../utils/formatters';

interface IngredientAggregationProps {
    recipes: Recipe[];
}

interface AggregatedIngredient {
    item: string;
    unit: string;
    quantity: number;
    originalRecipes: string[];
}

type ViewMode = 'merged' | 'byRecipe';

const IngredientAggregation = ({ recipes }: IngredientAggregationProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('merged');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());

    if (!recipes || recipes.length === 0) return null;

    // Aggregate ingredients
    const aggregated = recipes.reduce((acc, recipe) => {
        if (!recipe.components) return acc;
        recipe.components.forEach(comp => {
            if (!comp.ingredients) return;
            comp.ingredients.forEach(ing => {
                // Normalize key: item + unit
                const key = `${ing.item.toLowerCase().trim()}::${ing.unit.toLowerCase().trim()}`;
                if (!acc[key]) {
                    acc[key] = {
                        item: ing.item,
                        unit: ing.unit,
                        quantity: 0,
                        originalRecipes: []
                    };
                }
                acc[key].quantity += ing.quantity;
                if (!acc[key].originalRecipes.includes(recipe.core.name)) {
                    acc[key].originalRecipes.push(recipe.core.name);
                }
            });
        });
        return acc;
    }, {} as Record<string, AggregatedIngredient>);

    const sortedIngredients = Object.values(aggregated).sort((a, b) =>
        a.item.toLowerCase().localeCompare(b.item.toLowerCase())
    );

    const toggle = () => setIsExpanded(!isExpanded);
    const toggleCheck = (key: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const newChecked = new Set(checkedItems);
        if (newChecked.has(key)) {
            newChecked.delete(key);
        } else {
            newChecked.add(key);
        }
        setCheckedItems(newChecked);
    };

    const toggleRecipe = (recipeName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(expandedRecipes);
        if (newSet.has(recipeName)) {
            newSet.delete(recipeName);
        } else {
            newSet.add(recipeName);
        }
        setExpandedRecipes(newSet);
    };

    const renderIngredientLine = (item: string, unit: string, quantity: number, key: string) => {
        const isChecked = checkedItems.has(key);
        const isToTaste = quantity === 0 && unit.toLowerCase() === 'to taste';

        return (
            <List.Item
                key={key}
                display="flex"
                alignItems="center"
                cursor="pointer"
                onClick={() => toggleCheck(key)}
                opacity={isChecked ? 0.5 : 1}
                _hover={{ bg: 'vscode.list.hoverBackground', borderRadius: 'md' }}
                p={2}
                borderRadius="md"
                transition="all 0.2s"
            >
                <List.Indicator asChild>
                    <Icon
                        as={isChecked ? FaCheckSquare : FaRegSquare}
                        color={isChecked ? "vscode.accent" : "fg.muted"}
                        mr={3}
                        boxSize={4}
                    />
                </List.Indicator>
                <Text textDecoration={isChecked ? 'line-through' : 'none'} color="fg.default" fontSize="sm">
                    {isToTaste ? (
                        <>
                            <Text as="span" fontWeight="bold">{item}</Text> {unit}
                        </>
                    ) : (
                        <>
                            <Text as="span" fontWeight="bold">
                                {formatQuantity(quantity)} {unit}
                            </Text> {item}
                        </>
                    )}
                </Text>
            </List.Item>
        );
    };

    return (
        <Box borderWidth={1} borderColor="border.default" borderRadius="md" mt={8} overflow="hidden" bg="bg.surface">
            <HStack
                p={4}
                justify="space-between"
                bg="bg.surface"
                borderBottomWidth={isExpanded ? 1 : 0}
                borderColor="border.default"
            >
                <HStack gap={3} flex={1} cursor="pointer" onClick={toggle}>
                    <Icon as={isExpanded ? FaChevronUp : FaChevronDown} color="fg.muted" />
                    <Heading size="md" color="fg.default">Shopping List</Heading>
                    <Badge colorPalette="blue" variant="solid" borderRadius="full">
                        {sortedIngredients.length} items
                    </Badge>
                </HStack>

                {isExpanded && (
                    <HStack gap={0} borderRadius="md" overflow="hidden" borderWidth={1} borderColor="border.default">
                        <Button
                            size="xs"
                            bg={viewMode === 'merged' ? 'vscode.button' : 'bg.surface'}
                            color={viewMode === 'merged' ? 'white' : 'fg.default'}
                            _hover={{ bg: viewMode === 'merged' ? 'vscode.buttonHover' : 'bg.muted' }}
                            onClick={() => setViewMode('merged')}
                            borderRadius={0}
                        >
                            Merged
                        </Button>
                        <Button
                            size="xs"
                            bg={viewMode === 'byRecipe' ? 'vscode.button' : 'bg.surface'}
                            color={viewMode === 'byRecipe' ? 'white' : 'fg.default'}
                            _hover={{ bg: viewMode === 'byRecipe' ? 'vscode.buttonHover' : 'bg.muted' }}
                            onClick={() => setViewMode('byRecipe')}
                            borderRadius={0}
                        >
                            By Recipe
                        </Button>
                    </HStack>
                )}
            </HStack>

            {isExpanded && (
                <Box p={4} bg="bg.surface">
                    {viewMode === 'merged' ? (
                        <List.Root gap={1}>
                            {sortedIngredients.map((ing) => {
                                const key = `${ing.item.toLowerCase().trim()}::${ing.unit.toLowerCase().trim()}`;
                                return (
                                    <Box key={key} display="flex" flexDirection="column" mb={1}>
                                        {renderIngredientLine(ing.item, ing.unit, ing.quantity, key)}
                                        <Text fontSize="xs" color="fg.muted" ml={9} mt={-1} mb={2}>
                                            From: {ing.originalRecipes.join(', ')}
                                        </Text>
                                    </Box>
                                );
                            })}
                        </List.Root>
                    ) : (
                        <VStack align="stretch" gap={4}>
                            {recipes.map(recipe => {
                                const isRecipeExpanded = expandedRecipes.has(recipe.core.name);
                                const totalItems = recipe.components.reduce((acc, c) => acc + (c.ingredients?.length || 0), 0);

                                return (
                                    <Box key={recipe.core.id} borderWidth={1} borderColor="border.default" borderRadius="md" overflow="hidden">
                                        <HStack
                                            p={3}
                                            cursor="pointer"
                                            onClick={(e) => toggleRecipe(recipe.core.name, e)}
                                            bg="bg.muted"
                                            justify="space-between"
                                            _hover={{ bg: 'vscode.list.hoverBackground' }}
                                        >
                                            <HStack>
                                                <Heading size="sm" fontSize="sm">{recipe.core.name}</Heading>
                                                <Badge size="xs" variant="outline">{totalItems} items</Badge>
                                            </HStack>
                                            <Icon as={isRecipeExpanded ? FaChevronUp : FaChevronDown} size="xs" color="fg.muted" />
                                        </HStack>

                                        {isRecipeExpanded && (
                                            <Box p={3} bg="bg.surface">
                                                <List.Root gap={1}>
                                                    {recipe.components.map((comp, i) => (
                                                        <Box key={i}>
                                                            {comp.ingredients.map((ing) => {
                                                                const key = `${ing.item.toLowerCase().trim()}::${ing.unit.toLowerCase().trim()}`;
                                                                return renderIngredientLine(ing.item, ing.unit, ing.quantity, key);
                                                            })}
                                                        </Box>
                                                    ))}
                                                </List.Root>
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </VStack>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default IngredientAggregation;
