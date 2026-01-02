import React from 'react';
import {
    Box,
    Button,
    Input,
    VStack,
    HStack,
    IconButton,
    Heading,
    Text,
    Tooltip
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaGripVertical } from 'react-icons/fa';
import { RecipeIngredientCreate, ComponentCreate } from '../../../client';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RecipeIngredientsFormProps {
    components: ComponentCreate[];
    handleIngredientChange: (componentIndex: number, ingredientIndex: number, field: keyof RecipeIngredientCreate, value: string | number) => void;
    addIngredient: (componentIndex: number) => void;
    removeIngredient: (componentIndex: number, ingredientIndex: number) => void;
    handleComponentNameChange: (index: number, name: string) => void;
    addComponent: () => void;
    removeComponent: (index: number) => void;
    reorderIngredients: (componentIndex: number, fromIndex: number, toIndex: number) => void;
}

interface SortableIngredientRowProps {
    ingredient: RecipeIngredientCreate;
    index: number;
    componentIndex: number;
    handleIngredientChange: (componentIndex: number, ingredientIndex: number, field: keyof RecipeIngredientCreate, value: string | number) => void;
    removeIngredient: (componentIndex: number, ingredientIndex: number) => void;
    id: string;
}

const SortableIngredientRow = ({
    ingredient,
    index,
    componentIndex,
    handleIngredientChange,
    removeIngredient,
    id
}: SortableIngredientRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <HStack
            ref={setNodeRef}
            style={style}
            gap={2}
            align="end"
            bg="bg.surface" // Ensure background is opaque when dragging
        >
            <IconButton
                aria-label="Drag to reorder"
                variant="ghost"
                cursor="grab"
                color="fg.muted"
                size="sm"
                {...attributes}
                {...listeners}
                _active={{ cursor: 'grabbing' }}
            >
                <FaGripVertical />
            </IconButton>
            <Box flex={2}>
                {index === 0 && <Text fontSize="sm" mb={1}>Name</Text>}
                <Input
                    placeholder="Ingredient"
                    value={ingredient.ingredient_name}
                    onChange={(e) => handleIngredientChange(componentIndex, index, 'ingredient_name', e.target.value)}
                    bg="vscode.inputBg"
                    borderColor="border.default"
                    color="fg.default"
                    _hover={{ borderColor: 'vscode.accent' }}
                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                />
            </Box>
            <Box flex={1}>
                {index === 0 && <Text fontSize="sm" mb={1}>Quantity</Text>}
                <Input
                    placeholder="Qty"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(componentIndex, index, 'quantity', e.target.value)}
                    bg="vscode.inputBg"
                    borderColor="border.default"
                    color="fg.default"
                    _hover={{ borderColor: 'vscode.accent' }}
                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                />
            </Box>
            <Box flex={1}>
                {index === 0 && <Text fontSize="sm" mb={1}>Unit</Text>}
                <Input
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(componentIndex, index, 'unit', e.target.value)}
                    bg="vscode.inputBg"
                    borderColor="border.default"
                    color="fg.default"
                    _hover={{ borderColor: 'vscode.accent' }}
                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                />
            </Box>
            <Box flex={2}>
                {index === 0 && <Text fontSize="sm" mb={1}>Notes</Text>}
                <Input
                    placeholder="Notes (optional)"
                    value={ingredient.notes || ''}
                    onChange={(e) => handleIngredientChange(componentIndex, index, 'notes', e.target.value)}
                    bg="vscode.inputBg"
                    borderColor="border.default"
                    color="fg.default"
                    _hover={{ borderColor: 'vscode.accent' }}
                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                />
            </Box>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <IconButton
                        colorPalette="red"
                        variant="ghost"
                        onClick={() => removeIngredient(componentIndex, index)}
                        aria-label="Remove ingredient"
                        size="sm"
                    >
                        <FaTrash />
                    </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                    <Tooltip.Content>
                        Delete ingredient
                    </Tooltip.Content>
                </Tooltip.Positioner>
            </Tooltip.Root>
        </HStack>
    );
};

