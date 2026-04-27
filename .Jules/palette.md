## 2024-04-27 - [Double-Confirmation Delete Pattern]
**Learning:** Destructive actions like deleting history should always have a confirmation step to prevent accidental data loss. Implementing this with local state and synchronizing it with the component's visibility (e.g., sidebar `isOpen` prop) ensures a clean UX where the user isn't surprised by a lingering "Confirm?" state when they return to the interface.
**Action:** Use a `deletingId` state and `useEffect` to reset confirmation states when the parent container closes or the user's focus shifts away (e.g., `onMouseLeave`).
