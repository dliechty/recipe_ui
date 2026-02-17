import { useMemo, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    IconButton,
    Button,
    List,
    Icon,
    Badge,
} from '@chakra-ui/react';
import { FaTimes, FaPrint, FaCheckSquare, FaRegSquare, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Meal, Recipe } from '../../../client';
import { formatQuantity } from '../../../utils/formatters';

interface ShoppingListPanelProps {
    isOpen: boolean;
    onClose: () => void;
    meals: Meal[];
    recipes: Recipe[];
}

interface AggregatedIngredient {
    item: string;
    unit: string;
    quantity: number;
    originalRecipes: string[];
}

type ViewMode = 'merged' | 'byRecipe';

const ShoppingListPanel = ({ isOpen, onClose, meals, recipes }: ShoppingListPanelProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>('merged');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());

    const unshoppedMeals = useMemo(() => meals.filter(m => !m.is_shopped), [meals]);

    // Collect recipe IDs from unshopped meals
    const unshoppedRecipeIds = useMemo(() => {
        const ids = new Set<string>();
        unshoppedMeals.forEach(meal => {
            meal.items?.forEach(item => {
                if (item.recipe_id) ids.add(item.recipe_id);
            });
        });
        return ids;
    }, [unshoppedMeals]);

    // Filter recipes to only those referenced by unshopped meals
    const relevantRecipes = useMemo(
        () => recipes.filter(r => unshoppedRecipeIds.has(r.core.id)),
        [recipes, unshoppedRecipeIds]
    );

    // Aggregate ingredients from relevant recipes
    const aggregated = useMemo(() => {
        const acc: Record<string, AggregatedIngredient> = {};
        relevantRecipes.forEach(recipe => {
            if (!recipe.components) return;
            recipe.components.forEach(comp => {
                if (!comp.ingredients) return;
                comp.ingredients.forEach(ing => {
                    const key = `${ing.item.toLowerCase().trim()}::${ing.unit.toLowerCase().trim()}`;
                    if (!acc[key]) {
                        acc[key] = {
                            item: ing.item,
                            unit: ing.unit,
                            quantity: 0,
                            originalRecipes: [],
                        };
                    }
                    acc[key].quantity += ing.quantity;
                    if (!acc[key].originalRecipes.includes(recipe.core.name)) {
                        acc[key].originalRecipes.push(recipe.core.name);
                    }
                });
            });
        });
        return Object.values(acc).sort((a, b) =>
            a.item.toLowerCase().localeCompare(b.item.toLowerCase())
        );
    }, [relevantRecipes]);

    const toggleCheck = (key: string) => {
        setCheckedItems(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const toggleRecipe = (recipeName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRecipes(prev => {
            const next = new Set(prev);
            if (next.has(recipeName)) {
                next.delete(recipeName);
            } else {
                next.add(recipeName);
            }
            return next;
        });
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
                _hover={{ bg: 'whiteAlpha.100', borderRadius: 'md' }}
                p={2}
                borderRadius="md"
                transition="all 0.2s"
            >
                <List.Indicator asChild>
                    <Icon
                        as={isChecked ? FaCheckSquare : FaRegSquare}
                        color={isChecked ? "green.400" : "fg.muted"}
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

    if (!isOpen) return null;

    const hasIngredients = aggregated.length > 0;

    return (
        <Box
            position="fixed"
            top={0}
            right={0}
            bottom={0}
            w={{ base: '100%', md: '400px' }}
            bg="bg.surface"
            borderLeftWidth={1}
            borderColor="border.default"
            boxShadow="xl"
            zIndex={1000}
            overflowY="auto"
            className="shopping-list-panel"
        >
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    .shopping-list-panel,
                    .shopping-list-panel * {
                        visibility: visible !important;
                    }
                    .shopping-list-panel {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        right: 0 !important;
                        bottom: auto !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        border: none !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    [role="listitem"] {
                        break-inside: avoid;
                    }
                }
            `}</style>

            <HStack
                justify="space-between"
                p={4}
                borderBottomWidth={1}
                borderColor="border.default"
                position="sticky"
                top={0}
                bg="bg.surface"
                zIndex={1}
            >
                <HStack gap={3}>
                    <Heading size="md" color="fg.default">Shopping List</Heading>
                    {hasIngredients && (
                        <Badge colorPalette="blue" variant="solid" borderRadius="full">
                            {aggregated.length} items
                        </Badge>
                    )}
                </HStack>
                <HStack gap={1}>
                    <IconButton
                        aria-label="Print shopping list"
                        variant="ghost"
                        size="sm"
                        color="fg.muted"
                        _hover={{ color: "fg.default" }}
                        onClick={() => window.print()}
                        className="no-print"
                    >
                        <FaPrint />
                    </IconButton>
                    <IconButton
                        aria-label="Close"
                        variant="ghost"
                        size="sm"
                        color="fg.muted"
                        _hover={{ color: "fg.default" }}
                        onClick={onClose}
                        className="no-print"
                    >
                        <FaTimes />
                    </IconButton>
                </HStack>
            </HStack>

            {hasIngredients && (
                <HStack p={4} pb={0} gap={0} className="no-print">
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
                            onClick={() => {
                                setViewMode('byRecipe');
                                setExpandedRecipes(new Set(relevantRecipes.map(r => r.core.name)));
                            }}
                            borderRadius={0}
                        >
                            By Recipe
                        </Button>
                    </HStack>
                </HStack>
            )}

            <VStack p={4} align="stretch" gap={4}>
                {!hasIngredients ? (
                    <Text color="fg.muted" textAlign="center" py={8}>
                        No items to shop for. All queued meals have been shopped!
                    </Text>
                ) : viewMode === 'merged' ? (
                    <List.Root gap={1}>
                        {aggregated.map((ing) => {
                            const key = `${ing.item.toLowerCase().trim()}::${ing.unit.toLowerCase().trim()}`;
                            return (
                                <Box key={key} display="flex" flexDirection="column" mb={1}>
                                    {renderIngredientLine(ing.item, ing.unit, ing.quantity, key)}
                                    {ing.originalRecipes.length > 1 && (
                                        <Text fontSize="xs" color="fg.muted" ml={9} mt={-1} mb={2}>
                                            From: {ing.originalRecipes.join(', ')}
                                        </Text>
                                    )}
                                </Box>
                            );
                        })}
                    </List.Root>
                ) : (
                    <VStack align="stretch" gap={4}>
                        {relevantRecipes.map(recipe => {
                            const isRecipeExpanded = expandedRecipes.has(recipe.core.name);
                            const totalItems = recipe.components.reduce(
                                (acc, c) => acc + (c.ingredients?.length || 0), 0
                            );

                            return (
                                <Box
                                    key={recipe.core.id}
                                    borderWidth={1}
                                    borderColor="border.default"
                                    borderRadius="md"
                                    overflow="hidden"
                                >
                                    <HStack
                                        p={3}
                                        cursor="pointer"
                                        onClick={(e) => toggleRecipe(recipe.core.name, e)}
                                        bg="bg.muted"
                                        justify="space-between"
                                        _hover={{ bg: 'whiteAlpha.100' }}
                                    >
                                        <HStack>
                                            <Heading size="sm" fontSize="sm">{recipe.core.name}</Heading>
                                            <Badge size="xs" colorPalette="cyan" variant="solid">
                                                {totalItems} items
                                            </Badge>
                                        </HStack>
                                        <Icon
                                            as={isRecipeExpanded ? FaChevronUp : FaChevronDown}
                                            boxSize={3}
                                            color="fg.muted"
                                        />
                                    </HStack>

                                    {isRecipeExpanded && (
                                        <Box p={3} bg="bg.surface">
                                            <List.Root gap={1}>
                                                {recipe.components.map((comp, i) => (
                                                    <Box key={i}>
                                                        {comp.ingredients?.map((ing) => {
                                                            const key = `${ing.item.toLowerCase().trim()}::${ing.unit.toLowerCase().trim()}`;
                                                            return renderIngredientLine(
                                                                ing.item, ing.unit, ing.quantity, key
                                                            );
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
            </VStack>
        </Box>
    );
};

export default ShoppingListPanel;
