## 2024-04-25 - [Double-confirmation for history deletion]
**Learning:** Destructive actions in reading history require safety nets to prevent accidental data loss. A lightweight "double-confirmation" pattern using local state and `onMouseLeave` reset provides a smooth, frictionless safety check without extra buttons.
**Action:** Implement double-confirmation for all non-undoable destructive actions. Use `focus-visible` to ensure these hidden-on-hover actions remain accessible to keyboard users.
