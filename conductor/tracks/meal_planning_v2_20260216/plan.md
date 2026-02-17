# Plan: Meal Planning Iteration 2

## Phase 1: MSW Mock Fixes [checkpoint: 49a7666]

- [x] Task 1.1: Write tests for MSW mock sort by queue_position (ae7c332)
  - Test that GET /meals/?sort=queue_position returns meals sorted by queue_position
  - Test that after PUT updates to queue_position, re-fetch returns correct order

- [x] Task 1.2: Fix MSW GET /meals/ sort handler to support queue_position (ae7c332)
  - Add queue_position case to sort handler in handlers.ts
  - Ensure queue_position is treated as numeric sort

- [x] Task 1.3: Fix MSW POST /meals/generate to cycle through templates (ae7c332)
  - Change splice-based template selection to modulo-based cycling (allow reuse)
  - Ensure requested count is always honored regardless of template count
  - Add test coverage for generating more meals than templates

- [x] Task 1.4: Conductor - User Manual Verification 'Phase 1: MSW Mock Fixes' (49a7666)

## Phase 2: Meal Name Validation

- [x] Task 2.1: Write tests for meal name required validation (8aee057)
  - Test that form does not submit when name is empty
  - Test that validation error message appears on empty name submission
  - Test that form submits successfully with a non-empty name

- [x] Task 2.2: Implement meal name required validation in MealForm (6a0b3c6)
  - Add validation state for name field
  - Show error text when name is empty on submit attempt
  - Prevent form submission with empty/whitespace-only name

- [ ] Task 2.3: Conductor - User Manual Verification 'Phase 2: Meal Name Validation' (Protocol in workflow.md)

## Phase 3: Bulk Status Management

- [x] Task 3.1: Write tests for meal selection mode in UpcomingMeals (55ebeba)
  - Test selection toggle button appears
  - Test checkboxes appear on MealQueueCards when selection mode is active
  - Test selecting/deselecting individual meals
  - Test select-all / deselect-all toggle

- [x] Task 3.2: Implement selection mode in UpcomingMeals and MealQueueCard (9d9538a)
  - Add selectionMode state and selectedIds Set to UpcomingMeals
  - Pass selection props to MealQueueCard
  - Render checkbox on each card when in selection mode
  - Add select-all toggle in header

- [x] Task 3.3: Write tests for bulk status action bar (55ebeba)
  - Test action bar appears when meals are selected
  - Test "Mark Cooked" button triggers bulk update with status Cooked
  - Test "Mark Cancelled" button triggers bulk update with status Cancelled
  - Test "Mark Shopped"/"Mark Unshopped" buttons toggle is_shopped
  - Test selection resets after successful bulk action

- [x] Task 3.4: Implement bulk status action bar (9d9538a)
  - Build floating action bar with status change and shopped toggle buttons
  - Wire buttons to useBulkUpdateMeals hook
  - Clear selection and exit selection mode on success
  - Show success/error toasts

- [ ] Task 3.5: Conductor - User Manual Verification 'Phase 3: Bulk Status Management' (Protocol in workflow.md)

## Phase 4: Ingredient-Based Shopping List

- [x] Task 4.1: Write tests for refactored ShoppingListPanel with ingredient aggregation (2156a03)
  - Test that panel displays aggregated ingredients (not meal names)
  - Test merged view shows unique ingredients with summed quantities
  - Test by-recipe view groups ingredients under recipe names
  - Test checkbox toggles for individual ingredients
  - Test empty state when all meals are shopped

- [x] Task 4.2: Refactor ShoppingListPanel to display aggregated ingredients (2156a03)
  - Accept Recipe[] data instead of just recipe names
  - Extract ingredients from all recipes across unshopped meals
  - Implement merged view (aggregate by item+unit) and by-recipe view toggle
  - Add interactive checkboxes (client-side state)
  - Reuse aggregation patterns from IngredientAggregation component

- [x] Task 4.3: Write tests for print-optimized shopping list layout (2156a03)
  - Test "Print" button renders and triggers window.print
  - Test print CSS media query hides non-essential UI elements

- [x] Task 4.4: Implement print-optimized shopping list layout (2156a03)
  - Add "Print" button to ShoppingListPanel header
  - Add @media print CSS: hide header/nav, clean layout, readable font sizes
  - Ensure checked items are visually distinguished in print

- [x] Task 4.5: Update UpcomingMeals to pass full recipe data to ShoppingListPanel (2156a03)
  - Fetch full Recipe objects (with components/ingredients) for meals' recipe IDs
  - Pass Recipe[] to ShoppingListPanel instead of just recipeNames

- [ ] Task 4.6: Conductor - User Manual Verification 'Phase 4: Ingredient-Based Shopping List' (Protocol in workflow.md)

## Phase 5: Calendar Drag-and-Drop

- [ ] Task 5.1: Write tests for calendar drag-and-drop scheduling
  - Test meal cards in day slots are draggable (have drag attributes)
  - Test day slots are valid drop targets
  - Test unscheduled area is a valid drop target
  - Test dropping a meal on a different day updates scheduled_date
  - Test dropping an unscheduled meal onto a day schedules it
  - Test dropping a scheduled meal on unscheduled area clears scheduled_date

- [ ] Task 5.2: Implement calendar drag-and-drop with @dnd-kit
  - Wrap CalendarView with DndContext
  - Make meal cards draggable with useDraggable
  - Make day GridItems droppable with useDroppable
  - Make unscheduled area droppable
  - On drag end, determine target date and call meal update mutation
  - Add visual feedback: drag overlay, drop target highlight

- [ ] Task 5.3: Wire calendar drag-and-drop to meal update API
  - Accept onMealUpdate callback prop in CalendarView
  - UpcomingMeals passes update handler that calls useUpdateMeal
  - Invalidate meal queries on successful update

- [ ] Task 5.4: Conductor - User Manual Verification 'Phase 5: Calendar Drag-and-Drop' (Protocol in workflow.md)

## Phase 6: Queue Sort by Scheduled Date

- [ ] Task 6.1: Write tests for queue sort toggle
  - Test sort toggle button renders in queue header
  - Test default sort is by queue_position (drag-and-drop order)
  - Test clicking sort toggle switches to date-ascending sort
  - Test unscheduled meals appear at top when sorted by date
  - Test unscheduled meals retain relative order when sorted by date

- [ ] Task 6.2: Implement queue sort toggle in UpcomingMeals
  - Add sortMode state ('queue_position' | 'scheduled_date')
  - Add sort toggle button in header
  - When sort-by-date is active, client-side sort: unscheduled first (by queue_position), then scheduled by date ascending
  - Disable drag-and-drop when sorting by date (reorder doesn't make sense)

- [ ] Task 6.3: Conductor - User Manual Verification 'Phase 6: Queue Sort by Scheduled Date' (Protocol in workflow.md)
