# Spec: Enhance the Meal Planning Experience

## Overview

The meal planning experience is the core purpose of this application, but the current UI treats meals as a secondary feature behind recipes. This track transforms the meal experience into a queue-based meal planning workflow, making it the primary landing page and navigation destination. Users will manage an ordered queue of upcoming meals, optionally schedule them on a calendar, generate new meals in batches from templates, and produce shopping lists — all within a streamlined, planning-first interface.

## Problem Statement

Currently, the Meals page is a flat, list-based view for individual meal CRUD. The navigation places Recipes first. There is no concept of a meal queue, no batch generation, no shopping-list workflow, and no way to reorder upcoming meals. Users must create meals one at a time and manually track which meals are upcoming versus historic. The meal lifecycle (Draft → Scheduled → Cooked) conflates scheduling with status progression.

## Goals

1. **Meals as the primary experience** — Move the Meals tab to the far-left of the navigation bar. Make `/meals` the default post-login landing page.
2. **Queue-based upcoming meals view** — The default Meals tab shows an ordered queue of upcoming (Queued) meals as draggable cards, sortable by the user. This replaces the current flat list as the default view.
3. **Batch meal generation** — Allow users to generate N meals at a time from their templates via the updated `/meals/generate` endpoint, adding them to the queue.
4. **Meal lifecycle cleanup** — Adopt the updated status enum (`Queued`, `Cooked`, `Cancelled`). Remove `Draft` and `Scheduled` from UI status references. Scheduling is implicit (presence of `scheduled_date`), not a status.
5. **Shopping workflow** — Surface the `is_shopped` flag on meals. Provide a way to select meals and toggle their shopped status, and generate a shopping list for all queued un-shopped meals.
6. **Optional calendar view** — Provide a calendar toggle within the upcoming meals view that maps scheduled meals onto a daily/weekly grid (focused on the next 7–10 days) with an easy way to schedule unscheduled meals.
7. **Meal history** — Move the current list-based meals view to a "History" tab (right of Templates) that shows only Cooked and Cancelled meals for the current user.
8. **User-scoped views** — Upcoming Meals and History tabs show only the current user's meals. Templates remain global.

## Non-Goals

- Backend API changes (the OpenAPI spec has already been updated)
- Multi-user/family sharing features (future track)
- Monthly/yearly calendar views (focus is on daily/weekly for the next 7–10 days)
- Overhauling the Template creation/editing UI (templates already work well)

## Updated Data Model (from OpenAPI spec)

### Meal Status Enum
```
Queued | Cooked | Cancelled
```

### Meal Schema (key fields)
| Field | Type | Notes |
|---|---|---|
| `status` | MealStatus | Default: `Queued` |
| `scheduled_date` | datetime \| null | Optional — if set, meal is "scheduled" |
| `is_shopped` | boolean | Default: `false` |
| `queue_position` | integer \| null | Ordering within the user's queue |

### New/Updated Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `POST /meals/generate` | POST | Generate N meals from templates (weighted random). Request body: `{ count, scheduled_dates? }`. Returns array of Meal. |
| `PUT /meals/{meal_id}` | PUT | Update meal — now supports `is_shopped`, `queue_position`, `scheduled_date` fields. |
| `GET /meals/` | GET | Supports filtering by `status[in]`, `owner[in]`, `is_shopped`, and `scheduled_date` ranges. |

## User Stories

### US-1: Meals as Landing Page
**As a** home cook, **I want** the app to open on my Meals page after login, **so that** I immediately see what I'm cooking next.

**Acceptance Criteria:**
- After login, user lands on `/meals` (not `/recipes`).
- The navbar shows "Meals" as the leftmost item.
- The mobile hamburger menu also shows Meals first.
- Admin non-auth redirect goes to `/meals` instead of `/recipes`.

### US-2: Upcoming Meals Queue
**As a** home cook, **I want to** see my upcoming meals as an ordered queue of cards, **so that** I can visually plan what I'm cooking next.

**Acceptance Criteria:**
- The default `/meals` tab ("Upcoming") shows only the current user's `Queued` meals, ordered by `queue_position`.
- Each meal is a card showing: meal name, classification badge, recipe count, scheduled date (if any), and shopped status indicator.
- Cards can be reordered via drag-and-drop (`@dnd-kit`), which updates `queue_position` via the API.
- An empty state is shown when there are no upcoming meals, with a prompt to generate meals.
- Clicking a meal card navigates to the existing meal detail page.

### US-3: Batch Meal Generation
**As a** home cook, **I want to** generate multiple meals at once from my templates, **so that** I can quickly fill my upcoming queue without creating meals one-by-one.

**Acceptance Criteria:**
- A prominent "Generate Meals" button is accessible from the Upcoming tab.
- Clicking it opens a modal where the user specifies how many meals to generate (e.g., a number input, default 5).
- Optionally, the user can assign scheduled dates to some or all generated meals.
- On submit, the app calls `POST /meals/generate` with `{ count, scheduled_dates? }`.
- Newly generated meals appear at the end of the queue.
- Success feedback shows how many meals were generated.

### US-4: Meal Lifecycle & Status Transitions
**As a** home cook, **I want to** mark meals as Cooked or Cancelled, **so that** completed meals move out of my upcoming queue into history.

