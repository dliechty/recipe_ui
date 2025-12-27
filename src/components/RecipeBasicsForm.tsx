import React from 'react';
import {
    Box,
    Input,
    Textarea,
    VStack,
    HStack,
    Icon,
    Heading,
    SimpleGrid,
    Text
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { RecipeCreate } from '../client';

interface RecipeBasicsFormProps {
    formData: RecipeCreate;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNumberChange: (name: keyof RecipeCreate, valueString: string) => void;
    tagInput: string;
    setTagInput: (value: string) => void;
    handleTagKeyDown: (e: React.KeyboardEvent) => void;
    removeTag: (tag: string) => void;
}

const RecipeBasicsForm = ({
    formData,
    handleChange,
    handleNumberChange,
    tagInput,
    setTagInput,
    handleTagKeyDown,
    removeTag
}: RecipeBasicsFormProps) => {
    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="sm">
            <Heading size="md" mb={6}>Basics</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={10} alignItems="start">
                {/* Left Column: Details */}
                <VStack gap={4} align="stretch" maxW="md">
                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Recipe Name</Text>
                        <Input data-testid="recipe-name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Chocolate Cake" />
                    </Box>

                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Source</Text>
                        <Input data-testid="recipe-source" name="source" value={formData.source || ''} onChange={handleChange} placeholder="e.g. Grandma's cookbook" />
                    </Box>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Active Time (min)</Text>
                            <Input data-testid="recipe-prep-time" type="number" min={0} value={formData.prep_time_minutes} onChange={(e) => handleNumberChange('prep_time_minutes', e.target.value)} />
                        </Box>

                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Cook Time (min)</Text>
                            <Input data-testid="recipe-cook-time" type="number" min={0} value={formData.cook_time_minutes} onChange={(e) => handleNumberChange('cook_time_minutes', e.target.value)} />
                        </Box>
                    </HStack>

                    <HStack gap={2} align="start">
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
                            <HStack mt={2} wrap="wrap" gap={2}>
                                {(formData.tags || []).map((tag, index) => (
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
    );
};

export default RecipeBasicsForm;
