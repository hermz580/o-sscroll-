## 2025-04-26 - [Sidebar Accessibility & Cleanup]
**Learning:** When using Framer Motion (motion/react) for UI components like sidebars, wrap conditional elements in `AnimatePresence` to ensure they unmount from the DOM when closed. Simply animating off-screen (e.g., `x: '100%'`) leaves elements detectable by screen readers and automated test tools like Playwright, causing visibility check failures.
**Action:** Use conditional rendering (`isOpen && ...`) inside `AnimatePresence` for all modal/sidebar components to ensure clean unmounting and better accessibility.

## 2025-04-26 - [Double-Confirmation UX]
**Learning:** Implement a 'double-confirmation' flow for destructive actions (e.g., deletion) by using local state to toggle between a default icon/style and a 'Confirm?' prompt. This significantly reduces accidental data loss without the overhead of a full modal.
**Action:** Use local `confirmId` state in list items to manage individual deletion confirmations.
