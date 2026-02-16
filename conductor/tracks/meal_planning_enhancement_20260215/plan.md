# Plan: Enhance the Meal Planning Experience

## Phase 1: API Client Regeneration & Data Layer Updates

- [x] Task 1.1: Regenerate API client from updated OpenAPI spec `13edf39`
  - Run `npm run api:sync` to regenerate `src/client/` from the updated `openapi.json`
  - Verify the new types exist: `MealStatus` (Queued/Cooked/Cancelled), `MealGenerateRequest`, updated `Meal`/`MealCreate`/`MealUpdate` with `is_shopped`, `queue_position`, `scheduled_date`
  - Verify the updated `generate_meals` service method signature

- [x] Task 1.2: Update useMeals hooks for new data model `67c076c`
  - Update `useInfiniteMeals` to support `is_shopped` and `scheduled_date` filter params
  - Add `useGenerateMeals` hook calling `POST /meals/generate` with `MealGenerateRequest` body
  - Add `useReorderMeals` hook (batch updates `queue_position` via multiple `PUT /meals/{id}` calls)
  - Add `useBulkUpdateMeals` hook for bulk `is_shopped` toggling
  - Update `MealFilters` type and `mealParams.ts` for new filter fields (`is_shopped`, `scheduled_date`)

- [x] Task 1.3: Update existing components for new status enum `67c076c`
  - Update `EditableStatusBadge` to use `Queued`/`Cooked`/`Cancelled` (remove `Draft`/`Scheduled`)
  - Update `MealFilters` component dropdown options for new statuses
  - Update any hardcoded status references across meal components
  - Update `EditableMealDate` to use `scheduled_date` field name instead of `date`

- [x] Task 1.4: Write tests for updated hooks and status handling `67c076c`
  - Test `useGenerateMeals` with MSW mock for `POST /meals/generate`
  - Test `useInfiniteMeals` with new filter params
  - Test `EditableStatusBadge` renders new status values with correct colors
  - Test `mealParams` serialization/deserialization with new fields

## Phase 2: Navigation & Landing Page Changes

- [x] Task 2.1: Write tests for navigation and redirect changes `85e5e0c`
  - Test Layout navbar renders Meals before Recipes (desktop and mobile)
  - Test LoginPage redirects to `/meals` after login (instead of `/recipes`)
  - Test ProtectedRoute admin fallback redirects to `/meals`

- [x] Task 2.2: Update navigation order and default redirects `85e5e0c`
  - In `Layout.tsx`, move Meals `NavItem` before Recipes in both desktop nav and mobile menu
  - In `LoginPage.tsx`, change default redirect from `/recipes` to `/meals`
  - In `ProtectedRoute.tsx`, change admin non-auth redirect from `/recipes` to `/meals`

- [x] Task 2.3: Write tests for MealsPage tab restructuring `85e5e0c`
  - Test MealsPage renders three tabs: Upcoming, Templates, History
  - Test tab routing: `/meals` → Upcoming, `/meals/templates` → Templates, `/meals/history` → History
  - Test Upcoming tab is selected by default

- [x] Task 2.4: Restructure MealsPage tabs and routing `85e5e0c`
  - Update `MealsPage.tsx` tab structure: Upcoming (default) → Templates → History
  - Update `AppRoutes.tsx` nested routes under `/meals`: index → UpcomingMeals, `templates` → TemplateList, `history` → MealHistoryList
  - Add lazy-loaded imports for new components (UpcomingMeals, MealHistoryList)

## Phase 3: Upcoming Meals Queue

- [x] Task 3.1: Write tests for MealQueueCard component `2643eb4`
  - Test renders meal name, classification badge, recipe count
  - Test shows scheduled date when present, "Unscheduled" when absent
  - Test shows shopped/unshopped indicator
  - Test click navigates to meal detail page
  - Test drag handle is present and accessible

- [x] Task 3.2: Implement MealQueueCard component `2643eb4`
  - Build card component with meal name, classification badge, recipe count, scheduled date, shopped icon
  - Add drag handle for @dnd-kit integration
  - Style with dark theme card layout matching existing app patterns
  - Add click-to-navigate to `/meals/:id`

- [x] Task 3.3: Write tests for UpcomingMeals component `2643eb4`
  - Test fetches only current user's Queued meals sorted by queue_position
  - Test renders MealQueueCards for each meal
  - Test empty state with generate prompt
  - Test drag-and-drop reorder updates queue_position
  - Test "Generate Meals" button is visible

