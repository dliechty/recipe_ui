# Plan: Meal Calendar Selection & Status Improvements

## Phase 1: Calendar Selection Mode Foundation

- [x] Task 1.1: Add selection props to CalendarView and DraggableMealCard
    - [x] Write tests for CalendarView accepting selectionMode, selectedIds, onToggleSelect props
    - [x] Write tests for DraggableMealCard rendering selected state (accent border) when isSelected is true
    - [x] Write tests verifying click calls onToggleSelect (not navigate) when selectionMode is true
    - [x] Update CalendarViewProps interface to include selectionMode, selectedIds, onToggleSelect
    - [x] Update DraggableMealCardProps to include selectionMode, isSelected, onToggleSelect
    - [x] Implement selected border styling on DraggableMealCard
    - [x] Implement click handler switching between navigation and selection toggle

- [x] Task 1.2: Disable drag-and-drop during selection mode
    - [x] Write tests verifying drag-and-drop is disabled when selectionMode is true
    - [x] Conditionally disable DnD sensors when selectionMode is active

- [x] Task 1.3: Pass selection state from UpcomingMeals to CalendarView
    - [x] Write tests verifying UpcomingMeals passes selection props to CalendarView
    - [x] Update CalendarView rendering in UpcomingMeals to pass selectionMode, selectedIds, onToggleSelect

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Calendar Selection Mode Foundation' (Protocol in workflow.md)

## Phase 2: Shopping Status Indicator

- [x] Task 2.1: Add shopping bag icon to DraggableMealCard
    - [x] Write tests for shopping bag icon rendering: green when is_shopped=true, gray when is_shopped=false
    - [x] Add small FaShoppingBag icon to DraggableMealCard with conditional coloring
    - [x] Verify icon displays in both selection and non-selection modes

- [ ] Task: Conductor - User Manual Verification 'Phase 2: Shopping Status Indicator' (Protocol in workflow.md)

## Phase 3: Cooked/Cancelled Meal Removal

- [x] Task 3.1: Ensure bulk actions remove meals from calendar display
    - [x] Write tests verifying that meals marked Cooked/Cancelled via bulk actions disappear from CalendarView
    - [x] Verify the existing React Query cache invalidation handles removal (meals are filtered by status=Queued)
    - [x] Fix any issues if the calendar doesn't properly reflect updated meal list after bulk mutations

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Cooked/Cancelled Meal Removal' (Protocol in workflow.md)
