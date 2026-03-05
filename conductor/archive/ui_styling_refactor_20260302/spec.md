# Spec: UI Styling Refinement & Code Quality Refactor

## Overview

A comprehensive refactor of the Recipe UI application's styling system, component consistency, mobile responsiveness, and code quality. This track addresses fragmented color definitions, hard-coded values, duplicated style patterns, linting exceptions, and Chakra v2/v3 API inconsistencies. It also establishes design guidelines documentation and ensures all views work well on mobile browsers.

## Background & Motivation

An audit of the current codebase revealed:

1. **Duplicate color sources of truth**: `theme.ts` defines Chakra tokens while `styles.ts` duplicates all ~20+ hex values as plain strings for react-select. Changes require manual sync between files.
2. **Incomplete semantic token layer**: Warning-state tokens (`warningBg`, `warningText`, `warningBorder`) exist as raw tokens but lack semantic equivalents. No `button.text` token exists despite ~85 uses of `color="white"`.
3. **Hard-coded colors in components**: `MealDetails.tsx`, `GenerateMealsModal.tsx`, and `RecipeDetails.tsx` contain inline hex values. `GenerateMealsModal.tsx` fallback values don't match actual theme values.
4. **Raw Chakra palette colors**: `red.600`, `green.400`, `blue.500`, `yellow.400`, `orange.400`, `whiteAlpha.200`, etc. used in ~30+ places instead of semantic tokens.
5. **Duplicated input styles**: The focus ring pattern (`_focus={{ borderColor: 'vscode.accent', boxShadow: '...' }}`) is copy-pasted across 25+ files. Several files define local `const inputStyles` objects that are never shared.
6. **Chakra v2 API usage**: `ErrorBoundary.tsx` uses `colorScheme` prop (v2) instead of `colorPalette` (v3).
7. **Linting exceptions**: 20+ `eslint-disable` comments across production and test code for `react-hooks/exhaustive-deps`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars`, and `react-refresh/only-export-components`.
8. **Non-token font sizes**: `RecipeList.tsx` uses `fontSize="0.875rem"` instead of Chakra's `"sm"` token.
9. **No documented design guidelines**: No central reference for developers on color usage, component patterns, or styling conventions.
10. **Mobile responsiveness**: Not systematically verified across views.

## Functional Requirements

### FR-1: Semantic Token System Completion

- **FR-1.1**: Add missing semantic tokens to `theme.ts`:
  - `button.text` (white)
  - `status.warning`, `status.warningBg`, `status.warningBorder`
  - `link.default`, `link.hover`
  - `danger.fg`, `danger.bg`, `danger.bgHover`
  - `success.fg`, `success.bg`, `success.bgHover`
  - `info.fg`, `info.bg`
  - Badge-level tokens for role/status indicators
  - Any additional tokens discovered during implementation
- **FR-1.2**: Eliminate the duplicate `themeColors` object in `styles.ts` by deriving values from the theme system (or importing from a single source of truth).
- **FR-1.3**: Replace all `color="white"` on buttons with `color="button.text"` semantic token.
- **FR-1.4**: Replace all raw Chakra palette colors (`red.600`, `green.400`, `blue.500`, `yellow.400`, `orange.400`, `whiteAlpha.200`, etc.) with corresponding semantic tokens.

### FR-2: Shared Style Utilities

- **FR-2.1**: Extract the repeated input focus ring pattern into a shared utility in `styles.ts` (e.g., `inputStyles`, `focusRingStyles`).
- **FR-2.2**: Extract common button style patterns (primary, danger, success, secondary) into shared utilities or theme recipes.
- **FR-2.3**: Ensure all native `<select>` elements use `nativeSelectStyles` from `styles.ts` (fix `MealDetails.tsx:307` and `GenerateMealsModal.tsx` fallback mismatches).
- **FR-2.4**: Replace `fontSize="0.875rem"` in `RecipeList.tsx` with Chakra's `"sm"` token.
- **FR-2.5**: Update `styles.ts` react-select styling to eliminate remaining hard-coded values (`'white'` for multiValue text, `rgba(0,0,0,0.4)` box-shadow).

### FR-3: Chakra v3 API Alignment

- **FR-3.1**: Replace `colorScheme` prop usage in `ErrorBoundary.tsx` with `colorPalette` (Chakra v3 API).
- **FR-3.2**: Audit and fix any other Chakra v2 patterns found during implementation.

### FR-4: Linting Exception Cleanup

- **FR-4.1**: Remove `@typescript-eslint/no-explicit-any` suppressions by properly typing react-select generics in `styles.ts` and replacing `any` in test files with proper types or `unknown`.
- **FR-4.2**: Remove `@typescript-eslint/no-unused-vars` suppressions by using proper destructuring patterns (rest operator or explicit omit).
- **FR-4.3**: Remove `react-hooks/exhaustive-deps` suppressions in filter components (`RecipeFilters`, `MealFilters`, `TemplateFilters`, `UpcomingMeals`, `HouseholdContext`) by refactoring effects and callbacks to properly declare dependencies.
- **FR-4.4**: Remove `react-refresh/only-export-components` suppressions where possible. Context files (`AuthContext`, `HouseholdContext`, `AdminModeContext`) may legitimately require this exception — document the justification if kept. The `test-utils.tsx` suppression is acceptable.
- **FR-4.5**: Escalate `@typescript-eslint/no-explicit-any` from `'warn'` to `'error'` in `eslint.config.js` once all instances are resolved.

### FR-5: Mobile Responsive Audit

- **FR-5.1**: Use Playwright to test all major views at mobile viewport sizes (375px iPhone SE, 768px iPad).
- **FR-5.2**: Fix layout breaks, horizontal overflow, and content clipping on mobile viewports.
- **FR-5.3**: Ensure touch targets meet minimum 44x44px guideline.
- **FR-5.4**: Verify the dark theme renders correctly on mobile (contrast, readability).
- **FR-5.5**: Fix any navigation/menu usability issues on mobile.

### FR-6: Design Guidelines Documentation

- **FR-6.1**: Update `README.md` with a "Design System" section covering: color token usage, component styling patterns, and mobile guidelines.
- **FR-6.2**: Update `CLAUDE.md` with explicit design guidelines: token naming conventions, prohibited patterns (no hard-coded colors, no raw Chakra palette colors, always use semantic tokens), and component styling rules.
- **FR-6.3**: Update `GEMINI.md` with the same design guidelines as `CLAUDE.md`.
- **FR-6.4**: Document the `styles.ts` utility API (inputStyles, nativeSelectStyles, selectStyles, scrollbarStyles, focusRingStyles) so future development uses shared utilities.

## Non-Functional Requirements

- **NFR-1**: Zero visual regressions — changes must not alter the intended appearance of any component.
- **NFR-2**: All existing tests must continue to pass.
- **NFR-3**: No new `eslint-disable` comments may be introduced.
- **NFR-4**: `npm run lint` must pass clean after completion.
- **NFR-5**: `npx tsc --noEmit` must pass clean after completion.

## Acceptance Criteria

1. `theme.ts` is the single source of truth for all colors. `styles.ts` derives its values from theme tokens or a shared constant, not a duplicated object.
2. Zero hard-coded hex/rgb/rgba color values in component files (excluding `SnakeGame.tsx` canvas rendering and auto-generated `src/client/`).
3. Zero raw Chakra palette colors (e.g., `red.600`, `green.400`) in component props — all mapped to semantic tokens.
4. A shared `inputStyles` / `focusRingStyles` utility exists and is used by all input-like components.
5. All `eslint-disable` comments are removed except those documented with justification (context file `react-refresh` exceptions).
6. `@typescript-eslint/no-explicit-any` is set to `'error'` in ESLint config with zero violations.
7. All major views render correctly at 375px and 768px viewports (verified via Playwright).
8. `README.md`, `CLAUDE.md`, and `GEMINI.md` contain up-to-date design guidelines.
9. `npm run test:once`, `npm run lint`, and `npx tsc --noEmit` all pass clean.

## Out of Scope

- Adding a light theme or theme toggle
- Changing the overall visual identity or brand colors
- Adding new features or functionality
- Modifying auto-generated files in `src/client/`
- Refactoring `SnakeGame.tsx` canvas colors (game has its own palette)
- Changes to backend API or `openapi.json`
- Performance optimization (bundle size, lazy loading, etc.)
