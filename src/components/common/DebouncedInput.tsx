import React, { useState, useEffect } from 'react';
import { Input, InputProps } from '@chakra-ui/react';

interface DebouncedInputProps extends Omit<InputProps, 'onChange'> {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({
    value: initialValue,
    onChange,
    debounce = 300,
    ...props
}) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (value !== initialValue) {
                onChange(value);
            }
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onChange, initialValue]);

    return (
        <Input
            {...props}
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    );
};

export default DebouncedInput;
