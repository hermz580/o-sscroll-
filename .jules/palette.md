## 2025-05-14 - Accessible Nested Actions
**Learning:** When using `group-hover:opacity-100` for actions within a card, it's critical to also include `group-focus-within:opacity-100`. This ensures that keyboard users can see the action button when it receives focus, rather than it remaining invisible while they are interacting with it.
**Action:** Always pair hover-based visibility with focus-within or focus states for nested interactive elements. Use `focus-visible` rings to provide clear feedback without cluttering the UI for mouse users.
