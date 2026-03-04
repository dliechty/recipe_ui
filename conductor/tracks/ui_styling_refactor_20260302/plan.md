# Plan: UI Styling Refinement & Code Quality Refactor

## Phase 1: Theme Token System Completion [FR-1] [checkpoint: 5ebf172]

- [x] Task: Write tests for expanded semantic token system [0eeb6e5]
    - [x] Create test file for theme token validation
    - [x] Test that all new semantic tokens (button.text, status.warning*, link.*, danger.*, success.*, info.*, badge.*) resolve to valid color values
    - [x] Test that no semantic category has gaps (every status has fg/bg/border variants)
    - [x] Run tests and confirm they fail (Red Phase)

- [x] Task: Expand semantic tokens in theme.ts [61dece3]
    - [x] Add `button.text` token mapped to white
    - [x] Add `status.warning`, `status.warningBg`, `status.warningBorder` semantic tokens
    - [x] Add `link.default`, `link.hover` tokens
    - [x] Add `danger.fg`, `danger.bg`, `danger.bgHover` tokens
    - [x] Add `success.fg`, `success.bg`, `success.bgHover` tokens
    - [x] Add `info.fg`, `info.bg` tokens
    - [x] Add badge-level tokens for role/status indicators (e.g., `badge.admin`, `badge.member`, `badge.pending`)
    - [x] Run tests and confirm they pass (Green Phase)

- [x] Task: Write tests for single source of truth between theme.ts and styles.ts [f011141]
    - [x] Test that styles.ts themeColors values match theme.ts token values
    - [x] Test that styles.ts does not contain independent hex definitions
    - [x] Run tests and confirm they fail (Red Phase)

- [x] Task: Eliminate duplicate color definitions in styles.ts [e628bef]
    - [x] Refactor `themeColors` in styles.ts to derive values from theme.ts tokens or a shared constants file
    - [x] Remove all duplicated hex string definitions from styles.ts
    - [x] Update react-select `createSelectStyles` to use the derived values
    - [x] Replace hard-coded `'white'` and `rgba(0,0,0,0.4)` in react-select styles with token references
    - [x] Run tests and confirm they pass (Green Phase)
    - [x] Run `npm run lint` and `npx tsc --noEmit` to verify no regressions

- [x] Task: Conductor - User Manual Verification 'Phase 1: Theme Token System Completion' (Protocol in workflow.md) [5ebf172]

## Phase 2: Shared Style Utilities [FR-2] [checkpoint: 3fa381e]

- [x] Task: Write tests for shared style utilities [a0a9b6d]
    - [ ] Test that `inputStyles` utility exports correct focus ring properties
    - [ ] Test that `focusRingStyles` utility produces consistent _focus and _hover props
    - [ ] Test that `nativeSelectStyles` utility returns correct CSS properties using theme tokens
    - [ ] Test that button style utilities (primary, danger, success, secondary) export correct token references
    - [ ] Run tests and confirm they fail (Red Phase)

- [x] Task: Implement shared style utilities in styles.ts [95858e9]
    - [ ] Create `inputStyles` object with bg, borderColor, _hover, _focus properties using semantic tokens
    - [ ] Create `focusRingStyles` for the common focus ring pattern
    - [ ] Create `buttonStyles.primary`, `buttonStyles.danger`, `buttonStyles.success`, `buttonStyles.secondary` objects
    - [ ] Ensure `nativeSelectStyles` utility is complete and uses theme tokens
    - [ ] Export `scrollbarStyles` if not already exported
    - [ ] Run tests and confirm they pass (Green Phase)

- [x] Task: Migrate components to use shared input styles [8af9bff]
    - [ ] Replace all local `const inputStyles` definitions across filter components with import from styles.ts
    - [ ] Replace all inline `_focus={{ borderColor: 'vscode.accent', boxShadow: '...' }}` patterns (25+ instances) with shared utility
    - [ ] Replace `fontSize="0.875rem"` in RecipeList.tsx with `"sm"` token
    - [ ] Run full test suite to verify no regressions

- [x] Task: Migrate native select elements to use shared styles [e231875]
    - [ ] Fix MealDetails.tsx:307 hard-coded hex colors on native `<select>` to use nativeSelectStyles
    - [ ] Fix GenerateMealsModal.tsx CSS variable fallbacks to use correct theme values
    - [ ] Verify all native `<select>` elements across the codebase use consistent styling
    - [ ] Run full test suite to verify no regressions

