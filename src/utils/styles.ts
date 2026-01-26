import type { StylesConfig, CSSObjectWithLabel } from 'react-select';

/**
 * Centralized theme color constants for use in non-Chakra components (e.g., react-select).
 * These values mirror the theme tokens defined in src/theme.ts.
 */
export const themeColors = {
    // Core colors
    bg: '#1e1e1e',
    surface: '#252526',
    border: '#454545',
    text: '#d4d4d4',
    textMuted: '#a0a0a0',
    accent: '#007acc',
    button: '#0e639c',
    buttonHover: '#1177bb',
    inputBg: '#3c3c3c',
    // Status colors
    errorBg: '#4a1515',
    errorText: '#f8b4b4',
    errorBorder: '#7f1d1d',
    successBg: '#14532d',
    successText: '#86efac',
    successBorder: '#166534',
    // Button variants
    dangerButton: '#b91c1c',
    dangerButtonHover: '#991b1b',
    successButton: '#15803d',
    successButtonHover: '#166534',
    secondaryButton: '#4b5563',
    secondaryButtonHover: '#374151',
    // Overlay
    backdrop: 'rgba(0, 0, 0, 0.6)',
} as const;

/**
 * CSS variable for scrollbar styling in dark theme
 */
export const scrollbarColor = themeColors.border;

/**
 * Common styles for native select elements (dark theme)
 */
export const nativeSelectStyles = {
    backgroundColor: themeColors.inputBg,
    borderColor: themeColors.border,
    color: themeColors.text,
} as const;

/**
 * CSS for native select options (dark theme)
 */
export const nativeSelectOptionsCss = {
    '& option': {
        backgroundColor: themeColors.inputBg,
        color: themeColors.text,
    }
} as const;

interface SelectStylesOptions {
    /** Minimum height of the control (default: '40px') */
    minHeight?: string;
    /** Font size (default: 'inherit') */
    fontSize?: string;
    /** Menu z-index (default: 5) */
    menuZIndex?: number;
    /** Whether to include portal styles (default: false) */
    usePortal?: boolean;
}

/**
 * Factory function to create react-select StylesConfig with consistent dark theme styling.
 *
 * @param options - Optional configuration for the styles
 * @returns StylesConfig object for react-select
 */
export function createSelectStyles<Option, IsMulti extends boolean = false>(
    options: SelectStylesOptions = {}
): StylesConfig<Option, IsMulti> {
    const {
        minHeight = '40px',
        fontSize = 'inherit',
        menuZIndex = 5,
        usePortal = false,
    } = options;

    return {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: themeColors.inputBg,
            borderColor: state.isFocused ? themeColors.accent : themeColors.border,
            color: themeColors.text,
            minHeight,
            fontSize,
            boxShadow: state.isFocused ? `0 0 0 1px ${themeColors.accent}` : 'none',
            '&:hover': {
                borderColor: themeColors.accent
            }
        } as CSSObjectWithLabel),
        menu: (provided) => ({
            ...provided,
            backgroundColor: themeColors.inputBg,
            zIndex: menuZIndex,
            border: `1px solid ${themeColors.border}`,
            marginTop: '2px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)'
        } as CSSObjectWithLabel),
        ...(usePortal && {
            menuPortal: (provided) => ({
                ...provided,
                zIndex: 9999
            } as CSSObjectWithLabel)
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? themeColors.accent
                : state.isFocused
                    ? themeColors.border
                    : 'transparent',
            color: state.isSelected ? 'white' : themeColors.text,
            cursor: 'pointer',
            fontSize,
            ':active': {
                backgroundColor: themeColors.accent
            }
        } as CSSObjectWithLabel),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: themeColors.button,
        } as CSSObjectWithLabel),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#ffffff',
        } as CSSObjectWithLabel),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#ffffff',
            ':hover': {
                backgroundColor: themeColors.buttonHover,
                color: '#ffffff',
            },
        } as CSSObjectWithLabel),
        input: (provided) => ({
            ...provided,
            color: themeColors.text
        } as CSSObjectWithLabel),
        singleValue: (provided) => ({
            ...provided,
            color: themeColors.text
        } as CSSObjectWithLabel),
        placeholder: (provided) => ({
            ...provided,
            color: themeColors.textMuted
        } as CSSObjectWithLabel),
        indicatorSeparator: (provided) => ({
            ...provided,
            backgroundColor: themeColors.border
        } as CSSObjectWithLabel),
        dropdownIndicator: (provided) => ({
            ...provided,
            color: themeColors.textMuted,
            ':hover': {
                color: themeColors.text
            }
        } as CSSObjectWithLabel),
        clearIndicator: (provided) => ({
            ...provided,
            color: themeColors.textMuted,
            ':hover': {
                color: themeColors.text
            }
        } as CSSObjectWithLabel)
    };
}

/**
 * Pre-built react-select styles for common use cases.
 * Use these with explicit type parameters for TypeScript:
 * `styles={selectStyles.default as StylesConfig<YourOption, true>}`
 */
export const selectStyles = {
    /** Default styles for standard select inputs (40px height) */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: createSelectStyles<any, any>({ minHeight: '40px' }),

    /** Compact styles for filter/inline selects (32px height, smaller font) */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compact: createSelectStyles<any, any>({
        minHeight: '32px',
        fontSize: '0.875rem',
        menuZIndex: 9999,
        usePortal: true,
    }),

    /** Styles for single-value selects in forms */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: createSelectStyles<any, any>({ minHeight: '32px' }),
};
