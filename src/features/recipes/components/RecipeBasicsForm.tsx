import React from 'react';
import {
    Box,
    Input,
    Textarea,
    VStack,
    HStack,
    Heading,
    SimpleGrid,
    Text,
    NativeSelect
} from '@chakra-ui/react';
import { RecipeCoreCreate, RecipeTimes, DifficultyLevel } from '../../../client';

interface RecipeBasicsFormProps {
    core: RecipeCoreCreate;
    times: RecipeTimes;
    handleCoreChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleCoreNumberChange: (name: string, valueString: string) => void;
    handleTimesChange: (name: string, valueString: string) => void;
}

const RecipeBasicsForm = ({
    core,
    times,
    handleCoreChange,
    handleCoreNumberChange,
    handleTimesChange
}: RecipeBasicsFormProps) => {
    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="sm">
            <Heading size="md" mb={6}>Basics</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={10} alignItems="start">
                {/* Left Column: Details */}
                <VStack gap={4} align="stretch" maxW="lg">
                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Recipe Name</Text>
                        <Input data-testid="recipe-name" name="name" value={core.name} onChange={handleCoreChange} placeholder="e.g. Chocolate Cake" />
                    </Box>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Source</Text>
                            <Input data-testid="recipe-source" name="source" value={core.source || ''} onChange={handleCoreChange} placeholder="e.g. Grandma's cookbook" />
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Source URL</Text>
                            <Input data-testid="recipe-source-url" name="source_url" value={core.source_url || ''} onChange={handleCoreChange} placeholder="https://example.com" />
                        </Box>
                    </HStack>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Difficulty</Text>
                            <NativeSelect.Root>
                                <NativeSelect.Field data-testid="recipe-difficulty" name="difficulty" value={core.difficulty || ''} onChange={handleCoreChange} placeholder="Select difficulty">
                                    {Object.values(DifficultyLevel).map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                            </NativeSelect.Root>
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Cuisine</Text>
                            <Input data-testid="recipe-cuisine" name="cuisine" value={core.cuisine || ''} onChange={handleCoreChange} placeholder="e.g. Italian" />
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Category</Text>
                            <Input data-testid="recipe-category" name="category" value={core.category || ''} onChange={handleCoreChange} placeholder="e.g. Dessert" />
                        </Box>
                    </HStack>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Active Time (min)</Text>
                            <Input data-testid="recipe-active-time" type="number" min={0} value={times.active_time_minutes || 0} onChange={(e) => handleTimesChange('active_time_minutes', e.target.value)} />
                        </Box>

                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Cook Time (min)</Text>
                            <Input data-testid="recipe-cook-time" type="number" min={0} value={times.cook_time_minutes || 0} onChange={(e) => handleTimesChange('cook_time_minutes', e.target.value)} />
                        </Box>
                    </HStack>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Prep Time (min)</Text>
                            <Input data-testid="recipe-prep-time" type="number" min={0} value={times.prep_time_minutes || 0} onChange={(e) => handleTimesChange('prep_time_minutes', e.target.value)} />
                        </Box>

                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Total Time (min)</Text>
                            <Input data-testid="recipe-total-time" type="number" min={0} value={times.total_time_minutes || 0} onChange={(e) => handleTimesChange('total_time_minutes', e.target.value)} />
                        </Box>
                    </HStack>

                    <HStack gap={2} align="start">
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Yield (amount)</Text>
                            <Input data-testid="recipe-yield" type="number" min={1} value={core.yield_amount || 1} onChange={(e) => handleCoreNumberChange('yield_amount', e.target.value)} />
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Yield (unit)</Text>
                            <Input data-testid="recipe-yield-unit" name="yield_unit" value={core.yield_unit || ''} onChange={handleCoreChange} placeholder="servings" />
                        </Box>
                    </HStack>
                </VStack>

                {/* Right Column: Descriptions */}
                <Box>
                    <Text as="label" mb={2} display="block" fontWeight="bold">Description</Text>
                    <Textarea
                        data-testid="recipe-description"
                        name="description"
                        value={core.description || ''}
                        onChange={handleCoreChange}
                        placeholder="Detailed description"
                        rows={15}
                    />
                </Box>
            </SimpleGrid>
        </Box>
    );
};

export default RecipeBasicsForm;
