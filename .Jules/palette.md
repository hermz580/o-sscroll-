## 2025-05-14 - Two-Step Deletion Confirmation with Auto-Reset
**Learning:** For destructive actions in a glass-morphic list, a two-step confirmation (icon swap + color change) provides clear feedback without requiring a modal. Adding an `onMouseLeave` reset on the parent container ensures the confirmation state doesn't persist if the user decides not to proceed and moves their cursor away, preventing accidental deletions later.
**Action:** Use the `confirmingId` + `onMouseLeave` pattern for inline destructive actions in sidebar lists.
