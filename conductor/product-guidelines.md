# Product Guidelines

## Visual Identity

### Style: Clean & Minimal
The interface is modern and uncluttered, with generous whitespace and clear visual hierarchy. The design keeps the focus on content — recipes, meal plans, and shopping lists — rather than decoration. Every element on screen should serve a purpose.

### Dark Theme
The application uses a dark color palette provided by Chakra UI. All UI elements must conform to dark-inspired styling with high contrast to ensure readability and visual comfort during extended use.

### Typography
- Use clear, legible fonts with strong size differentiation between headings, body text, and labels.
- Recipe titles and meal plan headers should be prominent and scannable.
- Ingredient lists and instructions should be easy to read at a glance.

### Spacing & Layout
- Generous padding and margins to avoid visual clutter.
- Card-based layouts for recipes and meal plan entries to create clear content boundaries.
- Consistent spacing patterns throughout the application.

## Interaction Philosophy

### Guided & Intuitive
The application should feel approachable and easy to use, even for first-time users. Interactions follow a step-by-step pattern with clear prompts and visual feedback at each stage.

- **Progressive disclosure:** Show only what's needed at each step; don't overwhelm with options upfront.
- **Clear affordances:** Buttons, links, and interactive elements should be visually obvious.
- **Visual feedback:** Provide immediate feedback on user actions (loading states, success confirmations, error messages).
- **Sensible defaults:** Pre-fill common values and suggest logical next steps to reduce decision fatigue.
- **Contextual help:** Guide users through complex workflows like multi-step recipe creation and meal plan assembly.

## Content Guidelines

### Tone of Voice
- **Friendly but concise:** Use plain language. Avoid jargon or overly technical terms.
- **Action-oriented:** Labels and prompts should clearly communicate what will happen (e.g., "Add to Meal Plan" not "Submit").
- **Supportive:** Error messages should explain what went wrong and how to fix it.

### Content Hierarchy
1. **Meal plans** are the primary content — they should be the most prominent and accessible.
2. **Recipes** support meal plans — they should be easy to browse, search, and add to plans.
3. **Collaboration features** support the family unit — shared visibility without unnecessary complexity.

## Accessibility

- Maintain high contrast ratios appropriate for the dark theme.
- Ensure all interactive elements are keyboard-navigable.
- Use semantic HTML and ARIA labels for screen reader support.
- Touch targets should be large enough for comfortable mobile interaction.
