## 2025-05-15 - Accessibility Focus and Keyboard Navigation
**Learning:** When using `sr-only` to hide inputs while maintaining accessibility, focus indicators (like `focus-within`) must be applied to a parent element that visually represents the input (e.g., the `<label>` or a wrapper `<div>`) to ensure keyboard users have visual feedback. Applying it to a sibling `<div>` will not trigger the ring when the hidden input gains focus.
**Action:** Always wrap `sr-only` inputs in a container that carries the focus-visible/focus-within styles, or use `peer-focus` on a sibling.
