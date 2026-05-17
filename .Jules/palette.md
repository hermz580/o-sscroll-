## 2025-05-14 - Two-Step Deletion Confirmation Pattern
**Learning:** For destructive actions in glass-morphism sidebars where items are densely packed, a two-step confirmation (Trash -> Check) prevents accidental deletions during scroll or navigation. Resetting this state on `onMouseLeave` ensures the UI doesn't stay in a "lethal" state if the user changes their mind.
**Action:** Always implement a confirmation state for delete buttons in high-density lists, and ensure state reset on container exit.
