import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    IconButton,
    Badge,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { Meal } from '../../../client';

interface ShoppingListPanelProps {
    isOpen: boolean;
    onClose: () => void;
    meals: Meal[];
    recipeNames: Record<string, string>;
}

const ShoppingListPanel = ({ isOpen, onClose, meals, recipeNames }: ShoppingListPanelProps) => {
    if (!isOpen) return null;

    const unshoppedMeals = meals.filter(m => !m.is_shopped);

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
        >
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
                <Heading size="md" color="fg.default">Shopping List</Heading>
                <IconButton
                    aria-label="Close"
                    variant="ghost"
                    size="sm"
                    color="fg.muted"
                    _hover={{ color: "fg.default" }}
                    onClick={onClose}
                >
                    <FaTimes />
                </IconButton>
            </HStack>

            <VStack p={4} align="stretch" gap={4}>
                {unshoppedMeals.length === 0 ? (
                    <Text color="fg.muted" textAlign="center" py={8}>
                        No items to shop for. All queued meals have been shopped!
                    </Text>
                ) : (
                    unshoppedMeals.map(meal => (
                        <Box
                            key={meal.id}
                            borderWidth={1}
                            borderColor="border.default"
                            borderRadius="md"
                            p={3}
                        >
                            <HStack justify="space-between" mb={2}>
                                <Text fontWeight="semibold" color="fg.default" fontSize="sm">
                                    {meal.name || 'Untitled'}
                                </Text>
                                {meal.classification && (
                                    <Badge colorPalette="blue" size="sm">
                                        {meal.classification}
                                    </Badge>
                                )}
                            </HStack>
                            {meal.scheduled_date && (
                                <Text fontSize="xs" color="fg.muted" mb={2}>
                                    {new Date(meal.scheduled_date).toLocaleDateString()}
                                </Text>
                            )}
                            <VStack align="start" gap={1}>
                                {meal.items?.map(item => (
                                    <Text key={item.id} fontSize="sm" color="fg.default">
                                        {recipeNames[item.recipe_id] || 'Loading...'}
                                    </Text>
                                ))}
                                {(!meal.items || meal.items.length === 0) && (
                                    <Text fontSize="sm" color="fg.muted">No recipes</Text>
                                )}
                            </VStack>
                        </Box>
                    ))
                )}
            </VStack>
        </Box>
    );
};

export default ShoppingListPanel;