- [x] Task 3.4: Implement UpcomingMeals component `2643eb4`
  - Build queue view using `useInfiniteMeals` with `status[in]=Queued` and `owner` filter
  - Render list of `MealQueueCard` components within `@dnd-kit` DndContext/SortableContext
  - Implement drag-and-drop reorder with `queue_position` updates on drag-end
  - Show empty state with CTA to generate meals
  - Add "Generate Meals" button in the header area
  - Handle loading and error states

## Phase 4: Batch Meal Generation

- [x] Task 4.1: Write tests for GenerateMealsModal component `7a743a4`
  - Test modal opens with count input (default 5)
  - Test count validation (min 1, max reasonable limit)
  - Test optional scheduled dates input
  - Test submit calls generate endpoint with correct payload
  - Test success feedback and modal close
  - Test loading state during generation
  - Test error handling

- [x] Task 4.2: Implement GenerateMealsModal component `7a743a4`
  - Build modal with number input for meal count
  - Optional date picker section for scheduling generated meals
  - Submit button calls `useGenerateMeals` hook
  - Show success toast with count of generated meals
  - Close modal and invalidate meals query on success
  - Style consistent with existing modals (e.g., GenerateMealModal, RecipeFilterModal)

- [x] Task 4.3: Integrate GenerateMealsModal with UpcomingMeals `7a743a4`
  - Wire "Generate Meals" button to open GenerateMealsModal
  - Wire empty-state CTA to open GenerateMealsModal
  - Ensure queue refreshes after successful generation

## Phase 5: Shopping Workflow

- [x] Task 5.1: Write tests for shopping status and bulk actions `2f1d3e9`
  - Test MealQueueCard shows correct shopped/unshopped visual
  - Test selecting multiple meals for bulk is_shopped toggle
  - Test bulk update calls API for each selected meal
  - Test selection UI (checkboxes or multi-select mode)

- [x] Task 5.2: Implement shopping status display and bulk toggle `2f1d3e9`
  - Add shopped indicator to MealQueueCard (shopping bag icon, checked/unchecked)
  - Add selection mode to UpcomingMeals (checkbox per card or select-all)
  - Add "Mark as Shopped" / "Mark as Unshopped" bulk action buttons
  - Call `useBulkUpdateMeals` on bulk action, invalidate queries on success

- [x] Task 5.3: Write tests for ShoppingListPanel component `2f1d3e9`
  - Test fetches all Queued un-shopped meals and their recipes
  - Test ingredient aggregation across multiple meals
  - Test merged vs by-meal view toggle
  - Test checkbox state for individual items
  - Test empty state when all meals are shopped

- [x] Task 5.4: Implement ShoppingListPanel component `2f1d3e9`
  - Build drawer/modal that fetches Queued + un-shopped meals
  - Fetch full recipe details for each meal's items
  - Reuse `IngredientAggregation` patterns for ingredient merging
  - Provide merged and by-meal view toggles
  - Add interactive checkboxes for shopping tracking (client-side state)
  - Add "Shopping List" button to UpcomingMeals header
  - Style consistent with dark theme

## Phase 6: Calendar View Toggle

- [x] Task 6.1-6.4: CalendarView component with tests `6154186`
  - Weekly 7-day grid with day headers and meal cards
  - Week navigation (prev/next/today) with date range display
  - Meals grouped by scheduled_date into correct day slots
  - Unscheduled meals section
  - Current day highlight with accent border
  - Click-to-navigate to meal details
  - Recipe names in day slots

- [x] Task 6.5-6.6: Calendar toggle integration `6154186`
  - Queue/calendar toggle buttons in UpcomingMeals header
  - Conditionally render queue view or CalendarView based on toggle state

## Phase 7: Meal History Tab

- [x] Task 7.1: Write tests for MealHistoryList component `62f0856`
  - Test fetches only current user's Cooked and Cancelled meals
  - Test sorted by updated_at descending
  - Test reuses existing meal list infinite scroll patterns
  - Test status filters default to both Cooked and Cancelled
  - Test filters work correctly (name search, classification, date range)

- [x] Task 7.2: Implement MealHistoryList component `62f0856`
  - Build component using `useInfiniteMeals` with `status[in]=Cooked,Cancelled` and `owner` filter
  - Reuse existing `MealFilters` and infinite scroll patterns from current `MealList`
  - Default sort: `-updated_at`
  - Add status badge coloring for Cooked (green) and Cancelled (red/muted)

- [x] Task 7.3: Wire MealHistoryList into MealsPage History tab `62f0856`
  - Ensure `/meals/history` route renders MealHistoryList
  - Verify tab highlight when on History tab
