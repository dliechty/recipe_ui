import { useState } from 'react';
import { Box, HStack, Heading, Badge, Text, List, Icon } from '@chakra-ui/react';
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

const IngredientAggregation = ({ recipes }: IngredientAggregationProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

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
    const toggleCheck = (key: string) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(key)) {
            newChecked.delete(key);
        } else {
            newChecked.add(key);
        }
        setCheckedItems(newChecked);
    };

    return (
        <Box borderWidth={1} borderColor="border.default" borderRadius="md" mt={8} overflow="hidden" bg="bg.surface">
            <HStack
                p={4}
                cursor="pointer"
                onClick={toggle}
                justify="space-between"
                _hover={{ bg: 'bg.muted' }}
                bg="bg.surface"
            >
                <HStack gap={3}>
                    <Heading size="md" color="fg.default">Shopping List</Heading>
                    <Badge colorPalette="blue" variant="solid" borderRadius="full">
                        {sortedIngredients.length} items
                    </Badge>
                </HStack>
                <Icon as={isExpanded ? FaChevronUp : FaChevronDown} color="fg.muted" />
            </HStack>

            {isExpanded && (
                <Box p={4} borderTopWidth={1} borderColor="border.default" bg="bg.surface">
                    <List.Root gap={2}>
                        {sortedIngredients.map((ing) => {
                            const key = `${ing.item.toLowerCase().trim()}::${ing.unit.toLowerCase().trim()}`;
                            const isChecked = checkedItems.has(key);
                            const isToTaste = ing.quantity === 0 && ing.unit.toLowerCase() === 'to taste';

                            return (
                                <List.Item
                                    key={key}
                                    display="flex"
                                    alignItems="flex-start"
                                    cursor="pointer"
                                    onClick={() => toggleCheck(key)}
                                    opacity={isChecked ? 0.5 : 1}
                                    _hover={{ bg: 'vscode.list.hoverBackground', borderRadius: 'md' }}
                                    p={2}
                                    borderRadius="md"
                                    transition="all 0.2s"
                                >
                                    <List.Indicator asChild mt={1}>
                                        <Icon
                                            as={isChecked ? FaCheckSquare : FaRegSquare}
                                            color={isChecked ? "vscode.accent" : "fg.muted"}
                                            mr={3}
                                            boxSize={4}
                                        />
                                    </List.Indicator>
                                    <Box flex={1}>
                                        <Text textDecoration={isChecked ? 'line-through' : 'none'} color="fg.default">
                                            {isToTaste ? (
                                                <>
                                                    <Text as="span" fontWeight="bold">{ing.item}</Text> {ing.unit}
                                                </>
                                            ) : (
                                                <>
                                                    <Text as="span" fontWeight="bold">
                                                        {formatQuantity(ing.quantity)} {ing.unit}
                                                    </Text> {ing.item}
                                                </>
                                            )}
                                        </Text>
                                        <Text fontSize="xs" color="fg.muted" mt={0.5}>
                                            From: {ing.originalRecipes.join(', ')}
                                        </Text>
                                    </Box>
                                </List.Item>
                            );
                        })}
                    </List.Root>
                </Box>
            )}
        </Box>
    );
};

export default IngredientAggregation;
