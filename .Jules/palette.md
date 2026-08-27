## 2026-06-08 - Accessible Card Interactions
**Learning:** Nesting interactive elements (like a delete button) within a keyboard-navigable card (role="button") requires careful event propagation management to ensure screen readers and keyboard users can distinguish between the primary action (selecting the card) and the secondary action (deleting).
**Action:** Use `e.stopPropagation()` in the child button's `onClick` and `onKeyDown` handlers, and ensure the child button is visible on focus using `group-focus-within`.
