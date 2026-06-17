## 2025-05-15 - Nested Keyboard Accessibility
**Learning:** Nested interactive elements (like a delete button within a clickable card) require explicit event propagation handling (`e.stopPropagation`) and visibility management (`group-focus-within`) to ensure they are discoverable and usable for keyboard users.
**Action:** Always pair `onClick` with `onKeyDown` for custom roles like "button", and use `group-focus-within:opacity-100` to reveal secondary actions when a container is focused.
