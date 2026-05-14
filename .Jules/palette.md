## 2025-05-14 - Two-Step Deletion Pattern for Safety
**Learning:** For destructive actions like deleting history items, a simple hover-and-click pattern is prone to accidental loss and poor accessibility. Implementing a two-step "click-to-confirm" pattern provides a safety net and allows for clearer labeling for screen readers.
**Action:** Always implement double-confirmation for deletion in the 'Past Visions' sidebar and reset this state if the user's intent changes (e.g., mouse leaves or sidebar closes).

## 2025-05-14 - Keyboard Accessibility in Interactive Cards
**Learning:** Interactive cards (like history items) need explicit keyboard support. Simply adding `onClick` is insufficient; adding `tabIndex={0}`, `role="button"`, and an `onKeyDown` handler for 'Enter'/'Space' ensures they are accessible. Furthermore, nested buttons (like a delete button) must use `e.stopPropagation()` to avoid triggering the parent card's action.
**Action:** Ensure all clickable list items in the sidebar have matching ARIA roles, keyboard listeners, and focus-visible indicators.
