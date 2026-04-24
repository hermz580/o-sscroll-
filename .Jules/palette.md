# Palette's Journal - Critical UX & Accessibility Learnings

This journal contains critical learnings discovered during the development of Olari's Resonance.

## 2026-04-24 - [Double-Confirmation Delete Flow]
**Learning:** Reusable UX pattern: Implement a 'double-confirmation' flow for destructive actions (e.g., deletion) by using local state to toggle between a default icon/style and a 'Confirm?' prompt, preventing accidental data loss.
**Action:** Use a `deletingId` state that resets when the containing modal/sidebar is closed. Provide immediate visual feedback and change the button's ARIA label to "Confirm deletion" during the second state.
