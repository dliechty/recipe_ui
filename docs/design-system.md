# Design System

This document is the canonical reference for the Recipe UI design system. It covers color tokens, shared style utilities, component styling conventions, and mobile responsiveness guidelines.

## Color Token Architecture

### Single Source of Truth

All colors are defined in `src/theme.ts` via the `vsCodeColors` constant. This object is the single source of truth for every color in the application.

- **`src/theme.ts`** — Defines raw color values (`vsCodeColors`) and maps them to Chakra UI design tokens (both base tokens and semantic tokens).
- **`src/utils/styles.ts`** — Imports `vsCodeColors` from `theme.ts` and re-exports it as `themeColors` for non-Chakra contexts (e.g., react-select). Never defines its own color values.

### Semantic Token Map

Use semantic tokens in component props instead of raw palette colors or hex values.

| Category | Token | Purpose |
|----------|-------|---------|
| **Background** | `bg.canvas` | Page background |
| | `bg.surface` | Card/panel background |
| | `bg.muted` | Input background |
| **Foreground** | `fg.default` | Primary text |
| | `fg.muted` | Secondary/muted text |
| **Border** | `border.default` | Default borders |
| **Button** | `button.primary` / `button.primaryHover` | Primary action buttons |
| | `button.secondary` / `button.secondaryHover` | Secondary action buttons |
| | `button.danger` / `button.dangerHover` | Destructive action buttons |
| | `button.success` / `button.successHover` | Positive action buttons |
| | `button.text` | Button label text color |
| | `button.ghostHover` | Ghost button hover background |
| **Status** | `status.error` / `status.errorBg` / `status.errorBorder` | Error feedback |
| | `status.success` / `status.successBg` / `status.successBorder` | Success feedback |
| | `status.warning` / `status.warningBg` / `status.warningBorder` | Warning feedback |
| **Danger** | `danger.fg` / `danger.bg` / `danger.bgHover` | Danger-themed elements |
| | `danger.muted` / `danger.bgSubtle` | Subtle danger variants |
| **Success** | `success.fg` / `success.bg` / `success.bgHover` | Success-themed elements |
| **Warning** | `warning.fg` / `warning.bg` / `warning.bgHover` | Warning-themed elements |
| | `warning.border` / `warning.bgSubtle` | Subtle warning variants |
| **Info** | `info.fg` / `info.bg` | Informational elements |
| **Link** | `link.default` / `link.hover` | Hyperlinks |
| **Badge** | `badge.admin` / `badge.adminBg` / `badge.adminText` | Admin role badges |
| | `badge.member` / `badge.memberBg` / `badge.memberText` | Member role badges |
| | `badge.pending` / `badge.pendingBg` / `badge.pendingText` | Pending status badges |
| **Overlay** | `overlay.backdrop` | Modal/dialog backdrop |
| | `overlay.subtle` / `overlay.hover` / `overlay.active` / `overlay.pressed` | Interactive overlay states |

### Token Naming Conventions

- **Category-first**: Tokens are grouped by semantic category (`button.`, `status.`, `danger.`, etc.)
- **State suffixes**: Use `Hover`, `Bg`, `Border`, `Subtle` suffixes for state/variant variants
- **No raw palette references**: Never use `red.600`, `green.400`, `blue.500`, etc. in component code

## Prohibited Patterns

These patterns are **not allowed** in component files:

| Pattern | Use Instead |
|---------|-------------|
| `color="white"` on buttons | `color="button.text"` |
| `color="red.600"` | `color="danger.fg"` or `color="danger.bg"` |
| `color="green.400"` | `color="success.fg"` |
| `color="blue.500"` | `color="link.default"` or `color="info.fg"` |
| `color="yellow.400"` | `color="status.warning"` |
| `color="orange.500"` | `color="warning.fg"` |
| Hard-coded hex (`#007acc`) | Appropriate semantic token |
| Hard-coded `rgb()`/`rgba()` | Appropriate semantic/overlay token |
| `colorScheme` prop (Chakra v2) | `colorPalette` prop (Chakra v3) |
| Local `const inputStyles = {...}` | Import `inputStyles` from `src/utils/styles.ts` |
| Inline `_focus={{ borderColor: 'vscode.accent', boxShadow: '...' }}` | Import `focusRingStyles` from `src/utils/styles.ts` |

**Exceptions**: `SnakeGame.tsx` (canvas rendering) and `src/client/` (auto-generated) are exempt from color token rules.

## Shared Style Utilities

All shared style utilities are exported from `src/utils/styles.ts`.

