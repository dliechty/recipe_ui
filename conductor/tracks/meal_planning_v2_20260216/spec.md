# Spec: Meal Planning Iteration 2

## Overview

This track addresses bugs, incomplete features, and UX improvements discovered after the initial meal planning enhancement. The focus is on fixing mock data behavior, adding missing form validation, enabling bulk status changes from the queue view, overhauling the shopping list to show aggregated ingredients, adding drag-and-drop to the calendar, and adding sort controls to the queue list view.

## Problem Statement

Several features from the initial meal planning track were delivered in a partial or scaffolded state:
- The MSW mock layer has bugs that prevent drag-and-drop reorder and batch generation from working during development
- Meal creation allows empty names
- Users cannot change meal status or bulk-manage meals from the queue view — they must navigate to each meal's detail page
- The shopping list panel shows a list of meals instead of an aggregated ingredient list
- The calendar view is read-only with no drag-and-drop scheduling
- The queue list view has no sort option for scheduled date ordering

## Goals

1. **Fix MSW mock bugs** — Make drag-and-drop reorder and batch meal generation work correctly with mock data during development
2. **Require meal name** — Validate that the meal name field is non-empty before form submission
3. **Bulk status management** — Allow users to select meals from the upcoming queue and bulk-change status (Cooked, Cancelled) or toggle shopped status
4. **Ingredient-based shopping list** — Replace the meal-list shopping panel with an aggregated ingredient list compiled from all recipes of unshopped meals, with merged/by-recipe toggle, item checkboxes, and a print-optimized layout
5. **Calendar drag-and-drop** — Enable drag-and-drop to reschedule meals between days and to schedule unscheduled meals onto calendar days
6. **Queue sort by date** — Add a sort toggle to the queue list view that orders meals by scheduled date ascending, with unscheduled meals pinned to the top retaining their relative order

## Non-Goals

- Backend API changes
- Changes to the meal detail page (status changes already work there)
- Changes to meal templates or history tab
- Adding new API endpoints

## Detailed Requirements

### R1: MSW Mock Fixes

**R1a: Drag-and-drop reorder**
- The GET /meals/ mock sort handler must support `queue_position` as a sort field
- After bulk PUT updates to queue_position, re-fetching meals sorted by queue_position must return the new order

**R1b: Batch meal generation**
- The POST /meals/generate mock handler currently splices templates from a copy, which means if there are fewer templates than the requested count, fewer meals are generated silently
- Fix to cycle through templates (allow reuse) so the requested count is always honored
- Ensure the mock template store is populated with enough seed data

### R2: Meal Name Validation

- MealForm must require a non-empty name before submission
- Show a validation error message when the user attempts to submit without a name
- The submit button should be visually disabled or the form should prevent submission

### R3: Bulk Status Management from Queue View

- Add a selection mode to the upcoming meals queue (checkbox per card, select-all toggle)
- When meals are selected, show a floating action bar with buttons: "Mark Cooked", "Mark Cancelled", "Mark Shopped", "Mark Unshopped"
- Bulk actions call the existing useBulkUpdateMeals hook
- After bulk status change to Cooked/Cancelled, affected meals disappear from the queue
- Selection state resets after a successful bulk action

### R4: Ingredient-Based Shopping List

- ShoppingListPanel receives meals and full recipe data (not just recipe names)
- Compile all ingredients from all recipes across all unshopped meals into an aggregated list
- Reuse the IngredientAggregation component's patterns: merged view (ingredients grouped by item+unit with summed quantities) and by-recipe view (ingredients grouped under each recipe)
- Each ingredient line has a checkbox for checking off items while shopping (client-side state)
- Add a "Print" button that opens the browser print dialog with a print-optimized CSS layout (clean, minimal, readable on paper)

### R5: Calendar Drag-and-Drop

- Use @dnd-kit to make meal cards in the calendar draggable
- Day slots and the unscheduled area are drop targets
- Dragging a meal from one day to another updates its `scheduled_date` via PUT /meals/{id}
- Dragging an unscheduled meal onto a day slot schedules it
- Dragging a scheduled meal to the unscheduled area removes its scheduled_date
- Visual feedback during drag (ghost card, drop target highlight)

### R6: Queue Sort by Scheduled Date

- Add a sort toggle/button in the queue list header (e.g., "Sort by Date")
- When active, meals are sorted by `scheduled_date` ascending
- Unscheduled meals (no scheduled_date) appear at the top and retain their relative order (by queue_position)
- Default sort remains queue_position (drag-and-drop order)
- Sort preference can be a local toggle (not persisted)

## Technical Approach

### R1: MSW fixes
- Add `queue_position` case to the sort handler in GET /meals/ mock (handlers.ts ~line 947)
- Change generate handler to use modulo cycling instead of splice to allow template reuse

### R2: Meal name validation
- Add `required` state and error display to MealForm's name input
- Prevent form submission when name is empty with trim check

### R3: Bulk status
- Add `selectionMode` and `selectedIds` state to UpcomingMeals
- Pass selection props to MealQueueCard
- Render checkbox on each card when in selection mode
- Add a floating action bar component for bulk actions
- Wire to existing useBulkUpdateMeals hook

### R4: Shopping list overhaul
- Refactor ShoppingListPanel to accept `Recipe[]` data (fetched via existing useRecipe hooks in UpcomingMeals)
- Extract and reuse aggregation logic from IngredientAggregation into a shared utility or directly in ShoppingListPanel
- Add `@media print` CSS for clean print layout

### R5: Calendar drag-and-drop
- Wrap CalendarView with DndContext
- Make meal cards in day slots draggable using @dnd-kit
- Make day GridItems droppable with useDroppable
- Make unscheduled area droppable
- On drop, determine target date and call meal update mutation
- Add visual feedback: drag overlay, drop target highlight

### R6: Queue sort
- Add sort state to UpcomingMeals
- When sort-by-date is active, client-side sort the meals array: nulls first (by queue_position), then by scheduled_date ascending
