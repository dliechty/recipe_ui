# Spec: Meal Calendar Selection & Status Improvements

## Overview

The meal calendar view's "Select" button is currently non-functional from a UX perspective — while it technically works (select all and bulk actions do apply), there is no visual feedback to indicate which meals are selected or that changes have been applied. Additionally, the calendar lacks shopping status indicators that exist in the list view, and marking meals as Cooked/Cancelled doesn't remove them from the calendar display.

This track improves the calendar view to provide a fully functional selection mode with visual feedback, shopping status indicators, and proper removal behavior for completed/cancelled meals.

## Type

Feature Enhancement

## Functional Requirements

### FR-1: Selection Mode Click Behavior
- When the "Select" button is active, clicking a meal card on the calendar **must not** navigate to the meal details page.
- Instead, clicking a meal card **toggles its selection state** (selected/unselected).
- The existing "Select All" functionality must continue to work across all visible calendar meals.
- Drag-and-drop **must be disabled** while selection mode is active to prevent accidental drags.

### FR-2: Selected Meal Visual Indicator
- When a meal is selected in selection mode, the meal card **must** display a prominent accent-colored border (using the app's accent color) to clearly indicate selection.
- Unselected meals in selection mode retain their default border styling.
- The selected border must be visually distinct from the "today" day slot highlight and the hover state.

### FR-3: Shopping Status Indicator on Calendar Cards
- Each meal card on the calendar **must** display a small shopping bag icon indicating the meal's shopping status.
- **Shopped**: Green/filled shopping bag icon.
- **Not Shopped**: Gray/outline shopping bag icon.
- The icon should be positioned unobtrusively (e.g., corner of the card) and sized appropriately for the compact card layout.
- This indicator must be visible at all times (not only in selection mode).

### FR-4: Cooked/Cancelled Meal Removal from Calendar
- When a meal is marked as **Cooked** or **Cancelled** (via bulk actions in selection mode), the meal card **must be immediately removed** from the calendar view.
- Removal should use the existing React Query cache invalidation/optimistic update pattern already used in the app.
- This must match the existing behavior in the list/queue view where Cooked/Cancelled meals disappear.

## Non-Functional Requirements

- All changes must conform to the existing dark theme styling.
- Calendar card performance must not degrade (no unnecessary re-renders).
- Selection state must be managed in the parent component (`UpcomingMeals.tsx`) so it is shared between views.

## Acceptance Criteria

1. In calendar view, clicking "Select" enters selection mode; clicking a meal card selects/deselects it with a visible colored border — no navigation occurs.
2. Drag-and-drop is disabled while selection mode is active; re-enabled when selection mode is exited.
3. "Select All" selects all visible meals on the calendar with border indicators on each.
4. Bulk actions (Mark Cooked, Mark Cancelled, Mark Shopped, Mark Unshopped) apply correctly to selected meals.
5. Meals marked Cooked or Cancelled are immediately removed from the calendar display.
6. Every meal card displays a small shopping bag icon — green when shopped, gray when not shopped — regardless of selection mode.
7. Exiting selection mode clears all selections and restores normal click-to-navigate and drag-and-drop behavior.

## Out of Scope

- Individual right-click or long-press context menus on calendar meals.
- Animated transitions for meal removal (immediate removal only).
- Changes to the list/queue view selection behavior (already working).
- Changes to the meal detail page.
