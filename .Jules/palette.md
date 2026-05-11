## 2025-05-11 - [Double-Confirmation Deletion Pattern]
**Learning:** In mystical, glass-morphism UIs, destructive actions like deletion should be guarded with a two-step confirmation that provides clear visual feedback (e.g., pulsing icons, color shifts). Resetting this state on `onMouseLeave` or component close (`useEffect`) prevents "stuck" UI states and accidental triggers.
**Action:** Implement double-confirmation with local state tracking (`confirmingId`) and automatic reset on hover exit or sidebar closure for all destructive UI actions.

## 2025-05-11 - [Accessible Focus States in Glass-morphism]
**Learning:** Default browser focus rings are often nearly invisible against dark, translucent glass-morphism backgrounds. Custom focus rings using theme colors (e.g., `focus-visible:ring-gold/50`) are essential for keyboard navigation accessibility.
**Action:** Always apply `focus-visible:ring-2` and `outline-none` with a high-contrast theme color to interactive elements.
