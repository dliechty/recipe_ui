import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    Button,
    HStack,
    Text,
    Icon,
    Flex,
    SimpleGrid,
    Badge
} from '@chakra-ui/react';
import { FaTimes, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';
import { MealFilters as MealFiltersType } from '../../../utils/mealParams';
import { MealStatus } from '../../../client/models/MealStatus';
import { MealClassification } from '../../../client/models/MealClassification';
import { useUsers } from '../../../hooks/useUsers';
import RecipeMultiSelect from '../../recipes/components/RecipeMultiSelect';
import DebouncedInput from '../../../components/common/DebouncedInput';
import RecipeFilterModal from './RecipeFilterModal';

interface MealFiltersProps {
    filters: MealFiltersType;
    onFilterChange: (filters: MealFiltersType) => void;
}

const MealFilters: React.FC<MealFiltersProps> = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState<MealFiltersType>(filters);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

    // Sync local state when prop changes
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Auto-expand if advanced filters are present on mount
    useEffect(() => {
        const hasAdvancedFilters = Object.entries(filters).some(([key, value]) => {
            if (['sort', 'name', 'status'].includes(key)) return false;

            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== undefined && v !== '' && v !== null);
            }
            return value !== undefined && value !== '';
        });

        if (hasAdvancedFilters) {
            setIsExpanded(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (key: keyof MealFiltersType, value: unknown) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const defaults: MealFiltersType = { sort: '-created_at' };
        setLocalFilters(defaults);
        onFilterChange(defaults);
    };

    const { data: users } = useUsers();

    const inputStyles = {
        bg: "vscode.inputBg",
        borderColor: "border.default",
        color: "fg.default",
        _hover: { borderColor: 'vscode.accent' },
        _focus: { borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' },
        css: { colorScheme: 'dark' }
    };

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'sort') return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(v => v !== undefined && v !== '' && v !== null);
        }
        return value !== undefined && value !== '';
    });

    return (
        <Box borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface" p={4}>
            <VStack align="stretch" gap={4}>
                {/* Top Row: Basic Filters & Actions */}
                <Flex gap={4} align="end" wrap="wrap">
                    <Box flex={1} minW="200px">
                        <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Name</Text>
                        <DebouncedInput
                            placeholder="Search meals..."
                            size="sm"
                            value={localFilters.name || ''}
                            onChange={(value) => handleChange('name', value)}
                            {...inputStyles}
                        />
                    </Box>

                    <Box w={{ base: "100%", md: "250px" }}>
                        <RecipeMultiSelect
                            label="Status"
                            placeholder="All Statuses"
                            options={Object.values(MealStatus).map(s => ({ label: s, value: s }))}
                            value={localFilters.status || []}
                            onChange={(val) => handleChange('status', val.length ? val : undefined)}
                        />
                    </Box>

                    <HStack ml="auto">
                        <Button
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={handleReset}
                            disabled={!hasActiveFilters}
                            opacity={!hasActiveFilters ? 0.4 : 1}
                            cursor={!hasActiveFilters ? 'not-allowed' : 'pointer'}
                        >
                            <Icon as={FaTimes} mr={1} /> Reset
                        </Button>
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
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mt={4}>
                            
                            {/* Classification */}
                            <RecipeMultiSelect
                                label="Classification"
                                placeholder="Any Classification"
                                options={Object.values(MealClassification).map(c => ({ label: c, value: c }))}
                                value={localFilters.classification || []}
                                onChange={(val) => handleChange('classification', val.length ? val : undefined)}
                            />

                            {/* Owner / Author */}
                            <RecipeMultiSelect
                                label="Owner / Author"
                                placeholder="Any User"
                                options={(users || []).map(u => ({ label: `${u.first_name} ${u.last_name}`, value: u.id }))}
                                value={localFilters.owner || []}
                                onChange={(val) => handleChange('owner', val.length ? val : undefined)}
                            />

                            {/* Date Range */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Scheduled Date Range</Text>
                                <HStack>
                                    <DebouncedInput
                                        type="date"
                                        size="xs"
                                        value={localFilters.scheduled_date?.gt || ''}
                                        onChange={(val) => handleChange('scheduled_date', { ...localFilters.scheduled_date, gt: val || undefined })}
                                        {...inputStyles}
                                    />
                                    <Text>-</Text>
                                    <DebouncedInput
                                        type="date"
                                        size="xs"
                                        value={localFilters.scheduled_date?.lt || ''}
                                        onChange={(val) => handleChange('scheduled_date', { ...localFilters.scheduled_date, lt: val || undefined })}
                                        {...inputStyles}
                                    />
                                </HStack>
                            </Box>

                            {/* Recipe Filter Button */}
                            <Box>
                                <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">Recipes</Text>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    width="full"
                                    onClick={() => setIsRecipeModalOpen(true)}
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent', bg: 'bg.muted' }}
                                >
                                    <Icon as={FaFilter} mr={2} />
                                    {localFilters.recipe?.length ? `${localFilters.recipe.length} Recipes` : "Filter by Recipe"}
                                </Button>
                                {localFilters.recipe && localFilters.recipe.length > 0 && (
                                    <HStack mt={2} wrap="wrap">
                                        <Badge colorPalette="blue" variant="solid">
                                            {localFilters.recipe.length} selected
                                            <Icon 
                                                as={FaTimes} 
                                                ml={1} 
                                                cursor="pointer" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChange('recipe', undefined);
                                                }}
                                            />
                                        </Badge>
                                    </HStack>
                                )}
                            </Box>
                        </SimpleGrid>
                    </Box>
                )}
            </VStack>

            <RecipeFilterModal
                isOpen={isRecipeModalOpen}
                onClose={() => setIsRecipeModalOpen(false)}
                selectedRecipeIds={localFilters.recipe || []}
                onApply={(ids) => handleChange('recipe', ids.length ? ids : undefined)}
            />
        </Box>
    );
};

export default MealFilters;
