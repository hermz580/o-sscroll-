## 2025-05-14 - Accessible Interactive Cards with Hidden Actions
**Learning:** For keyboard-accessible list items with hidden actions (like a delete button), using `group-focus-within:opacity-100` on the action element ensures it is visible to keyboard users. Nested interactive elements must use `e.stopPropagation()` in both `onClick` and `onKeyDown` handlers to prevent event bubbling to the parent card.
**Action:** Always apply `group-focus-within` to child actions in cards and ensure event propagation is stopped to maintain clear interaction boundaries.
