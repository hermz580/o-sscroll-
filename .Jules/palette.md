## 2025-05-14 - [Destructive Action Safety]
**Learning:** Destructive actions like deleting history items should have a double-confirmation pattern to prevent accidental data loss. This is especially important in mobile-centric UIs where accidental taps are common.
**Action:** Implement a local-state toggle for delete buttons that replaces the icon with a "Confirm?" prompt on first click.

## 2025-05-14 - [Component State Hygiene]
**Learning:** Interactive component states (like pending delete IDs) must be reset when their parent container (modals, sidebars) is closed to prevent stale states on next opening.
**Action:** Use a `useEffect` hook synchronized with the `isOpen` prop to reset interactive states.

## 2025-05-14 - [Icon Button Accessibility]
**Learning:** Icon-only buttons must always have descriptive `aria-label` attributes to be accessible to screen reader users. Dynamic actions should have dynamic labels.
**Action:** Always include `aria-label` on icon-only buttons. For multi-state buttons (like the new delete confirmation), update the label to reflect the current action (e.g., "Confirm deletion").
