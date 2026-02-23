# Spec: Household Support

## Overview

Households are collaborative meal planning groups that allow multiple users to share a common pool of meals. This feature introduces full frontend support for creating, managing, and operating within households — including a dedicated React context for active household state, navbar controls for switching households, account-level management, admin oversight, and integration with the existing meals and meal template features.

The backend API already supports all household endpoints and the `household_id` field on meals. The frontend client types need to be regenerated via `npm run api:sync` before implementation begins.

## Functional Requirements

### FR-0: API Client Regeneration

- The `openapi.json` file already contains household endpoints and schemas, but the auto-generated TypeScript client in `src/client/` has not been regenerated.
- Run `npm run api:sync` to regenerate the client code, producing typed service methods and models for all household endpoints (`HouseholdsService`, `Household`, `HouseholdCreate`, `HouseholdUpdate`, `HouseholdMember`, `PrimaryHouseholdUpdate`, `DisabledTemplate`, etc.).
- Verify the generated types are correct and exported from `src/client/index.ts`.
- This must be completed before any other implementation work begins.

### FR-1: Household Context & Header Injection

- Create a dedicated `HouseholdContext` (separate from `AdminModeContext`) that manages:
  - `activeHouseholdId: string | null` — the currently selected household
  - `setActiveHousehold(id: string | null): void` — switch active household
  - `households: Household[]` — the user's household memberships (fetched on login)
  - `primaryHouseholdId: string | null` — the user's primary household preference
- Persist `activeHouseholdId` to `localStorage` so it survives page refreshes.
- On login/app initialization, fetch the user's households and auto-set the active household to the user's primary household (if set and still valid).
- Create a `HouseholdHeaderInjector` component that sets `X-Active-Household` on `OpenAPI.HEADERS`, merging with any existing admin headers (`X-Admin-Mode`, `X-Act-As-User`). When `activeHouseholdId` is `null`, the `X-Active-Household` header must not be sent.
- All existing meal hooks (`useInfiniteMeals`, `useMeal`, `useCreateMeal`, `useUpdateMeal`, `useGenerateMeals`, etc.) already read from `OpenAPI.HEADERS` — no changes needed to those hooks beyond including `activeHouseholdId` in React Query cache keys so data refetches on household switch.

### FR-2: Household React Query Hooks

Create hooks in `src/hooks/useHouseholds.ts`:

- `useHouseholds()` — list the current user's households (or all, in admin mode)
- `useHousehold(id)` — get a single household's details
- `useCreateHousehold()` — create a new household (mutation)
- `useUpdateHousehold()` — rename a household (mutation)
- `useDeleteHousehold()` — delete a household (mutation)
- `useJoinHousehold()` — join a household (mutation)
- `useLeaveHousehold()` — leave a household (mutation)
- `useHouseholdMembers(id)` — list members of a household
- `useRemoveHouseholdMember()` — remove a member (mutation)
- `useSetPrimaryHousehold()` — set or clear the user's primary household (mutation)
- `useDisabledTemplates(householdId)` — list disabled templates for a household
- `useDisableTemplate()` — disable a template for a household (mutation)
- `useEnableTemplate()` — re-enable a template (mutation)

All mutations should invalidate relevant query caches.

### FR-3: Navbar Household Drawer

- Add a household icon button to the navbar (both desktop and mobile layouts), positioned to the left of the existing right-side items (before AdminModeIndicator).
- The icon button should display a visual indicator of the current mode:
  - When a household is active: household icon with the household name (truncated if needed)
  - When in personal mode: a distinct icon or label indicating "Personal"
- Clicking the icon opens a slide-out drawer containing:
  - **Active household indicator** at the top showing the current selection
  - **List of the user's households** — each row shows the household name and a "Switch" action. The active household is visually highlighted.
  - **"Personal" option** — switches to no household (personal meals only)
  - **"Set as Primary" toggle** — mark/unmark a household as the user's primary
  - **Quick actions**: "Create Household" button and "Manage Households" link (navigates to Account page households section)
- Switching households immediately updates `HouseholdContext`, which triggers React Query refetches for meal data.

### FR-4: Onboarding Prompt

- After a first-time user completes the password change flow, show a dismissible banner or modal on the main page (Meals page) suggesting they create or join a household.
- The prompt should offer:
  - "Create a Household" — opens a create-household dialog
  - "Join a Household" — provides instructions or a join flow
  - "Dismiss" / "Maybe Later" — hides the prompt permanently (persisted in `localStorage`)
- The prompt should not block app usage — users can immediately interact with the app in personal mode.

### FR-5: Account Page — Household Management

Add a new section to the Account page (`AccountPage.tsx`) for household management:

- **"My Households" section** displaying:
  - List of households the user belongs to, showing: name, member count, the user's role (creator vs. member), whether it's the primary household
  - For each household:
    - **Set/Unset as Primary** — toggle primary household designation
    - **Leave** — leave the household (with confirmation; cannot leave if you're the creator unless you're the only member or transfer ownership... note: backend handles this — creator can leave and it soft-deletes)
    - **Rename** — inline rename (only if user is the creator)
    - **Delete** — delete the household (only if user is the creator, with confirmation dialog warning that meals will be unlinked)
    - **Manage Members** — expand or navigate to a member list where the creator can remove members
- **"Create Household" button** — opens a dialog to create a new household (name input)
- **"Join Household" button** — allows joining an existing household (by household ID or from a list of available households)

