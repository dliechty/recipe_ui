# Track: UI Authorization Model Alignment

## Overview

This track aligns the frontend UI with the backend's new authorization model. The
backend already enforces authorization via HTTP headers; this track updates the
frontend to:

1. Inject the appropriate custom request headers (`X-Admin-Mode`, `X-Act-As-User`)
   based on an admin's active operating mode
2. Correct the `canEdit` gating logic across all resource types so it reflects the
   new model (admin bypass only when explicitly in admin mode)
3. Provide admin UI on the admin page to switch operating modes
4. Show a persistent navbar badge when an admin is operating in an elevated mode

---

## Functional Requirements

### FR-1: Admin Operating Mode State

Track and persist the admin's current operating mode in `localStorage`:

| State | localStorage Key | Type | Default |
|---|---|---|---|
| Admin mode active | `admin_mode_active` | boolean | false |
| Impersonated user ID | `impersonated_user_id` | string \| null | null |

Rules:
- Only users with `is_admin === true` may activate either mode
- State is cleared on logout
- If both are set, `impersonatedUserId` takes precedence over `adminModeActive`
  (mirrors backend behaviour)
- Non-admin users can never have these flags set

### FR-2: Custom Header Injection

When an admin has an elevated mode active, inject the appropriate HTTP headers
on all API requests:

| Condition | Header injected |
|---|---|
| Admin mode active (not impersonating) | `X-Admin-Mode: true` |
| Impersonation active | `X-Act-As-User: <impersonated_user_id>` |
| Default mode (no elevated mode) | _(no custom headers)_ |
| Non-admin user | _(no custom headers)_ |

Implementation: dynamically compute and inject headers via the Axios interceptor
or `OpenAPI.HEADERS` config in AuthContext. Headers must be recomputed reactively
whenever operating mode changes.

### FR-3: Updated `canEdit` Logic

The `canEdit` flag used to gate edit/delete UI controls must be updated across all
resource types. A shared `computeCanEdit` utility function will be extracted:

```typescript
computeCanEdit({
  currentUserId,      // logged-in user's id
  resourceOwnerId,    // resource's owner_id / user_id
  isAdmin,            // currentUser.is_admin
  adminModeActive,    // from operating mode state
  impersonatedUserId, // from operating mode state
}): boolean
```

Logic:
- `isAdmin && adminModeActive` → `true` (full access)
- `isAdmin && impersonatedUserId !== null` → `resourceOwnerId === impersonatedUserId`
- Otherwise → `currentUserId === resourceOwnerId`

Affected components (all currently use `user?.is_admin` as an unconditional bypass):
- `src/features/recipes/components/RecipeDetails.tsx` (`recipe.core.owner_id`)
- `src/features/meals/components/MealDetails.tsx` (`meal.user_id`)
- `src/features/meals/components/TemplateDetails.tsx` (`template.user_id`)
- `src/features/recipes/components/comments/CommentItem.tsx` (`comment.user_id`)

### FR-4: Admin Page — Operating Mode Section

A new "Operating Mode" tab on the `AdminDashboard` (`/admin`) provides:

**Admin Mode Toggle**
- Label: "Admin Mode"
- Switch/toggle to enable/disable `adminModeActive`
- Descriptive note: "Grants full access to all resources across all users"
- Disabled while impersonation is active

**Impersonation Control**
- Label: "Impersonate User"
- Searchable dropdown listing all active, non-admin users (by name and email)
- "Start Impersonating" button sets `impersonatedUserId`, clears admin mode
- While impersonating: shows impersonated user's name with a "Stop Impersonating"
  button
- Descriptive note: "Scopes access to the selected user's data"

**Mode Summary**
- Always shows current mode:
  - "Current mode: User (default)"
  - "Current mode: Admin"
  - "Current mode: Impersonating — {user name}"

### FR-5: Navbar Operating Mode Indicator

When an admin has an elevated mode active, a subtle indicator appears in the navbar:

- **Admin mode**: amber/orange pill reading "Admin Mode"
- **Impersonation mode**: cyan/blue pill reading "Acting as: {user name}"
- Clicking the pill navigates to `/admin`
- Only visible to admin users; invisible to all other users

---

## Non-Functional Requirements

- **Persistence**: Admin mode state survives page refreshes via `localStorage`. It
  is cleared on logout.
- **Security**: Custom headers are only injected when `user.is_admin === true`.
- **Consistency**: `canEdit` logic and navbar indicator are always in sync with the
  same operating mode state.
- **Dark theme**: All new components follow the existing Chakra UI dark theme.

---

## Acceptance Criteria

1. A non-admin user sees no change in behavior whatsoever.
2. An admin in default mode can only edit/delete their own resources (same as a
   regular user).
3. An admin who enables Admin Mode can edit/delete any resource; all API requests
   carry `X-Admin-Mode: true`.
4. An admin who impersonates a user sees `X-Act-As-User: <uuid>` on all requests;
   `canEdit` is true only for that user's resources.
5. Admin mode and impersonation selection persist after a page refresh but are
   cleared on logout.
6. A styled navbar badge indicates the active elevated mode; absent in default mode.
7. All new UI components conform to the dark Chakra UI theme.
8. All new and affected components have updated passing tests.

---

## Out of Scope

- Backend authorization enforcement (already implemented)
- Changes to the JWT authentication or login flow
- Adding new API endpoints
- UI for impersonating other admin users (backend enforces this; the impersonation
  dropdown filters out admins)
