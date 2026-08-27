## 2025-05-14 - Deletion Safety and Keyboard Accessibility in History Lists

**Learning:** Destructive actions like deleting history items ("dissolving visions") benefit significantly from a two-step confirmation flow, especially when the item is precious or "mystical." Additionally, making list items keyboard-accessible requires using `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers, but special care must be taken with nested interactive elements (like a delete button) to stop event propagation and ensure focus-within visibility.

**Action:** Always implement `e.stopPropagation()` for nested buttons in list items and use `group-focus-within` to reveal hidden actions for keyboard users. Use a localized confirmation state for deletion rather than a generic browser alert to maintain the application's aesthetic and immersion.