### FR-6: Admin Dashboard — Households Tab

Add a fourth tab "Households" to the Admin Dashboard (`AdminDashboard.tsx`):

- **Table/list of all households in the system** showing: name, creator, member count, created date
- **Actions per household:**
  - **View Members** — expand row or modal showing all members with option to remove any member
  - **Rename** — inline edit of household name
  - **Delete** — delete household with confirmation (warns that meals will be unlinked)
- **Create Household** — button to create a new household (admin can create on behalf of the system)
- Uses admin mode headers (`X-Admin-Mode: true`) to access all households regardless of membership.

### FR-7: Admin Operating Mode — Household Compatibility

The existing Admin Operating Mode (admin mode toggle, user impersonation) must work correctly with all new household features:

- **Admin Mode (`X-Admin-Mode: true`)**: When active, the `GET /households` endpoint returns all households in the system (not just the admin's memberships). The Households admin tab relies on this. The `X-Active-Household` header should still be sent alongside `X-Admin-Mode` when the admin has selected a household, so the admin can preview meals for any household.
- **Impersonation (`X-Act-As-User: <userId>`)**: When impersonating a user:
  - The `HouseholdContext` must re-fetch households for the impersonated user (not the admin's households). This means household data must refetch when `impersonatedUserId` changes.
  - The household drawer should show the impersonated user's households, not the admin's.
  - The active household selection should reset when entering/exiting impersonation mode (clear `activeHouseholdId` on impersonation change).
  - The `X-Active-Household` header must be sent alongside `X-Act-As-User` so the backend resolves meals for the impersonated user within the selected household.
- **Header merging**: The `HouseholdHeaderInjector` must correctly merge `X-Active-Household` with whatever headers the `AdminModeContext` has already set. The final `OpenAPI.HEADERS` object may contain any combination of:
  - `X-Active-Household` only (normal user with household selected)
  - `X-Admin-Mode` + `X-Active-Household` (admin browsing a household)
  - `X-Act-As-User` + `X-Active-Household` (impersonating a user within their household)
  - `X-Admin-Mode` alone (admin mode, no household)
  - `X-Act-As-User` alone (impersonating, no household)
- **React Query cache keys**: Household-related queries must include `impersonatedUserId` (from `AdminModeContext`) in their cache keys so that switching impersonated users triggers a refetch of household data.

### FR-8: Meal Details — Household Display & Reassignment

Modify the Meal Details screen (`MealDetails.tsx`):

- **Display household info**: If the meal has a `household_id`, show the household name in the metadata section (alongside Created By, Status, etc.). If the meal is personal (no household), show "Personal" or omit.
- **Reassign household**: If the current user is the meal's creator, provide a control (dropdown or button) to:
  - Move the meal to a different household the user belongs to
  - Remove the meal from a household (make it personal) by setting `household_id` to `null`
  - Assign a personal meal to one of the user's households
- Uses the existing `useUpdateMeal` hook with the `household_id` field in `MealUpdate`.

### FR-9: Meal Templates — Disabled Template Indicator

Modify the Meal Templates list/page:

- When a household is active, fetch the list of disabled templates for that household (`useDisabledTemplates`).
- For each template in the list, show a visual indicator if it's disabled for the active household (e.g., a "Disabled" badge, muted styling, or strikethrough).
- Provide a toggle or button on each template to disable/enable it for the active household.
- When no household is active (personal mode), the disabled template indicators are hidden (template exclusions are a household-level concept).

## Non-Functional Requirements

- **Dark theme compliance**: All new UI components must conform to the existing dark theme palette.
- **Responsive design**: The household drawer and all new UI elements must work well on both desktop and mobile viewports.
- **Performance**: Household switching should feel instant — leverage React Query cache and background refetches.
- **Type safety**: All new code must be fully typed using the auto-generated client types.
- **Consistent patterns**: Follow existing codebase patterns for hooks (custom axios with header injection), components (Chakra UI v3), and feature organization.

## Acceptance Criteria

1. The API client is regenerated and household types/services are available in `src/client/`.
2. Users can create, join, leave, rename, and delete households from the Account page.
3. The navbar drawer allows quick switching between households and personal mode.
4. Switching households immediately updates all meal views to show the selected household's meals.
5. The active household persists across page refreshes (localStorage).
6. On login, the user's primary household is auto-activated.
7. First-time users see a dismissible prompt suggesting household creation/joining.
8. Meal Details shows the associated household and allows the creator to reassign.
9. Meal Templates indicate disabled status per active household, with toggle controls.
10. Admins can view and manage all households from the Admin Dashboard.
11. Admin mode correctly shows all households system-wide.
12. Impersonating a user shows that user's households (not the admin's), and active household resets on impersonation change.
13. All header combinations (`X-Active-Household` with `X-Admin-Mode` and/or `X-Act-As-User`) work correctly.
14. All new features work correctly on both desktop and mobile.
15. All new code has >80% test coverage.

## Out of Scope

- **Household invitations/invite links**: Users join by household ID or from a list — no email invitations or shareable links.
- **Household roles beyond creator**: No "admin" or "editor" roles within a household — just creator and member.
- **Real-time updates**: No WebSocket/SSE for live household activity — standard React Query polling/refetching.
- **Recipe sharing within households**: Households only affect meals, not recipe visibility.
- **Shopping list collaboration**: Shared shopping lists within households are not part of this track.
- **Transferring household ownership**: If the creator deletes or leaves, the backend handles it (soft-delete/unlink).
