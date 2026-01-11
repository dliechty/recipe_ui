import React, { useState } from 'react';
import {
    Box,
    Input,
    VStack,
    HStack,
    Heading,
    Button,
    NativeSelect,
    Text
} from '@chakra-ui/react';
import { MealCreate, MealStatus, MealClassification, MealItemBase } from '../../../client';
import RecipeSearchSelector from './RecipeSearchSelector';

interface MealFormProps {
    onSubmit: (data: MealCreate) => void;
    isLoading: boolean;
    initialData?: Partial<MealCreate>;
    onCancel?: () => void;
}

const MealForm = ({ onSubmit, isLoading, initialData, onCancel }: MealFormProps) => {
    const [name, setName] = useState(initialData?.name || '');
    const [status, setStatus] = useState<MealStatus>(initialData?.status || MealStatus.SCHEDULED);
    const [classification, setClassification] = useState<MealClassification | ''>(initialData?.classification || '');
    const [date, setDate] = useState(initialData?.date || '');
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(
        initialData?.items?.map(item => item.recipe_id) || []
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse recipe IDs from comma-separated string
        // Create meal items from selected recipe IDs
        const items: MealItemBase[] = selectedRecipeIds.map(recipe_id => ({ recipe_id }));

        const mealData: MealCreate = {
            name: name || null,
            status,
            classification: classification || null,
            date: date || null,
            items
        };

        onSubmit(mealData);
    };

    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="lg">
            <Heading size="md" mb={6}>Meal Details</Heading>

            <form onSubmit={handleSubmit}>
                <VStack gap={4} align="stretch">
                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Meal Name</Text>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter meal name"
                        />
                    </Box>

                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Status</Text>
                        <NativeSelect.Root>
                            <NativeSelect.Field
                                value={status}
                                onChange={(e) => setStatus(e.target.value as MealStatus)}
                            >
                                <option value={MealStatus.PROPOSED}>Proposed</option>
                                <option value={MealStatus.SCHEDULED}>Scheduled</option>
                                <option value={MealStatus.COOKED}>Cooked</option>
                            </NativeSelect.Field>
                        </NativeSelect.Root>
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
                        <Text as="label" mb={2} display="block" fontWeight="bold">Date (Optional)</Text>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </Box>

                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Recipes</Text>
                        <RecipeSearchSelector
                            selectedRecipeIds={selectedRecipeIds}
                            onChange={setSelectedRecipeIds}
                        />
                    </Box>

                    <HStack justify="flex-start" mt={4} gap={2}>
                        {onCancel && (
                            <Button
                                onClick={onCancel}
                                bg="gray.600"
                                color="white"
                                _hover={{ bg: "gray.700" }}
                                disabled={isLoading}
                                size="xs"
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
                            size="xs"
                        >
                            Save Meal
                        </Button>
                    </HStack>
                </VStack>
            </form>
        </Box>
    );
};

export default MealForm;
