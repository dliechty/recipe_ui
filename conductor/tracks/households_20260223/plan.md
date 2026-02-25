# Plan: Household Support

## Phase 1: API Client Regeneration [checkpoint: 35963b5]

- [x] Task: Regenerate TypeScript client from updated OpenAPI spec [35963b5]
    - [x] Run `npm run api:sync` to regenerate `src/client/` from `openapi.json`
    - [x] Verify household types are exported (`Household`, `HouseholdCreate`, `HouseholdUpdate`, `HouseholdMember`, `PrimaryHouseholdUpdate`, etc.)
    - [x] Verify household service methods are generated (`HouseholdsService`)
    - [x] Verify `Meal` type includes `household_id` field
    - [x] Verify `MealUpdate` type includes `household_id` field
- [x] Task: Create MSW handlers for household endpoints [35963b5]
    - [x] Add household mock data (2-3 households with members) to `src/mocks/`
    - [x] Implement handlers for household CRUD: `POST /households`, `GET /households`, `GET /households/:id`, `PATCH /households/:id`, `DELETE /households/:id`
    - [x] Implement handlers for membership: `POST /households/:id/join`, `DELETE /households/:id/leave`, `GET /households/:id/members`, `DELETE /households/:id/members/:userId`
    - [x] Implement handler for primary household: `PATCH /users/me/primary-household`
    - [x] Implement handlers for disabled templates: `GET /households/:id/disabled-templates`, `POST /households/:id/disabled-templates`, `DELETE /households/:id/disabled-templates/:templateId`
    - [x] Ensure mock meal data includes `household_id` field on some meals
    - [x] Ensure `GET /meals` handler respects the `X-Active-Household` header (filters meals by household_id when present, returns personal meals when absent)
- [x] Task: Conductor - User Manual Verification 'Phase 1: API Client Regeneration' (Protocol in workflow.md)

## Phase 2: Household Context & Header Injection [checkpoint: 891aaaa]

- [x] Task: Write tests for HouseholdContext [891aaaa]
    - [x] Test `activeHouseholdId` state management (set, clear, persist to localStorage)
    - [x] Test auto-activation of primary household on initialization
    - [x] Test state reset on logout (user transitions from non-null to null)
    - [x] Test state reset when impersonation changes
- [x] Task: Implement HouseholdContext [891aaaa]
    - [x] Create `src/context/HouseholdContext.tsx` with `activeHouseholdId`, `setActiveHousehold`, `primaryHouseholdId`, and `households` state
    - [x] Persist `activeHouseholdId` to localStorage
    - [x] Auto-set active household to primary on login/init
    - [x] Clear active household on logout and on impersonation change
    - [x] Export `useHouseholdContext` hook for consuming the context
- [x] Task: Write tests for HeaderInjector household header merging [891aaaa]
    - [x] Test `X-Active-Household` header set when household is active
    - [x] Test no `X-Active-Household` header when household is null
    - [x] Test header merging: `X-Active-Household` + `X-Admin-Mode`
    - [x] Test header merging: `X-Active-Household` + `X-Act-As-User`
    - [x] Test header merging: admin mode only (no household header)
- [x] Task: Implement HeaderInjector updates for household header merging [891aaaa]
    - [x] Modify `HeaderInjector` in `AuthContext.tsx` to read from `HouseholdContext`
    - [x] Merge `X-Active-Household` with existing admin/impersonation headers
    - [x] Ensure header is omitted when `activeHouseholdId` is null
- [x] Task: Wire HouseholdProvider into the app provider stack [891aaaa]
    - [x] Add `HouseholdProvider` to `main.tsx` between `AdminModeProvider` and `App`
    - [x] Pass admin mode context values to enable impersonation awareness
- [x] Task: Update meal React Query cache keys to include activeHouseholdId [891aaaa]
    - [x] Add `activeHouseholdId` to query keys in `useInfiniteMeals`, `useMeal`, `useInfiniteMealTemplates`, `useMealTemplate`
    - [x] Verify data refetches when household changes
- [x] Task: Conductor - User Manual Verification 'Phase 2: Household Context & Header Injection' (Protocol in workflow.md)

## Phase 3: Household React Query Hooks [checkpoint: 2b2484e]

- [x] Task: Write tests for household CRUD hooks [2b2484e]
    - [x] Test `useHouseholds` fetches household list
    - [x] Test `useHousehold` fetches single household
    - [x] Test `useCreateHousehold` creates and invalidates cache
    - [x] Test `useUpdateHousehold` renames and invalidates cache
    - [x] Test `useDeleteHousehold` deletes and invalidates cache
- [x] Task: Implement household CRUD hooks [2b2484e]
    - [x] Create `src/hooks/useHouseholds.ts`
    - [x] Implement `useHouseholds`, `useHousehold`, `useCreateHousehold`, `useUpdateHousehold`, `useDeleteHousehold`
