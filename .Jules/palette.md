## 2025-05-14 - Keyboard discoverability for hidden actions
**Learning:** Secondary actions (like Delete) that are only visible on hover are inaccessible to keyboard users unless they are also shown when the parent container receives focus. Using Tailwind's `group-focus-within` allows these actions to remain hidden visually until needed, without sacrificing accessibility.
**Action:** Always pair `group-hover` visibility with `group-focus-within` for secondary actions inside interactive cards.

## 2025-05-14 - Nested interactive elements accessibility
**Learning:** Nesting a `<button>` inside a container with `role="button"` creates a nested interactive structure that can be tricky for screen readers and event handling. Using `e.stopPropagation()` in the child button's handlers is essential to prevent triggering the parent's action, but a flatter structure is preferred when possible.
**Action:** When forced into nested interactions, strictly manage event propagation for both mouse and keyboard events to ensure intent is clear.
