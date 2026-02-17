# Plan: Meal Planning UX Iteration 3 — Bug Fixes & Enhancements

## Phase 1: Calendar Drag-and-Drop Flicker Fix (BF-1)

- [~] Task 1.1: Write tests for calendar DnD flicker fix
  - [ ] Add test verifying that a dragged meal card applies optimistic state (stays hidden at old position / visible at new position) after drop, before mutation resolves
  - [ ] Add test verifying no intermediate "snap-back" state between drag end and mutation completion

- [ ] Task 1.2: Implement optimistic update for calendar drag-and-drop
  - [ ] In `CalendarView.tsx`, introduce local optimistic state (similar to `UpcomingMeals`'s `localMeals` pattern) that immediately moves the meal to the target date on `handleDragEnd`, before the mutation response arrives
  - [ ] Keep `activeDragId` set (or use a separate pending state) until the optimistic update is applied, so the original card stays hidden
  - [ ] Ensure the `DragOverlay` disappears cleanly when the drop completes

- [ ] Task 1.3: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: View State Persistence (BF-2)

- [ ] Task 2.1: Write tests for view mode URL persistence
  - [ ] Test that `UpcomingMeals` reads `?view=calendar` from URL and renders calendar view
  - [ ] Test that `UpcomingMeals` defaults to `queue` when no `?view=` param is present
  - [ ] Test that clicking the calendar/queue toggle buttons updates the URL search param

- [ ] Task 2.2: Implement view mode as URL search parameter
  - [ ] In `UpcomingMeals.tsx`, replace `useState<'queue' | 'calendar'>` with `useSearchParams` to read/write `?view=` parameter
  - [ ] Update the view toggle buttons to set the search param instead of local state
  - [ ] Default to `'queue'` when param is absent or invalid

- [ ] Task 2.3: Write tests for breadcrumb navigation preserving view mode
  - [ ] Test that the breadcrumb link in `MealDetails` includes `?view=calendar` when the user navigated from the calendar view
  - [ ] Test that the breadcrumb link defaults to `/meals` (no param) when navigated from the queue view

- [ ] Task 2.4: Update MealDetails breadcrumb to preserve view mode
  - [ ] In `CalendarView.tsx`, pass `?view=calendar` in the navigation link when clicking a meal card (via route search params or state)
  - [ ] In `MealDetails.tsx`, read the originating view mode from search params or location state and include it in the breadcrumb link back to `/meals`

- [ ] Task 2.5: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Grouped Meals List View (EN-1)

- [ ] Task 3.1: Write tests for grouped list layout
  - [ ] Test that unscheduled meals render in a distinct "Unscheduled" section
  - [ ] Test that scheduled meals render in a distinct "Scheduled" section, ordered by `scheduled_date` ascending
  - [ ] Test that the sort-by button is no longer rendered
  - [ ] Test that drag-and-drop reordering works in the unscheduled section
  - [ ] Test that drag handles are hidden in the scheduled section

- [ ] Task 3.2: Implement grouped list view in UpcomingMeals
  - [ ] Remove the `sortMode` state and the sort-by toggle button
  - [ ] Split meals into two groups: unscheduled (no `scheduled_date`) and scheduled (has `scheduled_date`)
  - [ ] Render unscheduled group inside `DndContext`/`SortableContext` with drag handles and section header
  - [ ] Render scheduled group as a plain list sorted by `scheduled_date` ascending, with section header, no drag handles
  - [ ] Ensure drag-and-drop reorder in unscheduled section persists `queue_position` via existing bulk update logic

- [ ] Task 3.3: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Classification Filter in Generate Meals Modal (EN-2)

- [ ] Task 4.1: Write tests for classification filter in GenerateMealsModal
  - [ ] Test that the modal renders a classification dropdown defaulting to "Dinner"
  - [ ] Test that selecting a different classification includes the correct `template_filter` in the generate request
  - [ ] Test that the classification resets to "Dinner" when the modal is reopened

- [ ] Task 4.2: Implement classification filter in GenerateMealsModal
  - [ ] Add a `classification` state to `GenerateMealsModal` defaulting to `MealClassification.DINNER`
  - [ ] Add a styled `<select>` dropdown (consistent with the dark theme) populated from the `MealClassification` enum values
  - [ ] In `handleConfirm`, build the `template_filter` array: `[{ field: 'classification', operator: 'eq', value: classification }]`
  - [ ] Reset classification to `MealClassification.DINNER` when the modal opens (in existing `useEffect`)

- [ ] Task 4.3: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
