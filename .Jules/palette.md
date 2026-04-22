## 2024-05-23 - [Accessibility: Keyboard Visibility for Group-Hover Elements]
**Learning:** Elements that are only visible on hover (e.g., using Tailwind's `group-hover:opacity-100`) are inaccessible to keyboard users unless explicitly handled with focus states.
**Action:** Always pair `group-hover:opacity-100` with `focus-visible:opacity-100` for interactive elements like delete buttons to ensure they become visible when tabbed into.

## 2024-05-23 - [ARIA: Programmatic Relationships in Tabs and Accordions]
**Learning:** Screen readers rely on the explicit linkage between a trigger (tab/button) and its content (tabpanel/region) via `aria-controls` and `id`. Missing either side breaks the navigation experience.
**Action:** When implementing tabs or accordions, ensure every trigger has an `aria-controls` matching the content's `id`, and the content has an `aria-labelledby` matching the trigger's `id`.
