## 2025-05-20 - Accessible Deletion Confirmation
**Learning:** For destructive actions in a list (like history items), a two-step confirmation prevents accidental loss of data. Combining an icon swap with `onMouseLeave` reset provides a safe and intuitive interaction pattern without cluttering the UI with extra buttons.
**Action:** Use `confirmingId` state with `onMouseLeave` for inline destructive actions in future components.
