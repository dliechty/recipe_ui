# Spec: Enhance the Meal Planning Experience

## Overview

The current meals feature provides solid CRUD functionality for individual meals and templates, but the experience is list-oriented rather than planning-oriented. This track transforms the meal planning experience from a flat list of meals into a guided, calendar-centric workflow that makes weekly meal planning intuitive and efficient.

## Problem Statement

Currently, users can create individual meals and assign dates, but there is no unified view that shows a week's worth of meals at a glance. Planning meals for a week requires creating each meal individually and mentally tracking which days are covered. The meal list view, while functional, does not support the "plan my week" workflow that is central to the product vision.

## Goals

1. **Weekly calendar view** - Provide a visual week-at-a-glance view where users can see all planned meals organized by day and classification (breakfast, lunch, dinner, snack).
2. **Streamlined meal creation from calendar** - Allow users to quickly add meals to specific days directly from the calendar view without navigating away.
3. **Quick recipe-to-meal flow** - Enable adding a recipe directly to a meal plan from the recipe detail or browse pages.
4. **Improved shopping list** - Generate a consolidated shopping list from the weekly meal plan, aggregating ingredients across all meals for a given date range.
5. **Week navigation** - Allow users to navigate between weeks to plan ahead or review past meal plans.

## Non-Goals

- Backend API changes (this track works with the existing API endpoints)
- Meal template modifications (templates already work well)
- Multi-user/family sharing features (future track)
- Drag-and-drop meal rescheduling (future enhancement)

## User Stories

### US-1: View Weekly Meal Plan
**As a** home cook, **I want to** see all my meals for a given week in a calendar grid, **so that** I can quickly understand what I'm cooking each day.

**Acceptance Criteria:**
- A weekly calendar view shows 7 days (Monday–Sunday) with meals grouped by classification (Breakfast, Lunch, Dinner, Snack).
- Each meal card shows the meal name and the number of recipes.
- Clicking a meal card navigates to the existing meal detail page.
- The current day is visually highlighted.
- Empty slots are clearly indicated, encouraging the user to fill them.

### US-2: Navigate Between Weeks
**As a** home cook, **I want to** navigate forward and backward between weeks, **so that** I can plan meals ahead of time or review past plans.

**Acceptance Criteria:**
- Previous/Next week navigation buttons are provided.
- A "Today" button quickly returns to the current week.
- The currently displayed week range (e.g., "Feb 16 – Feb 22, 2026") is shown.
- Navigation updates the URL so the selected week is bookmarkable.

### US-3: Quick-Add Meal from Calendar
**As a** home cook, **I want to** create a meal directly from an empty slot in the weekly view, **so that** I can plan without navigating to a separate page.

**Acceptance Criteria:**
- Clicking an empty slot (or a "+" button on a day) opens a streamlined meal creation flow.
- The date and classification are pre-filled based on which slot was clicked.
- The user can search and select recipes inline.
- After creation, the new meal appears in the calendar without a full page reload.

### US-4: Add Recipe to Meal Plan from Recipe Page
**As a** home cook, **I want to** add a recipe to my meal plan directly from the recipe detail page, **so that** I don't have to remember recipes and manually add them later.

**Acceptance Criteria:**
- Recipe detail page and recipe cards show an "Add to Meal Plan" action.
- Clicking it opens a modal/popover where the user selects a date and classification.
- A new meal is created (or the recipe is added to an existing meal for that date/classification).
- The user receives confirmation feedback.

### US-5: Weekly Shopping List
**As a** home cook, **I want to** generate a shopping list from my weekly meal plan, **so that** I can efficiently shop for all the ingredients I need.

**Acceptance Criteria:**
- A "Shopping List" button/tab is accessible from the weekly calendar view.
- The shopping list aggregates all ingredients from all meals in the displayed week.
- Ingredients with the same name and unit are combined (quantities summed).
- Users can check off items as they shop.
- The list can be toggled between "merged" and "by-meal" views (reusing existing IngredientAggregation patterns).

## Technical Approach

### New Components
- `WeeklyCalendarView` - Main calendar grid component
- `WeekNavigation` - Week selector with prev/next/today controls
- `DayColumn` - Single day in the calendar showing meals by classification
- `MealSlot` - Individual meal card or empty slot within a day
- `QuickAddMealModal` - Streamlined modal for creating a meal from calendar
- `AddToMealPlanModal` - Modal for adding a recipe to a specific day/classification
- `WeeklyShoppingList` - Shopping list aggregated across the week's meals

### Modified Components
- `MealsPage` - Add a "Weekly" tab alongside existing Meals and Templates tabs
- Recipe detail/card components - Add "Add to Meal Plan" action

### Data Flow
- Use existing `useInfiniteMeals` hook with date range filters to fetch meals for the displayed week.
- Use existing `useCreateMeal` mutation for quick-add flows.
- Reuse `IngredientAggregation` logic for the weekly shopping list.
- Store selected week in URL search params for bookmarkability.

### Routing
- `/meals/weekly` - Weekly calendar view (new default tab)
- `/meals/weekly?week=2026-02-16` - Specific week view
