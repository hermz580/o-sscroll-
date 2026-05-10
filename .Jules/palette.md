## 2025-05-14 - Two-Step Deletion Confirmation
**Learning:** For destructive actions like deleting history items, a two-step confirmation flow integrated directly into the item (rather than a modal) provides a smoother experience while still preventing accidental data loss. Using `onMouseLeave` to reset the confirmation state helps prevent accidental clicks if the user returns to the item later.
**Action:** Use a local `confirmingId` state to toggle between the default action and a "Confirm?" state. Ensure `aria-label` updates to reflect the current state of the button.
