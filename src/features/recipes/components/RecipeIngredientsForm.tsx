import {
    Box,
    Button,
    Flex,
    Input,
    VStack,
    HStack,
    IconButton,
    Heading,
    Text,
    Tooltip
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaGripVertical } from 'react-icons/fa';
import { RecipeIngredientCreate } from '../../../client';
import { inputStyles } from '../../../utils/styles';
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

interface RecipeIngredientWithId extends RecipeIngredientCreate {
    id: string;
}

interface ComponentWithId {
    name: string;
    ingredients: RecipeIngredientWithId[];
}

interface RecipeIngredientsFormProps {
    components: ComponentWithId[];
    handleIngredientChange: (componentIndex: number, ingredientIndex: number, field: keyof RecipeIngredientCreate, value: string | number) => void;
    addIngredient: (componentIndex: number) => void;
    removeIngredient: (componentIndex: number, ingredientIndex: number) => void;
    handleComponentNameChange: (index: number, name: string) => void;
    addComponent: () => void;
    removeComponent: (index: number) => void;
    reorderIngredients: (componentIndex: number, fromIndex: number, toIndex: number) => void;
}

interface SortableIngredientRowProps {
    ingredient: RecipeIngredientWithId;
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
        <Flex
            ref={setNodeRef}
            style={style}
            gap={2}
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "end" }}
            bg="bg.surface"
            p={{ base: 3, md: 0 }}
            borderRadius={{ base: "md", md: "none" }}
            borderWidth={{ base: 1, md: 0 }}
            borderColor="border.default"
        >
            {/* Drag handle + delete row on mobile, inline on desktop */}
            <HStack
                display={{ base: "flex", md: "contents" }}
                justify="space-between"
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
                {/* Delete button visible on mobile in the top row */}
                <Box display={{ base: "block", md: "none" }}>
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
                </Box>
            </HStack>
            <Box flex={2}>
                <Text fontSize="sm" mb={1} display={{ base: "block", md: index === 0 ? "block" : "none" }}>Name</Text>
                <Input
                    placeholder="Ingredient"
                    value={ingredient.ingredient_name}
                    onChange={(e) => handleIngredientChange(componentIndex, index, 'ingredient_name', e.target.value)}
                    {...inputStyles}
                />
            </Box>
            <Flex gap={2} direction="row">
                <Box flex={1}>
                    <Text fontSize="sm" mb={1} display={{ base: "block", md: index === 0 ? "block" : "none" }}>Quantity</Text>
                    <Input
                        placeholder="Qty"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(componentIndex, index, 'quantity', e.target.value)}
                        {...inputStyles}
                    />
                </Box>
                <Box flex={1}>
                    <Text fontSize="sm" mb={1} display={{ base: "block", md: index === 0 ? "block" : "none" }}>Unit</Text>
                    <Input
                        placeholder="Unit"
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(componentIndex, index, 'unit', e.target.value)}
                        {...inputStyles}
                    />
                </Box>
            </Flex>
            <Box flex={2}>
                <Text fontSize="sm" mb={1} display={{ base: "block", md: index === 0 ? "block" : "none" }}>Notes</Text>
                <Input
                    placeholder="Notes (optional)"
                    value={ingredient.notes || ''}
                    onChange={(e) => handleIngredientChange(componentIndex, index, 'notes', e.target.value)}
                    {...inputStyles}
                />
            </Box>
            {/* Delete button on desktop - inline at end of row */}
            <Box display={{ base: "none", md: "block" }}>
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
            </Box>
        </Flex>
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
            const oldIndex = components[componentIndex].ingredients.findIndex(i => i.id === active.id);
            const newIndex = components[componentIndex].ingredients.findIndex(i => i.id === over.id);

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
                                    {...inputStyles}
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
                                items={component.ingredients.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <VStack gap={4} align="stretch">
                                    {component.ingredients.map((ingredient, index) => (
                                        <SortableIngredientRow
                                            key={ingredient.id}
                                            id={ingredient.id}
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
                            color="button.text"
                            _hover={{ bg: "vscode.buttonHover" }}
                            alignSelf="start"
                            size="xs"
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
                    color="button.text"
                    _hover={{ bg: "vscode.buttonHover" }}
                    alignSelf="start"
                    size="xs"
                >
                    <FaPlus /> Add Component
                </Button>
            </VStack>
        </Box>
    );
};

export default RecipeIngredientsForm;
