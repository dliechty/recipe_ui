import React, { useState } from 'react';
import {
    Box,
    Input,
    VStack,
    HStack,
    Heading,
    Button,
    Text,
    SimpleGrid
} from '@chakra-ui/react';
import Select, { StylesConfig } from 'react-select';
import { MealCreate, MealStatus, MealClassification, MealItemBase } from '../../../client';
import RecipeSearchSelector from './RecipeSearchSelector';

interface MealFormProps {
    onSubmit: (data: MealCreate) => void;
    isLoading: boolean;
    initialData?: Partial<MealCreate>;
    onCancel?: () => void;
}

// Custom styles for react-select to match VS Code theme
interface Option {
    label: string;
    value: string;
}

const customStyles: StylesConfig<Option, false> = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#3c3c3c', // vscode.inputBg
        borderColor: state.isFocused ? '#007acc' : '#454545', // vscode.accent : vscode.border
        color: '#d4d4d4', // vscode.text
        minHeight: '32px',
        boxShadow: state.isFocused ? '0 0 0 1px #007acc' : 'none',
        '&:hover': {
            borderColor: '#007acc'
        }
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#3c3c3c', // vscode.inputBg (opaque)
        zIndex: 10,
        border: '1px solid #454545', // vscode.border
        marginTop: '2px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)'
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#007acc' // vscode.accent
            : state.isFocused
                ? '#454545' // vscode.border (hover state)
                : 'transparent',
        color: state.isSelected ? 'white' : '#d4d4d4',
        cursor: 'pointer',
        fontSize: '0.875rem',
        ':active': {
            backgroundColor: '#007acc'
        }
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#d4d4d4'
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#a0a0a0' // vscode.textMuted
    }),
    input: (provided) => ({
        ...provided,
        color: '#d4d4d4'
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: '#454545'
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: '#a0a0a0',
        ':hover': {
            color: '#d4d4d4'
        }
    })
};

const statusOptions: Option[] = [
    { label: 'Proposed', value: MealStatus.PROPOSED },
    { label: 'Scheduled', value: MealStatus.SCHEDULED },
    { label: 'Cooked', value: MealStatus.COOKED },
];

const classificationOptions: Option[] = [
    { label: 'Breakfast', value: MealClassification.BREAKFAST },
    { label: 'Brunch', value: MealClassification.BRUNCH },
    { label: 'Lunch', value: MealClassification.LUNCH },
    { label: 'Dinner', value: MealClassification.DINNER },
    { label: 'Snack', value: MealClassification.SNACK },
];

const MealForm = ({ onSubmit, isLoading, initialData, onCancel }: MealFormProps) => {
    const [name, setName] = useState(initialData?.name || '');
    const [status, setStatus] = useState<MealStatus>(initialData?.status || MealStatus.SCHEDULED);
    const [classification, setClassification] = useState<MealClassification | ''>(initialData?.classification || '');
    const [date, setDate] = useState(initialData?.date || '');
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(
        initialData?.items?.map(item => item.recipe_id) || []
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const items: MealItemBase[] = selectedRecipeIds.map(recipe_id => ({ recipe_id }));

        const mealData: MealCreate = {
            name: name || null,
            status,
            classification: classification || null,
            date: date || null,
            items
        };

        onSubmit(mealData);
    };

    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="lg">
            <Heading size="md" mb={6}>Meal Details</Heading>

            <form onSubmit={handleSubmit}>
                <VStack gap={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} maxW="600px">
                        <Box>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Meal Name</Text>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter meal name"
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>

                        <Box>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Classification</Text>
                            <Select
                                options={classificationOptions}
                                value={classificationOptions.find(opt => opt.value === classification)}
                                onChange={(option) => {
                                    setClassification(option ? (option.value as MealClassification) : '');
                                }}
                                styles={customStyles}
                                placeholder="Select classification..."
                                isClearable
                                aria-label="Classification"
                                inputId="classification-select"
                            />
                        </Box>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} maxW="600px">
                        <Box>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Status</Text>
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(opt => opt.value === status)}
                                onChange={(option) => {
                                    if (option) setStatus(option.value as MealStatus);
                                }}
                                styles={customStyles}
                                isSearchable={false}
                                aria-label="Status"
                                inputId="status-select"
                            />
                        </Box>

                        <Box>
                            <Text as="label" mb={2} display="block" fontWeight="bold">Date</Text>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                colorScheme="dark"
                                css={{ colorScheme: 'dark' }}
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                    </SimpleGrid>

                    <Box>
                        <Text as="label" mb={2} display="block" fontWeight="bold">Recipes</Text>
                        <RecipeSearchSelector
                            selectedRecipeIds={selectedRecipeIds}
                            onChange={setSelectedRecipeIds}
                        />
                    </Box>

                    <HStack justify="flex-start" mt={4} gap={2}>
                        <Button
                            type="submit"
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                            loading={isLoading}
                            size="xs"
                        >
                            Save Meal
                        </Button>
                        {onCancel && (
                            <Button
                                onClick={onCancel}
                                bg="gray.600"
                                color="white"
                                _hover={{ bg: "gray.700" }}
                                disabled={isLoading}
                                size="xs"
                            >
                                Cancel
                            </Button>
                        )}
                    </HStack>
                </VStack>
            </form>
        </Box>
    );
};

export default MealForm;
