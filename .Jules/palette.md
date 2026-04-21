## 2025-05-14 - [Focused Micro-UX: Safe Deletion]
**Learning:** In highly interactive sidebars like history logs, destructive actions (delete) benefit significantly from a two-step "click-to-confirm" pattern to prevent accidental data loss. This is especially critical in mobile-responsive views where tap targets are close together.
**Action:** Always implement a confirmation state (visual toggle or dialog) for delete actions in list components. ensure the state management is robust against race conditions if multiple items are interactable.

## 2025-05-14 - [Sidebar Accessibility]
**Learning:** Using `role="dialog"` and `aria-modal="true"` on non-fullscreen sidebars provides critical context to screen readers, identifying the area as a distinct interaction zone.
**Action:** Ensure sidebars that overlay content use proper ARIA roles and labels to define their purpose.
