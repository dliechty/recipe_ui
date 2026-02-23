# Plan: Household Support

## Phase 1: API Client Regeneration

- [ ] Task: Regenerate TypeScript client from updated OpenAPI spec
    - [ ] Run `npm run api:sync` to regenerate `src/client/` from `openapi.json`
    - [ ] Verify household types are exported (`Household`, `HouseholdCreate`, `HouseholdUpdate`, `HouseholdMember`, `PrimaryHouseholdUpdate`, etc.)
    - [ ] Verify household service methods are generated (`HouseholdsService`)
    - [ ] Verify `Meal` type includes `household_id` field
    - [ ] Verify `MealUpdate` type includes `household_id` field
- [ ] Task: Create MSW handlers for household endpoints
    - [ ] Add household mock data (2-3 households with members) to `src/mocks/`
    - [ ] Implement handlers for household CRUD: `POST /households`, `GET /households`, `GET /households/:id`, `PATCH /households/:id`, `DELETE /households/:id`
    - [ ] Implement handlers for membership: `POST /households/:id/join`, `DELETE /households/:id/leave`, `GET /households/:id/members`, `DELETE /households/:id/members/:userId`
    - [ ] Implement handler for primary household: `PATCH /users/me/primary-household`
    - [ ] Implement handlers for disabled templates: `GET /households/:id/disabled-templates`, `POST /households/:id/disabled-templates`, `DELETE /households/:id/disabled-templates/:templateId`
    - [ ] Ensure mock meal data includes `household_id` field on some meals
    - [ ] Ensure `GET /meals` handler respects the `X-Active-Household` header (filters meals by household_id when present, returns personal meals when absent)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: API Client Regeneration' (Protocol in workflow.md)

## Phase 2: Household Context & Header Injection

- [ ] Task: Write tests for HouseholdContext
    - [ ] Test `activeHouseholdId` state management (set, clear, persist to localStorage)
    - [ ] Test auto-activation of primary household on initialization
    - [ ] Test state reset on logout (user transitions from non-null to null)
    - [ ] Test state reset when impersonation changes
- [ ] Task: Implement HouseholdContext
    - [ ] Create `src/context/HouseholdContext.tsx` with `activeHouseholdId`, `setActiveHousehold`, `primaryHouseholdId`, and `households` state
    - [ ] Persist `activeHouseholdId` to localStorage
    - [ ] Auto-set active household to primary on login/init
    - [ ] Clear active household on logout and on impersonation change
    - [ ] Export `useHouseholdContext` hook for consuming the context
- [ ] Task: Write tests for HeaderInjector household header merging
    - [ ] Test `X-Active-Household` header set when household is active
    - [ ] Test no `X-Active-Household` header when household is null
    - [ ] Test header merging: `X-Active-Household` + `X-Admin-Mode`
    - [ ] Test header merging: `X-Active-Household` + `X-Act-As-User`
    - [ ] Test header merging: admin mode only (no household header)
- [ ] Task: Implement HeaderInjector updates for household header merging
    - [ ] Modify `HeaderInjector` in `AuthContext.tsx` to read from `HouseholdContext`
    - [ ] Merge `X-Active-Household` with existing admin/impersonation headers
    - [ ] Ensure header is omitted when `activeHouseholdId` is null
- [ ] Task: Wire HouseholdProvider into the app provider stack
    - [ ] Add `HouseholdProvider` to `main.tsx` between `AdminModeProvider` and `App`
    - [ ] Pass admin mode context values to enable impersonation awareness
- [ ] Task: Update meal React Query cache keys to include activeHouseholdId
    - [ ] Add `activeHouseholdId` to query keys in `useInfiniteMeals`, `useMeal`, `useInfiniteMealTemplates`, `useMealTemplate`
    - [ ] Verify data refetches when household changes
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Household Context & Header Injection' (Protocol in workflow.md)

## Phase 3: Household React Query Hooks

- [ ] Task: Write tests for household CRUD hooks
    - [ ] Test `useHouseholds` fetches household list
    - [ ] Test `useHousehold` fetches single household
    - [ ] Test `useCreateHousehold` creates and invalidates cache
    - [ ] Test `useUpdateHousehold` renames and invalidates cache
    - [ ] Test `useDeleteHousehold` deletes and invalidates cache
