# Palette's Journal

This journal tracks critical UX and accessibility learnings for Olari's Resonance.

## 2025-06-11 - Ensuring Visibility for Keyboard Navigation
**Learning:** When using `div` as a button for card layouts (like history items), adding `tabIndex={0}` and `role="button"` makes them keyboard-accessible, but nested icon-only buttons that appear on hover (like "Delete") remain invisible to keyboard users unless explicitly handled. Using `group-focus-within:opacity-100` alongside `group-hover:opacity-100` ensures these actions are discoverable and usable when the card is focused.
**Action:** Always pair keyboard focus handling on parent containers with visibility rules for nested interactive elements to ensure full accessibility for secondary actions.
