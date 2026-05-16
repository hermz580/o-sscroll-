## 2025-05-15 - Interactive Card Keyboard Accessibility
**Learning:** When turning a container (like a card) into an interactive element with `tabIndex={0}` and `onKeyDown`, any nested buttons must use `e.stopPropagation()` in their handlers to prevent the parent's action from also being triggered. Additionally, `e.preventDefault()` should be used for 'Enter' and 'Space' on the parent to avoid double-triggers or accidental page scrolling.
**Action:** Always wrap nested button handlers with `e.stopPropagation()` when the parent is also interactive.

## 2025-05-15 - Double-Confirmation UX Pattern
**Learning:** For destructive actions like deletion in a list, a two-step confirmation (clicking once to "arm", then again to "fire") provides a safety net without the friction of a modal. Resetting this state on `onMouseLeave` prevents "stale" confirmation states if the user re-engages with the element later.
**Action:** Use a local `confirmingId` state for list deletions and reset it on mouse leave or when the view unmounts.
