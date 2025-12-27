import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Input,
    Textarea,
    VStack,
    HStack,
    Icon,
    IconButton,
    Heading,
    SimpleGrid,
    Text
} from '@chakra-ui/react';
import { FaTrash, FaPlus } from 'react-icons/fa';

const RecipeForm = ({ initialData, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        servings: 1,
        source: '',
        tags: [],
        ingredients: [],
        instructions: []
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Initialize with one empty ingredient and instruction for better UX
            setFormData(prev => ({
                ...prev,
                ingredients: [{ ingredient_name: '', quantity: '', unit: '', notes: '' }],
                instructions: [{ step_number: 1, description: '' }]
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name, valueString) => {
        setFormData(prev => ({ ...prev, [name]: parseInt(valueString) || 0 }));
    };

    // Ingredient Handlers
    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { ingredient_name: '', quantity: '', unit: '', notes: '' }]
        }));
    };

    const removeIngredient = (index) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    // Instruction Handlers
    const handleInstructionChange = (index, value) => {
        const newInstructions = [...formData.instructions];
        newInstructions[index] = { ...newInstructions[index], description: value };
        setFormData(prev => ({ ...prev, instructions: newInstructions }));
    };

    const addInstruction = () => {
        setFormData(prev => ({
            ...prev,
            instructions: [...prev.instructions, { step_number: prev.instructions.length + 1, description: '' }]
        }));
    };

    const removeInstruction = (index) => {
        const newInstructions = formData.instructions.filter((_, i) => i !== index)
            .map((inst, i) => ({ ...inst, step_number: i + 1 })); // Re-index steps
        setFormData(prev => ({ ...prev, instructions: newInstructions }));
    };

    // Tag Handlers
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name) return;
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
                <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="sm">
                    <Heading size="md" mb={6}>Basics</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="start">
                        {/* Left Column: Details */}
                        <VStack spacing={4} align="stretch" maxW="md">
                            <Box>
                                <Text as="label" mb={2} display="block" fontWeight="bold">Recipe Name</Text>
                                <Input data-testid="recipe-name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Chocolate Cake" />
                            </Box>

                            <Box>
                                <Text as="label" mb={2} display="block" fontWeight="bold">Source</Text>
                                <Input data-testid="recipe-source" name="source" value={formData.source || ''} onChange={handleChange} placeholder="e.g. Grandma's cookbook" />
                            </Box>

                            <HStack spacing={2}>
                                <Box flex={1}>
                                    <Text as="label" mb={2} display="block" fontWeight="bold">Active Time (min)</Text>
                                    <Input data-testid="recipe-prep-time" type="number" min={0} value={formData.prep_time_minutes} onChange={(e) => handleNumberChange('prep_time_minutes', e.target.value)} />
                                </Box>

                                <Box flex={1}>
                                    <Text as="label" mb={2} display="block" fontWeight="bold">Cook Time (min)</Text>
                                    <Input data-testid="recipe-cook-time" type="number" min={0} value={formData.cook_time_minutes} onChange={(e) => handleNumberChange('cook_time_minutes', e.target.value)} />
                                </Box>
                            </HStack>

                            <HStack spacing={2} align="start">
                                <Box flex={1}>
                                    <Text as="label" mb={2} display="block" fontWeight="bold">Yield (servings)</Text>
                                    <Input data-testid="recipe-servings" type="number" min={1} value={formData.servings} onChange={(e) => handleNumberChange('servings', e.target.value)} />
                                </Box>

                                <Box flex={1}>
                                    <Text as="label" mb={2} display="block" fontWeight="bold">Tags (Press Enter to add)</Text>
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Add tags..."
                                    />
                                    <HStack mt={2} wrap="wrap" spacing={2}>
                                        {formData.tags.map((tag, index) => (
                                            <Box key={index} px={2} py={1} bg="vscode.button" color="white" borderRadius="md" fontSize="sm" display="flex" alignItems="center">
                                                {tag}
                                                <Icon as={FaTrash} ml={2} cursor="pointer" onClick={() => removeTag(tag)} boxSize={3} />
                                            </Box>
                                        ))}
                                    </HStack>
                                </Box>
                            </HStack>
                        </VStack>

                        {/* Right Column: Description */}
                        <Box>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Description</Text>
                            <Textarea
                                data-testid="recipe-description"
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                placeholder="Brief description of the recipe"
                                rows={8}
                            />
                        </Box>
                    </SimpleGrid>
                </Box>

                <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="sm">
                    <Heading size="md" mb={6}>Ingredients</Heading>
                    <VStack spacing={4} align="stretch">
                        {formData.ingredients.map((ingredient, index) => (
                            <HStack key={index} spacing={2} align="flex-start">
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
                                        icon={<FaTrash />}
                                        aria-label="Remove ingredient"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => removeIngredient(index)}
                                    />
                                </Box>
                            </HStack>
                        ))}
                        <Button
                            leftIcon={<FaPlus />}
                            onClick={addIngredient}
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                            alignSelf="start"
                        >
                            Add Ingredient
                        </Button>
                    </VStack>
                </Box>

                <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="sm">
                    <Heading size="md" mb={6}>Instructions</Heading>
                    <VStack spacing={4} align="stretch">
                        {formData.instructions.map((instruction, index) => (
                            <HStack key={index} align="flex-start">
                                <Box pt={2} minW="24px" fontWeight="bold" color="fg.muted">
                                    {index + 1}.
                                </Box>
                                <Box flex={1}>
                                    <Textarea
                                        placeholder={`Step ${index + 1} description`}
                                        value={instruction.description}
                                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                                        rows={2}
                                    />
                                </Box>
                                <Box pt={1}>
                                    <IconButton
                                        icon={<FaTrash />}
                                        aria-label="Remove instruction"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => removeInstruction(index)}
                                    />
                                </Box>
                            </HStack>
                        ))}
                        <Button
                            leftIcon={<FaPlus />}
                            onClick={addInstruction}
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                            alignSelf="start"
                        >
                            Add Step
                        </Button>
                    </VStack>
                </Box>

                <Button
                    type="submit"
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    size="lg"
                    isLoading={isLoading}
                    loadingText="Saving..."
                >
                    Save Recipe
                </Button>
            </VStack>
        </form>
    );
};

export default RecipeForm;