- [ ] Task: Implement household CRUD hooks
    - [ ] Create `src/hooks/useHouseholds.ts`
    - [ ] Implement `useHouseholds`, `useHousehold`, `useCreateHousehold`, `useUpdateHousehold`, `useDeleteHousehold`
- [ ] Task: Write tests for membership hooks
    - [ ] Test `useJoinHousehold` joins and invalidates cache
    - [ ] Test `useLeaveHousehold` leaves and invalidates cache
    - [ ] Test `useHouseholdMembers` fetches member list
    - [ ] Test `useRemoveHouseholdMember` removes member and invalidates cache
    - [ ] Test `useSetPrimaryHousehold` sets/clears primary and invalidates cache
- [ ] Task: Implement membership hooks
    - [ ] Implement `useJoinHousehold`, `useLeaveHousehold`, `useHouseholdMembers`, `useRemoveHouseholdMember`, `useSetPrimaryHousehold`
- [ ] Task: Write tests for disabled template hooks
    - [ ] Test `useDisabledTemplates` fetches disabled template list for a household
    - [ ] Test `useDisableTemplate` disables and invalidates cache
    - [ ] Test `useEnableTemplate` re-enables and invalidates cache
- [ ] Task: Implement disabled template hooks
    - [ ] Implement `useDisabledTemplates`, `useDisableTemplate`, `useEnableTemplate`
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Household React Query Hooks' (Protocol in workflow.md)

## Phase 4: Navbar Household Drawer

- [ ] Task: Write tests for HouseholdDrawer component
    - [ ] Test drawer opens on icon button click
    - [ ] Test lists user's households with active one highlighted
    - [ ] Test "Personal" option switches to no household
    - [ ] Test clicking a household switches active household
    - [ ] Test "Set as Primary" toggle works
    - [ ] Test "Create Household" button opens create dialog
    - [ ] Test "Manage Households" link navigates to Account page
- [ ] Task: Implement HouseholdDrawer component
    - [ ] Create `src/features/households/components/HouseholdDrawer.tsx`
    - [ ] Implement drawer with household list, personal option, primary toggle, quick actions
    - [ ] Style for dark theme
- [ ] Task: Write tests for navbar household icon button
    - [ ] Test icon button renders with household name when active
    - [ ] Test icon button renders with "Personal" indicator when no household
    - [ ] Test icon button is visible on both desktop and mobile layouts
- [ ] Task: Integrate HouseholdDrawer into Layout navbar
    - [ ] Add household icon button to `Layout.tsx` (both desktop and mobile)
    - [ ] Position before AdminModeIndicator on right side
    - [ ] Connect to HouseholdDrawer open/close state
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Navbar Household Drawer' (Protocol in workflow.md)

## Phase 5: Account Page — Household Management

- [ ] Task: Write tests for AccountHouseholdSection component
    - [ ] Test displays list of user's households with name, member count, role, primary status
    - [ ] Test "Set as Primary" / "Unset as Primary" toggle
    - [ ] Test "Leave" action with confirmation dialog
    - [ ] Test "Rename" inline edit (creator only)
    - [ ] Test "Delete" action with confirmation dialog (creator only)
    - [ ] Test "Manage Members" expansion shows member list with remove action
    - [ ] Test "Create Household" dialog
    - [ ] Test "Join Household" flow
- [ ] Task: Implement AccountHouseholdSection component
    - [ ] Create `src/features/households/components/AccountHouseholdSection.tsx`
    - [ ] Implement household list with all management actions
    - [ ] Implement create and join household dialogs
    - [ ] Implement member management sub-section
- [ ] Task: Integrate household section into AccountPage
    - [ ] Add `AccountHouseholdSection` to `AccountPage.tsx` below existing profile section
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Account Page — Household Management' (Protocol in workflow.md)

## Phase 6: Meal Details — Household Display & Reassignment

- [ ] Task: Write tests for household display in MealDetails
    - [ ] Test household name shown when meal has `household_id`
    - [ ] Test "Personal" or no indicator when meal has no household
    - [ ] Test household reassignment dropdown visible for meal creator
    - [ ] Test reassignment dropdown hidden for non-creators
    - [ ] Test moving meal to a different household
    - [ ] Test removing meal from household (set to personal)
    - [ ] Test assigning personal meal to a household
- [ ] Task: Implement household display and reassignment in MealDetails
    - [ ] Add household name to metadata grid in `MealDetails.tsx`
    - [ ] Add household reassignment control (dropdown) for meal creator
    - [ ] Use `useUpdateMeal` with `household_id` field for reassignment
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Meal Details — Household Display & Reassignment' (Protocol in workflow.md)

