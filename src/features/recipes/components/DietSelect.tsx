import Select, { MultiValue } from 'react-select';
import { DietType } from '../../../client';
import { formatDietName } from '../../../utils/formatters';
import { Box, Text } from '@chakra-ui/react';
import { selectStyles } from '../../../utils/styles';

interface DietOption {
    label: string;
    value: DietType;
}

interface DietSelectProps {
    selectedDiets: DietType[];
    onChange: (selectedDiets: DietType[]) => void;
}

const options: DietOption[] = Object.values(DietType).map(diet => ({
    label: formatDietName(diet),
    value: diet
}));

const DietSelect = ({ selectedDiets, onChange }: DietSelectProps) => {
    // Map selected enum values to option objects
    const value = options.filter(option => selectedDiets.includes(option.value));

    const handleChange = (newValue: MultiValue<DietOption>) => {
        onChange(newValue.map(option => option.value));
    };

    return (
        <Box>
            <Text as="label" mb={2} display="block" fontWeight="bold">Dietary Suitability</Text>
            <Select
                isMulti
                options={options}
                value={value}
                onChange={handleChange}
                styles={selectStyles.default}
                placeholder="Select suitable diets..."
                instanceId="diet-select" // accessiblity
            />
        </Box>
    );
};

export default DietSelect;
