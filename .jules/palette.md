## 2025-05-15 - Enhancing History Navigation Accessibility
**Learning:** In mystical-themed apps with many glass-morphism cards, interactive containers (like past visions) often miss standard keyboard accessibility. Using `group-focus-within:opacity-100` is a crucial pattern for making "hover-only" actions (like delete buttons) discoverable and usable for keyboard users.
**Action:** Always check if interactive cards have `role="button"` and `tabIndex={0}`, and ensure nested "hidden" actions are revealed on focus.
