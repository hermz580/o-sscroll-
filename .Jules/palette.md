## 2026-06-02 - keyboard-accessible-hover-actions
**Learning:** In components where secondary actions (like 'Delete' or 'Edit') are only visible on hover, they remain inaccessible to keyboard users even if the parent container is focusable. Using 'group-focus-within:opacity-100' on the action buttons ensures they appear and are usable when the parent card receives focus.
**Action:** Always pair 'group-hover:opacity-100' with 'group-focus-within:opacity-100' for contextual actions on cards or list items.
