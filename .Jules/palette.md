## 2025-05-15 - Double-Confirmation Pattern for Destructive Actions
**Learning:** Destructive actions like deleting history items should have a double-confirmation flow to prevent accidental data loss. Synchronizing this state with the sidebar's open/close status prevents stale states when the user re-opens the UI.
**Action:** Use a local `confirmingId` state and a `useEffect` hook to reset it when the parent container (e.g., sidebar) closes.

## 2025-05-15 - Focus Visibility for Hover-Only Controls
**Learning:** Controls that are only visible on hover (e.g., a delete button on a list item) are inaccessible to keyboard users unless they are also made visible on focus.
**Action:** Always pair `group-hover:opacity-100` with `focus-visible:opacity-100` for interactive elements.
