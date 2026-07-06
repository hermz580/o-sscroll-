## 2025-07-06 - [Accessible History Sidebar]
**Learning:** For interactive card items with nested actions (like a delete button), keyboard accessibility requires `role="button"` and `tabIndex={0}` on the container, plus `e.stopPropagation()` in the nested button's `onKeyDown` to prevent triggering the parent card's activation.
**Action:** Always implement `onKeyDown` with `stopPropagation` for nested interactive elements in keyboard-accessible containers.

## 2025-07-06 - [WAI-ARIA Dialog Pattern]
**Learning:** Sidebars that behave like modals should implement the WAI-ARIA Dialog pattern (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) and include an `Escape` key listener for a standard accessible experience.
**Action:** Apply the Dialog pattern to all modal-like sidebars and drawers.
