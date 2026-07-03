## 2025-05-14 - Keyboard Accessibility for Sidebar & Lists
**Learning:** For interactive list items with hidden actions (like a delete button), using `group-focus-within:opacity-100` on the action element ensures it becomes visible when a keyboard user tabs into any part of the card, providing a much better experience than hover-only visibility.
**Action:** Always combine `group-hover` with `group-focus-within` for contextual actions.

## 2025-05-14 - Modal/Sidebar Dismissal
**Learning:** Implementing a global 'Escape' key listener within a `useEffect` hook specifically when a modal or sidebar is open is a standard expectation for accessible web applications.
**Action:** Include 'Escape' key dismissal in all future drawer or modal implementations.
