## 2025-02-19 - Double-Confirmation Pattern for Destructive Actions
**Learning:** In glass-morphism UIs with dense information, destructive actions like deletion benefit from a two-step confirmation that changes the icon/color in place. Resetting this state on `onMouseLeave` prevents "stuck" confirmation states if the user changes their mind and moves their cursor away.
**Action:** Use a `confirmingId` state and `onMouseLeave` reset for inline deletion buttons.
