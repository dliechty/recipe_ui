export const formatQuantity = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '';

    // Handle integers quickly
    if (Number.isInteger(value)) return value.toString();

    // Tolerance for floating point comparisons
    const tolerance = 0.01;
    const decimalPart = value % 1;
    const integerPart = Math.floor(value);
    const integerString = integerPart > 0 ? `${integerPart} ` : '';

    // Common fractions map
    const fractions: { [key: number]: string } = {
        0.5: '½',
        0.333: '⅓',
        0.666: '⅔',
        0.25: '¼',
        0.75: '¾',
        0.2: '⅕',
        0.4: '⅖',
        0.6: '⅗',
        0.8: '⅘',
        0.125: '⅛',
        0.375: '⅜',
        0.625: '⅝',
        0.875: '⅞',
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
