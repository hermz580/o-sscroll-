## 2025-05-14 - Ensuring Proper Unmounting and Interaction Safeguards

**Learning:** When using Framer Motion for sidebars, simply animating the `x` position (e.g., to '100%') leaves the element in the DOM. This can cause screen readers to still detect "hidden" content and automated tests to fail visibility checks. Additionally, destructive actions like deleting history entries benefit significantly from a two-step "double-confirmation" flow to prevent accidental data loss.

**Action:** Wrap sidebars in `AnimatePresence` and conditional rendering to ensure they unmount. Implement `confirmingId` states for deletions that reset when the component is closed.
