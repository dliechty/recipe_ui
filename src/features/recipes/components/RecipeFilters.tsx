import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
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
import DebouncedInput from '../../../components/common/DebouncedInput';

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

    // Auto-expand if advanced filters are present on mount
    useEffect(() => {
        const hasAdvancedFilters = Object.entries(filters).some(([key, value]) => {
            if (['sort', 'name', 'category'].includes(key)) return false;

            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => {
                    if (Array.isArray(v)) return v.length > 0;
                    return v !== undefined && v !== '' && v !== null;
                });
            }
            return value !== undefined && value !== '';
        });

        if (hasAdvancedFilters) {
            setIsExpanded(true);
        }
        // We only want to run this check on mount to respect user's manual toggling afterwards
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (key: keyof RecipeFiltersType, value: unknown) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        // Since inputs are now debounced, we can trigger update immediately
        onFilterChange(newFilters);
    };



    const handleReset = () => {
        const defaults: RecipeFiltersType = { sort: 'name' };
        setLocalFilters(defaults);
        onFilterChange(defaults);
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
        _focus: { borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' },
        css: { colorScheme: 'dark' }
    };

    return (
        <Box borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface" p={4}>
            <VStack align="stretch" gap={4}>
                {/* Top Row: Basic Filters & Actions */}
                <Flex gap={4} align="end" wrap="wrap">
                    <Box flex={1} minW="200px">
                        <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Name</Text>
                        <DebouncedInput
                            placeholder="Search recipes..."
                            size="sm"
                            value={localFilters.name || ''}
                            onChange={(value) => handleChange('name', value)}
                            {...inputStyles}
                        />
                    </Box>

                    <Box w={{ base: "100%", md: "350px" }}>
                        <RecipeMultiSelect
                            label="Category"
                            placeholder="All Categories"
                            options={(categories || []).map(c => ({ label: c, value: c }))}
                            value={localFilters.category || []}
                            onChange={(val) => handleChange('category', val.length ? val : undefined)}
                        />
                    </Box>

                    <HStack ml="auto">
                        {/* Check for any active filters (non-empty strings, arrays, or objects) */}
                        {(() => {
                            const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
                                // Ignore default sort
                                if (key === 'sort' && value === 'name') return false;

                                if (Array.isArray(value)) return value.length > 0;
                                if (typeof value === 'object' && value !== null) {
                                    // Check for range objects (gt/lt) or has_all arrays in objects
                                    return Object.values(value).some(v => {
                                        if (Array.isArray(v)) return v.length > 0;
                                        return v !== undefined && v !== '' && v !== null;
                                    });
                                }
                                return value !== undefined && value !== '';
                            });

                            return (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="red"
                                    onClick={handleReset}
                                    disabled={!hasActiveFilters}
                                    opacity={!hasActiveFilters ? 0.4 : 1}
                                    _hover={!hasActiveFilters ? { bg: 'transparent' } : undefined}
                                    cursor={!hasActiveFilters ? 'not-allowed' : 'pointer'}
                                >
                                    <Icon as={FaTimes} mr={1} /> Reset
                                </Button>
                            );
                        })()}
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
                                    <DebouncedInput
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.total_time?.gt || ''}
                                        onChange={(val) => handleChange('total_time', { ...localFilters.total_time, gt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <DebouncedInput
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.total_time?.lt || ''}
                                        onChange={(val) => handleChange('total_time', { ...localFilters.total_time, lt: val ? Number(val) : undefined })}
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
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Ingredient</Text>
                                <DebouncedInput
                                    placeholder="e.g. egg"
                                    size="sm"
                                    value={localFilters.ingredients?.like || ''}
                                    onChange={(val) => {
                                        handleChange('ingredients', {
                                            like: String(val) || undefined
                                        });
                                    }}
                                    {...inputStyles}
                                />
                            </Box>

                            {/* 2.3 Prep Time */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Prep Time (min)</Text>
                                <HStack>
                                    <DebouncedInput
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.prep_time?.gt || ''}
                                        onChange={(val) => handleChange('prep_time', { ...localFilters.prep_time, gt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <DebouncedInput
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.prep_time?.lt || ''}
                                        onChange={(val) => handleChange('prep_time', { ...localFilters.prep_time, lt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>


                            {/* --- Row 3 --- */}

                            {/* 3.1 Owner */}
                            {/* 3.1 Owner */}
                            <RecipeMultiSelect
                                label="Owner / Author"
                                placeholder="Any Owner"
                                options={(owners || []).map((o: { id: string; name: string } | string) => ({
                                    label: (typeof o === 'string' ? o : o.name) || String(o),
                                    value: (typeof o === 'string' ? o : o.id) || String(o)
                                }))}
                                value={localFilters.owner || []}
                                onChange={(val) => handleChange('owner', val.length ? val : undefined)}
                            />

                            {/* 3.2 Yield */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Yield (Typically in Servings)</Text>
                                <HStack>
                                    <DebouncedInput
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.yield?.gt || ''}
                                        onChange={(val) => handleChange('yield', { ...localFilters.yield, gt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <DebouncedInput
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.yield?.lt || ''}
                                        onChange={(val) => handleChange('yield', { ...localFilters.yield, lt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>

                            {/* 3.3 Cook Time */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Cook Time (min)</Text>
                                <HStack>
                                    <DebouncedInput
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.cook_time?.gt || ''}
                                        onChange={(val) => handleChange('cook_time', { ...localFilters.cook_time, gt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <DebouncedInput
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.cook_time?.lt || ''}
                                        onChange={(val) => handleChange('cook_time', { ...localFilters.cook_time, lt: val ? Number(val) : undefined })}
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
                                value={localFilters.suitable_for_diet || []}
                                onChange={(val) => handleChange('suitable_for_diet', val.length ? val : undefined)}
                            />

                            {/* 4.2 Calories */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Calories</Text>
                                <HStack>
                                    <DebouncedInput
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.calories?.gt || ''}
                                        onChange={(val) => handleChange('calories', { ...localFilters.calories, gt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <DebouncedInput
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.calories?.lt || ''}
                                        onChange={(val) => handleChange('calories', { ...localFilters.calories, lt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>

                            {/* 4.3 Active Time */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Active Time (min)</Text>
                                <HStack>
                                    <DebouncedInput
                                        placeholder="Min"
                                        size="xs"
                                        type="number"
                                        value={localFilters.active_time?.gt || ''}
                                        onChange={(val) => handleChange('active_time', { ...localFilters.active_time, gt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <DebouncedInput
                                        placeholder="Max"
                                        size="xs"
                                        type="number"
                                        value={localFilters.active_time?.lt || ''}
                                        onChange={(val) => handleChange('active_time', { ...localFilters.active_time, lt: val ? Number(val) : undefined })}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>
                        </SimpleGrid>


                    </Box>
                )}
            </VStack>
        </Box>
    );
};



export default RecipeFiltersDisplay;
