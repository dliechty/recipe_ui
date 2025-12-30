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
import { RecipeIngredientCreate, ComponentCreate } from '../../../client';

interface RecipeIngredientsFormProps {
    components: ComponentCreate[];
    handleIngredientChange: (componentIndex: number, ingredientIndex: number, field: keyof RecipeIngredientCreate, value: string | number) => void;
    addIngredient: (componentIndex: number) => void;
    removeIngredient: (componentIndex: number, ingredientIndex: number) => void;
    handleComponentNameChange: (index: number, name: string) => void;
    addComponent: () => void;
    removeComponent: (index: number) => void;
}

const RecipeIngredientsForm = ({
    components,
    handleIngredientChange,
    addIngredient,
    removeIngredient,
    handleComponentNameChange,
    addComponent,
    removeComponent
}: RecipeIngredientsFormProps) => {
    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="sm">
            <Heading size="md" mb={6}>Ingredients</Heading>
            <VStack gap={8} align="stretch">
                {components.map((component, componentIndex) => (
                    <Box key={componentIndex} p={4} borderRadius="md" borderWidth={1} borderColor="border.subtle">
                        <HStack mb={4} justify="space-between">
                            <Input
                                value={component.name}
                                onChange={(e) => handleComponentNameChange(componentIndex, e.target.value)}
                                placeholder="Component Name (e.g., Main, Sauce)"
                                fontWeight="bold"
                                maxW="300px"
                            />
                            {components.length > 1 && (
                                <IconButton
                                    colorPalette="red"
                                    variant="ghost"
                                    onClick={() => removeComponent(componentIndex)}
                                    aria-label="Remove component"
                                    size="sm"
                                >
                                    <FaTrash />
                                </IconButton>
                            )}
                        </HStack>

                        <VStack gap={4} align="stretch">
                            {component.ingredients.map((ingredient, index) => (
                                <HStack key={index} gap={2} align="flex-start">
                                    <Box flex={2}>
                                        {index === 0 && <Text fontSize="sm" mb={1}>Name</Text>}
                                        <Input
                                            placeholder="Ingredient"
                                            value={ingredient.ingredient_name}
                                            onChange={(e) => handleIngredientChange(componentIndex, index, 'ingredient_name', e.target.value)}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        {index === 0 && <Text fontSize="sm" mb={1}>Quantity</Text>}
                                        <Input
                                            placeholder="Qty"
                                            value={ingredient.quantity}
                                            onChange={(e) => handleIngredientChange(componentIndex, index, 'quantity', e.target.value)}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        {index === 0 && <Text fontSize="sm" mb={1}>Unit</Text>}
                                        <Input
                                            placeholder="Unit"
                                            value={ingredient.unit}
                                            onChange={(e) => handleIngredientChange(componentIndex, index, 'unit', e.target.value)}
                                        />
                                    </Box>
                                    <Box flex={2}>
                                        {index === 0 && <Text fontSize="sm" mb={1}>Notes</Text>}
                                        <Input
                                            placeholder="Notes (optional)"
                                            value={ingredient.notes || ''}
                                            onChange={(e) => handleIngredientChange(componentIndex, index, 'notes', e.target.value)}
                                        />
                                    </Box>
                                    <Box pt={index === 0 ? 8 : 0}>
                                        <IconButton
                                            colorPalette="red"
                                            variant="ghost"
                                            onClick={() => removeIngredient(componentIndex, index)}
                                            aria-label="Remove ingredient"
                                        >
                                            <FaTrash />
                                        </IconButton>
                                    </Box>
                                </HStack>
                            ))}
                            <Button
                                onClick={() => addIngredient(componentIndex)}
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                                alignSelf="start"
                                size="sm"
                            >
                                <FaPlus /> Add Ingredient
                            </Button>
                        </VStack>
                    </Box>
                ))}

                <Button
                    onClick={addComponent}
                    variant="outline"
                    alignSelf="start"
                >
                    <FaPlus /> Add Component
                </Button>
            </VStack>
        </Box>
    );
};

export default RecipeIngredientsForm;
