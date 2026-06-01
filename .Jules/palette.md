# Palette's Journal

🎨 UX and Accessibility learnings for Olari's Resonance.

## 2025-01-24 - Nested Interactive Elements and Keyboard Accessibility
**Learning:** When adding keyboard accessibility to container elements (like history cards) that contain their own internal actions (like a delete button), it's crucial to use `e.stopPropagation()` in the child button's handler. Without this, pressing 'Enter' or 'Space' on the button triggers both the button's action and the parent's navigation action.
**Action:** Always intercept and stop event propagation in nested interactive elements when the parent container is also keyboard-accessible. Use `focus-within` or `group-focus-within` to ensure hidden child actions become visible when the parent container receives keyboard focus.
