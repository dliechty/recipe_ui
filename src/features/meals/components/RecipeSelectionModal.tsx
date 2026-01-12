import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Heading,
    HStack,
    Icon
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import RecipeSearchSelector from './RecipeSearchSelector';
import { useUpdateMeal } from '../../../hooks/useMeals';
import { toaster } from '../../../toaster';

interface RecipeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealId: string;
    initialRecipeIds: string[];
}

const RecipeSelectionModal = ({
    isOpen,
    onClose,
    mealId,
    initialRecipeIds
}: RecipeSelectionModalProps) => {
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(initialRecipeIds);
    const updateMeal = useUpdateMeal();

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedRecipeIds(initialRecipeIds);
        }
    }, [isOpen, initialRecipeIds]);

    const handleSave = () => {
        updateMeal.mutate(
            {
                id: mealId,
                requestBody: {
                    items: selectedRecipeIds.map(recipe_id => ({ recipe_id }))
                }
            },
            {
                onSuccess: () => {
                    toaster.create({
                        title: "Recipes updated",
                        type: "success",
                    });
                    onClose();
                },
                onError: (error: Error) => {
                    toaster.create({
                        title: "Failed to update recipes",
                        description: error.message,
                        type: "error",
                    });
                }
            }
        );
    };

    const handleCancel = () => {
        setSelectedRecipeIds(initialRecipeIds);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.6)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            backdropFilter="blur(4px)"
            onClick={(e) => {
                // Close on backdrop click
                if (e.target === e.currentTarget) {
                    handleCancel();
                }
            }}
        >
            <Box
                bg="bg.surface"
                borderRadius="xl"
                maxW="900px"
                w="90%"
                maxH="85vh"
                display="flex"
                flexDirection="column"
                boxShadow="xl"
                borderWidth={1}
                borderColor="border.default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <HStack
                    justify="space-between"
                    p={4}
                    borderBottomWidth={1}
                    borderColor="border.default"
                >
                    <Heading size="md" color="fg.default">Select Recipes</Heading>
                    <Button
                        size="xs"
                        variant="ghost"
                        onClick={handleCancel}
                        color="fg.muted"
                        _hover={{ color: "fg.default" }}
                    >
                        <Icon as={FaTimes} />
                    </Button>
                </HStack>

                {/* Body */}
                <Box flex={1} overflow="auto" p={4}>
                    <RecipeSearchSelector
                        selectedRecipeIds={selectedRecipeIds}
                        onChange={setSelectedRecipeIds}
                    />
                </Box>

                {/* Footer */}
                <HStack
                    justify="flex-end"
                    p={4}
                    gap={3}
                    borderTopWidth={1}
                    borderColor="border.default"
                >
                    <Button
                        variant="ghost"
                        color="fg.muted"
                        onClick={handleCancel}
                        disabled={updateMeal.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: "vscode.buttonHover" }}
                        onClick={handleSave}
                        loading={updateMeal.isPending}
                    >
                        Save Changes
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
};

export default RecipeSelectionModal;
