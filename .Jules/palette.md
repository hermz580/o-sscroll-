## 2025-05-14 - Double-Confirmation for Destructive Actions
**Learning:** For destructive actions like deleting history, a "double-confirmation" pattern using local state provides a safe, low-friction UX. Combining this with a pulsed icon (like `AlertCircle`) gives clear visual feedback. Resetting this state on `onMouseLeave` or when a container (like a sidebar) closes prevents accidental subsequent deletions.
**Action:** Implement this pattern for all immediate data deletion buttons in the app.

## 2025-05-14 - Playwright Locator Conflicts with Substrings
**Learning:** When using `page.get_by_role('button', name='Visions')`, it can match multiple elements if one label is a substring of another (e.g., "Visions" vs "Close past visions").
**Action:** Use `exact=True` in Playwright locators for buttons with generic names to avoid strict mode violations during frontend verification.
