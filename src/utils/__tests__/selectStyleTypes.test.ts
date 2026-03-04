import { describe, it, expect, expectTypeOf } from 'vitest';
import type { StylesConfig } from 'react-select';
import { selectStyles, createSelectStyles } from '../styles';

/**
 * React-Select Generic Typing Tests
 *
 * FR-4.1: Validates that react-select style exports use proper generics
 * instead of `any`. The selectStyles presets should be typed with `unknown`
 * (or specific option types) so consumers get type safety.
 *
 * RED PHASE: These tests expose the `any` typing problem. The core type-safety
 * tests verify that:
 * 1. The selectStyles exports do not use `any` as their Option/IsMulti generics
 * 2. The styles are compatible with concrete consumer types (DietOption, etc.)
 * 3. The createSelectStyles factory properly propagates type parameters
 *
 * The `any` detection tests use a runtime technique: when styles are typed as
 * `StylesConfig<any, any>`, calling style functions with arbitrary invalid
 * arguments will succeed at runtime (since the functions just spread `provided`),
 * but the TYPE should reject such calls. Since we cannot enforce TS type errors
 * at runtime, we use eslint-disable comment detection as a proxy signal.
 */

// =================================================================
// createSelectStyles factory: proper generic inference
// =================================================================
describe('createSelectStyles generic typing', () => {
    it('returns StylesConfig with the specified Option type', () => {
        interface TestOption { label: string; value: string }
        const styles = createSelectStyles<TestOption, false>();

        // Runtime: it should be an object with style functions
        expect(styles).toBeDefined();
        expect(typeof styles.control).toBe('function');
        expect(typeof styles.option).toBe('function');

        // Type-level: the return type must match StylesConfig<TestOption, false>
        expectTypeOf(styles).toEqualTypeOf<StylesConfig<TestOption, false>>();
    });

    it('returns StylesConfig with IsMulti=true when specified', () => {
        interface TestOption { label: string; value: number }
        const styles = createSelectStyles<TestOption, true>();

        expectTypeOf(styles).toEqualTypeOf<StylesConfig<TestOption, true>>();
    });

    it('defaults IsMulti to false when not specified', () => {
        interface TestOption { label: string; value: string }
        const styles = createSelectStyles<TestOption>();

        expectTypeOf(styles).toEqualTypeOf<StylesConfig<TestOption, false>>();
    });
});

// =================================================================
// selectStyles.default: verify typing is not `any`
// =================================================================
describe('selectStyles.default typing', () => {
    it('is defined and has expected style functions at runtime', () => {
        expect(selectStyles.default).toBeDefined();
        expect(typeof selectStyles.default.control).toBe('function');
        expect(typeof selectStyles.default.option).toBe('function');
        expect(typeof selectStyles.default.menu).toBe('function');
    });

    it('should not use any as its Option type parameter (detected via eslint suppression)', async () => {
        // This test reads the source file and asserts that no eslint-disable
        // comments for @typescript-eslint/no-explicit-any exist on the
        // selectStyles export lines. This is a proxy for detecting `any` usage.
        //
        // RED PHASE: FAILS because the current code has these suppression comments.
        const fs = await import('fs');
        const path = await import('path');
        const stylesPath = path.resolve(__dirname, '..', 'styles.ts');
        const content = fs.readFileSync(stylesPath, 'utf-8');

        // Find all lines that define selectStyles presets
        const lines = content.split('\n');
        const selectStyleLines = lines.filter(
            line => line.includes('createSelectStyles<') && line.includes('>')
        );

        // There should be selectStyle definition lines
        expect(selectStyleLines.length).toBeGreaterThan(0);

        // None of them should use `any` as a type parameter
        for (const line of selectStyleLines) {
            expect(line).not.toMatch(/createSelectStyles<any/);
        }
    });

    it('should not have eslint-disable comments for no-explicit-any near selectStyles', async () => {
        // RED PHASE: FAILS because the source currently has these suppressions
        const fs = await import('fs');
        const path = await import('path');
        const stylesPath = path.resolve(__dirname, '..', 'styles.ts');
        const content = fs.readFileSync(stylesPath, 'utf-8');

        const lines = content.split('\n');

        // Find the selectStyles object definition region
        const selectStylesStart = lines.findIndex(l => l.includes('export const selectStyles'));
        expect(selectStylesStart).toBeGreaterThan(-1);

        // Check lines from selectStyles definition to the end of the object
        const selectStylesRegion = lines.slice(selectStylesStart);
        const closingBrace = selectStylesRegion.findIndex(l => l.match(/^};?\s*$/));
        const region = selectStylesRegion.slice(0, closingBrace + 1);

        const eslintDisableLines = region.filter(l =>
            l.includes('eslint-disable') && l.includes('no-explicit-any')
        );

        // After the fix, there should be zero eslint-disable comments for no-explicit-any
        expect(eslintDisableLines).toHaveLength(0);
    });
});

