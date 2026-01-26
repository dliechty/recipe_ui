import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Heading,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import RecipeSearchSelector from './RecipeSearchSelector';

interface RecipeFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRecipeIds: string[];
    onApply: (ids: string[]) => void;
}

const RecipeFilterModal = ({
    isOpen,
    onClose,
    selectedRecipeIds,
    onApply
}: RecipeFilterModalProps) => {
    const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedRecipeIds);

    // Reset temp state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempSelectedIds(selectedRecipeIds);
        }
    }, [isOpen, selectedRecipeIds]);

    const handleApply = () => {
        onApply(tempSelectedIds);
        onClose();
    };

    const handleCancel = () => {
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
            bg="overlay.backdrop"
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
                    <Heading size="md" color="fg.default">Filter by Recipes</Heading>
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
                        selectedRecipeIds={tempSelectedIds}
                        onChange={setTempSelectedIds}
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
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: "vscode.buttonHover" }}
                        size="sm"
                        onClick={handleApply}
                    >
                        Apply Filter ({tempSelectedIds.length})
                    </Button>
                    <Button
                        variant="ghost"
                        bg="button.secondary"
                        color="white"
                        _hover={{ bg: "button.secondaryHover" }}
                        size="sm"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
};

export default RecipeFilterModal;