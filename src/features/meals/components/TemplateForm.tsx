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
    Card
} from '@chakra-ui/react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { MealTemplateCreate, MealClassification, MealTemplateSlotCreate, MealTemplateSlotStrategy } from '../../../client';

interface TemplateFormProps {
    onSubmit: (data: MealTemplateCreate) => void;
    isLoading: boolean;
    initialData?: Partial<MealTemplateCreate>;
    onCancel?: () => void;
}

interface SlotWithId extends MealTemplateSlotCreate {
    id: string;
}

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
            slot.id === id ? { ...slot, strategy } : slot
        ));
    };

    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="lg">
            <Heading size="md" mb={6}>Template Details</Heading>

            <form onSubmit={handleSubmit}>
                <VStack gap={4} align="stretch">
                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Template Name</Text>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter template name"
                            required
                        />
                    </Box>

                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Classification</Text>
                        <NativeSelect.Root>
                            <NativeSelect.Field
                                value={classification}
                                onChange={(e) => setClassification(e.target.value as MealClassification)}
                            >
                                <option value="">Select classification...</option>
                                <option value={MealClassification.BREAKFAST}>Breakfast</option>
                                <option value={MealClassification.BRUNCH}>Brunch</option>
                                <option value={MealClassification.LUNCH}>Lunch</option>
                                <option value={MealClassification.DINNER}>Dinner</option>
                                <option value={MealClassification.SNACK}>Snack</option>
                            </NativeSelect.Field>
                        </NativeSelect.Root>
                    </Box>

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

                        <VStack gap={3} align="stretch">
                            {slots.map((slot, index) => (
                                <Card.Root key={slot.id} variant="outline" p={3}>
                                    <HStack gap={3} align="start">
                                        <Box flex="1">
                                            <Box>
                                                <Text as="label" mb={2} display="block" fontWeight="bold">Slot {index + 1} Strategy</Text>
                                                <NativeSelect.Root>
                                                    <NativeSelect.Field
                                                        value={slot.strategy}
                                                        onChange={(e) => updateSlotStrategy(slot.id, e.target.value as MealTemplateSlotStrategy)}
                                                    >
                                                        <option value={MealTemplateSlotStrategy.DIRECT}>Direct</option>
                                                        <option value={MealTemplateSlotStrategy.LIST}>List</option>
                                                        <option value={MealTemplateSlotStrategy.SEARCH}>Search</option>
                                                    </NativeSelect.Field>
                                                </NativeSelect.Root>
                                                <Text fontSize="xs" color="fg.muted" mt={1}>
                                                    {slot.strategy === MealTemplateSlotStrategy.DIRECT && "Recipe selected directly"}
                                                    {slot.strategy === MealTemplateSlotStrategy.LIST && "Recipe chosen from a list"}
                                                    {slot.strategy === MealTemplateSlotStrategy.SEARCH && "Recipe found via search criteria"}
                                                </Text>
                                            </Box>
                                        </Box>
                                        <IconButton
                                            onClick={() => removeSlot(slot.id)}
                                            aria-label="Remove slot"
                                            size="sm"
                                            colorPalette="red"
                                            variant="ghost"
                                            disabled={slots.length === 1}
                                            type="button"
                                            mt={6}
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    </HStack>
                                </Card.Root>
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

export default TemplateForm;