- [x] Task: Write tests for membership hooks [2b2484e]
    - [x] Test `useJoinHousehold` joins and invalidates cache
    - [x] Test `useLeaveHousehold` leaves and invalidates cache
    - [x] Test `useHouseholdMembers` fetches member list
    - [x] Test `useRemoveHouseholdMember` removes member and invalidates cache
    - [x] Test `useSetPrimaryHousehold` sets/clears primary and invalidates cache
- [x] Task: Implement membership hooks [2b2484e]
    - [x] Implement `useJoinHousehold`, `useLeaveHousehold`, `useHouseholdMembers`, `useRemoveHouseholdMember`, `useSetPrimaryHousehold`
- [x] Task: Write tests for disabled template hooks [2b2484e]
    - [x] Test `useDisabledTemplates` fetches disabled template list for a household
    - [x] Test `useDisableTemplate` disables and invalidates cache
    - [x] Test `useEnableTemplate` re-enables and invalidates cache
- [x] Task: Implement disabled template hooks [2b2484e]
    - [x] Implement `useDisabledTemplates`, `useDisableTemplate`, `useEnableTemplate`
- [x] Task: Conductor - User Manual Verification 'Phase 3: Household React Query Hooks' (Protocol in workflow.md)

## Phase 4: Navbar Household Drawer [checkpoint: 0cc54f4]

- [x] Task: Write tests for HouseholdDrawer component [0cc54f4]
    - [x] Test drawer opens on icon button click
    - [x] Test lists user's households with active one highlighted
    - [x] Test "Personal" option switches to no household
    - [x] Test clicking a household switches active household
    - [x] Test "Set as Primary" toggle works
    - [x] Test "Create Household" button opens create dialog
    - [x] Test "Manage Households" link navigates to Account page
- [x] Task: Implement HouseholdDrawer component [0cc54f4]
    - [x] Create `src/features/households/components/HouseholdDrawer.tsx`
    - [x] Implement drawer with household list, personal option, primary toggle, quick actions
    - [x] Style for dark theme
- [x] Task: Write tests for navbar household icon button [0cc54f4]
    - [x] Test icon button renders with household name when active
    - [x] Test icon button renders with "Personal" indicator when no household
    - [x] Test icon button is visible on both desktop and mobile layouts
- [x] Task: Integrate HouseholdDrawer into Layout navbar [0cc54f4]
    - [x] Add household icon button to `Layout.tsx` (both desktop and mobile)
    - [x] Position before AdminModeIndicator on right side
    - [x] Connect to HouseholdDrawer open/close state
- [x] Task: Conductor - User Manual Verification 'Phase 4: Navbar Household Drawer' (Protocol in workflow.md)

## Phase 5: Account Page — Household Management [checkpoint: 2c35b0f]

- [x] Task: Write tests for AccountHouseholdSection component [10d7da7]
    - [x] Test displays list of user's households with name, member count, role, primary status
    - [x] Test "Set as Primary" / "Unset as Primary" toggle
    - [x] Test "Leave" action with confirmation dialog
    - [x] Test "Rename" inline edit (creator only)
    - [x] Test "Delete" action with confirmation dialog (creator only)
    - [x] Test "Manage Members" expansion shows member list with remove action
    - [x] Test "Create Household" dialog
    - [x] Test "Join Household" flow
- [x] Task: Implement AccountHouseholdSection component [10d7da7]
    - [x] Create `src/features/households/components/AccountHouseholdSection.tsx`
    - [x] Implement household list with all management actions
    - [x] Implement create and join household dialogs
    - [x] Implement member management sub-section
- [x] Task: Integrate household section into AccountPage [10d7da7]
    - [x] Add `AccountHouseholdSection` to `AccountPage.tsx` below existing profile section
- [x] Task: Conductor - User Manual Verification 'Phase 5: Account Page — Household Management' (Protocol in workflow.md) [2c35b0f]

## Phase 6: Meal Details — Household Display & Reassignment [checkpoint: 71d9d95]

- [x] Task: Write tests for household display in MealDetails [abd5aff]
    - [x] Test household name shown when meal has `household_id`
    - [x] Test "Personal" or no indicator when meal has no household
    - [x] Test household reassignment dropdown visible for meal creator
    - [x] Test reassignment dropdown hidden for non-creators
    - [x] Test moving meal to a different household
    - [x] Test removing meal from household (set to personal)
    - [x] Test assigning personal meal to a household
- [x] Task: Implement household display and reassignment in MealDetails [abd5aff]
    - [x] Add household name to metadata grid in `MealDetails.tsx`
    - [x] Add household reassignment control (dropdown) for meal creator
    - [x] Use `useUpdateMeal` with `household_id` field for reassignment
