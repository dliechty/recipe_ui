# Spec: Meal Planning UX Iteration 3 — Bug Fixes & Enhancements

## Overview

This track addresses two bugs identified from the prior Meal Planning track and introduces two UX improvements to the meals list view and the generate meals modal. The goal is to polish the meal planning experience with smoother interactions and more intuitive organization.

## Type

Mixed (Bug Fix + Enhancement)

## Bug Fixes

### BF-1: Calendar Drag-and-Drop Flicker

**Current Behavior:** When dropping a meal onto a new date in the calendar view, the meal card briefly flickers back to its original position before appearing in the target location.

**Root Cause (Suspected):** The dragged meal's opacity is restored (via `setActiveDragId(null)`) before the mutation completes and the query cache is updated. This causes the original card to briefly reappear at its old position, then the cache invalidation moves it.

**Expected Behavior:** When a meal is dropped, it should appear at the target location without any flicker or snap-back animation. The original card should remain hidden (or removed) until the new position is confirmed.

**Affected Component:** `CalendarView.tsx` — `handleDragEnd` callback and `DraggableMealCard` opacity logic.

### BF-2: Calendar View State Lost on Navigation

**Current Behavior:** When a user is on the calendar view (`UpcomingMeals` with `viewMode = 'calendar'`), navigates to a meal detail page (`/meals/:id`), and then navigates back (browser back button or breadcrumb), the view resets to the list/queue view.

**Root Cause:** `viewMode` is stored in `useState` inside `UpcomingMeals`, which resets to `'queue'` on every mount.

**Expected Behavior:** The view mode should be preserved across navigation. When the user returns to the upcoming meals page, it should restore the view they were previously using. This applies to both the browser back button and the breadcrumb link on the meal details page.

**Solution:** Store the view mode as a URL search parameter (`?view=calendar` or `?view=queue`). This integrates with browser history and the back button naturally.

**Affected Components:**
- `UpcomingMeals.tsx` — Replace `useState` for `viewMode` with `useSearchParams`.
- `MealDetails.tsx` (breadcrumb) — The breadcrumb link to the meals list must include the `?view=` parameter so it navigates back to the correct view mode. This can be achieved by reading the referrer's search params or by passing the view mode through route state/search params when navigating to the detail page.

## Enhancements

### EN-1: Grouped Meals List View

**Current Behavior:** The upcoming meals list view shows all meals in a flat list with a sort-by control (field + direction selectors). Drag-and-drop reordering is available when sorted by `queue_position`.

**New Behavior:** Remove the sort-by controls entirely. Instead, display meals in two distinct sections:

1. **Unscheduled Meals** — Meals without a `scheduled_date`. Ordered by `queue_position`. Users can reorder these via drag-and-drop, which persists `queue_position` to the backend (existing behavior).

2. **Scheduled Meals** — Meals with a `scheduled_date`. Strictly ordered by `scheduled_date` ascending. No drag-and-drop reordering. These are read-only in terms of order.

**Section Headers:** Each section should have a clear visual header label (e.g., "Unscheduled" and "Scheduled").

**Affected Components:**
- `UpcomingMeals.tsx` — Remove sort mode state/controls, split meals into two groups, render unscheduled with DnD and scheduled without.
- `MealQueueCard.tsx` — May need minor adjustments for showing/hiding drag handles based on section.

### EN-2: Classification Filter in Generate Meals Modal

**Current Behavior:** The generate meals modal only accepts a `count` parameter.

**New Behavior:** Add a single-select dropdown for meal classification that filters which templates are used for generation. The dropdown defaults to "Dinner" and includes all values from the `MealClassification` enum: Breakfast, Brunch, Lunch, Dinner, Snack.

**API Integration:** The classification selection maps to the `template_filter` field on `MealGenerateRequest`:
```json
{
  "count": 5,
  "template_filter": [
    { "field": "classification", "operator": "eq", "value": "Dinner" }
  ]
}
```

When no classification is selected (if allowed in future), `template_filter` is omitted entirely.

**Affected Component:** `GenerateMealsModal.tsx`

## Acceptance Criteria

- [ ] Dragging a meal in calendar view shows no flicker or snap-back on drop
- [ ] Switching to calendar view and navigating to a meal detail then back preserves the calendar view
- [ ] The `?view=calendar` or `?view=queue` parameter is reflected in the URL
- [ ] The breadcrumb on MealDetails navigates back to the last-used view mode
- [ ] Upcoming meals list shows two sections: Unscheduled (drag-reorderable) and Scheduled (date-sorted, no drag)
- [ ] Sort-by controls are removed from the upcoming meals view
- [ ] Generate meals modal shows a classification dropdown defaulting to Dinner
- [ ] Generated meals use the selected classification as a template filter
- [ ] All existing tests pass; new tests cover the changed behavior

## Out of Scope

- Multi-select classification filter (future enhancement)
- Persisting other filter state in URL params
- Changes to the meal history or templates views
- Backend API changes (API already supports the needed fields)
