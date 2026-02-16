# Plan: Enhance the Meal Planning Experience

## Phase 1: Weekly Calendar View Foundation

- [ ] Task 1.1: Write tests for WeekNavigation component
  - Create test file for WeekNavigation component
  - Test rendering of current week date range
  - Test previous/next week button navigation
  - Test "Today" button returns to current week
  - Test URL search param updates on navigation

- [ ] Task 1.2: Implement WeekNavigation component
  - Build WeekNavigation component with prev/next/today buttons
  - Display week date range (e.g., "Feb 16 – Feb 22, 2026")
  - Integrate with URL search params for bookmarkability
  - Style with Chakra UI dark theme

- [ ] Task 1.3: Write tests for DayColumn and MealSlot components
  - Create test files for DayColumn and MealSlot components
  - Test DayColumn renders day header and meal slots grouped by classification
  - Test MealSlot renders meal name and recipe count
  - Test MealSlot renders empty state with add button
  - Test current day highlighting
  - Test click on meal card navigates to meal detail

- [ ] Task 1.4: Implement DayColumn and MealSlot components
  - Build DayColumn component showing day name, date, and meal slots by classification
  - Build MealSlot component for displaying meal cards and empty slot placeholders
  - Highlight current day visually
  - Add navigation to meal detail on click
  - Style with Chakra UI dark theme, card-based layout

- [ ] Task 1.5: Write tests for WeeklyCalendarView component
  - Create test file for WeeklyCalendarView component
  - Test fetching meals for the selected week using date range filters
  - Test rendering 7 DayColumns with correct dates
  - Test meals are correctly distributed to their respective day and classification
  - Test loading and empty states

- [ ] Task 1.6: Implement WeeklyCalendarView component
  - Build WeeklyCalendarView composing WeekNavigation and 7 DayColumns
  - Use useInfiniteMeals with date range filters to fetch week's meals
  - Distribute meals to correct day/classification slots
  - Handle loading, empty, and error states
  - Responsive layout with horizontal scroll on mobile

- [ ] Task 1.7: Write tests for MealsPage weekly tab integration
  - Test new "Weekly" tab appears in MealsPage
  - Test tab navigation routes to /meals/weekly
  - Test WeeklyCalendarView renders within the tab

- [ ] Task 1.8: Integrate WeeklyCalendarView into MealsPage
  - Add "Weekly" tab to MealsPage alongside Meals and Templates
  - Add route for /meals/weekly in AppRoutes.tsx
  - Wire up tab navigation

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Weekly Calendar View Foundation' (Protocol in workflow.md)

## Phase 2: Quick-Add Meal from Calendar

- [ ] Task 2.1: Write tests for QuickAddMealModal component
  - Create test file for QuickAddMealModal component
  - Test modal opens with pre-filled date and classification
  - Test recipe search and selection within modal
  - Test meal creation submission
  - Test modal closes and calendar updates after successful creation
  - Test validation (at least one recipe required)

- [ ] Task 2.2: Implement QuickAddMealModal component
  - Build streamlined modal with date and classification pre-filled
  - Include inline RecipeSearchSelector for recipe selection
  - Use useCreateMeal mutation for submission
  - Show success feedback and close modal on completion
  - Style with Chakra UI dark theme

- [ ] Task 2.3: Write tests for QuickAddMealModal integration with calendar
  - Test clicking empty slot opens QuickAddMealModal with correct date/classification
  - Test clicking "+" button on a day opens modal with correct date
  - Test newly created meal appears in calendar after modal closes

- [ ] Task 2.4: Integrate QuickAddMealModal with WeeklyCalendarView
  - Wire empty MealSlot click to open QuickAddMealModal
  - Pass date and classification context to modal
  - Invalidate meals query on successful creation to refresh calendar

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Quick-Add Meal from Calendar' (Protocol in workflow.md)

## Phase 3: Add Recipe to Meal Plan

- [ ] Task 3.1: Write tests for AddToMealPlanModal component
  - Create test file for AddToMealPlanModal component
  - Test modal renders with recipe info
  - Test date picker and classification selector
  - Test creating a new meal with the recipe
  - Test adding recipe to an existing meal for the selected date/classification
  - Test success feedback

- [ ] Task 3.2: Implement AddToMealPlanModal component
  - Build modal showing recipe name/summary
  - Include date picker and classification selector
  - Logic to check for existing meal at date/classification and offer to add or create new
  - Use useCreateMeal or useUpdateMeal mutations
  - Success confirmation feedback
  - Style with Chakra UI dark theme

- [ ] Task 3.3: Write tests for "Add to Meal Plan" button on recipe pages
  - Test "Add to Meal Plan" button appears on recipe detail page
  - Test "Add to Meal Plan" action appears on recipe cards
  - Test clicking button opens AddToMealPlanModal with recipe context

- [ ] Task 3.4: Integrate AddToMealPlanModal with recipe components
  - Add "Add to Meal Plan" button to RecipeDetails component
  - Add "Add to Meal Plan" action to recipe card components
  - Wire button clicks to open AddToMealPlanModal with recipe data

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Add Recipe to Meal Plan' (Protocol in workflow.md)

## Phase 4: Weekly Shopping List

- [ ] Task 4.1: Write tests for WeeklyShoppingList component
  - Create test file for WeeklyShoppingList component
  - Test fetching all meals for the selected week
  - Test ingredient aggregation across multiple meals
  - Test merged vs by-meal view toggle
  - Test checkbox state for shopping tracking
  - Test empty state when no meals planned

- [ ] Task 4.2: Implement WeeklyShoppingList component
  - Build component that fetches all meals and their recipes for the week
  - Reuse IngredientAggregation logic for cross-meal ingredient merging
  - Provide merged and by-meal view toggles
  - Add interactive checkboxes for shopping tracking
  - Style with Chakra UI dark theme

- [ ] Task 4.3: Write tests for WeeklyShoppingList integration with calendar
  - Test "Shopping List" button appears in weekly calendar view
  - Test clicking button shows/navigates to shopping list
  - Test shopping list reflects the currently selected week

- [ ] Task 4.4: Integrate WeeklyShoppingList with WeeklyCalendarView
  - Add "Shopping List" button or tab to the weekly calendar view
  - Pass selected week context to WeeklyShoppingList
  - Ensure list updates when week navigation changes

- [ ] Task: Conductor - User Manual Verification 'Phase 4: Weekly Shopping List' (Protocol in workflow.md)