- [x] Task: Conductor - User Manual Verification 'Phase 2: Shared Style Utilities' (Protocol in workflow.md) [3fa381e]

## Phase 3: Component Color Migration [FR-1.3, FR-1.4, FR-3] [checkpoint: 3cda6cf]

- [x] Task: Write tests for component token usage [3c16d08]
    - [ ] Test that button components render with `button.text` token instead of literal "white"
    - [ ] Test that status/feedback components render with semantic status tokens
    - [ ] Test that ErrorBoundary uses `colorPalette` prop (Chakra v3)
    - [ ] Run tests and confirm they fail (Red Phase)

- [x] Task: Replace all `color="white"` with `color="button.text"` on buttons [3d66b0c]
    - [ ] Systematically update all ~85 instances across the codebase
    - [ ] Verify each replacement renders correctly
    - [ ] Run full test suite (Green Phase)

- [x] Task: Replace raw Chakra palette colors with semantic tokens [9de2771]
    - [ ] Replace `red.400`/`red.600` usage with `danger.fg`/`danger.bg` tokens
    - [ ] Replace `green.400`/`green.600` usage with `success.fg`/`success.bg` tokens
    - [ ] Replace `blue.500`/`blue.900` usage with `link.default`/`info.bg` tokens
    - [ ] Replace `yellow.400`/`yellow.500`/`yellow.900` usage with `status.warning`/badge tokens
    - [ ] Replace `orange.400`/`orange.500`/`orange.600` usage with appropriate semantic tokens
    - [ ] Replace `whiteAlpha.200`/`whiteAlpha.100` with semantic overlay tokens or document as acceptable
    - [ ] Replace `gray.700` badge usage with semantic badge tokens
    - [ ] Run full test suite to verify no regressions

- [x] Task: Fix Chakra v3 API alignment [de45de3]
    - [ ] Replace `colorScheme` with `colorPalette` in ErrorBoundary.tsx
    - [ ] Audit all remaining `colorScheme` usage and migrate to `colorPalette` where needed
    - [ ] Run full test suite (Green Phase)

- [x] Task: Remove all remaining hard-coded color values from components [13f846a]
    - [ ] Fix RecipeDetails.tsx rgba fallback in _hover
    - [ ] Final sweep: grep for hex codes, rgb(), rgba() in component files (excluding SnakeGame.tsx, theme.ts, and src/client/)
    - [ ] Run `npm run lint` and `npx tsc --noEmit` to verify clean

- [x] Task: Conductor - User Manual Verification 'Phase 3: Component Color Migration' (Protocol in workflow.md)

## Phase 4: Linting Exception Cleanup [FR-4]

- [x] Task: Write tests for properly typed react-select generics [fa48498]
    - [x] Test that selectStyles exports are properly typed without `any`
    - [x] Test that DietSelect, RecipeMultiSelect, and MealForm consume typed select styles
    - [x] Run tests and confirm they fail (Red Phase)

- [x] Task: Remove `@typescript-eslint/no-explicit-any` suppressions [685aaf1]
    - [x] Properly type react-select generics in styles.ts (replace `any` with proper Option/IsMulti types)
    - [x] Replace `any` in test files (RecipeSearchSelector.test.tsx, CalendarView.test.tsx) with proper types or `unknown`
    - [x] Run tests and confirm they pass (Green Phase)

- [x] Task: Remove `@typescript-eslint/no-unused-vars` suppressions [f8258af]
    - [x] Refactor destructuring in RecipeForm.tsx to use rest operator instead of naming unused vars
    - [x] Refactor destructuring in RecipeDetails.tsx similarly
    - [x] Refactor destructuring in TemplateForm.tsx similarly
    - [x] Fix CalendarView.test.tsx unused variable
    - [x] Run full test suite to verify no regressions

- [x] Task: Remove `react-hooks/exhaustive-deps` suppressions [c0db92c]
    - [x] Refactor RecipeFilters.tsx effect to properly declare dependencies (use useCallback or refs)
    - [x] Refactor MealFilters.tsx effect similarly
    - [x] Refactor TemplateFilters.tsx effect similarly
    - [x] Refactor UpcomingMeals.tsx effect similarly
    - [x] Refactor HouseholdContext.tsx effect similarly
    - [x] Run full test suite to verify no regressions

