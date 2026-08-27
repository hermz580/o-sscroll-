## 2024-05-22 - Keyboard Accessibility Pattern for Nested Interactive Elements

**Learning:** When nesting interactive elements (like a Delete button inside a focusable History Card), using `e.stopPropagation()` in the child's handler is crucial to prevent triggering the parent's action. Additionally, adding `group-focus-within` to the child ensures it is discoverable for keyboard users when the parent is focused.

**Action:** Always use `e.stopPropagation()` for nested interactive elements and ensure secondary actions are visible on focus/hover via Tailwind's `group` utilities.
