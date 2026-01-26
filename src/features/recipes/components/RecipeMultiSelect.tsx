import Select, { MultiValue } from 'react-select';
import { Box, Text } from '@chakra-ui/react';
import { selectStyles } from '../../../utils/styles';

export interface Option {
    label: string;
    value: string;
}

interface RecipeMultiSelectProps {
    label: string;
    options: Option[];
    value: string[];
    onChange: (newValue: string[]) => void;
    placeholder?: string;
    testId?: string;
}

const RecipeMultiSelect = ({ label, options, value, onChange, placeholder, testId }: RecipeMultiSelectProps) => {
    // Map selected string values to option objects
    const selectedOptions = options.filter(option => value.includes(option.value));

    const handleChange = (newValue: MultiValue<Option>) => {
        onChange(newValue.map(option => option.value));
    };

    return (
        <Box data-testid={testId}>
            <Text fontSize="xs" fontWeight="bold" mb={1} color="fg.muted">{label}</Text>
            <Select
                isMulti
                options={options}
                value={selectedOptions}
                onChange={handleChange}
                styles={selectStyles.compact}
                placeholder={placeholder || "Select..."}
                instanceId={`select-${label.replace(/\s+/g, '-').toLowerCase()}`}
                menuPortalTarget={document.body}
                menuPlacement="auto"
            />
        </Box>
    );
};

export default RecipeMultiSelect;
