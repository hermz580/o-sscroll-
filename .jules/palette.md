## 2025-03-24 - Accessible Sidebars and Interactive Cards
**Learning:** For interactive cards with hidden "hover-only" actions (like delete), using 'group-focus-within' ensures these actions are visible and reachable for keyboard users. Proper ARIA labeling of the card container using IDs from its children ('aria-labelledby') preserves semantic context for screen readers.
**Action:** Always implement 'group-focus-within:opacity-100' on secondary actions within interactive containers and use semantic 'dialog' roles for sidebars with 'Escape' key support.
