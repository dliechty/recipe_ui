import React, { useState, useEffect } from 'react';
import {
    Box,
    Input,
    Textarea,
    VStack,
    HStack,
    Heading,
    SimpleGrid,
    Text,
    NativeSelect,
    Button
} from '@chakra-ui/react';
import { RecipeCoreCreate, RecipeTimes, DifficultyLevel, RecipeNutrition, DietType } from '../../../client';
import DietSelect from './DietSelect';

interface RecipeBasicsFormProps {
    core: RecipeCoreCreate;
    times: RecipeTimes;
    nutrition: RecipeNutrition;
    diet: DietType[];
    handleCoreChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleCoreNumberChange: (name: string, valueString: string) => void;
    handleTimesChange: (name: string, valueString: string) => void;
    handleNutritionChange: (name: string, valueString: string) => void;
    handleDietChange: (selectedDiets: DietType[]) => void;
    parentRecipeId?: string | null;
    handleParentIdChange: (id: string | null) => void;
}

const RecipeBasicsForm = ({
    core,
    times,
    nutrition,
    diet,
    handleCoreChange,
    handleCoreNumberChange,
    handleTimesChange,
    handleNutritionChange,
    handleDietChange,
    parentRecipeId,
    handleParentIdChange
}: RecipeBasicsFormProps) => {
    const [isParentModalOpen, setIsParentModalOpen] = useState(false);
    const [tempParentId, setTempParentId] = useState('');

    const openParentModal = () => {
        setTempParentId(parentRecipeId || '');
        setIsParentModalOpen(true);
    };

    const saveParentId = () => {
        handleParentIdChange(tempParentId || null);
        setIsParentModalOpen(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isParentModalOpen) {
                setIsParentModalOpen(false);
            }
        };

        if (isParentModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isParentModalOpen]);

    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="lg">
            <HStack justify="space-between" mb={6}>
                <Heading size="md">Basics</Heading>
                <Button variant="plain" size="sm" color="vscode.accent" onClick={openParentModal}>
                    {parentRecipeId ? `Edit Parent: ${parentRecipeId}` : 'Add Parent'}
                </Button>
            </HStack>

            {isParentModalOpen && (
                <Box
                    position="fixed"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(0,0,0,0.6)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1400}
                    backdropFilter="blur(2px)"
                    onClick={() => setIsParentModalOpen(false)}
                >
                    <Box
                        bg="bg.surface"
                        p={6}
                        borderRadius="md"
                        boxShadow="xl"
                        borderWidth="1px"
                        borderColor="border.default"
                        onClick={(e) => e.stopPropagation()}
                        minW="300px"
                    >
                        <Heading size="sm" mb={4} color="fg.default">
                            {parentRecipeId ? 'Edit Parent Recipe ID' : 'Add Parent Recipe ID'}
                        </Heading>
                        <Input
                            placeholder="Parent Recipe ID"
                            value={tempParentId}
                            onChange={(e) => setTempParentId(e.target.value)}
                            mb={4}
                            bg="vscode.inputBg"
                            borderColor="border.default"
                            color="fg.default"
                        />
                        <HStack justify="flex-end" gap={2}>
                            <Button
                                size="sm"
                                variant="outline"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ bg: "vscode.inputBg" }}
                                onClick={() => setIsParentModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" bg="vscode.button" color="white" _hover={{ bg: "vscode.buttonHover" }} onClick={saveParentId}>Save</Button>
                        </HStack>
                    </Box>
                </Box>
            )}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={10} alignItems="start">
                {/* Left Column: Details */}
                <VStack gap={4} align="stretch" maxW="lg">
                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Recipe Name</Text>
                        <Input
                            data-testid="recipe-name"
                            name="name"
                            value={core.name}
                            onChange={handleCoreChange}
                            placeholder="e.g. Chocolate Cake"
                            bg="vscode.inputBg"
                            borderColor="border.default"
                            color="fg.default"
                            _hover={{ borderColor: 'vscode.accent' }}
                            _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                        />
                    </Box>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Source</Text>
                            <Input
                                data-testid="recipe-source"
                                name="source"
                                value={core.source || ''}
                                onChange={handleCoreChange}
                                placeholder="e.g. Grandma's cookbook"
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Source URL</Text>
                            <Input
                                data-testid="recipe-source-url"
                                name="source_url"
                                value={core.source_url || ''}
                                onChange={handleCoreChange}
                                placeholder="https://example.com"
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                    </HStack>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Difficulty</Text>
                            <NativeSelect.Root>
                                <NativeSelect.Field
                                    data-testid="recipe-difficulty"
                                    name="difficulty"
                                    value={core.difficulty || ''}
                                    onChange={handleCoreChange}
                                    placeholder="Select difficulty"
                                    bg="vscode.inputBg"
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent' }}
                                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                >
                                    {Object.values(DifficultyLevel).map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </NativeSelect.Field>
                                <NativeSelect.Indicator />
                            </NativeSelect.Root>
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Protein (Main)</Text>
                            <Input
                                data-testid="recipe-protein"
                                name="protein"
                                value={core.protein || ''}
                                onChange={handleCoreChange}
                                placeholder="e.g. Chicken"
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                    </HStack>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Cuisine</Text>
                            <Input
                                data-testid="recipe-cuisine"
                                name="cuisine"
                                value={core.cuisine || ''}
                                onChange={handleCoreChange}
                                placeholder="e.g. Italian"
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Category</Text>
                            <Input
                                data-testid="recipe-category"
                                name="category"
                                value={core.category || ''}
                                onChange={handleCoreChange}
                                placeholder="e.g. Dessert"
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                    </HStack>



                    <DietSelect
                        selectedDiets={diet}
                        onChange={handleDietChange}
                    />

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Active Time (min)</Text>
                            <Input
                                data-testid="recipe-active-time"
                                type="number"
                                min={0}
                                value={times.active_time_minutes || 0}
                                onChange={(e) => handleTimesChange('active_time_minutes', e.target.value)}
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>

                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Cook Time (min)</Text>
                            <Input
                                data-testid="recipe-cook-time"
                                type="number"
                                min={0}
                                value={times.cook_time_minutes || 0}
                                onChange={(e) => handleTimesChange('cook_time_minutes', e.target.value)}
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                    </HStack>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Prep Time (min)</Text>
                            <Input
                                data-testid="recipe-prep-time"
                                type="number"
                                min={0}
                                value={times.prep_time_minutes || 0}
                                onChange={(e) => handleTimesChange('prep_time_minutes', e.target.value)}
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>

                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Total Time (min)</Text>
                            <Input
                                data-testid="recipe-total-time"
                                type="number"
                                min={0}
                                value={times.total_time_minutes || 0}
                                onChange={(e) => handleTimesChange('total_time_minutes', e.target.value)}
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                    </HStack>

                    <HStack gap={2} align="start">
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Yield (amount)</Text>
                            <Input
                                data-testid="recipe-yield"
                                type="number"
                                min={1}
                                value={core.yield_amount || 1}
                                onChange={(e) => handleCoreNumberChange('yield_amount', e.target.value)}
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Yield (unit)</Text>
                            <Input
                                data-testid="recipe-yield-unit"
                                name="yield_unit"
                                value={core.yield_unit || ''}
                                onChange={handleCoreChange}
                                placeholder="servings"
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                    </HStack>

                    <HStack gap={2}>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Calories</Text>
                            <Input
                                data-testid="recipe-calories"
                                type="number"
                                min={0}
                                value={nutrition.calories || 0}
                                onChange={(e) => handleNutritionChange('calories', e.target.value)}
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                        <Box flex={1}>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Serving Size</Text>
                            <Input
                                data-testid="recipe-serving-size"
                                name="serving_size"
                                value={nutrition.serving_size || ''}
                                onChange={(e) => handleNutritionChange('serving_size', e.target.value)}
                                placeholder="e.g. 1 slice"
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
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
                        bg="vscode.inputBg"
                        borderColor="border.default"
                        color="fg.default"
                        _hover={{ borderColor: 'vscode.accent' }}
                        _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                    />
                </Box>
            </SimpleGrid>
        </Box>
    );
};

export default RecipeBasicsForm;