- [x] Task: Conductor - User Manual Verification 'Phase 6: Meal Details — Household Display & Reassignment' (Protocol in workflow.md) [71d9d95]

## Phase 7: Meal Templates — Disabled Template Indicator [checkpoint: c4771cf]

- [x] Task: Write tests for disabled template indicators [b8d6ad4]
    - [x] Test disabled badge shown on templates disabled for active household
    - [x] Test no disabled indicators when in personal mode
    - [x] Test toggle to disable a template for active household
    - [x] Test toggle to re-enable a template for active household
- [x] Task: Implement disabled template indicators on template list [42cfcf3]
    - [x] Modify template list component to fetch disabled templates when household is active
    - [x] Add visual indicator (badge/muted styling) for disabled templates
    - [x] Add disable/enable toggle button per template
    - [x] Hide indicators when no household is active
- [x] Task: Conductor - User Manual Verification 'Phase 7: Meal Templates — Disabled Template Indicator' (Protocol in workflow.md) [c4771cf]

## Phase 8: Admin Dashboard — Households Tab [checkpoint: 980fdfc]

- [x] Task: Write tests for AdminHouseholdManagement component [6c8704c]
    - [x] Test displays table of all households (name, creator, member count, created date)
    - [x] Test "View Members" shows member list with remove action
    - [x] Test "Rename" inline edit
    - [x] Test "Delete" with confirmation dialog
    - [x] Test "Create Household" button
    - [x] Test uses admin mode headers to fetch all households
- [x] Task: Implement AdminHouseholdManagement component [065df0b]
    - [x] Create `src/features/admin/components/AdminHouseholdManagement.tsx`
    - [x] Implement table with all household management actions
    - [x] Ensure admin mode header is active for all operations
- [x] Task: Integrate Households tab into AdminDashboard [065df0b]
    - [x] Add fourth tab "Households" to `AdminDashboard.tsx`
    - [x] Wire up `AdminHouseholdManagement` component
- [x] Task: Conductor - User Manual Verification 'Phase 8: Admin Dashboard — Households Tab' (Protocol in workflow.md)

## Phase 9: Admin Operating Mode — Household Compatibility [checkpoint: 65831af]

- [x] Task: Write tests for impersonation + household interaction [e028f57]
    - [x] Test household data refetches when impersonated user changes
    - [x] Test household drawer shows impersonated user's households
    - [x] Test active household resets when entering impersonation mode
    - [x] Test active household resets when exiting impersonation mode
    - [x] Test household query keys include `impersonatedUserId`
- [x] Task: Implement impersonation-aware household state management [f5bcf5a]
    - [x] Ensure HouseholdContext re-fetches households when `impersonatedUserId` changes
    - [x] Reset `activeHouseholdId` on impersonation change
    - [x] Include `impersonatedUserId` in household query cache keys
- [x] Task: Write tests for admin mode + household header combinations [1d17673]
    - [x] Test admin browsing a household sends `X-Admin-Mode` + `X-Active-Household`
    - [x] Test impersonation with household sends `X-Act-As-User` + `X-Active-Household`
    - [x] Test switching between admin/impersonation/default modes preserves correct headers
- [x] Task: Verify end-to-end header combinations work correctly [1d17673]
    - [x] Integration test: admin mode + household selection + meal list fetch
    - [x] Integration test: impersonation + household selection + meal list fetch
- [x] Task: Conductor - User Manual Verification 'Phase 9: Admin Operating Mode — Household Compatibility' (Protocol in workflow.md)

## Phase 10: Onboarding Prompt

- [x] Task: Write tests for HouseholdOnboardingPrompt component [59462e8]
    - [x] Test prompt appears on Meals page for users with no households
    - [x] Test prompt does not appear for users already in a household
    - [x] Test "Create a Household" opens create dialog
    - [x] Test "Join a Household" opens join flow
    - [x] Test "Maybe Later" dismisses permanently (persisted in localStorage)
    - [x] Test prompt does not reappear after dismissal
- [x] Task: Implement HouseholdOnboardingPrompt component [ad805a0]
    - [x] Create `src/features/households/components/HouseholdOnboardingPrompt.tsx`
    - [x] Implement dismissible banner/modal with create, join, and dismiss actions
    - [x] Persist dismissal state in localStorage
- [x] Task: Integrate onboarding prompt into MealsPage [8019f13]
    - [x] Add `HouseholdOnboardingPrompt` to MealsPage (or its Outlet layout)
    - [x] Conditionally render based on user household membership and dismissal state
- [x] Task: Conductor - User Manual Verification 'Phase 10: Onboarding Prompt' (Protocol in workflow.md)
