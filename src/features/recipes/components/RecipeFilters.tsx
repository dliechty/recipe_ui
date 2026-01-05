import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    Input,
    Button,
    HStack,
    Text,
    Icon,
    Flex,
    SimpleGrid
} from '@chakra-ui/react';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { RecipeFilters as RecipeFiltersType } from '../../../hooks/useRecipes';
import { useRecipeMeta } from '../hooks/useRecipeMeta';
import RecipeMultiSelect from './RecipeMultiSelect';

interface RecipeFiltersProps {
    filters: RecipeFiltersType;
    onFilterChange: (filters: RecipeFiltersType) => void;
}

const RecipeFiltersDisplay: React.FC<RecipeFiltersProps> = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState<RecipeFiltersType>(filters);
    const [isExpanded, setIsExpanded] = useState(false);

    // Sync local state when prop changes (e.g. reset)
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (key: keyof RecipeFiltersType, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        // Debounce actual update to parent could be handled here or in parent
        // For now, simpler inputs update on Blur or Enter, specific ones immediately
        if (key !== 'name' && key !== 'calories' && key !== 'total_time') {
            onFilterChange(newFilters);
        }
    };

    const handleApply = () => {
        onFilterChange(localFilters);
    };

    const handleReset = () => {
        const empty: RecipeFiltersType = {};
        setLocalFilters(empty);
        onFilterChange(empty);
    };

    const { data: categories } = useRecipeMeta('category');
    const { data: cuisines } = useRecipeMeta('cuisine');
    const { data: difficulties } = useRecipeMeta('difficulty');
    const { data: owners } = useRecipeMeta('owner');
    const { data: diets } = useRecipeMeta('suitable_for_diet');
    const { data: proteins } = useRecipeMeta('protein');

    const inputStyles = {
        bg: "vscode.inputBg",
        borderColor: "border.default",
        color: "fg.default",
        _hover: { borderColor: 'vscode.accent' },
        _focus: { borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }
    };

    return (
        <Box borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface" p={4}>
            <VStack align="stretch" gap={4}>
                {/* Top Row: Basic Filters & Actions */}
                <Flex gap={4} align="end" wrap="wrap">
                    <Box flex={1} minW="200px">
                        <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Name</Text>
                        <Input
                            placeholder="Search recipes..."
                            size="sm"
                            value={localFilters.name || ''}
                            onChange={(e) => setLocalFilters({ ...localFilters, name: e.target.value })}
                            onBlur={handleApply}
                            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                            {...inputStyles}
                        />
                    </Box>

                    <Box w={{ base: "100%", md: "200px" }}>
                        <RecipeMultiSelect
                            label="Category"
                            placeholder="All Categories"
                            options={(categories || []).map(c => ({ label: c, value: c }))}
                            value={localFilters.category || []}
                            onChange={(val) => handleChange('category', val.length ? val : undefined)}
                        />
                    </Box>

                    <HStack ml="auto">
                        {Object.keys(filters).length > 0 && (
                            <Button size="xs" variant="ghost" colorScheme="red" onClick={handleReset}>
                                <Icon as={FaTimes} mr={1} /> Reset
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsExpanded(!isExpanded)}
                            color="fg.default"
                            _hover={{ bg: "bg.muted" }}
                        >
                            {isExpanded ? "Less Filters" : "More Filters"}
                            <Icon as={isExpanded ? FaChevronUp : FaChevronDown} ml={2} />
                        </Button>
                    </HStack>
                </Flex>

                {/* Collapsible Advanced Filters */}
                {isExpanded && (
                    <Box pt={2} borderTopWidth={1} borderColor="border.muted">
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mt={4}>

                            {/* --- Row 1 --- */}

                            {/* 1.1 Cuisine */}
                            <RecipeMultiSelect
                                label="Cuisine"
                                placeholder="All Cuisines"
                                options={(cuisines || []).map(c => ({ label: c, value: c }))}
                                value={localFilters.cuisine || []}
                                onChange={(val) => handleChange('cuisine', val.length ? val : undefined)}
                            />

                            {/* 1.2 Protein */}
                            <RecipeMultiSelect
                                label="Protein"
                                placeholder="Any Protein"
                                options={(proteins || []).map(p => ({ label: p, value: p }))}
                                value={localFilters.protein || []}
                                onChange={(val) => handleChange('protein', val.length ? val : undefined)}
                            />

                            {/* 1.3 Total Time */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Total Time (min)</Text>
                                <HStack>
                                    <Input
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.total_time?.gt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            total_time: { ...localFilters.total_time, gt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <Input
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.total_time?.lt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            total_time: { ...localFilters.total_time, lt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>


                            {/* --- Row 2 --- */}

                            {/* 2.1 Difficulty */}
                            <RecipeMultiSelect
                                label="Difficulty"
                                placeholder="Any Difficulty"
                                options={(difficulties || []).map(d => ({ label: d, value: d }))}
                                value={localFilters.difficulty || []}
                                onChange={(val) => handleChange('difficulty', val.length ? val : undefined)}
                            />

                            {/* 2.2 Ingredients */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Ingredients</Text>
                                <Input
                                    placeholder="e.g. egg, cheese"
                                    size="sm"
                                    value={localFilters.ingredients?.has_all?.join(', ') || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setLocalFilters({
                                            ...localFilters,
                                            ingredients: {
                                                ...localFilters.ingredients,
                                                has_all: val ? val.split(',').map(s => s.trim()).filter(Boolean) : undefined
                                            }
                                        });
                                    }}
                                    onBlur={handleApply}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                                    {...inputStyles}
                                />
                            </Box>

                            {/* 2.3 Prep Time */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Prep Time (min)</Text>
                                <HStack>
                                    <Input
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.prep_time?.gt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            prep_time: { ...localFilters.prep_time, gt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <Input
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.prep_time?.lt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            prep_time: { ...localFilters.prep_time, lt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>


                            {/* --- Row 3 --- */}

                            {/* 3.1 Owner */}
                            <RecipeMultiSelect
                                label="Owner / Author"
                                placeholder="Any Owner"
                                options={owners || []} // owners is already {label, value}
                                value={localFilters.owner || []}
                                onChange={(val) => handleChange('owner', val.length ? val : undefined)}
                            />

                            {/* 3.2 Yield */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Yield (Typically Servings)</Text>
                                <HStack>
                                    <Input
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.yield?.gt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            yield: { ...localFilters.yield, gt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <Input
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.yield?.lt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            yield: { ...localFilters.yield, lt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>

                            {/* 3.3 Cook Time */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Cook Time (min)</Text>
                                <HStack>
                                    <Input
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.cook_time?.gt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            cook_time: { ...localFilters.cook_time, gt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <Input
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.cook_time?.lt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            cook_time: { ...localFilters.cook_time, lt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>


                            {/* --- Row 4 --- */}

                            {/* 4.1 Dietary Suitability */}
                            <RecipeMultiSelect
                                label="Dietary Suitability"
                                placeholder="Any Diet"
                                options={(diets || []).map(d => ({ label: d, value: d }))}
                                value={localFilters.suitable_for_diet?.has_all || []}
                                onChange={(val) => {
                                    setLocalFilters({
                                        ...localFilters,
                                        suitable_for_diet: val.length ? { has_all: val } : undefined
                                    });
                                }}
                            />

                            {/* 4.2 Calories */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Calories</Text>
                                <HStack>
                                    <Input
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.calories?.gt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            calories: { ...localFilters.calories, gt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <Input
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.calories?.lt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            calories: { ...localFilters.calories, lt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>

                            {/* 4.3 Active Time */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Active Time (min)</Text>
                                <HStack>
                                    <Input
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.active_time?.gt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            active_time: { ...localFilters.active_time, gt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <Input
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.active_time?.lt || ''}
                                        onChange={(e) => setLocalFilters({
                                            ...localFilters,
                                            active_time: { ...localFilters.active_time, lt: e.target.value ? Number(e.target.value) : undefined }
                                        })}
                                        onBlur={handleApply}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>
                        </SimpleGrid>

                        <Button
                            size="sm"
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                            onClick={handleApply}
                            mt={4}
                            width={{ base: 'full', md: 'auto' }}
                        >
                            Apply Filters
                        </Button>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};



export default RecipeFiltersDisplay;
