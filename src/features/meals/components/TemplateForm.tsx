import React, { useState } from 'react';
import {
    Box,
    Input,
    VStack,
    HStack,
    Heading,
    Button,
    NativeSelect,
    Text,
    IconButton,
    Icon,
    Badge,
    Spinner,
    Center,
    Grid
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaLink, FaListUl, FaSearch, FaTimes, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { MealTemplateCreate, MealClassification, MealTemplateSlotCreate, MealTemplateSlotStrategy, SearchCriterion, Recipe } from '../../../client';
import { useInfiniteRecipes, useRecipe, RecipeFilters } from '../../../hooks/useRecipes';
import { useRecipeMeta } from '../../recipes/hooks/useRecipeMeta';
import RecipeMultiSelect from '../../recipes/components/RecipeMultiSelect';
import DebouncedInput from '../../../components/common/DebouncedInput';
import { formatDuration } from '../../../utils/formatters';

interface TemplateFormProps {
    onSubmit: (data: MealTemplateCreate) => void;
    isLoading: boolean;
    initialData?: Partial<MealTemplateCreate>;
    onCancel?: () => void;
}

interface SlotWithId extends MealTemplateSlotCreate {
    id: string;
}

// Strategy icon and color mapping (matches TemplateSlotCard)
const strategyConfig = {
    [MealTemplateSlotStrategy.DIRECT]: { icon: FaLink, color: 'blue', label: 'Direct' },
    [MealTemplateSlotStrategy.LIST]: { icon: FaListUl, color: 'purple', label: 'List' },
    [MealTemplateSlotStrategy.SEARCH]: { icon: FaSearch, color: 'orange', label: 'Search' },
};

// Common input styling
const inputStyles = {
    bg: "vscode.inputBg",
    borderColor: "border.default",
    color: "fg.default",
    _hover: { borderColor: 'vscode.accent' },
    _focus: { borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' },
    // Style for native select options (dark theme)
    css: {
        '& option': {
            backgroundColor: '#3c3c3c',
            color: '#d4d4d4',
        }
    }
};

// Searchable fields for search criteria
const SEARCHABLE_FIELDS = [
    { value: 'category', label: 'Category' },
    { value: 'cuisine', label: 'Cuisine' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'protein', label: 'Protein' },
    { value: 'suitable_for_diet', label: 'Diet Type' },
];

const OPERATORS = [
    { value: 'eq', label: '=' },
    { value: 'in', label: 'in' },
];

const TemplateForm = ({ onSubmit, isLoading, initialData, onCancel }: TemplateFormProps) => {
    const [name, setName] = useState(initialData?.name || '');
    const [classification, setClassification] = useState<MealClassification | ''>(initialData?.classification || '');

    // Initialize slots with unique IDs for UI rendering
    const [slots, setSlots] = useState<SlotWithId[]>(() => {
        if (initialData?.slots && initialData.slots.length > 0) {
            return initialData.slots.map((slot, index) => ({
                ...slot,
                id: `slot-${index}-${Date.now()}`
            }));
        }
        // Start with one empty slot
        return [{
            id: `slot-0-${Date.now()}`,
            strategy: MealTemplateSlotStrategy.DIRECT
        }];
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        if (slots.length === 0) {
            return;
        }

        // Remove the UI-only 'id' field before submitting
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const slotsData: MealTemplateSlotCreate[] = slots.map(({ id, ...slot }) => slot);

        const templateData: MealTemplateCreate = {
            name: name.trim(),
            classification: classification || null,
            slots: slotsData
        };

        onSubmit(templateData);
    };

    const addSlot = () => {
        setSlots([
            ...slots,
            {
                id: `slot-${slots.length}-${Date.now()}`,
                strategy: MealTemplateSlotStrategy.DIRECT
            }
        ]);
    };

    const removeSlot = (id: string) => {
        if (slots.length > 1) {
            setSlots(slots.filter(slot => slot.id !== id));
        }
    };

    const updateSlotStrategy = (id: string, strategy: MealTemplateSlotStrategy) => {
        setSlots(slots.map(slot =>
            slot.id === id ? {
                ...slot,
                strategy,
                // Clear data from other strategies when switching
                recipe_id: strategy === MealTemplateSlotStrategy.DIRECT ? slot.recipe_id : undefined,
                recipe_ids: strategy === MealTemplateSlotStrategy.LIST ? slot.recipe_ids : undefined,
                search_criteria: strategy === MealTemplateSlotStrategy.SEARCH ? slot.search_criteria : undefined,
            } : slot
        ));
    };

    const updateSlotRecipeId = (id: string, recipeId: string | null) => {
        setSlots(slots.map(slot =>
            slot.id === id ? { ...slot, recipe_id: recipeId || undefined } : slot
        ));
    };

    const updateSlotRecipeIds = (id: string, recipeIds: string[]) => {
        setSlots(slots.map(slot =>
            slot.id === id ? { ...slot, recipe_ids: recipeIds.length > 0 ? recipeIds : undefined } : slot
        ));
    };

    const updateSlotSearchCriteria = (id: string, criteria: SearchCriterion[]) => {
        setSlots(slots.map(slot =>
            slot.id === id ? { ...slot, search_criteria: criteria.length > 0 ? criteria : undefined } : slot
        ));
    };

    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="lg">
            <Heading size="md" mb={6}>Template Details</Heading>

            <form onSubmit={handleSubmit}>
                <VStack gap={4} align="stretch">
                    {/* Name and Classification on same row */}
                    <HStack gap={4} align="end">
                        <Box flex="1">
                            <Text as="label" mb={2} display="block" fontWeight="bold">Template Name</Text>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter template name"
                                required
                                {...inputStyles}
                            />
                        </Box>
                        <Box w="200px">
                            <Text as="label" mb={2} display="block" fontWeight="bold">Classification</Text>
                            <NativeSelect.Root>
                                <NativeSelect.Field
                                    value={classification}
                                    onChange={(e) => setClassification(e.target.value as MealClassification)}
                                    {...inputStyles}
                                >
                                    <option value="">Select...</option>
                                    <option value={MealClassification.BREAKFAST}>Breakfast</option>
                                    <option value={MealClassification.BRUNCH}>Brunch</option>
                                    <option value={MealClassification.LUNCH}>Lunch</option>
                                    <option value={MealClassification.DINNER}>Dinner</option>
                                    <option value={MealClassification.SNACK}>Snack</option>
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                            </NativeSelect.Root>
                        </Box>
                    </HStack>

                    <Box>
                        <HStack justify="space-between" mb={3}>
                            <Text fontWeight="medium">Slots</Text>
                            <Button
                                onClick={addSlot}
                                size="xs"
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                                type="button"
                            >
                                <FaPlus /> Add Slot
                            </Button>
                        </HStack>

                        <VStack gap={4} align="stretch">
                            {slots.map((slot, index) => (
                                <SlotEditor
                                    key={slot.id}
                                    slot={slot}
                                    index={index}
                                    onStrategyChange={(strategy) => updateSlotStrategy(slot.id, strategy)}
                                    onRecipeIdChange={(recipeId) => updateSlotRecipeId(slot.id, recipeId)}
                                    onRecipeIdsChange={(recipeIds) => updateSlotRecipeIds(slot.id, recipeIds)}
                                    onSearchCriteriaChange={(criteria) => updateSlotSearchCriteria(slot.id, criteria)}
                                    onRemove={() => removeSlot(slot.id)}
                                    canRemove={slots.length > 1}
                                />
                            ))}
                        </VStack>
                    </Box>

                    <HStack justify="flex-end" mt={4} gap={2}>
                        {onCancel && (
                            <Button
                                onClick={onCancel}
                                bg="gray.600"
                                color="white"
                                _hover={{ bg: "gray.700" }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                            loading={isLoading}
                            disabled={!name.trim() || slots.length === 0}
                        >
                            Save Template
                        </Button>
                    </HStack>
                </VStack>
            </form>
        </Box>
    );
};

// Slot Editor Component
interface SlotEditorProps {
    slot: SlotWithId;
    index: number;
    onStrategyChange: (strategy: MealTemplateSlotStrategy) => void;
    onRecipeIdChange: (recipeId: string | null) => void;
    onRecipeIdsChange: (recipeIds: string[]) => void;
    onSearchCriteriaChange: (criteria: SearchCriterion[]) => void;
    onRemove: () => void;
    canRemove: boolean;
}

const SlotEditor = ({
    slot,
    index,
    onStrategyChange,
    onRecipeIdChange,
    onRecipeIdsChange,
    onSearchCriteriaChange,
    onRemove,
    canRemove
}: SlotEditorProps) => {
    const config = strategyConfig[slot.strategy];

    return (
        <Box
            borderWidth={1}
            borderColor="border.default"
            borderRadius="md"
            overflow="hidden"
            bg="bg.canvas"
        >
            {/* Slot Header */}
            <Box
                px={4}
                py={3}
                bg="bg.surface"
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
                                Slot {index + 1}
                            </Text>
                            <Badge colorPalette={config.color} size="xs">
                                {config.label}
                            </Badge>
                        </VStack>
                    </HStack>
                    <HStack gap={2}>
                        <NativeSelect.Root size="sm" w="120px">
                            <NativeSelect.Field
                                value={slot.strategy}
                                onChange={(e) => onStrategyChange(e.target.value as MealTemplateSlotStrategy)}
                                {...inputStyles}
                            >
                                <option value={MealTemplateSlotStrategy.DIRECT}>Direct</option>
                                <option value={MealTemplateSlotStrategy.LIST}>List</option>
                                <option value={MealTemplateSlotStrategy.SEARCH}>Search</option>
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        <IconButton
                            onClick={onRemove}
                            aria-label="Remove slot"
                            size="sm"
                            colorPalette="red"
                            variant="ghost"
                            disabled={!canRemove}
                            type="button"
                        >
                            <FaTrash />
                        </IconButton>
                    </HStack>
                </HStack>
            </Box>

            {/* Slot Content based on strategy */}
            <Box p={4}>
                {slot.strategy === MealTemplateSlotStrategy.DIRECT && (
                    <DirectSlotEditor
                        recipeId={slot.recipe_id || null}
                        onChange={onRecipeIdChange}
                    />
                )}
                {slot.strategy === MealTemplateSlotStrategy.LIST && (
                    <ListSlotEditor
                        recipeIds={slot.recipe_ids || []}
                        onChange={onRecipeIdsChange}
                    />
                )}
                {slot.strategy === MealTemplateSlotStrategy.SEARCH && (
                    <SearchSlotEditor
                        criteria={slot.search_criteria || []}
                        onChange={onSearchCriteriaChange}
                    />
                )}
            </Box>
        </Box>
    );
};

// Direct Slot Editor - Single recipe selection
interface DirectSlotEditorProps {
    recipeId: string | null;
    onChange: (recipeId: string | null) => void;
}

const DirectSlotEditor = ({ recipeId, onChange }: DirectSlotEditorProps) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const { data: recipe, isLoading } = useRecipe(recipeId || '');

    if (isSelecting) {
        return (
            <RecipeSelector
                mode="single"
                selectedIds={recipeId ? [recipeId] : []}
                onSelect={(ids) => {
                    onChange(ids[0] || null);
                    setIsSelecting(false);
                }}
                onCancel={() => setIsSelecting(false)}
            />
        );
    }

    return (
        <VStack align="stretch" gap={3}>
            <Text fontSize="sm" color="fg.muted">
                Select a single recipe for this slot.
            </Text>
            {recipeId && recipe ? (
                <Box
                    p={3}
                    borderWidth={1}
                    borderColor="border.default"
                    borderRadius="md"
                    bg="bg.surface"
                >
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
                            </HStack>
                        </VStack>
                        <HStack gap={2}>
                            <Button
                                size="xs"
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                                onClick={() => setIsSelecting(true)}
                            >
                                Edit
                            </Button>
                            <IconButton
                                size="xs"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => onChange(null)}
                                aria-label="Remove recipe"
                            >
                                <FaTimes />
                            </IconButton>
                        </HStack>
                    </HStack>
                </Box>
            ) : isLoading && recipeId ? (
                <Center p={4}>
                    <Spinner size="sm" color="vscode.accent" />
                </Center>
            ) : (
                <Button
                    size="sm"
                    variant="outline"
                    borderColor="border.default"
                    color="fg.default"
                    _hover={{ bg: "vscode.inputBg" }}
                    onClick={() => setIsSelecting(true)}
                >
                    <FaPlus /> Select Recipe
                </Button>
            )}
        </VStack>
    );
};

// List Slot Editor - Multiple recipe selection
interface ListSlotEditorProps {
    recipeIds: string[];
    onChange: (recipeIds: string[]) => void;
}

const ListSlotEditor = ({ recipeIds, onChange }: ListSlotEditorProps) => {
    const [isSelecting, setIsSelecting] = useState(false);

    const { data: recipesData, isLoading } = useInfiniteRecipes(
        recipeIds.length || 1,
        { ids: recipeIds },
        { enabled: recipeIds.length > 0 }
    );
    const recipes = recipesData?.pages.flatMap(p => p.recipes) || [];

    if (isSelecting) {
        return (
            <RecipeSelector
                mode="multiple"
                selectedIds={recipeIds}
                onSelect={(ids) => {
                    onChange(ids);
                    setIsSelecting(false);
                }}
                onCancel={() => setIsSelecting(false)}
            />
        );
    }

    return (
        <VStack align="stretch" gap={3}>
            <HStack justify="space-between">
                <Text fontSize="sm" color="fg.muted">
                    Select recipes for this slot. One will be randomly chosen when generating a meal.
                </Text>
                <Button
                    size="xs"
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    onClick={() => setIsSelecting(true)}
                >
                    {recipeIds.length > 0 ? 'Edit List' : 'Add Recipes'}
                </Button>
            </HStack>

            {isLoading && recipeIds.length > 0 ? (
                <Center p={4}>
                    <Spinner size="sm" color="vscode.accent" />
                </Center>
            ) : recipes.length > 0 ? (
                <Box
                    maxH="200px"
                    overflowY="auto"
                    borderWidth={1}
                    borderColor="border.default"
                    borderRadius="md"
                >
                    <VStack align="stretch" gap={0}>
                        {recipes.map((recipe) => (
                            <Box
                                key={recipe.core.id}
                                p={3}
                                borderBottomWidth={1}
                                borderColor="border.default"
                                _last={{ borderBottomWidth: 0 }}
                                bg="bg.surface"
                            >
                                <HStack justify="space-between" align="center">
                                    <VStack align="start" gap={1}>
                                        <Text fontWeight="medium" fontSize="sm" color="fg.default">{recipe.core.name}</Text>
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
                                        </HStack>
                                    </VStack>
                                    <IconButton
                                        size="xs"
                                        variant="ghost"
                                        colorPalette="red"
                                        onClick={() => onChange(recipeIds.filter(id => id !== recipe.core.id))}
                                        aria-label="Remove recipe"
                                    >
                                        <FaTimes />
                                    </IconButton>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            ) : (
                <Box p={4} borderWidth={1} borderColor="border.default" borderRadius="md" bg="bg.surface">
                    <Text fontSize="sm" color="fg.muted" textAlign="center">No recipes selected</Text>
                </Box>
            )}

            {recipes.length > 0 && (
                <Text fontSize="xs" color="fg.muted">
                    {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in list
                </Text>
            )}
        </VStack>
    );
};

// Search Slot Editor - Search criteria builder
interface SearchSlotEditorProps {
    criteria: SearchCriterion[];
    onChange: (criteria: SearchCriterion[]) => void;
}

const SearchSlotEditor = ({ criteria, onChange }: SearchSlotEditorProps) => {
    const [showPreview, setShowPreview] = useState(false);

    // Metadata for value options
    const { data: categories } = useRecipeMeta('category');
    const { data: cuisines } = useRecipeMeta('cuisine');
    const { data: difficulties } = useRecipeMeta('difficulty');
    const { data: proteins } = useRecipeMeta('protein');
    const { data: diets } = useRecipeMeta('suitable_for_diet');

    const getValuesForField = (field: string): string[] => {
        switch (field) {
            case 'category': return categories || [];
            case 'cuisine': return cuisines || [];
            case 'difficulty': return difficulties || [];
            case 'protein': return proteins || [];
            case 'suitable_for_diet': return diets || [];
            default: return [];
        }
    };

    const addCriterion = () => {
        onChange([...criteria, { field: 'category', operator: 'eq', value: '' }]);
    };

    const updateCriterion = (index: number, updates: Partial<SearchCriterion>) => {
        const newCriteria = criteria.map((c, i) =>
            i === index ? { ...c, ...updates } : c
        );
        onChange(newCriteria);
    };

    const removeCriterion = (index: number) => {
        onChange(criteria.filter((_, i) => i !== index));
    };

    return (
        <VStack align="stretch" gap={3}>
            <Text fontSize="sm" color="fg.muted">
                Define search criteria. Recipes matching these criteria will be candidates for this slot.
            </Text>

            {criteria.length > 0 && (
                <VStack align="stretch" gap={2}>
                    {criteria.map((criterion, index) => (
                        <Box
                            key={index}
                            p={3}
                            borderWidth={1}
                            borderColor="border.default"
                            borderRadius="md"
                            bg="bg.surface"
                        >
                            <Grid templateColumns="1fr 100px 1fr auto" gap={2} alignItems="center">
                                <NativeSelect.Root size="sm">
                                    <NativeSelect.Field
                                        value={criterion.field}
                                        onChange={(e) => updateCriterion(index, { field: e.target.value, value: '' })}
                                        {...inputStyles}
                                    >
                                        {SEARCHABLE_FIELDS.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>

                                <NativeSelect.Root size="sm">
                                    <NativeSelect.Field
                                        value={criterion.operator}
                                        onChange={(e) => updateCriterion(index, { operator: e.target.value })}
                                        {...inputStyles}
                                    >
                                        {OPERATORS.map(op => (
                                            <option key={op.value} value={op.value}>{op.label}</option>
                                        ))}
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>

                                {criterion.operator === 'eq' ? (
                                    <NativeSelect.Root size="sm">
                                        <NativeSelect.Field
                                            value={String(criterion.value)}
                                            onChange={(e) => updateCriterion(index, { value: e.target.value })}
                                            {...inputStyles}
                                        >
                                            <option value="">Select...</option>
                                            {getValuesForField(criterion.field).map(v => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                ) : (
                                    <RecipeMultiSelect
                                        label=""
                                        placeholder="Select values..."
                                        options={getValuesForField(criterion.field).map(v => ({ label: v, value: v }))}
                                        value={String(criterion.value).split(',').filter(Boolean)}
                                        onChange={(vals) => updateCriterion(index, { value: vals.join(',') })}
                                    />
                                )}

                                <IconButton
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="red"
                                    onClick={() => removeCriterion(index)}
                                    aria-label="Remove criterion"
                                >
                                    <FaTimes />
                                </IconButton>
                            </Grid>
                        </Box>
                    ))}
                </VStack>
            )}

            <HStack gap={2}>
                <Button
                    size="xs"
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    onClick={addCriterion}
                >
                    <FaPlus /> Add Criterion
                </Button>
                {criteria.length > 0 && (
                    <Button
                        size="xs"
                        bg="gray.600"
                        color="white"
                        _hover={{ bg: "gray.700" }}
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? 'Hide Preview' : 'Preview Results'}
                    </Button>
                )}
            </HStack>

            {showPreview && criteria.length > 0 && (
                <SearchPreview criteria={criteria} />
            )}
        </VStack>
    );
};

// Search Preview Component
const SearchPreview = ({ criteria }: { criteria: SearchCriterion[] }) => {
    // Convert criteria to filters
    const filters: RecipeFilters = {};
    for (const criterion of criteria) {
        const { field, operator, value } = criterion;
        if (!value) continue;

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

    const hasValidCriteria = Object.keys(filters).length > 0;

    const { data: recipesData, isLoading } = useInfiniteRecipes(
        10,
        filters,
        { enabled: hasValidCriteria }
    );
    const recipes = recipesData?.pages.flatMap(p => p.recipes) || [];
    const totalCount = recipesData?.pages[0]?.totalCount || 0;

    return (
        <Box
            borderWidth={1}
            borderColor="border.default"
            borderRadius="md"
            bg="bg.surface"
            overflow="hidden"
        >
            <Box px={3} py={2} bg="vscode.inputBg" borderBottomWidth={1} borderColor="border.default">
                <Text fontSize="xs" fontWeight="bold" color="fg.muted">
                    {isLoading ? 'Loading...' : `${totalCount} matching recipe${totalCount !== 1 ? 's' : ''}`}
                </Text>
            </Box>
            {isLoading ? (
                <Center p={4}>
                    <Spinner size="sm" color="vscode.accent" />
                </Center>
            ) : recipes.length > 0 ? (
                <Box maxH="200px" overflowY="auto">
                    <VStack align="stretch" gap={0}>
                        {recipes.map((recipe) => (
                            <Box
                                key={recipe.core.id}
                                p={2}
                                borderBottomWidth={1}
                                borderColor="border.default"
                                _last={{ borderBottomWidth: 0 }}
                            >
                                <HStack gap={2}>
                                    <Text fontSize="sm" color="fg.default">{recipe.core.name}</Text>
                                    {recipe.core.category && <Badge colorPalette="orange" size="xs">{recipe.core.category}</Badge>}
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            ) : (
                <Center p={4}>
                    <Text fontSize="sm" color="fg.muted">No recipes match these criteria</Text>
                </Center>
            )}
        </Box>
    );
};

// Recipe Selector Component - Used by Direct and List editors
interface RecipeSelectorProps {
    mode: 'single' | 'multiple';
    selectedIds: string[];
    onSelect: (ids: string[]) => void;
    onCancel: () => void;
}

const RecipeSelector = ({ mode, selectedIds, onSelect, onCancel }: RecipeSelectorProps) => {
    const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);
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

    const searchResults = searchData?.pages.flatMap(p => p.recipes) || [];

    // Fetch selected recipes to show names
    const { data: selectedData } = useInfiniteRecipes(
        localSelectedIds.length || 1,
        { ids: localSelectedIds },
        { enabled: localSelectedIds.length > 0 }
    );
    const selectedRecipes = selectedData?.pages.flatMap(p => p.recipes) || [];
    const selectedRecipesMap = new Map(selectedRecipes.map(r => [r.core.id, r]));

    const handleToggleRecipe = (id: string) => {
        if (mode === 'single') {
            setLocalSelectedIds([id]);
        } else {
            if (localSelectedIds.includes(id)) {
                setLocalSelectedIds(localSelectedIds.filter(rid => rid !== id));
            } else {
                setLocalSelectedIds([...localSelectedIds, id]);
            }
        }
    };

    const handleRemoveSelected = (id: string) => {
        setLocalSelectedIds(localSelectedIds.filter(rid => rid !== id));
    };

    const handleFilterChange = (key: keyof RecipeFilters, value: unknown) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ sort: 'name' });
    };

    const hasActiveFilters = Object.keys(filters).some(k => k !== 'sort' && !!filters[k as keyof RecipeFilters]);

    return (
        <Box
            borderWidth={1}
            borderColor="border.default"
            borderRadius="md"
            bg="bg.surface"
            overflow="hidden"
        >
            {/* Header */}
            <HStack
                justify="space-between"
                p={3}
                borderBottomWidth={1}
                borderColor="border.default"
                bg="vscode.inputBg"
            >
                <Text fontWeight="medium" fontSize="sm" color="fg.default">
                    {mode === 'single' ? 'Select Recipe' : 'Select Recipes'}
                </Text>
                <HStack gap={2}>
                    <Button
                        size="xs"
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: "vscode.buttonHover" }}
                        onClick={() => onSelect(localSelectedIds)}
                    >
                        Done
                    </Button>
                    <Button
                        size="xs"
                        bg="gray.600"
                        color="white"
                        _hover={{ bg: "gray.700" }}
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                </HStack>
            </HStack>

            {/* Selected Recipes */}
            {localSelectedIds.length > 0 && (
                <Box p={3} borderBottomWidth={1} borderColor="border.default">
                    <Text fontSize="xs" fontWeight="bold" mb={2} color="fg.muted">
                        Selected ({localSelectedIds.length})
                    </Text>
                    <HStack wrap="wrap" gap={2}>
                        {localSelectedIds.map(id => {
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
                                    <Text mr={2} maxW="150px" truncate>
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
            <Box p={3} borderBottomWidth={1} borderColor="border.default">
                <VStack align="stretch" gap={2}>
                    <DebouncedInput
                        placeholder="Search recipes..."
                        value={filters.name || ''}
                        onChange={(val) => handleFilterChange('name', val)}
                        {...inputStyles}
                    />

                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={2}>
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
            <Box maxH="300px" overflowY="auto">
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
                                const isSelected = localSelectedIds.includes(recipe.core.id);
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
                        {hasNextPage && (
                            <Center p={2}>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => fetchNextPage()}
                                    loading={isFetchingNextPage}
                                    color="vscode.accent"
                                >
                                    Load More
                                </Button>
                            </Center>
                        )}
                    </VStack>
                )}
            </Box>
        </Box>
    );
};

export default TemplateForm;
