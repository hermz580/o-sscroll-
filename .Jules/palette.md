## 2025-05-15 - ARIA Tab Patterns in Mystical Interfaces
**Learning:** In highly stylized or "mystical" glass-morphism UIs, standard interactive elements (like tabs and pagination) can easily become "invisible" to screen readers if they rely solely on visual cues or custom icons. Implementing the full WAI-ARIA Tab pattern (role="tablist", role="tab", role="tabpanel") is essential to ensure that the "magic" doesn't exclude users with assistive technologies.
**Action:** Always implement the three-part ARIA tab relationship (List -> Tab -> Panel) with matching IDs and 'aria-controls'/'aria-labelledby' attributes, even for simple single-page-app navigation that "feels" like a tab system.

## 2025-05-15 - Deletion Confirmation UX
**Learning:** For destructive actions in history-based applications (like deleting a spiritual reading), a single click is too risky, but a browser 'confirm()' dialog breaks the immersive "mystical" experience. A two-step "click-to-confirm" pattern using a visual state change (e.g., Trash to Check icon) within the component maintains the aesthetic while providing safety.
**Action:** Use a 'confirmingId' state pattern for in-situ deletions and always reset the state on 'onMouseLeave' to prevent "stuck" confirmation buttons.
