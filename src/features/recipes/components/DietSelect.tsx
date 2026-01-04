import React from 'react';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { DietType } from '../../../client';
import { formatDietName } from '../../../utils/formatters';
import { Box, Text } from '@chakra-ui/react';

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

const customStyles: StylesConfig<DietOption, true> = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#3c3c3c', // vscode.inputBg
        borderColor: state.isFocused ? '#007acc' : '#454545', // vscode.accent : vscode.border
        color: '#d4d4d4', // vscode.text
        minHeight: '40px',
        boxShadow: state.isFocused ? '0 0 0 1px #007acc' : 'none',
        '&:hover': {
            borderColor: '#007acc'
        }
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#3c3c3c', // vscode.inputBg (opaque)
        zIndex: 5,
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
        ':active': {
            backgroundColor: '#007acc'
        }
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#0e639c', // vscode.button
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#ffffff',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#ffffff',
        ':hover': {
            backgroundColor: '#1177bb', // vscode.buttonHover
            color: '#ffffff',
        },
    }),
    input: (provided) => ({
        ...provided,
        color: '#d4d4d4' // vscode.text
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#d4d4d4'
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#a0a0a0' // vscode.textMuted
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
    }),
    clearIndicator: (provided) => ({
        ...provided,
        color: '#a0a0a0',
        ':hover': {
            color: '#d4d4d4'
        }
    })
};

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
                styles={customStyles}
                placeholder="Select suitable diets..."
                instanceId="diet-select" // accessiblity
            />
        </Box>
    );
};

export default DietSelect;
