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
