import React from 'react';
import {
    Box,
    Button,
    Input,
    VStack,
    HStack,
    IconButton,
    Heading,
    Text
} from '@chakra-ui/react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { RecipeIngredientCreate } from '../../../client';

interface RecipeIngredientsFormProps {
    ingredients: RecipeIngredientCreate[];
    handleIngredientChange: (index: number, field: keyof RecipeIngredientCreate, value: string | number) => void;
    addIngredient: () => void;
    removeIngredient: (index: number) => void;
}

const RecipeIngredientsForm = ({
    ingredients,
    handleIngredientChange,
    addIngredient,
    removeIngredient
}: RecipeIngredientsFormProps) => {
    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="sm">
            <Heading size="md" mb={6}>Ingredients</Heading>
            <VStack gap={4} align="stretch">
                {ingredients.map((ingredient, index) => (
                    <HStack key={index} gap={2} align="flex-start">
                        <Box flex={2}>
                            {index === 0 && <Text fontSize="sm" mb={1}>Name</Text>}
                            <Input
                                placeholder="Ingredient"
                                value={ingredient.ingredient_name}
                                onChange={(e) => handleIngredientChange(index, 'ingredient_name', e.target.value)}
                            />
                        </Box>
                        <Box flex={1}>
                            {index === 0 && <Text fontSize="sm" mb={1}>Quantity</Text>}
                            <Input
                                placeholder="Qty"
                                value={ingredient.quantity}
                                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                            />
                        </Box>
                        <Box flex={1}>
                            {index === 0 && <Text fontSize="sm" mb={1}>Unit</Text>}
                            <Input
                                placeholder="Unit"
                                value={ingredient.unit}
                                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                            />
                        </Box>
                        <Box flex={2}>
                            {index === 0 && <Text fontSize="sm" mb={1}>Notes</Text>}
                            <Input
                                placeholder="Notes (optional)"
                                value={ingredient.notes || ''}
                                onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                            />
                        </Box>
                        <Box pt={index === 0 ? 8 : 0}>
                            <IconButton
                                colorPalette="red"
                                variant="ghost"
                                onClick={() => removeIngredient(index)}
                                aria-label="Remove ingredient"
                            >
                                <FaTrash />
                            </IconButton>
                        </Box>
                    </HStack>
                ))}
                <Button
                    onClick={addIngredient}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    alignSelf="start"
                >
                    <FaPlus /> Add Ingredient
                </Button>
            </VStack>
        </Box>
    );
};

export default RecipeIngredientsForm;
