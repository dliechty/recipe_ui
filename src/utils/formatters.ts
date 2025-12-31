export const formatQuantity = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '';

    // Handle integers quickly
    if (Number.isInteger(value)) return value.toString();

    // Tolerance for floating point comparisons
    const tolerance = 0.001;
    const decimalPart = value % 1;
    const integerPart = Math.floor(value);
    const integerString = integerPart > 0 ? `${integerPart} ` : '';

    // Common fractions map
    const fractions: { [key: number]: string } = {
        0.5: '1/2',
        0.333: '1/3',
        0.666: '2/3',
        0.25: '1/4',
        0.75: '3/4',
        0.2: '1/5',
        0.4: '2/5',
        0.6: '3/5',
        0.8: '4/5',
        0.125: '1/8',
        0.375: '3/8',
        0.625: '5/8',
        0.875: '7/8',
    };

    // Check for exact matches first (for clean decimals like 0.5)
    if (fractions[decimalPart]) {
        return `${integerString}${fractions[decimalPart]}`;
    }

    // Check with tolerance
    for (const [decimal, fraction] of Object.entries(fractions)) {
        if (Math.abs(decimalPart - parseFloat(decimal)) < tolerance) {
            return `${integerString}${fraction}`;
        }
    }

    // Return original number if no match found
    return value.toString();
};
