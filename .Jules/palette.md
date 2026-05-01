## 2025-05-14 - [Modal/Sidebar Hygiene]
**Learning:** Simply animating off-screen (e.g., x: '100%') leaves elements detectable by screen readers and automated test tools like Playwright, causing visibility check failures and a confusing experience for keyboard users.
**Action:** Always wrap conditional elements in 'AnimatePresence' and ensure they unmount from the DOM when closed.

## 2025-05-14 - [Double-Confirmation Pattern]
**Learning:** Users can accidentally trigger destructive actions (like deletion) in dense interfaces. A local-state-driven confirmation step within the same UI element provides a low-friction but safe way to handle these actions.
**Action:** Implement a 'double-confirmation' flow for destructive actions by using local state to toggle between a default icon and a 'Confirm?' prompt.
