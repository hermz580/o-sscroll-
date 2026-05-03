## 2025-05-15 - Double-confirmation for destructive actions
**Learning:** Destructive actions like deleting history items should have a confirmation step to prevent accidental data loss, especially in touch or mouse-heavy interfaces where misclicks are common.
**Action:** Use local state to toggle a 'Confirm?' state on the delete button before executing the final deletion.

## 2025-05-15 - Accessibility for icon-only buttons
**Learning:** Icon-only buttons are invisible to screen readers without ARIA labels.
**Action:** Always provide `aria-label` for buttons that don't have visible text.

## 2025-05-15 - Keyboard visibility for hover-only elements
**Learning:** Elements that only appear on hover (e.g., `opacity-0 group-hover:opacity-100`) are difficult for keyboard users to discover.
**Action:** Use `focus-visible:opacity-100` to ensure they appear when tabbed to.