- [x] Task: Audit and document remaining `react-refresh/only-export-components` suppressions [2258564]
    - [x] Evaluate if AuthContext.tsx, HouseholdContext.tsx, AdminModeContext.tsx suppressions can be removed
    - [x] If not removable, add inline justification comment for each
    - [x] Confirm test-utils.tsx suppression is documented
    - [x] Run full test suite to verify no regressions

- [x] Task: Escalate `no-explicit-any` to error in ESLint config [fbb84c2]
    - [x] Change `@typescript-eslint/no-explicit-any` from `'warn'` to `'error'` in eslint.config.js
    - [x] Run `npm run lint` and confirm zero violations
    - [x] Run `npx tsc --noEmit` to confirm type safety

- [ ] Task: Conductor - User Manual Verification 'Phase 4: Linting Exception Cleanup' (Protocol in workflow.md)

## Phase 5: Mobile Responsive Audit [FR-5]

- [ ] Task: Set up Playwright mobile viewport tests
    - [ ] Configure Playwright test files for mobile viewports (375px iPhone SE, 768px iPad)
    - [ ] Create test scenarios for all major views: Login, Recipes List, Recipe Detail, Meal Calendar, Meal Detail, Admin Dashboard, User Account
    - [ ] Run tests to establish baseline

- [ ] Task: Audit and fix recipe views for mobile
    - [ ] Test RecipeList page at 375px and 768px — fix overflow, layout, touch targets
    - [ ] Test RecipeDetails page at 375px and 768px — fix content clipping, readability
    - [ ] Test RecipeForm (create/edit) at 375px and 768px — fix form usability
    - [ ] Test RecipeFilters panel at mobile sizes — ensure filter UI is accessible
    - [ ] Verify dark theme contrast on mobile viewports

- [ ] Task: Audit and fix meal planning views for mobile
    - [ ] Test CalendarView at 375px and 768px — fix calendar layout, day cell sizing
    - [ ] Test MealDetails at 375px and 768px — fix content layout
    - [ ] Test MealForm at 375px and 768px — fix form usability
    - [ ] Test UpcomingMeals at 375px and 768px — fix list layout
    - [ ] Test MealTemplates at 375px and 768px — fix card layout

- [ ] Task: Audit and fix navigation, auth, and admin views for mobile
    - [ ] Test navigation bar/menu at 375px — fix menu usability, hamburger behavior
    - [ ] Test Login page at 375px and 768px — fix form layout
    - [ ] Test Admin Dashboard at 375px and 768px — fix table/list layouts
    - [ ] Test User Account / Household pages at 375px and 768px
    - [ ] Ensure all touch targets meet 44x44px minimum

- [ ] Task: Conductor - User Manual Verification 'Phase 5: Mobile Responsive Audit' (Protocol in workflow.md)

## Phase 6: Design Guidelines Documentation [FR-6]

- [ ] Task: Draft design guidelines content
    - [ ] Document color token naming conventions and the complete semantic token map
    - [ ] Document prohibited patterns (no hard-coded colors, no raw Chakra palette colors)
    - [ ] Document shared utility API (inputStyles, focusRingStyles, buttonStyles, nativeSelectStyles, selectStyles, scrollbarStyles)
    - [ ] Document mobile responsiveness guidelines (breakpoints, touch targets, layout patterns)
    - [ ] Document component styling conventions (when to use Chakra props vs utilities vs CSS)

- [ ] Task: Update README.md with Design System section
    - [ ] Add "Design System" section covering token usage, styling patterns, and mobile guidelines
    - [ ] Include quick-reference table of semantic tokens
    - [ ] Include "do / don't" examples for color usage

- [ ] Task: Update CLAUDE.md with design guidelines
    - [ ] Add explicit design rules: always use semantic tokens, never hard-code colors, use shared utilities
    - [ ] Add prohibited patterns list
    - [ ] Add component styling reference

- [ ] Task: Update GEMINI.md with design guidelines
    - [ ] Mirror the same design guidelines from CLAUDE.md
    - [ ] Ensure consistent instructions across both AI assistant files

- [ ] Task: Final validation sweep
    - [ ] Run `npm run test:once` — all tests pass
    - [ ] Run `npm run lint` — zero warnings, zero errors
    - [ ] Run `npx tsc --noEmit` — zero type errors
    - [ ] Grep for any remaining hard-coded colors in component files
    - [ ] Grep for any remaining `eslint-disable` comments (document justified exceptions)

- [ ] Task: Conductor - User Manual Verification 'Phase 6: Design Guidelines Documentation' (Protocol in workflow.md)