### `inputStyles`

Common styles for Chakra UI input components (Input, Textarea, Select, etc.).

```tsx
import { inputStyles } from '../utils/styles';

<Input {...inputStyles} placeholder="Search..." />
```

Provides: `bg`, `borderColor`, `color`, `_hover`, `_focus` with consistent dark theme styling.

### `focusRingStyles`

Consistent focus ring behavior for any interactive Chakra component.

```tsx
import { focusRingStyles } from '../utils/styles';

<Box {...focusRingStyles} tabIndex={0}>Focusable element</Box>
```

Provides: `_hover` (accent border), `_focus` (accent border + box-shadow ring).

### `buttonStyles`

Pre-configured button style objects using semantic tokens.

```tsx
import { buttonStyles } from '../utils/styles';

<Button {...buttonStyles.primary}>Save</Button>
<Button {...buttonStyles.danger}>Delete</Button>
<Button {...buttonStyles.success}>Approve</Button>
<Button {...buttonStyles.secondary}>Cancel</Button>
```

Each variant provides: `bg`, `_hover.bg`, `color` using semantic tokens.

### `nativeSelectStyles` / `nativeSelectOptionsCss`

Styles for native `<select>` elements (non-Chakra).

```tsx
import { nativeSelectStyles, nativeSelectOptionsCss } from '../utils/styles';

<select style={nativeSelectStyles}>...</select>
```

### `selectStyles` / `createSelectStyles`

Pre-built and factory styles for `react-select` components.

```tsx
import { selectStyles, createSelectStyles } from '../utils/styles';

// Pre-built variants
<Select styles={selectStyles.default} />   // Standard (40px)
<Select styles={selectStyles.compact} />   // Compact (32px, small font)
<Select styles={selectStyles.form} />      // Form context (32px)

// Custom configuration
const custom = createSelectStyles<MyOption>({ minHeight: '36px', menuZIndex: 10 });
```

### `scrollbarStyles`

Custom scrollbar styling for dark theme containers.

```tsx
import { scrollbarStyles } from '../utils/styles';

<Box css={scrollbarStyles} overflowY="auto">...</Box>
```

## Component Styling Conventions

### When to Use What

| Scenario | Approach |
|----------|----------|
| Standard Chakra component styling | Semantic token props (`bg="bg.surface"`, `color="fg.default"`) |
| Input/form elements | Spread `inputStyles` utility |
| Buttons with specific variants | Spread `buttonStyles.primary` (or danger/success/secondary) |
| Focus ring behavior | Spread `focusRingStyles` utility |
| react-select dropdowns | Use `selectStyles.default` / `selectStyles.compact` / `selectStyles.form` |
| Native `<select>` elements | Use `nativeSelectStyles` |
| Scrollable containers | Apply `scrollbarStyles` via `css` prop |
| One-off hover/focus overrides | Use Chakra `_hover`/`_focus` props with semantic tokens |

### Rules

1. **Always use semantic tokens** — never reference raw Chakra palette colors or hex values in component code.
2. **Use shared utilities** — import from `src/utils/styles.ts` instead of defining local style objects.
3. **Use Chakra v3 API** — use `colorPalette` instead of `colorScheme`.
4. **Use Chakra size tokens** — prefer `"sm"`, `"md"`, `"lg"` over raw values like `"0.875rem"`.
5. **No new `eslint-disable` comments** — fix the root cause instead of suppressing.

## Mobile Responsiveness Guidelines

### Breakpoints

| Breakpoint | Target Device | Viewport |
|------------|--------------|----------|
| Small | iPhone SE | 375px |
| Medium | iPad | 768px |
| Large | Desktop | 1024px+ |

### Layout Guidelines

- Use Chakra's responsive props: `{{ base: "column", md: "row" }}` for flex direction.
- Stack elements vertically on mobile; use horizontal layouts on tablet and above.
- Ensure no horizontal overflow at 375px — all content must fit within viewport width.
- Use `overflowX="auto"` on tables and wide content with appropriate scrollbar styling.

### Touch Targets

- All interactive elements (buttons, links, form controls) must have a minimum touch target of **44x44px**.
- Use adequate padding/margin to prevent accidental taps on adjacent elements.

### Typography

- Text must be readable without zooming on mobile.
- Minimum font size: 14px (Chakra `"sm"` token) for body text.
- Headings should scale down appropriately on smaller viewports.

### Navigation

- Navigation uses a hamburger menu on mobile viewports.
- Mobile menu items must have full-width touch targets.
- Ensure proper z-indexing for mobile menus and overlays.