// =================================================================
// selectStyles.compact: verify typing is not `any`
// =================================================================
describe('selectStyles.compact typing', () => {
    it('is defined and has expected style functions', () => {
        expect(selectStyles.compact).toBeDefined();
        expect(typeof selectStyles.compact.control).toBe('function');
        expect(typeof selectStyles.compact.option).toBe('function');
    });

    it('has menuPortal style due to usePortal option', () => {
        // compact is configured with usePortal: true
        expect(selectStyles.compact.menuPortal).toBeDefined();
    });
});

// =================================================================
// selectStyles.form: verify typing is not `any`
// =================================================================
describe('selectStyles.form typing', () => {
    it('is defined and has expected style functions', () => {
        expect(selectStyles.form).toBeDefined();
        expect(typeof selectStyles.form.control).toBe('function');
        expect(typeof selectStyles.form.option).toBe('function');
    });
});

// =================================================================
// Consumer compatibility: DietSelect usage pattern
// =================================================================
describe('DietSelect style consumption typing', () => {
    it('selectStyles.default should have all required style keys for multi-select', () => {
        // DietSelect uses: styles={selectStyles.default as StylesConfig<DietOption, true>}
        // Verify all style keys needed for a multi-select are present
        const styles = selectStyles.default;
        expect(styles.control).toBeDefined();
        expect(styles.menu).toBeDefined();
        expect(styles.option).toBeDefined();
        expect(styles.multiValue).toBeDefined();
        expect(styles.multiValueLabel).toBeDefined();
        expect(styles.multiValueRemove).toBeDefined();
        expect(styles.input).toBeDefined();
        expect(styles.singleValue).toBeDefined();
        expect(styles.placeholder).toBeDefined();
        expect(styles.indicatorSeparator).toBeDefined();
        expect(styles.dropdownIndicator).toBeDefined();
        expect(styles.clearIndicator).toBeDefined();

        // Type-level: presets are typed as StylesConfig<unknown, boolean>
        // Consumers narrow via assertion: `as StylesConfig<DietOption, true>`
        expectTypeOf(styles).toEqualTypeOf<StylesConfig<unknown, boolean>>();
    });
});

// =================================================================
// Consumer compatibility: RecipeMultiSelect usage pattern
// =================================================================
describe('RecipeMultiSelect style consumption typing', () => {
    it('selectStyles.compact should be usable with string-value Option type', () => {
        const styles = selectStyles.compact;
        expect(styles.control).toBeDefined();
        expect(styles.option).toBeDefined();

        // Consumers narrow via assertion: `as StylesConfig<Option, true>`
        expectTypeOf(styles).toEqualTypeOf<StylesConfig<unknown, boolean>>();
    });
});

// =================================================================
// Consumer compatibility: MealForm usage pattern
// =================================================================
describe('MealForm style consumption typing', () => {
    it('selectStyles.form should be usable with single-select Option type', () => {
        const styles = selectStyles.form;
        expect(styles.control).toBeDefined();
        expect(styles.option).toBeDefined();

        // MealForm narrows via assertion: `as StylesConfig<Option, false>`
        expectTypeOf(styles).toEqualTypeOf<StylesConfig<unknown, boolean>>();
    });
});

// =================================================================
// Runtime structure validation for all presets
// =================================================================
describe('selectStyles presets runtime structure', () => {
    it('all three presets should have the core style keys', () => {
        const defaultKeys = Object.keys(selectStyles.default).sort();
        const compactKeys = Object.keys(selectStyles.compact).sort();
        const formKeys = Object.keys(selectStyles.form).sort();

        const coreKeys = ['control', 'menu', 'option', 'input', 'singleValue',
            'placeholder', 'indicatorSeparator', 'dropdownIndicator', 'clearIndicator',
            'multiValue', 'multiValueLabel', 'multiValueRemove'];

        for (const key of coreKeys) {
            expect(defaultKeys).toContain(key);
            expect(formKeys).toContain(key);
            // compact has all core keys plus menuPortal
            expect(compactKeys).toContain(key);
        }

        // compact should also have menuPortal since usePortal=true
        expect(compactKeys).toContain('menuPortal');
    });

    it('style functions return objects with expected CSS properties', () => {
        // Test that the control style function produces dark-theme styles
        const controlFn = selectStyles.default.control;
        if (typeof controlFn === 'function') {
            const baseStyles = {} as import('react-select').CSSObjectWithLabel;
            const state = { isFocused: false } as Parameters<typeof controlFn>[1];
            const result = controlFn(baseStyles, state);

            expect(result).toHaveProperty('backgroundColor');
            expect(result).toHaveProperty('borderColor');
            expect(result).toHaveProperty('color');
            expect(result).toHaveProperty('minHeight');
        }
    });
});