**Acceptance Criteria:**
- The status badge on meal cards and the detail page reflects the new statuses: `Queued`, `Cooked`, `Cancelled`.
- Users can change a meal's status via the existing editable status badge dropdown (updated for new enum values).
- When a meal is marked `Cooked` or `Cancelled`, it disappears from the Upcoming tab and appears in History.
- Color coding: Queued = gray/blue, Cooked = green, Cancelled = red/muted.

### US-5: Shopping Workflow
**As a** home cook, **I want to** see which meals I haven't shopped for and generate a shopping list, **so that** I can efficiently prepare for upcoming meals.

**Acceptance Criteria:**
- Each meal card in the Upcoming view shows a visual "shopped" indicator (e.g., a shopping bag icon, checked/unchecked).
- Users can select multiple meals and bulk-toggle the `is_shopped` status.
- A "Shopping List" button generates an aggregated ingredient list for all queued, un-shopped meals (reusing `IngredientAggregation` patterns).
- The shopping list supports merged and by-meal view modes.
- Users can check off individual items while shopping.

### US-6: Calendar View Toggle
**As a** home cook, **I want to** see my scheduled meals on a calendar, **so that** I can plan my week visually.

**Acceptance Criteria:**
- A toggle (list/calendar) on the Upcoming tab switches between queue view and calendar view.
- Calendar view shows a 7-day (or 10-day) daily grid with meals mapped to their `scheduled_date`.
- Unscheduled meals appear in a sidebar or "unscheduled" area.
- Users can schedule meals by clicking an empty day slot and selecting from unscheduled meals, or by dragging from the unscheduled area.
- Week navigation (prev/next/today) is provided.
- The current day is visually highlighted.

### US-7: Meal History
**As a** home cook, **I want to** view my past meals (Cooked and Cancelled), **so that** I can see my cooking history.

**Acceptance Criteria:**
- A "History" tab appears to the right of "Templates" in the MealsPage tab bar.
- History shows only the current user's meals with status `Cooked` or `Cancelled`.
- The existing list-based meal view with filters is reused here.
- Status filters default to showing both Cooked and Cancelled.
- History is sorted by `updated_at` descending (most recent first).

## Tab Structure

```
[ Upcoming ] [ Templates ] [ History ]
     ^             ^            ^
  Queue/Calendar   Global    User-scoped
  (user-scoped)              Cooked/Cancelled
```

## Technical Approach

### Updated Client Code
Run `npm run api:sync` to regenerate the TypeScript client from the updated `openapi.json`. This gives us the new `MealStatus` enum values, `MealGenerateRequest` type, updated `Meal`/`MealCreate`/`MealUpdate` types with `is_shopped`, `queue_position`, and `scheduled_date` fields, and the updated `generate_meals` service method.

### New Components
- `UpcomingMeals` — Queue view with draggable meal cards
- `MealQueueCard` — Individual meal card for the queue (shows name, classification, schedule, shopped status)
- `GenerateMealsModal` — Modal for batch meal generation (count + optional dates)
- `ShoppingListPanel` — Shopping list for un-shopped meals (drawer/modal)
- `CalendarView` — Daily/weekly calendar grid for scheduled meals
- `CalendarDaySlot` — Single day in the calendar
- `MealHistoryList` — Filtered list for history tab (wraps existing MealList patterns)

### Modified Components
- `Layout.tsx` — Reorder nav: Meals first, Recipes second
- `LoginPage.tsx` — Change default redirect from `/recipes` to `/meals`
- `ProtectedRoute.tsx` — Change admin fallback redirect from `/recipes` to `/meals`
- `MealsPage.tsx` — Restructure tabs: Upcoming (default) → Templates → History
- `AppRoutes.tsx` — Update nested routes under `/meals` to support new tab structure
- `EditableStatusBadge.tsx` — Update status values and colors for new enum
- `MealFilters.tsx` — Add `is_shopped` filter option
- `useMeals.ts` — Add hooks for batch generate, queue reorder, and `is_shopped`/`scheduled_date` filter support
- `mealParams.ts` — Add `is_shopped` and `scheduled_date` filter params

### Data Flow
- Upcoming queue: `useInfiniteMeals` with `status[in]=Queued` and `owner[in]=<currentUserId>`, sorted by `queue_position`.
- History: `useInfiniteMeals` with `status[in]=Cooked,Cancelled` and `owner[in]=<currentUserId>`, sorted by `-updated_at`.
- Batch generate: New `useGenerateMeals` hook calling `POST /meals/generate`.
- Queue reorder: On drag-end, update `queue_position` for affected meals via `PUT /meals/{id}`.
- Shopping list: Fetch all Queued + un-shopped meals, extract recipe details, aggregate ingredients.
- Calendar: Same data as upcoming queue, filtered/grouped by `scheduled_date`.

### Routing
```
/meals                → Upcoming tab (queue view, default)
/meals/templates      → Templates tab (unchanged)
/meals/history        → History tab (new)
/meals/new            → Add meal page (unchanged)
/meals/:id            → Meal detail page (unchanged)
/meals/templates/new  → Add template page (unchanged)
/meals/templates/:id  → Template detail page (unchanged)
```
