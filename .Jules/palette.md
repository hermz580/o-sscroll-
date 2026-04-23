## 2026-04-23 - [Delete Confirmation & Accessibility]
**Learning:** Implementing a double-confirmation pattern for destructive actions like deleting history (Visions) significantly improves user confidence and prevents accidental data loss. This pattern should be combined with proper ARIA roles and labels to ensure accessibility.
**Action:** Always include ARIA labels on icon-only buttons and consider a confirmation state for any action that permanently removes user data. Synchronize these states with the visibility of the parent container to avoid state leakage.
