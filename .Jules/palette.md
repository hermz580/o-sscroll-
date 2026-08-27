## 2025-05-15 - Safe Deletion Pattern
**Learning:** For destructive actions in a high-touch mystical interface, a two-step confirmation (icon morphing) combined with `onMouseLeave` reset provides a "soft" safety net that feels integrated rather than disruptive (like a modal).
**Action:** Use the `confirmingId` + `onMouseLeave` pattern for inline deletions to maintain flow while preventing accidents.

## 2025-05-15 - Nested Keyboard Accessibility
**Learning:** When making cards keyboard-accessible (`role="button"`, `tabIndex={0}`), nested icon-buttons must use `e.stopPropagation()` to prevent the card's primary action from firing.
**Action:** Ensure all sub-actions in history cards use `e.stopPropagation()` and proper ARIA labels.
