# Plan: UI Authorization Model Alignment

## Phase 1: Admin Mode State Management & Header Injection [checkpoint: 0eff106]

- [x] Task: Write failing tests for `AdminModeContext` [f29829e]
    - [x] Test: default state is `{ adminModeActive: false, impersonatedUserId: null }`
    - [x] Test: `setAdminMode(true)` sets `adminModeActive` and persists to localStorage
    - [x] Test: `setImpersonatedUser(uuid)` sets `impersonatedUserId`, clears adminMode, and persists to localStorage
    - [x] Test: `clearMode()` resets both flags and clears localStorage
    - [x] Test: calling `logout()` via AuthContext clears admin mode state
    - [x] Test: non-admin user cannot activate admin mode

- [x] Task: Create `src/context/AdminModeContext.tsx` [f29829e]
    - [x] Define `AdminModeContext` with `adminModeActive`, `impersonatedUserId`, `setAdminMode`, `setImpersonatedUser`, `clearMode`
    - [x] Load initial state from localStorage on mount
    - [x] Persist state changes to localStorage
    - [x] Auto-clear state when auth user is null (logout)
    - [x] Guard: only allow state changes when `user?.is_admin === true`
    - [x] Wrap app with `AdminModeProvider` in `src/main.tsx`

- [x] Task: Write failing tests for custom header injection [83b1a26]
    - [x] Test: when `adminModeActive`, requests include `X-Admin-Mode: true`
    - [x] Test: when `impersonatedUserId` is set, requests include `X-Act-As-User: <uuid>`
    - [x] Test: when both are set, only `X-Act-As-User` header is included
    - [x] Test: when in default mode, no custom headers are added
    - [x] Test: non-admin user never has custom headers added

- [x] Task: Implement header injection in `src/context/AuthContext.tsx` [83b1a26]
    - [x] Add a dynamic header resolver that reads admin mode state from `AdminModeContext`
    - [x] Set `OpenAPI.HEADERS` reactively whenever admin mode state changes
    - [x] Ensure header injection only occurs when `user?.is_admin === true`

- [x] Task: Conductor - User Manual Verification 'Phase 1: Admin Mode State Management & Header Injection' (Protocol in workflow.md)

---

## Phase 2: `canEdit` Logic Update

- [x] Task: Write failing tests for `computeCanEdit` utility [d7989d4]
    - [x] Test: owner in default mode → `true`
    - [x] Test: non-owner, non-admin, default mode → `false`
    - [x] Test: admin in default mode viewing another user's resource → `false`
    - [x] Test: admin in admin mode viewing another user's resource → `true`
    - [x] Test: admin impersonating owner of resource → `true`
    - [x] Test: admin impersonating non-owner of resource → `false`
    - [x] Test: admin mode + impersonation both set → impersonation takes precedence

- [x] Task: Create `src/utils/computeCanEdit.ts` [d7989d4]
    - [x] Define and export `computeCanEdit` function with typed params
    - [x] Implement logic per spec FR-3

- [ ] Task: Update `RecipeDetails.tsx` canEdit logic
    - [ ] Replace inline `canEdit` expression with `computeCanEdit` using `useAdminMode()`
    - [ ] Update or add component tests covering admin mode and impersonation cases

- [ ] Task: Update `MealDetails.tsx` canEdit logic
    - [ ] Replace inline `canEdit` expression with `computeCanEdit` using `useAdminMode()`
    - [ ] Update or add component tests covering admin mode and impersonation cases

- [ ] Task: Update `TemplateDetails.tsx` canEdit logic
    - [ ] Replace inline `canEdit` expression with `computeCanEdit` using `useAdminMode()`
    - [ ] Update or add component tests covering admin mode and impersonation cases

- [ ] Task: Update `CommentItem.tsx` canEdit logic
    - [ ] Replace inline `canEdit` expression with `computeCanEdit` using `useAdminMode()`
    - [ ] Update or add component tests covering admin mode and impersonation cases

- [ ] Task: Conductor - User Manual Verification 'Phase 2: canEdit Logic Update' (Protocol in workflow.md)

---

## Phase 3: Admin Page — Operating Mode Section

- [ ] Task: Write failing tests for `AdminOperatingMode` component
    - [ ] Test: renders "Current mode: User (default)" in default state
    - [ ] Test: enabling admin mode toggle calls `setAdminMode(true)` and shows "Current mode: Admin"
    - [ ] Test: disabling admin mode toggle calls `setAdminMode(false)`
    - [ ] Test: impersonation dropdown lists only non-admin active users
    - [ ] Test: clicking "Start Impersonating" calls `setImpersonatedUser(uuid)` and shows "Current mode: Impersonating — {name}"
    - [ ] Test: clicking "Stop Impersonating" calls `clearMode()`
    - [ ] Test: admin mode toggle is disabled while impersonation is active

- [ ] Task: Create `src/features/admin/components/AdminOperatingMode.tsx`
    - [ ] Admin Mode section with toggle switch and descriptive note
    - [ ] Impersonation section with searchable Chakra Select/combobox, "Start Impersonating" and "Stop Impersonating" controls
    - [ ] Mode summary display
    - [ ] Fetch active users list (reuse existing user list query); filter out admins from dropdown
    - [ ] Wire up to `useAdminMode()` context

- [ ] Task: Integrate `AdminOperatingMode` into `AdminDashboard.tsx`
    - [ ] Add new "Operating Mode" tab alongside existing tabs
    - [ ] Render `AdminOperatingMode` in the tab panel

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Admin Page — Operating Mode Section' (Protocol in workflow.md)

---

## Phase 4: Navbar Operating Mode Indicator

- [ ] Task: Write failing tests for `AdminModeIndicator` component
    - [ ] Test: renders nothing for non-admin users
    - [ ] Test: renders nothing for admin in default mode
    - [ ] Test: renders amber "Admin Mode" badge when `adminModeActive`
    - [ ] Test: renders cyan "Acting as: {name}" badge when impersonating
    - [ ] Test: badge links to `/admin`

- [ ] Task: Create `src/features/admin/components/AdminModeIndicator.tsx`
    - [ ] Read `adminModeActive` and `impersonatedUserId` from `useAdminMode()`
    - [ ] Render amber pill ("Admin Mode") in admin mode
    - [ ] Render cyan pill ("Acting as: {user name}") in impersonation mode; resolve user name from user list
    - [ ] Wrap pill in React Router `<Link to="/admin">`
    - [ ] Return `null` for non-admins and default mode

- [ ] Task: Integrate `AdminModeIndicator` into app layout/navbar
    - [ ] Locate the shared layout/navbar component in `src/components/`
    - [ ] Render `<AdminModeIndicator />` in the navbar alongside existing controls

- [ ] Task: Conductor - User Manual Verification 'Phase 4: Navbar Operating Mode Indicator' (Protocol in workflow.md)