const RecipeIngredientsForm = ({
    components,
    handleIngredientChange,
    addIngredient,
    removeIngredient,
    handleComponentNameChange,
    addComponent,
    removeComponent,
    reorderIngredients
}: RecipeIngredientsFormProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent, componentIndex: number) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // IDs are formatted as `comp-${componentIndex}-ing-${index}`
            // or just use index if we can get it from active.id/over.id, but simple index is risky if items change.
            // Actually, we can pass index data or parse IDs.
            // Let's use simple IDs: `c${componentIndex}-i${index}`
            // But if we reorder, the index in ID changes? No, ID should be unique to the content if possible?
            // But here ingredients don't have IDs yet (creating new recipe).
            // So we MUST use index, but we have to be careful.
            // If we use index as ID, dnd-kit might get confused during the move.
            // Better to assign a unique ID to each item in the form state?
            // User didn't ask for that complex refactor.
            // Standard approach for simple lists: use index as ID *if* items are not keyed by database ID.
            // But wait, `useSortable({ id })` needs a stable ID.
            // If I use index "0", "1", "2"... and I move "0" to "2", the item at "0" becomes the old "1".
            // If key={index}, React re-renders everything.
            // If I use a random ID on creation, I need to persist it in the form state.
            // Let's try to simulate stable IDs by index for now, but `dnd-kit` really wants stable IDs.
            // However, `ingredients` array is what we have.
            // Let's assume we can generate a temporary ID based on something... or just use the index but expect re-renders.
            // Actually `dnd-kit` examples often use `id` property.
            // Since we are editing, maybe we can assume the list order IS the identity for now.
            // But `active.id` will be the index.

            // Parsing IDs: `c${componentIndex}-i${index}`
            const oldIndex = parseInt((active.id as string).split('-i')[1]);
            const newIndex = parseInt((over.id as string).split('-i')[1]);

            reorderIngredients(componentIndex, oldIndex, newIndex);
        }
    };

    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="lg">
            <Heading size="md" mb={6}>Ingredients</Heading>
            <VStack gap={8} align="stretch">
                {components.map((component, componentIndex) => (
                    <Box key={componentIndex} p={4} borderRadius="md" borderWidth={1} borderColor="border.default">
                        <HStack mb={4} justify="space-between">
                            {component.name === 'Main' ? (
                                <Heading size="sm" mt={2} mb={2}>{component.name}</Heading>
                            ) : (
                                <Input
                                    value={component.name}
                                    onChange={(e) => handleComponentNameChange(componentIndex, e.target.value)}
                                    placeholder="Component Name (e.g., Main, Sauce)"
                                    fontWeight="bold"
                                    maxW="300px"
                                    bg="vscode.inputBg"
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent' }}
                                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                />
                            )}
                            {components.length > 1 && component.name !== 'Main' && (
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <IconButton
                                            colorPalette="red"
                                            variant="ghost"
                                            onClick={() => removeComponent(componentIndex)}
                                            aria-label="Remove component"
                                            size="sm"
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    </Tooltip.Trigger>
                                    <Tooltip.Positioner>
                                        <Tooltip.Content>
                                            Delete component
                                        </Tooltip.Content>
                                    </Tooltip.Positioner>
                                </Tooltip.Root>
                            )}
                        </HStack>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, componentIndex)}
                        >
                            <SortableContext
                                items={component.ingredients.map((_, i) => `c${componentIndex}-i${i}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                <VStack gap={4} align="stretch">
                                    {component.ingredients.map((ingredient, index) => (
                                        <SortableIngredientRow
                                            key={`c${componentIndex}-i${index}`}
                                            id={`c${componentIndex}-i${index}`}
                                            ingredient={ingredient}
                                            index={index}
                                            componentIndex={componentIndex}
                                            handleIngredientChange={handleIngredientChange}
                                            removeIngredient={removeIngredient}
                                        />
                                    ))}
                                </VStack>
                            </SortableContext>
                        </DndContext>

                        <Button
                            onClick={() => addIngredient(componentIndex)}
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                            alignSelf="start"
                            size="sm"
                            mt={4}
                            ml={10}
                        >
                            <FaPlus /> Add Ingredient
                        </Button>
                    </Box>
                ))}

                <Button
                    onClick={addComponent}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    alignSelf="start"
                    size="sm"
                >
                    <FaPlus /> Add Component
                </Button>
            </VStack>
        </Box>
    );
};

export default RecipeIngredientsForm;