## Phase 7: Meal Templates — Disabled Template Indicator

- [ ] Task: Write tests for disabled template indicators
    - [ ] Test disabled badge shown on templates disabled for active household
    - [ ] Test no disabled indicators when in personal mode
    - [ ] Test toggle to disable a template for active household
    - [ ] Test toggle to re-enable a template for active household
- [ ] Task: Implement disabled template indicators on template list
    - [ ] Modify template list component to fetch disabled templates when household is active
    - [ ] Add visual indicator (badge/muted styling) for disabled templates
    - [ ] Add disable/enable toggle button per template
    - [ ] Hide indicators when no household is active
- [ ] Task: Conductor - User Manual Verification 'Phase 7: Meal Templates — Disabled Template Indicator' (Protocol in workflow.md)

## Phase 8: Admin Dashboard — Households Tab

- [ ] Task: Write tests for AdminHouseholdManagement component
    - [ ] Test displays table of all households (name, creator, member count, created date)
    - [ ] Test "View Members" shows member list with remove action
    - [ ] Test "Rename" inline edit
    - [ ] Test "Delete" with confirmation dialog
    - [ ] Test "Create Household" button
    - [ ] Test uses admin mode headers to fetch all households
- [ ] Task: Implement AdminHouseholdManagement component
    - [ ] Create `src/features/admin/components/AdminHouseholdManagement.tsx`
    - [ ] Implement table with all household management actions
    - [ ] Ensure admin mode header is active for all operations
- [ ] Task: Integrate Households tab into AdminDashboard
    - [ ] Add fourth tab "Households" to `AdminDashboard.tsx`
    - [ ] Wire up `AdminHouseholdManagement` component
- [ ] Task: Conductor - User Manual Verification 'Phase 8: Admin Dashboard — Households Tab' (Protocol in workflow.md)

## Phase 9: Admin Operating Mode — Household Compatibility

- [ ] Task: Write tests for impersonation + household interaction
    - [ ] Test household data refetches when impersonated user changes
    - [ ] Test household drawer shows impersonated user's households
    - [ ] Test active household resets when entering impersonation mode
    - [ ] Test active household resets when exiting impersonation mode
    - [ ] Test household query keys include `impersonatedUserId`
- [ ] Task: Implement impersonation-aware household state management
    - [ ] Ensure HouseholdContext re-fetches households when `impersonatedUserId` changes
    - [ ] Reset `activeHouseholdId` on impersonation change
    - [ ] Include `impersonatedUserId` in household query cache keys
- [ ] Task: Write tests for admin mode + household header combinations
    - [ ] Test admin browsing a household sends `X-Admin-Mode` + `X-Active-Household`
    - [ ] Test impersonation with household sends `X-Act-As-User` + `X-Active-Household`
    - [ ] Test switching between admin/impersonation/default modes preserves correct headers
- [ ] Task: Verify end-to-end header combinations work correctly
    - [ ] Integration test: admin mode + household selection + meal list fetch
    - [ ] Integration test: impersonation + household selection + meal list fetch
- [ ] Task: Conductor - User Manual Verification 'Phase 9: Admin Operating Mode — Household Compatibility' (Protocol in workflow.md)

## Phase 10: Onboarding Prompt

- [ ] Task: Write tests for HouseholdOnboardingPrompt component
    - [ ] Test prompt appears on Meals page for users with no households
    - [ ] Test prompt does not appear for users already in a household
    - [ ] Test "Create a Household" opens create dialog
    - [ ] Test "Join a Household" opens join flow
    - [ ] Test "Maybe Later" dismisses permanently (persisted in localStorage)
    - [ ] Test prompt does not reappear after dismissal
- [ ] Task: Implement HouseholdOnboardingPrompt component
    - [ ] Create `src/features/households/components/HouseholdOnboardingPrompt.tsx`
    - [ ] Implement dismissible banner/modal with create, join, and dismiss actions
    - [ ] Persist dismissal state in localStorage
- [ ] Task: Integrate onboarding prompt into MealsPage
    - [ ] Add `HouseholdOnboardingPrompt` to MealsPage (or its Outlet layout)
    - [ ] Conditionally render based on user household membership and dismissal state
- [ ] Task: Conductor - User Manual Verification 'Phase 10: Onboarding Prompt' (Protocol in workflow.md)
