import React from 'react';
import {
    Box,
    Button,
    VStack,
    HStack,
    IconButton,
    Heading,
    Textarea,
    Tooltip
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaGripVertical } from 'react-icons/fa';
import { InstructionCreate } from '../../../client';
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

interface InstructionWithId extends InstructionCreate {
    id: string;
}

interface RecipeInstructionsFormProps {
    instructions: InstructionWithId[];
    handleInstructionChange: (index: number, value: string) => void;
    addInstruction: () => void;
    removeInstruction: (index: number) => void;
    reorderInstructions: (fromIndex: number, toIndex: number) => void;
}

interface SortableInstructionRowProps {
    instruction: InstructionWithId;
    index: number;
    handleInstructionChange: (index: number, value: string) => void;
    removeInstruction: (index: number) => void;
    id: string;
}

const SortableInstructionRow = ({
    instruction,
    index,
    handleInstructionChange,
    removeInstruction,
    id
}: SortableInstructionRowProps) => {
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
            align="start"
            bg="bg.surface"
        >
            <IconButton
                aria-label="Drag to reorder"
                variant="ghost"
                cursor="grab"
                color="fg.muted"
                size="sm"
                mt={2}
                {...attributes}
                {...listeners}
                _active={{ cursor: 'grabbing' }}
            >
                <FaGripVertical />
            </IconButton>
            <Box flex={1}>
                {/* We just show step number as label or placeholder, reordering updates them */}
                <Textarea
                    placeholder={`Step ${index + 1}`}
                    value={instruction.text}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    bg="vscode.inputBg"
                    borderColor="border.default"
                    color="fg.default"
                    _hover={{ borderColor: 'vscode.accent' }}
                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                    rows={2}
                    resize="vertical"
                />
            </Box>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <IconButton
                        colorPalette="red"
                        variant="ghost"
                        onClick={() => removeInstruction(index)}
                        aria-label="Remove step"
                        size="sm"
                        mt={2}
                    >
                        <FaTrash />
                    </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                    <Tooltip.Content>
                        Delete step
                    </Tooltip.Content>
                </Tooltip.Positioner>
            </Tooltip.Root>
        </HStack>
    );
};

const RecipeInstructionsForm = ({
    instructions,
    handleInstructionChange,
    addInstruction,
    removeInstruction,
    reorderInstructions
}: RecipeInstructionsFormProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = instructions.findIndex(i => i.id === active.id);
            const newIndex = instructions.findIndex(i => i.id === over.id);

            reorderInstructions(oldIndex, newIndex);
        }
    };

    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="lg">
            <Heading size="md" mb={6}>Instructions</Heading>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={instructions.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <VStack gap={4} align="stretch">
                        {instructions.map((instruction, index) => (
                            <SortableInstructionRow
                                key={instruction.id}
                                id={instruction.id}
                                instruction={instruction}
                                index={index}
                                handleInstructionChange={handleInstructionChange}
                                removeInstruction={removeInstruction}
                            />
                        ))}
                    </VStack>
                </SortableContext>
            </DndContext>

            <Button
                onClick={addInstruction}
                bg="vscode.button"
                color="white"
                _hover={{ bg: "vscode.buttonHover" }}
                alignSelf="start"
                size="xs"
                mt={4}
                ml={10}
            >
                <FaPlus /> Add Step
            </Button>
        </Box>
    );
};

export default RecipeInstructionsForm;
