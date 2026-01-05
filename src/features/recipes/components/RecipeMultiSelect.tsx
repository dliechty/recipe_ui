import React from 'react';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { Box, Text } from '@chakra-ui/react';

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

const customStyles: StylesConfig<Option, true> = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#3c3c3c', // vscode.inputBg
        borderColor: state.isFocused ? '#007acc' : '#454545', // vscode.accent : vscode.border
        color: '#d4d4d4', // vscode.text
        minHeight: '32px', // Compact for filters
        fontSize: '0.875rem', // sm size
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
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#0e639c', // vscode.button
        borderRadius: '2px',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#ffffff',
        fontSize: '0.75rem',
        padding: '2px 4px',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#ffffff',
        ':hover': {
            backgroundColor: '#1177bb', // vscode.buttonHover
            color: '#ffffff',
            cursor: 'pointer'
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
        padding: '4px',
        ':hover': {
            color: '#d4d4d4'
        }
    }),
    clearIndicator: (provided) => ({
        ...provided,
        color: '#a0a0a0',
        padding: '4px',
        ':hover': {
            color: '#d4d4d4'
        }
    })
};

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
                styles={customStyles}
                placeholder={placeholder || "Select..."}
                instanceId={`select-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
        </Box>
    );
};

export default RecipeMultiSelect;
