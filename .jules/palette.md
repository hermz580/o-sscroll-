# Palette's Journal - Olari's Resonance

## 2025-05-14 - Keyboard Visibility for Hover-Only Actions
**Learning:** When using `group-hover:opacity-100` to show actions (like delete buttons) on card hover, these actions remain invisible to keyboard users even when the card or its children have focus.
**Action:** Always complement `group-hover` with `group-focus-within` or `group-focus` to ensure interactive elements are visible to keyboard and screen reader users.
