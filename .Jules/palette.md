## 2025-05-22 - [Sidebar Animation and Destructive Action Hygiene]
**Learning:** In Framer Motion-heavy apps, using `AnimatePresence` with conditional rendering is essential for ensuring components correctly unmount from the DOM. Simply animating `x: '100%'` leaves elements detectable by screen readers and test tools. Additionally, a 'double-confirmation' flow for deletions is a high-impact, low-effort micro-UX pattern that prevents data loss.
**Action:** Always wrap sidebars and modals in `AnimatePresence` and use a local state toggle for destructive actions in future tasks.
